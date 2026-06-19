import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Usiamo context: any per aggirare i conflitti di TypeScript tra Next 14 e Next 15
export async function GET(request: Request, context: any) {
  try {
    // Il trucco magico per Next.js 15: "await" sui params!
    const params = await context.params;
    const cardId = params.id;

    const card = await prisma.card.findUnique({
      where: { id: cardId },
      include: { set: true },
    });

    if (!card) {
      return NextResponse.json({ error: 'Carta non trovata nel database' }, { status: 404 });
    }

    return NextResponse.json(card);
  } catch (error) {
    console.error("Errore API recupero carta:", error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}