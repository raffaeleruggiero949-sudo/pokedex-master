import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CardsService {
  private readonly logger = new Logger(CardsService.name);

  constructor(private prisma: PrismaService) {}

  @Cron('*/15 * * * * *')
  async syncPricesNightly() {
    this.logger.log('Inizio sincronizzazione notturna dei prezzi delle carte via REST API...');

    try {
      // 1. Recuperiamo tutte le carte presenti nel nostro DB
      const cards = await this.prisma.card.findMany({
        select: { id: true, name: true }
      });

      this.logger.log(`Trovate ${cards.length} carte da aggiornare.`);

      // 2. Cicliamo su ogni carta per aggiornarne il prezzo
      for (const card of cards) {
        try {
          // Rimuoviamo eventuali suffissi -IT, -EN, -JP che potresti usare nel tuo database
          // L'API americana riconosce solo l'ID originale (es. "sv1-1")
          const originalId = card.id.replace('-IT', '').replace('-EN', '').replace('-JP', '');

          // Facciamo la chiamata diretta all'API Ufficiale tramite fetch
          const response = await fetch(`https://api.pokemontcg.io/v2/cards/${originalId}`);
          
          if (!response.ok) {
            this.logger.warn(`Impossibile recuperare i dati per la carta ${card.id}`);
            continue; // Saltiamo questa carta e passiamo alla prossima
          }

          const responseData = await response.json();
          const externalCard = responseData.data;
          
          // Estrapoliamo il prezzo di mercato
          const newPrice = externalCard.cardmarket?.prices?.averageSellPrice 
            || externalCard.tcgplayer?.prices?.normal?.market 
            || null;

          if (newPrice) {
            // 3. Aggiorniamo il database tramite Prisma
            await this.prisma.card.update({
              where: { id: card.id },
              data: { priceUsd: newPrice }
            });
            this.logger.log(`Prezzo aggiornato per ${card.name} (${card.id}): $${newPrice}`);
          }

          // Aggiungiamo un piccolo ritardo (500ms) per non violare i rate-limit dell'API esterna
          await new Promise(resolve => setTimeout(resolve, 500)); 

        } catch (error) {
          this.logger.error(`Errore di rete per la carta ${card.id}:`, error);
        }
      }

      this.logger.log('Sincronizzazione notturna completata con successo!');
    } catch (error) {
      this.logger.error('Errore fatale durante il Cron Job:', error);
    }
  }

  // --- RESTO DEI METODI CRUD ---

  async create(createCardDto: CreateCardDto) {
    return 'This action adds a new card';
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [cards, total] = await Promise.all([
      this.prisma.card.findMany({
        skip,
        take: limit,
        include: { set: true },
      }),
      this.prisma.card.count(),
    ]);

    return {
      data: cards,
      meta: {
        totalItems: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    return this.prisma.card.findUnique({
      where: { id },
      include: { set: true },
    });
  }

  async update(id: string, updateCardDto: UpdateCardDto) {
    return this.prisma.card.update({
      where: { id },
      data: updateCardDto as any, 
    });
  }

  async remove(id: string) {
    return this.prisma.card.delete({
      where: { id },
    });
  }
}