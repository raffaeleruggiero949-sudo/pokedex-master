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

interface SetData {
  id: string;
  name: string;
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
    holo: "Holo / Reverse Holo",
    allSets: "Tutte le Espansioni",
    sortBy: "Ordina per...",
    priceAsc: "Prezzo: Più basso",
    priceDesc: "Prezzo: Più alto",
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
    holo: "Holo / Reverse Holo",
    allSets: "All Expansions",
    sortBy: "Sort by...",
    priceAsc: "Price: Lowest first",
    priceDesc: "Price: Highest first",
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
  const [availableSets, setAvailableSets] = useState<SetData[]>([]);
  const [meta, setMeta] = useState<MetaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  
  const [uiLang, setUiLang] = useState<'IT' | 'EN'>('IT');
  const t = translations[uiLang]; 
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedRarity, setSelectedRarity] = useState('');
  const [selectedSet, setSelectedSet] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);

  // GESTIONE SICURA DEL RECUPERO SET
  useEffect(() => {
    fetch('/api/sets')
      .then(res => res.json())
      .then(data => {
        // Controllo se i dati ricevuti sono effettivamente un array per prevenire il crash
        if (Array.isArray(data)) {
          setAvailableSets(data);
        } else {
          console.error("L'API non ha restituito un array di Set:", data);
          setAvailableSets([]);
        }
      })
      .catch(err => {
        console.error("Errore di rete durante il recupero dei sets", err);
        setAvailableSets([]);
      });
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedType, selectedRarity, selectedSet, sortOrder]);

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
    if (selectedSet) queryParams.append('setId', selectedSet);
    if (sortOrder) queryParams.append('sort', sortOrder);

    fetch(`/api/cards?${queryParams.toString()}`)
      .then((response) => response.json())
      .then((json) => {
        // Assicuriamoci che anche qui i dati siano un array
        setCards(Array.isArray(json.data) ? json.data : []);
        setMeta(json.meta || null);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Errore API:", error);
        setCards([]);
        setLoading(false);
      });
  }, [currentPage, searchTerm, selectedType, selectedRarity, selectedSet, sortOrder]);

  const toggleUiLanguage = () => {
    const newLang = uiLang === 'IT' ? 'EN' : 'IT';
    setUiLang(newLang);
    localStorage.setItem('pokedex_ui_lang', newLang);
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col selection:bg-blue-500/30">
      
      <header className="bg-slate-900 border-b border-slate-800 px-8 py-6 sticky top-0 z-50 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 tracking-tight">
            Pokédex Master
          </h1>
          <p className="text-slate-400 text-sm mt-1">{t.subtitle}</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleUiLanguage}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-lg font-bold transition-all"
          >
            {uiLang === 'IT' ? '🇮🇹 IT' : '🇬🇧 EN'}
          </button>

          {user ? (
            <Link href="/profile" className="px-6 py-2 bg-blue-600/20 hover:bg-blue-600 border border-blue-600/50 text-blue-400 hover:text-white rounded-full font-bold transition-all">
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
        
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 mb-8 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            
            <input
              type="text"
              placeholder={t.search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="lg:col-span-2 w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors"
            />
            
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors cursor-pointer">
              <option value="">{t.allTypes}</option>
              <option value="Pokémon">Pokémon</option>
              <option value="Trainer">{t.trainer}</option>
              <option value="Energy">{t.energy}</option>
            </select>

            <select value={selectedSet} onChange={(e) => setSelectedSet(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors cursor-pointer">
              <option value="">{t.allSets}</option>
              {availableSets.map(set => (
                <option key={set.id} value={set.id}>{set.name}</option>
              ))}
            </select>

            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors cursor-pointer">
              <option value="">{t.sortBy}</option>
              <option value="price_desc">{t.priceDesc}</option>
              <option value="price_asc">{t.priceAsc}</option>
            </select>

          </div>
        </div>

        {/* ... il resto della griglia carte rimane invariato ... */}
      </main>
    </div>
  );
}