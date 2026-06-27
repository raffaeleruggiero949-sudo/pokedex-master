import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// DELETE: Elimina definitivamente un mazzo e tutte le sue carte
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const deckId = params.id;

    await prisma.deck.delete({
      where: { id: deckId }
    });

    return NextResponse.json({ message: "Mazzo eliminato con successo" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Errore durante l'eliminazione del mazzo" }, { status: 500 });
  }
}