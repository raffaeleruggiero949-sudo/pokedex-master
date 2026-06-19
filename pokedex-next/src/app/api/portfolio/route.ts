import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'ID Utente mancante' }, { status: 400 });
  }

  try {
    // 1. Peschiamo tutte le righe UserCard di questo utente, includendo i dettagli della Carta e del Set
    const userCards = await prisma.userCard.findMany({
      where: { userId },
      include: {
        card: {
          include: { set: true }
        }
      }
    });

    // Variabili per i nostri calcoli
    let totalPortfolioValue = 0;
    const mastersetsMap: Record<string, any> = {};

    // 2. Facciamo scorrere tutte le carte possedute per fare i calcoli
    userCards.forEach((uc) => {
      // Calcolo Valore: (Prezzo Carta * Quantità Posseduta)
      if (uc.card.priceUsd) {
        totalPortfolioValue += (uc.card.priceUsd * uc.quantity);
      }

      // Calcolo Masterset: Raggruppiamo le carte per Set
      const setId = uc.card.setId;
      if (!mastersetsMap[setId]) {
        mastersetsMap[setId] = {
          setId: setId,
          setName: uc.card.set.name,
          logoUrl: uc.card.set.logoUrl,
          totalCards: uc.card.set.totalCards,
          collectedUnique: 0, // Contatore delle carte uniche trovate
        };
      }
      
      // Siccome il DB ha un @@unique([userId, cardId]), ogni riga in userCards 
      // rappresenta una carta UNICA. Quindi incrementiamo semplicemente di 1.
      mastersetsMap[setId].collectedUnique += 1;
    });

    // 3. Trasformiamo la mappa in un array e calcoliamo la % matematica
    const mastersets = Object.values(mastersetsMap).map((set: any) => {
      // Limitiamo il completamento al 100% nel caso ci siano carte segrete (fuori serie)
      const rawPercentage = (set.collectedUnique / set.totalCards) * 100;
      const finalPercentage = Math.min(rawPercentage, 100).toFixed(1);
      
      return {
        ...set,
        percentage: finalPercentage
      };
    });

    // Ordiniamo i Masterset da quello più completo a quello meno completo
    mastersets.sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));

    return NextResponse.json({
      totalValue: totalPortfolioValue.toFixed(2),
      mastersets: mastersets,
      cards: userCards // Passiamo anche le carte vere e proprie per la griglia
    });

  } catch (error) {
    console.error("Errore API Portfolio:", error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }

  // Aggiungi questo in fondo a pokedex-next/src/app/api/portfolio/route.ts

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, cardId } = body;

    if (!userId || !cardId) {
      return NextResponse.json({ error: 'Dati mancanti' }, { status: 400 });
    }

    // 1. Controlliamo se l'utente ha già questa carta nel suo portfolio
    const existingEntry = await prisma.userCard.findUnique({
      where: {
        userId_cardId: { userId, cardId }
      }
    });

    if (existingEntry) {
      // 2a. Se ce l'ha già, aumentiamo la quantità di +1
      const updated = await prisma.userCard.update({
        where: { id: existingEntry.id },
        data: { quantity: existingEntry.quantity + 1 }
      });
      return NextResponse.json({ success: true, data: updated, message: "Quantità aumentata!" });
    } else {
      // 2b. Se non ce l'ha, creiamo la nuova riga
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

}