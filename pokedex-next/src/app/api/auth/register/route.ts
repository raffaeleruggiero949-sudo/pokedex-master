import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '@/lib/prisma'; // Assicurati che il percorso sia corretto

// Definizione dello schema di validazione
const registerSchema = z.object({
  name: z.string().min(2, "Il nome deve avere almeno 2 caratteri"),
  email: z.string().email("Email non valida"),
  password: z.string().min(8, "La password deve avere almeno 8 caratteri"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 1. Validazione input
    const parsedData = registerSchema.parse(body);

    // 2. Controllo se l'utente esiste già
    const existingUser = await prisma.user.findUnique({
      where: { email: parsedData.email }
    });
    if (existingUser) return NextResponse.json({ error: "Email già in uso" }, { status: 400 });

    // 3. Hashing della password
    const hashedPassword = await bcrypt.hash(parsedData.password, 10);

    // 4. Salvataggio nel DB
    const newUser = await prisma.user.create({
      data: {
        name: parsedData.name,
        email: parsedData.email,
        password: hashedPassword,
      }
    });

    return NextResponse.json({ message: "Utente creato con successo" }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Errore interno del server" }, { status: 500 });
  }
}