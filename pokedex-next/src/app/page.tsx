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

interface User {
  id: string;
  name: string;
  email: string;
}

const translations = {
  IT: {
    subtitle: "Esplora l'archivio globale delle carte.",
    login: "Accedi / Registrati",
    profile: "Profilo di",
    search: "Cerca per nome (es. Charizard)...",
    allTypes: "Tutti i Tipi",
    trainer: "Allenatore",
    energy: "Energia",
    allRarities: "Tutte le Rarità",
    common: "Comuni",
    uncommon: "Non Comuni",
    rare: "Rare",
    allCardLangs: "Qualsiasi Lingua",
    cardEn: "Inglese 🇬🇧",
    cardJp: "Giapponese 🇯🇵",
    loading: "Ricerca nell'archivio...",
    noResults: "Nessuna carta trovata con questi filtri.",
    prev: "Indietro",
    next: "Avanti",
    page: "Pagina",
    of: "di",
    unknown: "Sconosciuto"
  },
  EN: {
    subtitle: "Explore the global card archive.",
    login: "Login / Register",
    profile: "Profile of",
    search: "Search by name (e.g. Charizard)...",
    allTypes: "All Types",
    trainer: "Trainer",
    energy: "Energy",
    allRarities: "All Rarities",
    common: "Common",
    uncommon: "Uncommon",
    rare: "Rare",
    allCardLangs: "Any Language",
    cardEn: "English 🇬🇧",
    cardJp: "Japanese 🇯🇵",
    loading: "Searching the archive...",
    noResults: "No cards found with these filters.",
    prev: "Previous",
    next: "Next",
    page: "Page",
    of: "of",
    unknown: "Unknown"
  }
};

export default function Home() {
  const [cards, setCards] = useState<Card[]>([]);
  const [meta, setMeta] = useState<MetaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  
  const [uiLang, setUiLang] = useState<'IT' | 'EN'>('IT');
  const t = translations[uiLang]; 
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedRarity, setSelectedRarity] = useState('');
  const [selectedCardLang, setSelectedCardLang] = useState(''); 
  
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedType, selectedRarity, selectedCardLang]);

  useEffect(() => {
    const storedUser = localStorage.getItem('pokedex_user');
    if (storedUser) setUser(JSON.parse(storedUser));

    const savedUiLang = localStorage.getItem('pokedex_ui_lang');
    if (savedUiLang === 'EN' || savedUiLang === 'IT') setUiLang(savedUiLang);

    setLoading(true);

    const queryParams = new URLSearchParams({
      page: currentPage.toString(),
      limit: '12', 
    });
    
    if (searchTerm) queryParams.append('search', searchTerm);
    if (selectedType) queryParams.append('supertype', selectedType);
    if (selectedRarity) queryParams.append('rarity', selectedRarity);
    if (selectedCardLang) queryParams.append('lang', selectedCardLang);

    fetch(`/api/cards?${queryParams.toString()}`)
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
  }, [currentPage, searchTerm, selectedType, selectedRarity, selectedCardLang]);

  const toggleUiLanguage = () => {
    const newLang = uiLang === 'IT' ? 'EN' : 'IT';
    setUiLang(newLang);
    localStorage.setItem('pokedex_ui_lang', newLang);
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col selection:bg-blue-500/30">
      
      <header className="bg-slate-900 border-b border-slate-800 px-8 py-6 shadow-lg sticky top-0 z-50 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 tracking-tight">
            Pokédex Master
          </h1>
          <p className="text-slate-400 text-sm mt-1">{t.subtitle}</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleUiLanguage}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-lg font-bold transition-all flex items-center gap-2"
          >
            {uiLang === 'IT' ? '🇮🇹 IT' : '🇬🇧 EN'}
          </button>

          {user ? (
            <Link href="/profile" className="px-6 py-2 bg-blue-600/20 hover:bg-blue-600 border border-blue-600/50 text-blue-400 hover:text-white rounded-full font-bold transition-all shadow-lg shadow-blue-900/20">
              👤 {t.profile} {user.name}
            </Link>
          ) : (
            <Link href="/login" className="px-6 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-full font-bold transition-all">
              {t.login}
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 w-full flex-grow flex flex-col">
        
        <div className="bg-slate-900 p-4 md:p-6 rounded-2xl border border-slate-800 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xl">
          
          <div className="w-full md:w-1/3">
            <input
              type="text"
              placeholder={t.search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          
          <div className="w-full md:w-1/6">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors cursor-pointer"
            >
              <option value="">{t.allTypes}</option>
              <option value="Pokémon">Pokémon</option>
              <option value="Trainer">{t.trainer}</option>
              <option value="Energy">{t.energy}</option>
            </select>
          </div>

          {/* FILTRO RARITÀ AGGIORNATO (Senza Radiant, con Mega Attack e Nuove Gold) */}
          <div className="w-full md:w-1/4">
            <select
              value={selectedRarity}
              onChange={(e) => setSelectedRarity(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors cursor-pointer"
            >
              <option value="">{t.allRarities}</option>
              <option value="Common">{t.common}</option>
              <option value="Uncommon">{t.uncommon}</option>
              <option value="Rare">{t.rare}</option>
              <option value="Rare Holo">Holo / Reverse</option>
              
              <optgroup label="Carte V, EX, GX, MEGA" className="bg-slate-900 text-blue-400">
                <option value="Rare Holo V" className="text-white">V</option>
                <option value="Rare Holo VMAX" className="text-white">VMAX</option>
                <option value="Rare Holo VSTAR" className="text-white">VSTAR (V ASTRO)</option>
                <option value="Rare Holo GX" className="text-white">GX</option>
                <option value="Rare Holo EX" className="text-white">EX / MEGA</option>
                <option value="Double Rare" className="text-white">ex (Double Rare)</option>
              </optgroup>

              <optgroup label="Full Art & Speciali" className="bg-slate-900 text-emerald-400">
                <option value="Rare Ultra" className="text-white">Full Art / Ultra Rare</option>
                <option value="Illustration Rare" className="text-white">Illustration Rare (IR)</option>
                <option value="Special Illustration Rare" className="text-white">Special Ill. Rare (SIR)</option>
              </optgroup>

              <optgroup label="Gold & Nuove Rarità" className="bg-slate-900 text-yellow-500">
                <option value="Hyper Rare" className="text-white">Hyper Rare (Gold SV)</option>
                <option value="Rare Secret" className="text-white">Secret Rare (Vecchie Gold / Rainbow)</option>
                <option value="VSTAR Gold" className="text-white">VSTAR Gold (V ASTRO Gold)</option>
                <option value="New Gold Rare" className="text-white">Nuove Gold (Chaos Rising/Perfect Order)</option>
                <option value="Mega Attack Rare" className="text-white">Mega Attack Rare (Ascended Heroes)</option>
              </optgroup>

              <optgroup label="Fuoriserie Classiche" className="bg-slate-900 text-purple-400">
                <option value="Amazing Rare" className="text-white">Amazing Rare</option>
                <option value="Rare Holo Star" className="text-white">Gold Star (Classiche)</option>
                <option value="LEGEND" className="text-white">LEGEND</option>
              </optgroup>
            </select>
          </div>

          <div className="w-full md:w-1/4">
            <select
              value={selectedCardLang}
              onChange={(e) => setSelectedCardLang(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors cursor-pointer"
            >
              <option value="">{t.allCardLangs}</option>
              <option value="EN">{t.cardEn}</option>
              <option value="JP">{t.cardJp}</option>
            </select>
          </div>
        </div>

        {loading && cards.length === 0 ? (
          <div className="flex-grow flex items-center justify-center">
            <div className="text-2xl text-slate-500 animate-pulse font-bold">{t.loading}</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-12">
            {cards.map((card) => (
              <Link href={`/cards/${card.id}`} key={card.id}>
                <div className="bg-slate-900 rounded-2xl p-3 shadow-xl border border-slate-800 hover:border-blue-500 hover:-translate-y-2 transition-all duration-300 cursor-pointer h-full flex flex-col group">
                  
                  <div className="relative mb-3 overflow-hidden rounded-xl">
                    <img 
                      src={card.imageUrl} 
                      alt={card.name} 
                      className="w-full h-auto transform group-hover:scale-105 transition-transform duration-500" 
                    />
                  </div>
                  
                  <div className="flex flex-col flex-grow">
                    <h2 className="text-sm font-bold text-white truncate mb-1">{card.name}</h2>
                    <span className="text-slate-400 text-xs truncate">{card.set?.name || t.unknown}</span>
                  </div>
                  
                  <div className="mt-3 pt-2 border-t border-slate-800 flex justify-between items-end">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">{card.supertype}</span>
                    <h3 className="text-lg font-black text-emerald-400 leading-none">${card.priceUsd || '0.00'}</h3>
                  </div>
                </div>
              </Link>
            ))}
            
            {cards.length === 0 && !loading && (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-500">
                <span className="text-5xl mb-4">🔍</span>
                <p className="text-xl">{t.noResults}</p>
              </div>
            )}
          </div>
        )}

        {meta && meta.totalPages > 1 && (
          <div className="mt-auto flex justify-center items-center space-x-6 bg-slate-900 p-4 rounded-full border border-slate-800 w-fit mx-auto shadow-lg">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-6 py-2 rounded-full font-bold transition-all text-sm ${currentPage === 1 ? 'bg-slate-950 text-slate-600' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
            >
              &larr; {t.prev}
            </button>
            <span className="text-slate-400 font-medium text-sm">
              {t.page} <strong className="text-white">{meta.currentPage}</strong> {t.of} {meta.totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, meta.totalPages))}
              disabled={currentPage === meta.totalPages}
              className={`px-6 py-2 rounded-full font-bold transition-all text-sm ${currentPage === meta.totalPages ? 'bg-slate-950 text-slate-600' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
            >
              {t.next} &rarr;
            </button>
          </div>
        )}
      </main>
    </div>
  );
}