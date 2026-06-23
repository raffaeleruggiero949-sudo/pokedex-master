import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Disabilita la cache statica per evitare vecchi errori salvati in memoria
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sets = await prisma.set.findMany({
      // RIMOSSO "include: { cards: true }" perché causava il crash del server.
      // Per il menu a tendina servono solo l'ID e il Nome del set, selezioniamo solo quelli.
      select: {
        id: true,
        name: true
      },
      orderBy: {
        id: 'desc' 
      }
    });

    return NextResponse.json(sets);
  } catch (error) {
    console.error("Errore nel recupero dei set:", error);
    return NextResponse.json({ error: "Errore nel caricamento dei set" }, { status: 500 });
  }
}