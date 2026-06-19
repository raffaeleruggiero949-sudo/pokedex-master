import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, context: any) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  // Gestione asincrona dei parametri per Next.js 15
  const params = await context.params;
  const setId = params.id;

  if (!userId || !setId) {
    return NextResponse.json({ error: 'Parametri mancanti' }, { status: 400 });
  }

  try {
    // 1. Dettagli del Set
    const setDetails = await prisma.set.findUnique({
      where: { id: setId }
    });

    if (!setDetails) return NextResponse.json({ error: 'Set non trovato' }, { status: 404 });

    // 2. Tutte le carte mondiali appartenenti a questo set
    const allCards = await prisma.card.findMany({
      where: { setId }
    });

    // 3. Le carte specifiche che l'utente possiede in questo set
    const userCards = await prisma.userCard.findMany({
      where: { userId, card: { setId } }
    });

    // Mappiamo le carte possedute in un dizionario per velocizzare la ricerca
    const ownedMap: Record<string, number> = {};
    userCards.forEach(uc => {
      ownedMap[uc.cardId] = uc.quantity;
    });

    // 4. Uniamo i dati: segniamo true/false se la possiede
    const collection = allCards.map(card => ({
      ...card,
      owned: !!ownedMap[card.id],
      quantity: ownedMap[card.id] || 0
    }));

    // 5. Ordiniamo le carte numericamente per rispecchiare l'ordine del raccoglitore
    collection.sort((a, b) => {
      const numA = parseInt(a.id.split('-').pop() || '0');
      const numB = parseInt(b.id.split('-').pop() || '0');
      return numA - numB;
    });

    return NextResponse.json({
      set: setDetails,
      collection
    });

  } catch (error) {
    console.error("Errore API Masterset:", error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}