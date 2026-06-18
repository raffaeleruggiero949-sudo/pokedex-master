import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

// 1. Carica le variabili dal file .env
dotenv.config();

// 2. Inizializza la connessione usando l'adapter PostgreSQL
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Inizio il seeding del database... 🌱');

  // 1. Creiamo un po' di Espansioni (Sets)
  const set1 = await prisma.set.upsert({
    where: { id: 'cri' },
    update: {},
    create: {
      id: 'cri',
      name: 'Chaos Rising',
      series: 'Mega Evolution',
      totalCards: 122,
      releaseDate: '2026/05/22',
      logoUrl: 'https://via.placeholder.com/150x50/141418/FFFFFF?text=Chaos+Rising',
    },
  });

  const set2 = await prisma.set.upsert({
    where: { id: 'wht' },
    update: {},
    create: {
      id: 'wht',
      name: 'White Flare',
      series: 'Scarlet & Violet',
      totalCards: 173,
      releaseDate: '2025/07/18',
      logoUrl: 'https://via.placeholder.com/150x50/141418/FFFFFF?text=White+Flare',
    },
  });

  // 2. Creiamo un po' di Carte associate ai Set
  await prisma.card.upsert({
    where: { id: 'cri-1' },
    update: {},
    create: {
      id: 'cri-1',
      name: 'AZ',
      supertype: 'Trainer',
      rarity: 'Rare Ultra',
      priceUsd: 25.99,
      imageUrl: 'https://images.pokemontcg.io/xy4/117_hires.png',
      setId: set1.id,
    },
  });

  await prisma.card.upsert({
    where: { id: 'cri-2' },
    update: {},
    create: {
      id: 'cri-2',
      name: "AZ's Tranquility",
      supertype: 'Trainer',
      rarity: 'Ultra Rare',
      priceUsd: 45.50,
      imageUrl: 'https://images.pokemontcg.io/xy4/122_hires.png',
      setId: set1.id,
    },
  });

  await prisma.card.upsert({
    where: { id: 'wht-1' },
    update: {},
    create: {
      id: 'wht-1',
      name: 'Charizard ex',
      supertype: 'Pokémon',
      rarity: 'Special Illustration Rare',
      priceUsd: 120.00,
      imageUrl: 'https://images.pokemontcg.io/sv3/223_hires.png',
      setId: set2.id,
    },
  });

  console.log('Seeding completato con successo! 🎉');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });