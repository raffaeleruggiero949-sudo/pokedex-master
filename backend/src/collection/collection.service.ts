import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CollectionService {
  constructor(private readonly prisma: PrismaService) {}

  // Aggiunge una carta alla collezione o ne incrementa la quantità
  async addCard(userId: string, cardId: string, variant: string = 'Normal', condition: string = 'NM') {
    // 1. Verifica che la carta esista nel DB globale
    const card = await this.prisma.card.findUnique({ where: { id: cardId } });
    if (!card) {
      throw new NotFoundException('Carta non trovata nel database');
    }

    // 2. Usa upsert: se l'utente ha già questa carta in questa variante, incrementa di 1 la quantità.
    // Altrimenti, crea un nuovo record nella tabella UserCard.
    return this.prisma.userCard.upsert({
      where: {
        userId_cardId_variant: {
          userId,
          cardId,
          variant,
        },
      },
      update: {
        quantity: { increment: 1 },
      },
      create: {
        userId,
        cardId,
        variant,
        condition,
        quantity: 1,
      },
    });
  }

  // Rimuove una carta o ne decrementa la quantità se è un doppione
  async removeCard(userId: string, cardId: string, variant: string = 'Normal') {
    const userCard = await this.prisma.userCard.findUnique({
      where: { userId_cardId_variant: { userId, cardId, variant } },
    });

    if (!userCard) {
      throw new NotFoundException('Carta non presente nella collezione in questa variante');
    }

    if (userCard.quantity > 1) {
      // Se ha più copie, ne toglie solo una
      return this.prisma.userCard.update({
        where: { id: userCard.id },
        data: { quantity: { decrement: 1 } },
      });
    } else {
      // Se era l'ultima copia, elimina il record
      return this.prisma.userCard.delete({
        where: { id: userCard.id },
      });
    }
  }

  // Calcola le statistiche di completamento del Masterset
  async getSetProgress(userId: string, setId: string) {
    const set = await this.prisma.set.findUnique({ where: { id: setId } });
    if (!set) {
      throw new NotFoundException('Set non trovato');
    }

    // Recuperiamo tutte le carte UNICHE possedute dall'utente per questo set
    const userCardsInSet = await this.prisma.userCard.findMany({
      where: {
        userId,
        card: { setId },
      },
      select: { cardId: true },
      distinct: ['cardId'], // La clausola distinct fa sì che varianti (es. Normal e Reverse) della stessa carta contino come 1 ai fini del completamento numerico base
    });

    const collectedUniqueCards = userCardsInSet.length;

    return {
      setId: set.id,
      setName: set.name,
      totalCardsInSet: set.totalCards,
      collectedCards: collectedUniqueCards,
      percentage: Math.round((collectedUniqueCards / set.totalCards) * 100),
    };
  }

  // Recupera l'intera collezione dell'utente
  async getUserCollection(userId: string) {
    return this.prisma.userCard.findMany({
      where: { userId },
      include: {
        card: {
          include: { set: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}