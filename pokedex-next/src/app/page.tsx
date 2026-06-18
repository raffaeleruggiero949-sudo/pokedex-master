"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Card {
  id: string;
  name: string;
  supertype: string;
  rarity: string;
  priceUsd: number;
  imageUrl: string;
  set: { name: string };
}

interface MetaData {
  totalItems: number;
  currentPage: number;
  totalPages: number;
}

export default function Home() {
  const [cards, setCards] = useState<Card[]>([]);
  const [meta, setMeta] = useState<MetaData | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/cards?page=${currentPage}&limit=8`)
      .then((response) => response.json())
      .then((json) => {
        setCards(json.data || []);
        setMeta(json.meta || null);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Errore API:", error);
        setLoading(false);
      });
  }, [currentPage]);

  const filteredCards = cards.filter((card) => {
    const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === '' || card.supertype === selectedType;
    return matchesSearch && matchesType;
  });

  if (loading && cards.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 font-sans min-h-screen text-white">
        <header className="mb-10 text-center">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-700 to-gray-500 tracking-tight animate-pulse">
            Caricamento...
          </h1>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="bg-gray-800 rounded-2xl p-4 h-[420px] animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 font-sans min-h-screen text-white flex flex-col">
      <header className="mb-10 relative">
        <div className="absolute right-0 top-0 z-10">
          <Link href="/login" className="px-6 py-2 bg-red-600/10 hover:bg-red-600 border border-red-600 text-red-500 hover:text-white rounded-full font-bold transition-all inline-block">
            Accedi / Registrati
          </Link>
        </div>
        <div className="text-center pt-8">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500 tracking-tight">
            Pokédex Master
          </h1>
          <p className="text-gray-400 mt-2">Gestisci e filtra la tua collezione in tempo reale.</p>
        </div>
      </header>

      <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 mb-10 flex flex-col md:flex-row gap-4 items-center justify-between shadow-md">
        <div className="relative w-full md:w-1/2">
          <input
            type="text"
            placeholder="Cerca una carta per nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none"
          />
        </div>
        <div className="w-full md:w-1/4">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none"
          >
            <option value="">Tutti i Tipi</option>
            <option value="Pokémon">Pokémon</option>
            <option value="Trainer">Trainer</option>
          </select>
        </div>
      </div>

      {filteredCards.length === 0 && !loading && (
        <div className="text-center py-20 bg-gray-800/20 rounded-2xl border border-dashed border-gray-700 flex-grow">
          <p className="text-xl text-gray-400">Nessuna carta corrisponde ai criteri. 🔍</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-12">
        {filteredCards.map((card) => (
          <Link href={`/cards/${card.id}`} key={card.id}>
            <div className="bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-700 hover:-translate-y-2 hover:border-red-500/50 transition-all h-full flex flex-col justify-between cursor-pointer">
              <div>
                <img src={card.imageUrl} alt={card.name} className="w-full h-auto rounded-xl mb-4" />
                <h2 className="text-xl font-bold text-white">{card.name}</h2>
                <span className="text-gray-400 text-sm">{card.set.name}</span>
              </div>
              <div className="mt-4 pt-2 border-t border-gray-700/50 flex justify-between items-center">
                <span className="text-xs text-gray-500 font-mono uppercase">{card.supertype}</span>
                <h3 className="text-2xl font-black text-green-400">${card.priceUsd}</h3>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="mt-auto flex justify-center items-center space-x-6 bg-gray-900/50 p-4 rounded-full border border-gray-800 self-center">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-6 py-2 rounded-full font-bold transition-all ${currentPage === 1 ? 'bg-gray-800 text-gray-600' : 'bg-red-600 hover:bg-red-500 text-white'}`}
          >
            &larr; Precedente
          </button>
          <span className="text-gray-400 font-medium">
            Pagina <strong className="text-white">{meta.currentPage}</strong> di {meta.totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, meta.totalPages))}
            disabled={currentPage === meta.totalPages}
            className={`px-6 py-2 rounded-full font-bold transition-all ${currentPage === meta.totalPages ? 'bg-gray-800 text-gray-600' : 'bg-red-600 hover:bg-red-500 text-white'}`}
          >
            Successiva &rarr;
          </button>
        </div>
      )}
    </div>
  );
}