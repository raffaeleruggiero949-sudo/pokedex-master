import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST: Aggiunge una carta a un mazzo specifico
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { deckId, cardId } = body;

    if (!deckId || !cardId) return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });

    // Controlla se la carta esiste già in questo mazzo
    const existingCard = await prisma.deckCard.findFirst({
      where: { deckId: deckId, cardId: cardId }
    });

    if (existingCard) {
      // Se esiste, aumenta la quantità di 1
      const updatedCard = await prisma.deckCard.update({
        where: { id: existingCard.id },
        data: { quantity: existingCard.quantity + 1 }
      });
      return NextResponse.json(updatedCard, { status: 200 });
    } else {
      // Se non esiste, crea una nuova voce nel mazzo
      const newCard = await prisma.deckCard.create({
        data: {
          quantity: 1,
          deck: { connect: { id: deckId } },
          card: { connect: { id: cardId } }
        }
      });
      return NextResponse.json(newCard, { status: 201 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Errore nell'aggiunta della carta" }, { status: 500 });
  }
}