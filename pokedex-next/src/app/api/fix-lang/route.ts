import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Dizionario per sovrascrivere i kanji con i nomi internazionali.
// Puoi aggiungere altri ID (es. Absol in altre espansioni) se necessario.
const jpToEnglishMap: Record<string, string> = {
  "SV4a": "Shiny Treasure ex",
  "S12a": "VSTAR Universe",
  "SV2a": "Pokémon Card 151",
  "S8b": "VMAX Climax",
  "SV1V": "Violet ex",
  "SV1S": "Scarlet ex",
};

export async function GET() {
  try {
    const sets = await prisma.set.findMany();
    let updatedCount = 0;

    for (const set of sets) {
      if (jpToEnglishMap[set.id]) {
        await prisma.set.update({
          where: { id: set.id },
          data: { name: jpToEnglishMap[set.id] }
        });
        updatedCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Aggiornati con successo ${updatedCount} set giapponesi ai nomi inglesi.` 
    });
  } catch (error) {
    console.error("Errore durante l'aggiornamento della lingua:", error);
    return NextResponse.json({ success: false, error: "Impossibile aggiornare i set" }, { status: 500 });
  }
}