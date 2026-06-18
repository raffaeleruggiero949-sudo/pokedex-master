import 'dotenv/config';
import { defineConfig } from '@prisma/config';

export default defineConfig({
  datasource: {
    // Il punto interrogativo/fallback è utile per evitare errori TS
    url: process.env.DATABASE_URL || "", 
  },
  migrations: {
    seed: 'npx ts-node prisma/seed.ts',
  },
});