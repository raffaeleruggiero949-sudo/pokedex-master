import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { setId, lang } = await request.json();

    if (!setId || !lang) {
      return NextResponse.json({ error: 'Parametri mancanti' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'src', 'data', `${setId}.json`);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ 
        error: `File locale non trovato! Assicurati di aver creato il file: src/data/${setId}.json` 
      }, { status: 404 });
    }

    const fileContents = fs.readFileSync(filePath, 'utf8');
    const setData = JSON.parse(fileContents);

    if (!setData || !setData.cards) {
      return NextResponse.json({ error: 'Il file JSON è vuoto o non contiene carte.' }, { status: 400 });
    }

    // 1. IMPORTANTE: Creiamo/Aggiorniamo PRIMA il Set nel database!
    // Così Prisma non andrà in panico quando cercherà di collegargli le carte.
    await prisma.set.upsert({
      where: { id: setId },
      update: {}, // Se c'è già non lo tocchiamo
      create: {
        id: setId,
        name: setData.name || `Set ${setId.toUpperCase()}`,
        series: 'Sconosciuta',
        totalCards: setData.cardCount?.total || setData.cards.length,
        releaseDate: setData.releaseDate || '1996-01-01',
        logoUrl: setData.logo ? `${setData.logo}.png` : '',
        language: lang
      }
    });

    let insertedCount = 0;

    // 2. Ora possiamo inserire tranquillamente le carte
    for (const card of setData.cards) {
      const cardId = lang === 'JP' ? `${card.id}-JP` : card.id;
      const imageUrl = card.image ? `${card.image}/high.webp` : 'https://via.placeholder.com/250';

      await prisma.card.upsert({
        where: { id: cardId },
        update: {}, 
        create: {
          id: cardId,
          name: card.name || 'Sconosciuto',
          supertype: 'Pokémon',
          rarity: card.rarity || 'Sconosciuta',
          language: lang,
          priceUsd: 0,
          imageUrl: imageUrl,
          setId: setId,
        }
      });
      insertedCount++;
    }

    return NextResponse.json({ 
      success: true, 
      message: `Importazione Offline Completata! 🚀 Inserite ${insertedCount} carte direttamente dal tuo PC.`
    });

  } catch (error: any) {
    console.error("Errore importazione locale:", error);
    // 3. DEBUG: Restituiamo il messaggio di errore VERO di Prisma se qualcosa va storto
    return NextResponse.json({ 
      error: `Errore tecnico: ${error.message || 'Sconosciuto'}` 
    }, { status: 500 });
  }
}