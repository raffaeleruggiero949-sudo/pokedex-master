import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Disabilita la cache statica per forzare Next.js a interrogare il database a ogni richiesta
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Paginazione
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '12', 10);
  const skip = (page - 1) * limit;

  // Filtri
  const search = searchParams.get('search') || '';
  const supertype = searchParams.get('supertype') || '';
  const rarity = searchParams.get('rarity') || '';
  const language = searchParams.get('lang') || '';
  const setId = searchParams.get('setId') || ''; 
  const sort = searchParams.get('sort') || '';   

  // Costruiamo la clausola "WHERE"
  const whereClause: any = {};

  if (search) whereClause.name = { contains: search, mode: 'insensitive' };
  if (supertype) whereClause.supertype = supertype;
  if (rarity) whereClause.rarity = rarity;
  if (language) whereClause.language = language;
  if (setId) whereClause.setId = setId;

  // Costruiamo la clausola "ORDER BY" gestendo i valori nulli per non rompere la griglia
  let orderByClause: any = { id: 'asc' }; 
  if (sort === 'price_asc') orderByClause = { priceUsd: { sort: 'asc', nulls: 'last' } };
  if (sort === 'price_desc') orderByClause = { priceUsd: { sort: 'desc', nulls: 'last' } };

  try {
    const [cards, total] = await Promise.all([
      prisma.card.findMany({
        where: whereClause,
        orderBy: orderByClause,
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