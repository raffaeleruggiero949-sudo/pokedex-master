import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Peschiamo tutti i set dal database ordinandoli per data di uscita (dal più nuovo)
    const sets = await prisma.set.findMany({
      orderBy: { releaseDate: 'desc' }
    });
    
    return NextResponse.json(sets);
  } catch (error) {
    console.error("Errore recupero set:", error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}