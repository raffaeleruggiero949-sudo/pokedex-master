import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// UPDATE: Modifica il prezzo o lo stato (Attivo/Inattivo) di un alert
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const alertId = params.id;
    const body = await req.json();
    const { targetPrice, isActive } = body;

    const updatedAlert = await prisma.priceAlert.update({
      where: { id: alertId },
      data: {
        ...(targetPrice !== undefined && { targetPrice: parseFloat(targetPrice) }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) })
      }
    });

    return NextResponse.json(updatedAlert, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Errore nell'aggiornamento dell'alert" }, { status: 500 });
  }
}

// DELETE: Elimina definitivamente un alert
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const alertId = params.id;

    await prisma.priceAlert.delete({
      where: { id: alertId }
    });

    return NextResponse.json({ message: "Alert eliminato con successo" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Errore durante l'eliminazione dell'alert" }, { status: 500 });
  }
}