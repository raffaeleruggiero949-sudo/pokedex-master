import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import s12aData from '@/data/S12a.json';

export async function GET() {
  try {
    // Assicuriamoci che il set VSTAR Universe esista nel DB prima di inserire le carte
    await prisma.set.upsert({
      where: { id: "S12a" },
      update: {},
      create: {
        id: "S12a",
        name: "VSTAR Universe",
        series: "Sword & Shield",
        totalCards: 262,
        releaseDate: "2022-12-02",
        language: "JP"
      }
    });

    // Mappiamo i dati dal JSON per farli combaciare col tuo schema Prisma
    const cardsToInsert = s12aData.cards.map((card: any) => ({
      id: card.id,
      name: card.name,
      supertype: "Pokémon", // Default generico
      imageUrl: `${card.image}/high.webp`, // URL immagine in alta qualità da TCGDex
      language: "JP",
      hasReverse: true, // VSTAR Universe ha le reverse
      setId: "S12a"
    }));

    // Inseriamo tutto nel DB ignorando eventuali duplicati
    const result = await prisma.card.createMany({
      data: cardsToInsert,
      skipDuplicates: true, 
    });

    return NextResponse.json({ 
      success: true, 
      message: `Caricate con successo ${result.count} carte del set S12a dal file locale!` 
    });
  } catch (error) {
    console.error("Errore sync-local:", error);
    return NextResponse.json({ error: "Errore durante il caricamento del file S12a" }, { status: 500 });
  }
}