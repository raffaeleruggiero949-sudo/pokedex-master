import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// --- INIZIO FUNZIONE GET (Serve alla pagina Profilo per leggere i dati) ---
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'ID Utente mancante' }, { status: 400 });
  }

  try {
    const userCards = await prisma.userCard.findMany({
      where: { userId },
      include: {
        card: {
          include: { set: true }
        }
      }
    });

    let totalPortfolioValue = 0;
    const mastersetsMap: Record<string, any> = {};

    userCards.forEach((uc) => {
      // 1. Calcolo del valore (applica i moltiplicatori di prezzo per le gradate)
      if (uc.card.priceUsd) {
        let cardValue = uc.card.priceUsd;
        if (uc.variant === 'PSA 10' || uc.variant === 'BGS 10' || uc.variant === 'CGC 10') {
          cardValue *= 2.2;
        } else if (uc.variant === 'PSA 9' || uc.variant === 'BGS 9.5') {
          cardValue *= 1.15;
        }
        totalPortfolioValue += (cardValue * uc.quantity);
      }

      // 2. Logica Masterset
      const setId = uc.card.setId;
      if (!mastersetsMap[setId]) {
        mastersetsMap[setId] = {
          setId: setId,
          setName: uc.card.set.name,
          logoUrl: uc.card.set.logoUrl,
          totalCards: uc.card.set.totalCards,
          collectedCardIds: new Set(), // Usa un Set per non contare i doppioni
        };
      }
      
      // Se la carta è GRADATA, non deve contare nel completamento del set!
      const isGraded = uc.variant.includes('PSA') || uc.variant.includes('BGS') || uc.variant.includes('CGC');
      if (!isGraded) {
        mastersetsMap[setId].collectedCardIds.add(uc.card.id);
      }
    });

    const mastersets = Object.values(mastersetsMap).map((set: any) => {
      const collectedUnique = set.collectedCardIds.size;
      const rawPercentage = (collectedUnique / set.totalCards) * 100;
      const finalPercentage = Math.min(rawPercentage, 100).toFixed(1);
      
      return {
        setId: set.setId,
        setName: set.setName,
        logoUrl: set.logoUrl,
        totalCards: set.totalCards,
        collectedUnique: collectedUnique,
        percentage: finalPercentage
      };
    });

    mastersets.sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));

    return NextResponse.json({
      totalValue: totalPortfolioValue.toFixed(2),
      mastersets: mastersets,
      cards: userCards 
    });

  } catch (error) {
    console.error("Errore API Portfolio:", error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}
// --- FINE FUNZIONE GET ---

// --- INIZIO FUNZIONE POST (Aggiornata con la variante) ---
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, cardId, variant = 'Normal', condition = 'NM' } = body;

    if (!userId || !cardId) {
      return NextResponse.json({ error: 'Dati mancanti' }, { status: 400 });
    }

    const existingEntry = await prisma.userCard.findUnique({
      where: {
        userId_cardId_variant: { userId, cardId, variant }
      }
    });

    if (existingEntry) {
      const updated = await prisma.userCard.update({
        where: { id: existingEntry.id },
        data: { quantity: existingEntry.quantity + 1 }
      });
      return NextResponse.json({ success: true, data: updated, message: "Quantità aumentata!" });
    } else {
      const newEntry = await prisma.userCard.create({
        data: { userId, cardId, variant, condition, quantity: 1 }
      });
      return NextResponse.json({ success: true, data: newEntry, message: "Carta aggiunta al portfolio!" });
    }

  } catch (error) {
    console.error("Errore aggiunta portfolio:", error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}
// --- FINE FUNZIONE POST ---