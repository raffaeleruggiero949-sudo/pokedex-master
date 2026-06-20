import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // 1. Scarichiamo gli elenchi UFFICIALI da TCGDex
    const [jaRes, enRes] = await Promise.all([
      fetch('https://api.tcgdex.net/v2/ja/sets'),
      fetch('https://api.tcgdex.net/v2/en/sets')
    ]);

    const jaSets = await jaRes.json();
    const enSets = await enRes.json();

    // 2. Creiamo una lista di ID per controllarli velocemente
    const jpIds = new Set(jaSets.map((s: any) => s.id.toLowerCase()));
    const enIds = new Set(enSets.map((s: any) => s.id.toLowerCase()));

    const dbSets = await prisma.set.findMany();
    let fixedCount = 0;

    // 3. Controlliamo e correggiamo ogni set nel tuo database
    for (const set of dbSets) {
      const setIdLower = set.id.toLowerCase();
      let correctLanguage = set.language;

      if (jpIds.has(setIdLower)) {
        correctLanguage = 'JP';
      } else if (enIds.has(setIdLower)) {
        correctLanguage = 'EN';
      }

      // Se la lingua nel DB è sbagliata, la sovrascriviamo con quella reale!
      if (set.language !== correctLanguage) {
        await prisma.set.update({
          where: { id: set.id },
          data: { language: correctLanguage }
        });
        fixedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `✨ Database pulito con successo! Sistemate le lingue di ${fixedCount} espansioni mischiate.`
    });
  } catch (error) {
    console.error("Errore fix DB:", error);
    return NextResponse.json({ error: "Errore durante la pulizia" }, { status: 500 });
  }
}