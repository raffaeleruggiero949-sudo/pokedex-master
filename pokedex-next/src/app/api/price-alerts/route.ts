import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Assicurati che il percorso del tuo client Prisma sia corretto

// READ: Recupera tutti i Price Alert di un utente
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: "User ID mancante" }, { status: 400 });
    }

    const alerts = await prisma.priceAlert.findMany({
      where: { userId: userId },
      include: { card: true }, // Include i dettagli della carta
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(alerts, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Errore nel recupero degli alert" }, { status: 500 });
  }
}

// CREATE: Crea un nuovo Price Alert
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, cardId, targetPrice } = body;

    if (!userId || !cardId || targetPrice == null) {
      return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });
    }

    const newAlert = await prisma.priceAlert.create({
      data: {
        targetPrice: parseFloat(targetPrice),
        user: { connect: { id: userId } },
        card: { connect: { id: cardId } }
      }
    });

    return NextResponse.json(newAlert, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Errore nella creazione dell'alert" }, { status: 500 });
  }
}