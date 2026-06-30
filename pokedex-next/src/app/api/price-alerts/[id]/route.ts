import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// DELETE: Elimina l'alert
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const alertId = resolvedParams.id;

    await prisma.priceAlert.delete({
      where: { id: alertId }
    });

    return NextResponse.json({ message: "Alert eliminato con successo" });
  } catch (error) {
    console.error("Errore eliminazione alert:", error);
    return NextResponse.json({ error: "Errore durante l'eliminazione" }, { status: 500 });
  }
}

// PATCH: Aggiorna lo stato (Attivo/Inattivo)
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const alertId = resolvedParams.id;
    
    // Leggiamo il nuovo stato dal corpo della richiesta
    const body = await req.json();
    const { isActive } = body;

    // Aggiorniamo il database
    const updatedAlert = await prisma.priceAlert.update({
      where: { id: alertId },
      data: { isActive: isActive }
    });

    return NextResponse.json(updatedAlert);
  } catch (error) {
    console.error("Errore aggiornamento stato alert:", error);
    return NextResponse.json({ error: "Errore durante l'aggiornamento" }, { status: 500 });
  }
}