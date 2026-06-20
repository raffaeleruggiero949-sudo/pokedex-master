import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // 1. Scarichiamo i dati grezzi e "brutti" da TCGDex (il set S12a - VSTAR Universe)
    const response = await fetch('https://api.tcgdex.net/v2/ja/sets/s12a');
    const data = await response.json();

    // 2. Creiamo il percorso dove salvare il file (src/data/s12a.json)
    const dataDir = path.join(process.cwd(), 'src', 'data');
    const filePath = path.join(dataDir, 's12a.json');

    // Se la cartella "data" non esiste, la creiamo in automatico
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // 3. Salviamo il file scrivendolo con un'impaginazione perfetta!
    // Quel "null, 2" formatta il testo rendendolo leggibile per gli umani.
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');

    return NextResponse.json({ 
      success: true, 
      message: "✅ File s12a.json creato e formattato con successo nella cartella src/data!" 
    });

  } catch (error) {
    console.error("Errore:", error);
    return NextResponse.json({ error: "Errore durante la creazione del file" }, { status: 500 });
  }
}