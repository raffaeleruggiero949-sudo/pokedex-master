import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Paginazione
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '8', 10);
  const skip = (page - 1) * limit;

  // Nuovi Filtri
  const search = searchParams.get('search') || '';
  const supertype = searchParams.get('supertype') || '';
  const rarity = searchParams.get('rarity') || '';
  const language = searchParams.get('lang') || '';

  // Costruiamo la clausola "WHERE" dinamicamente
  const whereClause: any = {};

  // Cerca parte del nome ignorando maiuscole/minuscole
  if (search) whereClause.name = { contains: search, mode: 'insensitive' };
  
  // Filtri esatti
  if (supertype) whereClause.supertype = supertype;
  if (rarity) whereClause.rarity = rarity;
  if (language) whereClause.language = language;

  try {
    const [cards, total] = await Promise.all([
      prisma.card.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: { set: true },
      }),
      prisma.card.count({ where: whereClause }),
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