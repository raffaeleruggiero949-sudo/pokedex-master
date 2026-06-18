"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter(); // Ci serve per reindirizzare l'utente
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isRegister) {
      // --- LOGICA DI REGISTRAZIONE ---
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await response.json();

        if (response.ok) {
          alert('Allenatore registrato con successo! Ora puoi accedere.');
          setIsRegister(false);
          setPassword('');
        } else {
          alert(data.error || 'Errore durante la registrazione.');
        }
      } catch (error) {
        console.error("Errore di rete:", error);
        alert('Impossibile contattare il server.');
      }
    } else {
      // --- LOGICA DI LOGIN ---
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
          // Salviamo i dati dell'utente nella memoria del browser
          localStorage.setItem('pokedex_user', JSON.stringify(data.user));
          
          // Riportiamo l'utente alla Home Page
          router.push('/');
        } else {
          alert(data.error || 'Errore durante il login.');
        }
      } catch (error) {
        console.error("Errore di rete:", error);
        alert('Impossibile contattare il server.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#141418] font-sans p-4">
      <div className="w-full max-w-md bg-gray-900/80 p-8 rounded-3xl border border-gray-700 shadow-2xl backdrop-blur-sm">
        
        <Link href="/" className="text-gray-500 hover:text-white text-sm mb-6 inline-block transition-colors">
          &larr; Torna al Pokédex
        </Link>

        <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
          {isRegister ? 'Crea un Account' : 'Bentornato Allenatore'}
        </h2>
        <p className="text-gray-400 text-sm mb-8">
          {isRegister ? 'Inizia a costruire la tua collezione personale.' : 'Accedi per gestire le tue carte.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Nome</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                placeholder="Ash Ketchum"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
              placeholder="ash@pallet-town.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-red-500/20 mt-4"
          >
            {isRegister ? 'Registrati' : 'Accedi'}
          </button>
        </form>

        <p className="mt-8 text-center text-gray-400 text-sm">
          {isRegister ? 'Hai già un account?' : 'Non hai ancora un account?'}
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="ml-2 text-red-500 hover:text-red-400 font-bold underline transition-colors"
          >
            {isRegister ? 'Accedi' : 'Registrati'}
          </button>
        </p>

      </div>
    </div>
  );
}