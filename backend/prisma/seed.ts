import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Funzione fondamentale per mettere in pausa lo script ed evitare il blocco (Rate Limit) dell'API
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  console.log('Pulizia profonda del database in corso... 🧹');
  await prisma.userCard.deleteMany();
  await prisma.card.deleteMany();
  await prisma.set.deleteMany();

  console.log('Scaricamento di TUTTI i Set ufficiali Pokémon... 📚');
  const setsResponse = await fetch('https://api.pokemontcg.io/v2/sets');
  const setsData = await setsResponse.json();

  const setsToInsert = setsData.data.map((set: any) => ({
    id: set.id,
    name: set.name,
    series: set.series,
    totalCards: set.total, // Questo è il numero che useremo per calcolare il completamento del Masterset!
    releaseDate: set.releaseDate,
    logoUrl: set.images.logo,
    symbolUrl: set.images.symbol,
  }));

  // Inseriamo tutti i set in un colpo solo (sono circa 160)
  await prisma.set.createMany({ data: setsToInsert });
  console.log(`✅ Letti e salvati ${setsToInsert.length} Set nel database!`);

  console.log('Inizio scaricamento di TUTTE le carte esistenti...');
  console.log('⚠️ ATTENZIONE: Questa operazione richiederà circa 3-5 minuti. Non chiudere il terminale!');

  let page = 1;
  let hasMore = true;
  let totalCardsImported = 0;

  while (hasMore) {
   console.log(`Richiesta pagina ${page}...`);
    const cardsResponse = await fetch(`https://api.pokemontcg.io/v2/cards?page=${page}&pageSize=250`, {
      headers: {
        'X-Api-Key': process.env.POKEMON_API_KEY || 'ecf4574b-6ee4-4daf-88b4-a2486c9f3dad', // Inseriamo la chiave API!
      }
    });
      }
      throw new Error(`Errore API: ${cardsResponse.statusText}`);
    }

    const cardsData = await cardsResponse.json();

    // Se l'array è vuoto, significa che abbiamo scaricato tutte le carte del mondo
    if (cardsData.data.length === 0) {
      hasMore = false;
      break;
    }

    // Prepariamo le 250 carte della pagina corrente
    const cardsToInsert = cardsData.data.map((card: any) => {
      const priceUsd = card.tcgplayer?.prices?.normal?.market 
                    || card.tcgplayer?.prices?.holofoil?.market 
                    || card.tcgplayer?.prices?.reverseHolofoil?.market 
                    || 0;

      return {
        id: card.id,
        name: card.name,
        supertype: card.supertype,
        rarity: card.rarity || 'Common',
        priceUsd: priceUsd,
        imageUrl: card.images.large || card.images.small || '',
        setId: card.set.id,
      };
    });

    // Inseriamo in blocco nel database (createMany è velocissimo)
    await prisma.card.createMany({ data: cardsToInsert, skipDuplicates: true });
    totalCardsImported += cardsToInsert.length;
    console.log(`✅ Importate ${totalCardsImported} carte finora...`);

    page++;
    // Pausa di 2.5 secondi prima della prossima richiesta per far respirare l'API pubblica
    await sleep(200);
  }

  console.log(`🎉 INCREDIBILE! Hai clonato il database mondiale: ${totalCardsImported} carte importate con successo!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });