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
    searchSet: "Scrivi per cercare un set...",
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
    searchSet: "Type to search a set...",
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
  
  // Stati per il Custom Dropdown dei Set
  const [setSearchInput, setSetSearchInput] = useState('');
  const [isSetDropdownOpen, setIsSetDropdownOpen] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetch('/api/sets')
      .then(res => res.json())
      .then(data => {
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
      
      <header className="bg-slate-900 border-b border-slate-800 px-8 py-6 sticky top-0 z-50 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
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
        
        {/* BARRA DI RICERCA E FILTRI */}
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

            {/* NUOVO COMPONENTE: DROPDOWN RICERCABILE PER I SET */}
            <div className="relative w-full">
              <input
                type="text"
                placeholder={t.searchSet}
                value={isSetDropdownOpen ? setSearchInput : (availableSets.find(s => s.id === selectedSet)?.name || '')}
                onChange={(e) => {
                  setSetSearchInput(e.target.value);
                  setIsSetDropdownOpen(true);
                  if (e.target.value === '') setSelectedSet('');
                }}
                onFocus={() => {
                  setIsSetDropdownOpen(true);
                  setSetSearchInput(''); // Permette di cercare da zero quando clicchi
                }}
                // Il timeout permette al click sulle opzioni di funzionare prima di chiudere il menu
                onBlur={() => setTimeout(() => setIsSetDropdownOpen(false), 200)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors placeholder:text-slate-500"
              />
              
              {isSetDropdownOpen && (
                <div className="absolute z-10 w-full mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
                  <div
                    className="px-4 py-3 hover:bg-slate-800 cursor-pointer text-slate-400 border-b border-slate-800 font-medium"
                    onClick={() => { setSelectedSet(''); setSetSearchInput(''); setIsSetDropdownOpen(false); }}
                  >
                    {t.allSets}
                  </div>
                  {availableSets
                    .filter(s => s.name.toLowerCase().includes(setSearchInput.toLowerCase()))
                    .map(set => (
                      <div
                        key={set.id}
                        className="px-4 py-3 hover:bg-blue-600 hover:text-white cursor-pointer text-slate-300 transition-colors"
                        onClick={() => { setSelectedSet(set.id); setSetSearchInput(''); setIsSetDropdownOpen(false); }}
                      >
                        {set.name}
                      </div>
                  ))}
                  {availableSets.filter(s => s.name.toLowerCase().includes(setSearchInput.toLowerCase())).length === 0 && (
                    <div className="px-4 py-3 text-slate-500 italic text-center">Nessun set trovato</div>
                  )}
                </div>
              )}
            </div>

            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors cursor-pointer">
              <option value="">{t.sortBy}</option>
              <option value="price_desc">{t.priceDesc}</option>
              <option value="price_asc">{t.priceAsc}</option>
            </select>

          </div>
        </div>

        {/* GRIGLIA CARTE E STATO DI CARICAMENTO */}
        {loading ? (
          <div className="flex justify-center items-center py-32 flex-col gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
            <p className="text-slate-400 font-medium text-lg animate-pulse">{t.loading}</p>
          </div>
        ) : cards.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center shadow-xl">
            <p className="text-slate-400 text-xl font-medium">{t.noResults}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-8">
              {cards.map((card) => (
                <Link 
                  key={card.id} 
                  href={`/cards/${card.id}`} 
                  className="group bg-slate-900 border border-slate-800 rounded-2xl p-4 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 transition-all flex flex-col h-full cursor-pointer"
                >
                  {/* Immagine Carta */}
                  <div className="relative w-full aspect-[63/88] mb-4 overflow-hidden rounded-xl bg-slate-950 border border-slate-800 group-hover:border-slate-700 transition-colors">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={card.imageUrl || '/window.svg'} 
                      alt={card.name}
                      loading="lazy"
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  
                  {/* Dettagli Carta */}
                  <div className="flex-grow flex flex-col justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-slate-100 truncate text-base" title={card.name}>
                        {card.name}
                      </h3>
                      <p className="text-xs text-slate-400 truncate mt-1">
                        {card.set?.name || t.unknown}
                      </p>
                    </div>
                    
                    {/* Prezzo e Rarità */}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs font-medium text-slate-500 truncate max-w-[50%]">
                        {card.rarity || ''}
                      </span>
                      {card.priceUsd ? (
                        <span className="bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-lg text-xs font-bold border border-emerald-500/20">
                          ${card.priceUsd.toFixed(2)}
                        </span>
                      ) : (
                        <span className="bg-slate-800 text-slate-400 px-2.5 py-1 rounded-lg text-xs font-bold border border-slate-700">
                          N/A
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Paginazione */}
            {meta && meta.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-4 bg-slate-900 p-3 rounded-2xl border border-slate-800 w-fit mx-auto shadow-lg">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-5 py-2 bg-slate-950 disabled:opacity-40 hover:bg-slate-800 border border-slate-800 rounded-xl font-bold text-sm transition-colors text-slate-300"
                >
                  {t.prev}
                </button>
                <span className="text-slate-400 text-sm font-medium px-4">
                  {t.page} <span className="text-white font-bold">{currentPage}</span> {t.of} <span className="text-white font-bold">{meta.totalPages}</span>
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(meta.totalPages, p + 1))}
                  disabled={currentPage === meta.totalPages}
                  className="px-5 py-2 bg-slate-950 disabled:opacity-40 hover:bg-slate-800 border border-slate-800 rounded-xl font-bold text-sm transition-colors text-slate-300"
                >
                  {t.next}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}