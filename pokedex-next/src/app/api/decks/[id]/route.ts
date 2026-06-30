import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Spacchettiamo i parametri
    const resolvedParams = await params;
    const deckId = resolvedParams.id;

    // Eliminiamo il mazzo
    await prisma.deck.delete({
      where: { id: deckId }
    });

    return NextResponse.json({ message: "Mazzo eliminato con successo" });
  } catch (error) {
    console.error("Errore eliminazione mazzo:", error);
    return NextResponse.json({ error: "Errore durante l'eliminazione" }, { status: 500 });
  }
}