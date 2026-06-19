"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('pokedex_user');
    
    // Se l'utente non è loggato, lo rimandiamo alla Home
    if (!storedUser) {
      router.push('/');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    // Chiamiamo la nostra nuova potentissima API
    fetch(`/api/portfolio?userId=${parsedUser.id}`)
      .then((res) => res.json())
      .then((data) => {
        setPortfolioData(data);
        setLoading(false);
      });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('pokedex_user');
    router.push('/');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white">Caricamento Portfolio...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 font-sans min-h-screen text-white">
      {/* HEADER PROFILO */}
      <header className="flex justify-between items-center mb-12 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-4xl font-black">Bentornato, <span className="text-red-500">{user?.name}</span></h1>
          <p className="text-gray-400 mt-2">Ecco lo stato aggiornato della tua collezione.</p>
        </div>
        <div className="flex gap-4">
          <Link href="/" className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-full font-bold transition-all">
            Torna al Pokédex
          </Link>
          <button onClick={handleLogout} className="px-6 py-2 bg-red-600 hover:bg-red-500 rounded-full font-bold transition-all">
            Esci
          </button>
        </div>
      </header>

      {/* STATISTICHE GENERALI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-gradient-to-br from-green-900/40 to-green-600/10 border border-green-500/30 p-8 rounded-3xl flex flex-col justify-center items-center shadow-lg shadow-green-900/20">
          <h2 className="text-xl text-green-400 font-bold mb-2">Valore Totale Mercato</h2>
          <p className="text-6xl font-black text-white">${portfolioData.totalValue}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-900/40 to-blue-600/10 border border-blue-500/30 p-8 rounded-3xl flex flex-col justify-center items-center shadow-lg shadow-blue-900/20">
          <h2 className="text-xl text-blue-400 font-bold mb-2">Carte Totali Collezionate</h2>
          <p className="text-6xl font-black text-white">
            {/* Sommiamo le quantità di tutte le carte possedute */}
            {portfolioData.cards.reduce((acc: number, curr: any) => acc + curr.quantity, 0)}
          </p>
        </div>
      </div>

      {/* PROGRESSO MASTERSET */}
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">🎯 Progresso Masterset</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {portfolioData.mastersets.map((set: any) => (
          <div key={set.setId} className="bg-gray-800/50 border border-gray-700 p-6 rounded-2xl flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                {set.logoUrl && <img src={set.logoUrl} alt="logo" className="h-10 w-auto object-contain" />}
                <h3 className="text-xl font-bold">{set.setName}</h3>
              </div>
              <span className="text-xl font-black text-yellow-400">{set.percentage}%</span>
            </div>
            
            {/* Barra di Progresso */}
            <div className="w-full bg-gray-900 rounded-full h-4 mb-2 overflow-hidden border border-gray-700">
              <div 
                className="bg-gradient-to-r from-yellow-600 to-yellow-400 h-4 rounded-full transition-all duration-1000" 
                style={{ width: `${set.percentage}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-400 text-right">
              {set.collectedUnique} su {set.totalCards} carte base trovate
            </p>
          </div>
        ))}
        {portfolioData.mastersets.length === 0 && (
          <p className="text-gray-500 italic">Non hai ancora iniziato nessun Masterset.</p>
        )}
      </div>

      {/* GRIGLIA CARTE POSSEDUTE */}
      <h2 className="text-3xl font-bold mb-6">🗂️ Le Tue Carte</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {portfolioData.cards.map((uc: any) => (
          <div key={uc.id} className="relative group">
            {/* Badge Quantità */}
            <div className="absolute -top-3 -right-3 z-10 bg-red-600 text-white font-black w-10 h-10 rounded-full flex items-center justify-center border-4 border-gray-900 shadow-xl">
              x{uc.quantity}
            </div>
            
            <Link href={`/cards/${uc.card.id}`}>
              <div className="bg-gray-800 p-3 rounded-2xl border border-gray-700 hover:border-blue-500 transition-all cursor-pointer">
                <img src={uc.card.imageUrl} alt={uc.card.name} className="w-full h-auto rounded-xl mb-3" />
                <h3 className="font-bold truncate">{uc.card.name}</h3>
                <p className="text-green-400 font-bold">${uc.card.priceUsd}</p>
              </div>
            </Link>
          </div>
        ))}
        {portfolioData.cards.length === 0 && (
          <p className="text-gray-500 italic col-span-full">La tua collezione è ancora vuota. Vai al Pokédex per aggiungere le tue prime carte!</p>
        )}
      </div>
    </div>
  );
}