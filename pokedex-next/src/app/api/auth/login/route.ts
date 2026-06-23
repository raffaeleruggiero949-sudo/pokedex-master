import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '@/lib/prisma';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    // Trova utente
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "Credenziali non valide" }, { status: 401 });

    // Compara password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return NextResponse.json({ error: "Credenziali non valide" }, { status: 401 });

    // Genera Token
    const token = jwt.sign(
      { userId: user.id, email: user.email }, 
      process.env.JWT_SECRET || 'super_segreto_di_sviluppo', 
      { expiresIn: '7d' }
    );

    // Invia la risposta impostando il cookie HttpOnly
    const response = NextResponse.json({ 
      message: "Login effettuato", 
      user: { id: user.id, name: user.name, email: user.email } 
    }, { status: 200 });

    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true, // Cruciale per la sicurezza!
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 7 giorni
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Errore durante il login" }, { status: 500 });
  }
}