import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Questo comando dice al database: "Prendi TUTTE le carte e metti il flag lingua su Inglese"
    const result = await prisma.card.updateMany({
      data: { language: 'EN' }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: `Riparazione completata! ${result.count} carte sono state impostate su Inglese (EN).` 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Errore durante la riparazione' }, { status: 500 });
  }
}