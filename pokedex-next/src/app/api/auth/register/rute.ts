import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; 

export async function POST(request: Request) {
  try {
    // 1. Estraiamo i dati che arrivano dal tuo form
    const body = await request.json();
    const { name, email, password } = body;

    // 2. Controllo di sicurezza base
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e password sono obbligatori' },
        { status: 400 }
      );
    }

    // 3. Controlliamo se esiste già un utente con questa email
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Questa email è già registrata. Prova ad accedere.' },
        { status: 409 }
      );
    }

    // 4. Creiamo l'utente nel Database
    const newUser = await prisma.user.create({
      data: {
        name: name || null,
        email: email,
        password: password, 
      },
    });

    // 5. Tutto è andato a buon fine!
    return NextResponse.json(
      { message: 'Allenatore registrato con successo!', user: { id: newUser.id, email: newUser.email } },
      { status: 201 }
    );
    
  } catch (error) {
    console.error("Errore durante la registrazione:", error);
    return NextResponse.json(
      { error: 'Errore interno del server durante la registrazione.' },
      { status: 500 }
    );
  }
}