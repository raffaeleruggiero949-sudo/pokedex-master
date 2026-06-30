import { NextResponse } from 'next/dist/server/web/spec-extension/response';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // TODO: Sostituisci questo con l'ID dell'utente attualmente loggato
    const userId = "0fb288b4-9fdd-469e-8cb0-f2accca2bf69"; 

    const notifications = await prisma.notification.findMany({
      where: { 
        userId: userId,
        isRead: false 
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(notifications);
  } catch (error) {
    return NextResponse.json({ error: "Errore nel recupero delle notifiche" }, { status: 500 });
  }
}