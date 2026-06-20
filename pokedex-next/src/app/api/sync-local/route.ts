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

    // Costruiamo il percorso assoluto per cercare il file nel tuo computer
    const filePath = path.join(process.cwd(), 'src', 'data', `${setId}.json`);

    // Controlliamo se hai effettivamente creato il file
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ 
        error: `File locale non trovato! Assicurati di aver creato il file: src/data/${setId}.json` 
      }, { status: 404 });
    }

    // Leggiamo il file senza usare internet
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const setData = JSON.parse(fileContents);

    if (!setData || !setData.cards) {
      return NextResponse.json({ error: 'Il file JSON è vuoto o formattato male.' }, { status: 400 });
    }

    let insertedCount = 0;

    // Inseriamo le carte nel database
    for (const card of setData.cards) {
      const cardId = lang === 'JP' ? `${card.id}-JP` : card.id;
      const imageUrl = card.image ? `${card.image}/high.webp` : 'https://via.placeholder.com/250';

      await prisma.card.upsert({
        where: { id: cardId },
        update: {}, // Non sovrascriviamo se esiste già
        create: {
          id: cardId,
          name: card.name,
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

  } catch (error) {
    console.error("Errore importazione locale:", error);
    return NextResponse.json({ error: 'Errore interno durante la lettura del file' }, { status: 500 });
  }
}