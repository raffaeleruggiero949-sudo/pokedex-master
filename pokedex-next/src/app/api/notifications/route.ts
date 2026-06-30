import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: Recupera le notifiche dell'utente loggato
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: "UserId mancante" }, { status: 400 });
    }

    // Prende le ultime 15 notifiche
    const notifications = await prisma.notification.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
      take: 15
    });

    // Conta solo quelle NON lette per mostrare il numerino rosso
    const unreadCount = await prisma.notification.count({
      where: { userId: userId, isRead: false }
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error("Errore recupero notifiche:", error);
    return NextResponse.json({ error: "Errore interno" }, { status: 500 });
  }
}

// PATCH: Segna tutte le notifiche di un utente come "Lette"
export async function PATCH(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: "UserId mancante" }, { status: 400 });
    }

    // Aggiorna il database mettendo isRead a true
    await prisma.notification.updateMany({
      where: { userId: userId, isRead: false },
      data: { isRead: true }
    });

    return NextResponse.json({ success: true, message: "Notifiche lette" });
  } catch (error) {
    console.error("Errore aggiornamento notifiche:", error);
    return NextResponse.json({ error: "Errore interno" }, { status: 500 });
  }
}