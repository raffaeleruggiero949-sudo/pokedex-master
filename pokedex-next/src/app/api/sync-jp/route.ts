import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // 1. Chiamata per scaricare le CARTE in Giapponese (Immagini e nomi originali)
    const responseJa = await fetch('https://api.tcgdex.net/v2/ja/sets/sv4a');
    
    // 2. Chiamata strategica per scaricare i dettagli del SET in Inglese!
    const responseEn = await fetch('https://api.tcgdex.net/v2/en/sets/sv4a');
    
    let englishSetName = "Shiny Treasure ex"; // Nome di sicurezza
    
    // Se TCGDex ci risponde in inglese, estraiamo il nome tradotto pulito
    if (responseEn.ok) {
       const enData = await responseEn.json();
       if (enData.name) {
         englishSetName = enData.name;
       }
    }

    let setData = null;
    if (responseJa.ok) {
      setData = await responseJa.json();
    }

    let cardsToInsert = [];
    let totalCards = 190;
    let logoUrl = "";

    if (setData && setData.cards) {
      cardsToInsert = setData.cards;
      totalCards = setData.cardCount?.total || totalCards;
      logoUrl = setData.logo ? `${setData.logo}.png` : "";
    } else {
      // Fallback in caso di API offline
      cardsToInsert = [
        { id: 'sv4a-349', name: 'Charizard ex (SSR)', image: 'https://assets.tcgdex.net/ja/sv/sv4a/349' },
        { id: 'sv4a-350', name: 'Mew ex (SSR)', image: 'https://assets.tcgdex.net/ja/sv/sv4a/350' },
        { id: 'sv4a-348', name: 'Pikachu (S)', image: 'https://assets.tcgdex.net/ja/sv/sv4a/348' },
        { id: 'sv4a-330', name: 'Iono (SAR)', image: 'https://assets.tcgdex.net/ja/sv/sv4a/330' }
      ];
    }

    // 3. Salviamo (o aggiorniamo) il Set nel database usando ESCLUSIVAMENTE il nome in inglese
    await prisma.set.upsert({
      where: { id: 'sv4a' },
      update: { 
        name: englishSetName // <-- MAGIA: Se il set esiste già in giapponese, lo rinomina in inglese!
      }, 
      create: {
        id: 'sv4a',
        name: englishSetName,
        series: 'Scarlet & Violet',
        totalCards: totalCards,
        releaseDate: '2023-12-01',
        logoUrl: logoUrl,
      },
    });

    let insertedCount = 0;

    // 4. Inseriamo le carte nel Database Prisma (mantenendo i loro nomi originali come hai chiesto)
    for (const card of cardsToInsert) {
      const cardId = `${card.id}-JP`;
      const imageUrl = card.image ? `${card.image}/high.webp` : 'https://via.placeholder.com/250';

      await prisma.card.upsert({
        where: { id: cardId },
        update: {}, // Le carte non le tocchiamo se ci sono già
        create: {
          id: cardId,
          name: card.name,
          supertype: 'Pokémon',
          rarity: 'Special Illustration Rare',
          language: 'JP',
          priceUsd: 0, 
          imageUrl: imageUrl,
          setId: 'sv4a',
        },
      });
      insertedCount++;
    }

    return NextResponse.json({ 
      success: true, 
      message: `Banzai! 🇯🇵 Il set è stato rinominato in "${englishSetName}".` 
    });

  } catch (error) {
    console.error("Errore Sync JP:", error);
    return NextResponse.json({ error: 'Errore interno durante il download' }, { status: 500 });
  }
}