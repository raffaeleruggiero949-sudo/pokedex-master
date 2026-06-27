import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// READ: Recupera tutti i mazzi di un utente (incluse le carte al loro interno)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) return NextResponse.json({ error: "User ID mancante" }, { status: 400 });

    const decks = await prisma.deck.findMany({
      where: { userId: userId },
      include: { 
        cards: { 
          include: { card: true } // Includiamo i dettagli delle singole carte
        } 
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(decks, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Errore nel recupero dei mazzi" }, { status: 500 });
  }
}

// CREATE: Crea un nuovo Mazzo vuoto
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, name, description } = body;

    if (!userId || !name) return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });

    const newDeck = await prisma.deck.create({
      data: {
        name,
        description: description || null,
        user: { connect: { id: userId } }
      }
    });

    return NextResponse.json(newDeck, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Errore nella creazione del mazzo" }, { status: 500 });
  }
}