import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  // Recuperiamo i parametri di paginazione direttamente dall'URL
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '8', 10);
  const skip = (page - 1) * limit;

  try {
    // Interroghiamo PostgreSQL tramite Prisma
    const [cards, total] = await Promise.all([
      prisma.card.findMany({
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