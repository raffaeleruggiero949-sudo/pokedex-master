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
  language?: string; // Aggiunto per poter filtrare con precisione dal DB
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
    allCardLangs: "Qualsiasi Lingua",
    cardEn: "Inglese 🇬🇧",
    cardJp: "Giapponese 🇯🇵",
    allSets: "Tutte le Espansioni",
    enSets: "Espansioni Inglesi 🇬🇧",
    jpSets: "Espansioni Giapponesi 🇯🇵",
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
    allCardLangs: "Any Language",
    cardEn: "English 🇬🇧",
    cardJp: "Japanese 🇯🇵",
    allSets: "All Expansions",
    enSets: "English Sets 🇬🇧",
    jpSets: "Japanese Sets 🇯🇵",
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
  
  // Tutti i filtri
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedRarity, setSelectedRarity] = useState('');
  const [selectedCardLang, setSelectedCardLang] = useState(''); 
  const [selectedSet, setSelectedSet] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);

  // Scarichiamo le espansioni al caricamento della pagina
  useEffect(() => {
    fetch('/api/sets')
      .then(res => res.json())
      .then(data => setAvailableSets(data || []))
      .catch(err => console.error("Errore recupero sets", err));
  }, []);

  // Resetta la pagina a 1 quando cambiano i filtri
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedType, selectedRarity, selectedCardLang, selectedSet, sortOrder]);

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
    if (selectedSet) queryParams.append('setId', selectedSet);
    if (sortOrder) queryParams.append('sort', sortOrder);

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
  }, [currentPage, searchTerm, selectedType, selectedRarity, selectedCardLang, selectedSet, sortOrder]);

  const toggleUiLanguage = () => {
    const newLang = uiLang === 'IT' ? 'EN' : 'IT';
    setUiLang(newLang);
    localStorage.setItem('pokedex_ui_lang', newLang);
  };

  // Suddivide i set filtrando esattamente per il campo "language" salvato nel DB
  const japaneseSets = availableSets.filter((s) => s.language && s.language.toUpperCase() === 'JP');
  // Consideriamo "inglesi" (o comunque occidentali) tutti i set che NON sono marchiati JP
  const englishSets = availableSets.filter((s) => !s.language || s.language.toUpperCase() !== 'JP');

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
        
        {/* BLOCCO FILTRI AVANZATI IN GRIGLIA */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 mb-8 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
            
            {/* Ricerca (Occupa 2 colonne su schermi grandi) */}
            <div className="lg:col-span-2">
              <input
                type="text"
                placeholder={t.search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            
            {/* Tipo */}
            <div>
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

            {/* Rarità */}
            <div>
              <select
                value={selectedRarity}
                onChange={(e) => setSelectedRarity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors cursor-pointer"
              >
                <option value="">{t.allRarities}</option>
                <option value="Common">{t.common}</option>
                <option value="Rare Holo">{t.holo}</option>
                
                <optgroup label="Era Spada e Scudo (V)" className="bg-slate-900 text-blue-400">
                  <option value="Rare Holo V" className="text-white">V (Rara V)</option>
                  <option value="Rare Holo VMAX" className="text-white">VMAX (Tripla Rara ★★★)</option>
                  <option value="Rare Holo VSTAR" className="text-white">VSTAR (Rara VSTAR)</option>
                </optgroup>

                <optgroup label="Illustrazioni Speciali & Alt Art" className="bg-slate-900 text-emerald-400">
                  <option value="Illustration Rare" className="text-white">IR (Illustration Rare ★)</option>
                  <option value="Special Illustration Rare" className="text-white">SIR (Special Ill. Rare ★★)</option>
                  <option value="Alternative Art" className="text-white">Alternative Art (Alt Art)</option>
                  <option value="Character Rare" className="text-white">CHR / CSR (Character Rare)</option>
                </optgroup>

                <optgroup label="Ultrarare, Gold & Rainbow" className="bg-slate-900 text-yellow-500">
                  <option value="Rare Ultra" className="text-white">Full Art (Ultrarara ★★)</option>
                  <option value="Rare Rainbow" className="text-white">Rainbow (Rara Arcobaleno)</option>
                  <option value="Hyper Rare" className="text-white">Gold / UR (Iper Rara ★★★)</option>
                </optgroup>

                <optgroup label="EX, GX, Radiant & Shiny" className="bg-slate-900 text-purple-400">
                  <option value="Rare Holo EX" className="text-white">EX / Mega (Era XY / N&B)</option>
                  <option value="Rare Holo GX" className="text-white">GX / Tag Team (Era Sole e Luna)</option>
                  <option value="Radiant Rare" className="text-white">Radiant (Rara Lucente)</option>
                  <option value="Shiny Rare" className="text-white">Shiny Vault / Shiny Treasure</option>
                </optgroup>

                <optgroup label="Vintage Classico" className="bg-slate-900 text-orange-400">
                  <option value="Rare Holo Star" className="text-white">Gold Star (Pokémon Stella ★)</option>
                </optgroup>
              </select>
            </div>

            {/* Set / Espansione Inglese */}
            <div>
              <select
                value={englishSets.some(s => s.id === selectedSet) ? selectedSet : ""}
                onChange={(e) => setSelectedSet(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors cursor-pointer"
              >
                <option value="">{t.enSets}</option>
                {englishSets.map(set => (
                  <option key={set.id} value={set.id}>{set.name}</option>
                ))}
              </select>
            </div>

            {/* Set / Espansione Giapponese */}
            <div>
              <select
                value={japaneseSets.some(s => s.id === selectedSet) ? selectedSet : ""}
                onChange={(e) => setSelectedSet(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 transition-colors cursor-pointer"
              >
                <option value="">{t.jpSets}</option>
                {japaneseSets.map(set => (
                  <option key={set.id} value={set.id}>{set.name}</option>
                ))}
              </select>
            </div>

            {/* Ordinamento Prezzo */}
            <div>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors cursor-pointer"
              >
                <option value="">{t.sortBy}</option>
                <option value="price_desc">{t.priceDesc}</option>
                <option value="price_asc">{t.priceAsc}</option>
              </select>
            </div>

          </div>
        </div>

        {/* GRIGLIA DELLE CARTE */}
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

        {/* PAGINAZIONE */}
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