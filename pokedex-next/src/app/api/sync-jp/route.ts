import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // 1. Chiediamo l'elenco dei set giapponesi (per avere gli ID esatti)
    const resJa = await fetch('https://api.tcgdex.net/v2/ja/sets');
    const setsJa = await resJa.json();
    
    // 2. Chiediamo l'elenco in inglese (per avere le traduzioni dei nomi!)
    const resEn = await fetch('https://api.tcgdex.net/v2/en/sets');
    const setsEn = await resEn.json();
    
    // Creiamo un dizionario veloce per le traduzioni
    const enSetMap = new Map();
    if (Array.isArray(setsEn)) {
      for (const s of setsEn) enSetMap.set(s.id, s.name);
    }

    if (!Array.isArray(setsJa)) {
      return NextResponse.json({ error: 'Nessun dato trovato' }, { status: 404 });
    }

    let count = 0;
    // 3. Salviamo tutti i set nel database
    for (const set of setsJa) {
      const translatedName = enSetMap.get(set.id) || set.name;

      await prisma.set.upsert({
        where: { id: set.id },
        update: { language: 'JP', name: translatedName }, 
        create: {
          id: set.id,
          name: translatedName,
          series: set.series?.name || 'Sconosciuta',
          totalCards: set.cardCount?.total || 0,
          releaseDate: set.releaseDate || '1996-01-01',
          logoUrl: set.logo ? `${set.logo}.png` : '',
          language: 'JP' // Taggato come set Giapponese!
        },
      });
      count++;
    }

    return NextResponse.json({ success: true, message: `Magia completata! ${count} Espansioni Giapponesi aggiunte all'archivio.` });
  } catch (error) {
    console.error("Errore Sync JP Sets:", error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}