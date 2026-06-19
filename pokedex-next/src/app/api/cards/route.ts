import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// src/app/api/cards/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '8', 10);
  const skip = (page - 1) * limit;
  
  // Nuovi parametri di filtro
  const search = searchParams.get('search') || '';
  const rarity = searchParams.get('rarity') || '';
  const language = searchParams.get('lang') || '';

  const whereClause: any = {
    name: { contains: search, mode: 'insensitive' }
  };
  
  if (rarity) whereClause.rarity = rarity;
  if (language) whereClause.language = language;

  const [cards, total] = await Promise.all([
    prisma.card.findMany({
      where: whereClause,
      skip,
      take: limit,
      include: { set: true },
    }),
    prisma.card.count({ where: whereClause }),
  ]);
  // ... resto del codice
  try {
    // Interroghiamo PostgreSQL tramite Prisma
    const [cards, total] = await Promise.all([
      prisma.card.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: { set: true },
      }),
      prisma.card.count(),
    ]);

    return NextResponse.json({
      data: cards,
      meta: {
        totalItems: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Errore API Next.js:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}