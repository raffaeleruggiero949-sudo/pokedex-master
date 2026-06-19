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
      if (uc.card.priceUsd) {
        totalPortfolioValue += (uc.card.priceUsd * uc.quantity);
      }

      const setId = uc.card.setId;
      if (!mastersetsMap[setId]) {
        mastersetsMap[setId] = {
          setId: setId,
          setName: uc.card.set.name,
          logoUrl: uc.card.set.logoUrl,
          totalCards: uc.card.set.totalCards,
          collectedUnique: 0,
        };
      }
      
      mastersetsMap[setId].collectedUnique += 1;
    });

    const mastersets = Object.values(mastersetsMap).map((set: any) => {
      const rawPercentage = (set.collectedUnique / set.totalCards) * 100;
      const finalPercentage = Math.min(rawPercentage, 100).toFixed(1);
      
      return {
        ...set,
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


// --- INIZIO FUNZIONE POST (Serve al bottone per aggiungere le carte) ---
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, cardId } = body;

    if (!userId || !cardId) {
      return NextResponse.json({ error: 'Dati mancanti' }, { status: 400 });
    }

    const existingEntry = await prisma.userCard.findUnique({
      where: {
        userId_cardId: { userId, cardId }
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
        data: { userId, cardId, quantity: 1 }
      });
      return NextResponse.json({ success: true, data: newEntry, message: "Carta aggiunta al portfolio!" });
    }

  } catch (error) {
    console.error("Errore aggiunta portfolio:", error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}
// --- FINE FUNZIONE POST ---