import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; 

export async function GET() {
  try {
    // 1. Troviamo gli ID di tutti i set che sono stati marcati come JP
    const jpSets = await prisma.set.findMany({
      where: { language: 'JP' },
      select: { id: true }
    });

    const jpSetIds = jpSets.map(set => set.id);

    // Se non trova nulla, ci avvisa senza fare danni
    if (jpSetIds.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: "Nessun set giapponese trovato nel database. È già pulito!" 
      });
    }

    // 2. Eliminiamo PRIMA tutte le carte che appartengono a questi set giapponesi.
    // (Questo previene l'errore di blocco del database sulle relazioni)
    const deletedCards = await prisma.card.deleteMany({
      where: {
        setId: { in: jpSetIds }
      }
    });

    // 3. ORA che le carte non ci sono più, possiamo eliminare i Set in totale sicurezza
    const deletedSets = await prisma.set.deleteMany({
      where: {
        id: { in: jpSetIds }
      }
    });

    return NextResponse.json({
      success: true,
      message: `Pulizia forzata completata con successo! Rimosse ${deletedCards.count} carte e ${deletedSets.count} set giapponesi.`
    });

  } catch (error: any) {
    // Qui stampiamo l'errore VERO e specifico nel terminale di VS Code
    console.error("ERRORE DATABASE DURANTE LA PULIZIA:", error.message || error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Si è rotto qualcosa. Controlla il terminale di VS Code (dove hai fatto npm run dev) per leggere il messaggio di errore rosso esatto." 
      }, 
      { status: 500 }
    );
  }
}