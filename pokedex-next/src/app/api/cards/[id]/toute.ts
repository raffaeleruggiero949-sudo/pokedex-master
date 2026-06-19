import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const card = await prisma.card.findUnique({
      where: { id: params.id },
      include: { set: true },
    });

    if (!card) {
      return NextResponse.json({ error: 'Carta non trovata' }, { status: 404 });
    }

    return NextResponse.json(card);
  } catch (error) {
    console.error("Errore recupero singola carta:", error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}