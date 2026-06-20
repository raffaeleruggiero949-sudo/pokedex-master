import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Mappa degli ID dei set giapponesi con i nomi che desideri in inglese
const setTranslations: Record<string, string> = {
  // Esempi basati sulle espansioni reali
  "sv4a": "Shiny Treasure ex",
  "s12a": "VSTAR Universe",
  "s8b": "VMAX Climax",
  "s4a": "Shiny Star V",
  "sv2a": "Pokémon Card 151",
  "sv5k": "Wild Force",
  "sv5m": "Cyber Judge",
  "sv6": "Mask of Change",
  "sv6a": "Night Wanderer",
  "sv7": "Stellar Miracle",
  // Inserisci qui l'ID esatto del set che citavi (es. se "mega dream ex" ha id "sm8b" o simile)
  "ID_DEL_SET_QUI": "Ascended Hero", 
};

export async function GET() {
  try {
    let updatedSets = 0;
    const results = [];

    for (const [setId, englishName] of Object.entries(setTranslations)) {
      // Controlliamo prima se il set esiste nel database
      const existingSet = await prisma.set.findUnique({
        where: { id: setId }
      });

      if (existingSet) {
        // Se esiste, aggiorniamo il nome (e impostiamo la lingua su EN per coerenza)
        await prisma.set.update({
          where: { id: setId },
          data: { 
            name: englishName,
            language: "EN" 
          }
        });
        updatedSets++;
        results.push(`${existingSet.name} -> ${englishName}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Aggiornati ${updatedSets} set con successo!`,
      details: results
    });

  } catch (error) {
    console.error("Errore durante l'aggiornamento dei nomi:", error);
    return NextResponse.json(
      { success: false, error: "Impossibile aggiornare i set." },
      { status: 500 }
    );
  }
}