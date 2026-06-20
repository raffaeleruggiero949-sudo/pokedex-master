import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const sets = await prisma.set.findMany({
      // Questo comando forza Prisma a estrarre anche tutte le carte 
      // collegate a ciascun set, risolvendo il problema della griglia vuota.
      include: {
        cards: true, 
      },
      orderBy: {
        id: 'desc' // Ordina in base all'ID (opzionale)
      }
    });

    return NextResponse.json(sets);
  } catch (error) {
    console.error("Errore nel recupero dei set:", error);
    return NextResponse.json({ error: "Errore nel caricamento dei set" }, { status: 500 });
  }
}