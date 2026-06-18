"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  name: string;
  email: string;
}

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Al caricamento, controlla se l'utente esiste
    const storedUser = localStorage.getItem('pokedex_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // Se qualcuno prova ad entrare nel profilo senza login, lo caccia via!
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('pokedex_user');
    router.push('/');
  };

  // Evita sfarfallii mentre controlla il login
  if (!user) return null; 

  return (
    <div className="min-h-screen bg-[#141418] font-sans text-white p-8">
      <div className="max-w-5xl mx-auto">
        
        <div className="flex justify-between items-center mb-10 border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-2">Quartier Generale</h1>
            <p className="text-gray-400">Bentornato, <span className="text-white font-bold">{user.name || 'Allenatore'}</span> ({user.email})</p>
          </div>
          <div className="flex gap-4">
            <Link href="/" className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-full font-bold transition-all">
              Torna al Pokédex
            </Link>
            <button onClick={handleLogout} className="px-6 py-2 bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white border border-red-600 rounded-full font-bold transition-all">
              Esci
            </button>
          </div>
        </div>

        {/* Qui in futuro inseriremo le statistiche e i Masterset */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="bg-gray-900/80 p-8 rounded-3xl border border-gray-700 shadow-xl">
            <h2 className="text-2xl font-bold text-yellow-500 mb-4">Valore Collezione</h2>
            <p className="text-5xl font-black text-white mb-2">$0.00</p>
            <p className="text-gray-400 text-sm">Carte totali possedute: 0</p>
            <div className="mt-6 p-4 bg-gray-800 rounded-xl border border-gray-700">
              <p className="text-sm text-gray-300">Inizia ad aggiungere carte dalla pagina principale per vedere crescere il valore del tuo portfolio in tempo reale!</p>
            </div>
          </div>

          <div className="bg-gray-900/80 p-8 rounded-3xl border border-gray-700 shadow-xl">
            <h2 className="text-2xl font-bold text-blue-400 mb-4">Progresso Masterset</h2>
            <p className="text-gray-400 text-sm mb-6">Tieni traccia del completamento delle tue espansioni preferite.</p>
            
            {/* Esempio di Barra di Progresso */}
            <div className="mb-4">
              <div className="flex justify-between text-sm font-bold mb-2">
                <span>Paldean Fates</span>
                <span className="text-blue-400">0%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-3">
                <div className="bg-blue-500 h-3 rounded-full" style={{ width: '0%' }}></div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}