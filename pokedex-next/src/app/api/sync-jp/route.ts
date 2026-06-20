import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // 1. Facciamo la chiamata all'API di TCGDex per il set Giapponese "Shiny Treasure ex" (id: sv4a)
    // Puoi cambiare 'sv4a' con 'sv2a' se vuoi ad esempio il set 151 giapponese!
    const response = await fetch('https://api.tcgdex.net/v2/jp/sets/sv4a');
    const setData = await response.json();

    if (!setData || !setData.cards) {
      return NextResponse.json({ error: 'Nessun dato trovato su TCGDex' }, { status: 404 });
    }

    // 2. Creiamo il Set Giapponese nel tuo database Prisma
    await prisma.set.upsert({
      where: { id: 'sv4a' },
      update: {},
      create: {
        id: 'sv4a',
        name: setData.name || 'Shiny Treasure ex',
        series: 'Scarlet & Violet',
        totalCards: setData.cardCount?.total || 190,
        releaseDate: setData.releaseDate || '2023-12-01',
        logoUrl: setData.logo ? `${setData.logo}.png` : '',
      },
    });

    let insertedCount = 0;

    // 3. Cicliamo tutte le carte scaricate e le inseriamo nel database
    for (const card of setData.cards) {
      const cardId = `${card.id}-JP`; // Aggiungiamo "-JP" per non confonderle con quelle americane
      
      // TCGDex richiede di aggiungere /high.webp alla fine dell'URL per avere l'immagine in HD
      const imageUrl = card.image ? `${card.image}/high.webp` : 'https://via.placeholder.com/250';

      await prisma.card.upsert({
        where: { id: cardId },
        update: {},
        create: {
          id: cardId,
          name: card.name,
          supertype: 'Pokémon', // Mettiamo un valore di default
          rarity: 'Rare Holo', // Mettiamo un valore di default
          language: 'JP', // <--- ECCO LA MAGIA! Segniamo la carta come Giapponese
          priceUsd: 0, // Il prezzo partirà da 0 (potresti aggiornarlo a mano o con altre API in futuro)
          imageUrl: imageUrl,
          setId: 'sv4a',
        },
      });
      insertedCount++;
    }

    return NextResponse.json({ 
      success: true, 
      message: `Banzai! 🇯🇵 Inserite ${insertedCount} carte giapponesi nel database.` 
    });

  } catch (error) {
    console.error("Errore Sync JP:", error);
    return NextResponse.json({ error: 'Errore interno durante il download' }, { status: 500 });
  }
}