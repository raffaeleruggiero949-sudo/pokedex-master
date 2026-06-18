import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email e password sono obbligatori' }, { status: 400 });
    }

    // 1. Cerca l'utente nel database tramite l'email
    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    // 2. Se l'utente non esiste o la password è sbagliata, blocca l'accesso
    if (!user || user.password !== password) {
      return NextResponse.json({ error: 'Credenziali non valide. Riprova.' }, { status: 401 });
    }

    // 3. Rimuoviamo la password dai dati per sicurezza prima di inviarli al frontend
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { message: 'Login effettuato con successo!', user: userWithoutPassword },
      { status: 200 }
    );
    
  } catch (error) {
    console.error("Errore durante il login:", error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}