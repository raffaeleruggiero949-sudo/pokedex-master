import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Nota come abbiamo cambiato { params } per indicare che è una Promise
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // 1. Aspettiamo che Next.js ci consegni i parametri
    const resolvedParams = await params;
    const alertId = resolvedParams.id;

    // 2. Ora possiamo eliminare l'alert con l'ID corretto
    await prisma.priceAlert.delete({
      where: { id: alertId }
    });

    return NextResponse.json({ message: "Alert eliminato con successo" });
  } catch (error) {
    console.error("Errore eliminazione alert:", error);
    return NextResponse.json({ error: "Errore durante l'eliminazione" }, { status: 500 });
  }
}