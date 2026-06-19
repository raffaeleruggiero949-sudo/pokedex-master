import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PokemonTCG } from 'pokemon-tcg-sdk-typescript'; // <-- Import dell'SDK
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CardsService {
  private readonly logger = new Logger(CardsService.name);

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async syncPricesNightly() {
    this.logger.log('Inizio sincronizzazione notturna dei prezzi delle carte tramite SDK...');

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

          // Facciamo la chiamata usando l'SDK Ufficiale
          const externalCard = await PokemonTCG.Card.find(originalId);
          
          // Estrapoliamo il prezzo di mercato
          const newPrice = externalCard.cardmarket?.prices?.averageSellPrice 
            || externalCard.tcgplayer?.prices?.normal?.market 
            || null;

          if (newPrice) {
            // 3. Aggiorniamo il database tramite Prisma usando il VERO id del DB (con eventuale suffisso)
            await this.prisma.card.update({
              where: { id: card.id },
              data: { priceUsd: newPrice }
            });
            this.logger.log(`Prezzo aggiornato per ${card.name} (${card.id}): $${newPrice}`);
          }

          // Aggiungiamo un piccolo ritardo per non violare i rate-limit dell'API esterna
          await new Promise(resolve => setTimeout(resolve, 500)); 

        } catch (error) {
          // Catturiamo gli errori (es. carta non trovata) senza bloccare il ciclo generale
          this.logger.error(`Errore SDK per la carta ${card.id}:`, error);
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
    // Calcoliamo quanti record saltare. Es: Pagina 2 con limite 10 = salta i primi 10.
    const skip = (page - 1) * limit;

    // Eseguiamo due query contemporaneamente: prendiamo le carte e contiamo il totale esatto
    const [cards, total] = await Promise.all([
      this.prisma.card.findMany({
        skip,
        take: limit,
        include: { set: true },
      }),
      this.prisma.card.count(),
    ]);

    // Restituiamo un oggetto strutturato con i metadati di paginazione
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