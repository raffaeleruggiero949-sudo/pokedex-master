"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isSyncingJP, setIsSyncingJP] = useState(false);

  const generateChartData = (currentTotal: number) => {
    const data = [];
    let tempValue = currentTotal * 0.7; 
    for(let i = 30; i >= 0; i -= 5) {
      data.push({ date: i === 0 ? 'Oggi' : `-${i}g`, valore: parseFloat(tempValue.toFixed(2)) });
      tempValue = tempValue + (Math.random() * (currentTotal * 0.1)) - (currentTotal * 0.02);
    }
    data[data.length - 1].valore = parseFloat(currentTotal.toFixed(2));
    return data;
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('pokedex_user');
    if (!storedUser) {
      router.push('/');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    fetch(`/api/portfolio?userId=${parsedUser.id}`)
      .then((res) => res.json())
      .then((data) => {
        setPortfolioData(data);
        const totalNum = parseFloat(data.totalValue);
        setChartData(generateChartData(totalNum));
        setLoading(false);
      });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('pokedex_user');
    router.push('/');
  };

  // --- FUNZIONI ADMIN ---
  const handleFixLang = async () => {
    try {
      const res = await fetch('/api/fix-lang');
      const data = await res.json();
      alert(data.message || data.error);
    } catch (err) {
      alert("Errore di connessione.");
    }
  };

  const handleSyncJP = async () => {
    setIsSyncingJP(true);
    try {
      const res = await fetch('/api/sync-jp');
      const data = await res.json();
      alert(data.message || data.error);
    } catch (err) {
      alert("Errore di connessione durante il download.");
    } finally {
      setIsSyncingJP(false);
    }
  };

  const handleSyncLocal = async () => {
    const setId = prompt("Inserisci l'ID del Set locale da importare (es. S12a):");
    if (!setId) return;

    try {
      const res = await fetch('/api/sync-local', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setId: setId.toLowerCase(), lang: 'JP' })
      });
      const data = await res.json();
      alert(data.message || data.error);
    } catch (err) {
      alert("Errore durante la lettura dal file locale.");
    }
  };

  // NUOVA FUNZIONE: Crea il file formattato
  const handleCreateLocalFile = async () => {
    try {
      const res = await fetch('/api/create-local-file');
      const data = await res.json();
      alert(data.message || data.error);
    } catch (err) {
      alert("Errore di connessione durante la creazione del file.");
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-300">Caricamento Portfolio...</div>;

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 pb-16 selection:bg-blue-500/30">
      
      <header className="bg-slate-900 border-b border-slate-800 px-8 py-6 mb-8 flex justify-between items-center shadow-lg">
        <div>
          <h1 className="text-3xl font-black">Profilo di <span className="text-blue-500">{user?.name}</span></h1>
          <p className="text-slate-400 mt-1">Gestisci la tua collezione e analizza il mercato.</p>
        </div>
        <div className="flex gap-4">
          <Link href="/" className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg font-bold transition-all text-sm border border-slate-700">
            Torna al Pokédex
          </Link>
          <button onClick={handleLogout} className="px-6 py-2 bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white border border-red-600/50 rounded-lg font-bold transition-all text-sm">
            Esci
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 gap-8 flex flex-col">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl flex flex-col justify-center shadow-xl">
            <h2 className="text-slate-400 font-bold mb-2 uppercase tracking-widest text-sm">Portfolio Value</h2>
            <p className="text-5xl font-black text-emerald-400 mb-4">${portfolioData.totalValue}</p>
            <div className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full w-fit text-sm font-bold border border-emerald-500/20">
              +14.2% questo mese
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl lg:col-span-2 shadow-xl h-72">
            <h2 className="text-slate-400 font-bold mb-4 uppercase tracking-widest text-sm">Andamento 30 Giorni</h2>
            <ResponsiveContainer width="100%" height="85%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" tick={{fontSize: 12}} />
                <YAxis stroke="#64748b" tick={{fontSize: 12}} tickFormatter={(value) => `$${value}`} width={60} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="valore" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">🎯 Progresso Masterset</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolioData.mastersets.map((set: any) => (
              <Link href={`/profile/set/${set.setId}`} key={set.setId} className="group">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg hover:border-blue-500 transition-all cursor-pointer h-full">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      {set.logoUrl && <img src={set.logoUrl} alt="logo" className="h-8 w-auto object-contain" />}
                      <h3 className="font-bold text-lg group-hover:text-blue-400 transition-colors">{set.setName}</h3>
                    </div>
                    <span className="text-lg font-black text-blue-400">{set.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-3 mb-4 overflow-hidden border border-slate-800">
                    <div className="bg-blue-500 h-full rounded-full transition-all duration-1000" style={{ width: `${set.percentage}%` }}></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-slate-500 font-medium">
                      {set.collectedUnique} / {set.totalCards} trovate
                    </p>
                    <span className="text-xs text-blue-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      Apri Raccoglitore &rarr;
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-6 mt-4">🗂️ Carte Collezionate ({portfolioData.cards.reduce((acc: number, curr: any) => acc + curr.quantity, 0)})</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {portfolioData.cards.map((uc: any) => (
              <div key={uc.id} className="relative group">
                <div className="absolute -top-2 -right-2 z-10 bg-slate-900 text-white text-xs font-black w-8 h-8 rounded-full flex items-center justify-center border-2 border-slate-700 shadow-xl">
                  x{uc.quantity}
                </div>
                <Link href={`/cards/${uc.card.id}`}>
                  <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 hover:border-blue-500 transition-all cursor-pointer h-full flex flex-col">
                    <img src={uc.card.imageUrl} alt={uc.card.name} className="w-full h-auto rounded-lg mb-2" />
                    <h3 className="font-bold text-sm truncate">{uc.card.name}</h3>
                    <p className="text-emerald-400 font-bold text-sm mt-auto">${uc.card.priceUsd}</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* --- PANNELLO ADMIN --- */}
        <div className="mt-16 bg-slate-900/50 border border-amber-500/30 p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
          <h2 className="text-xl font-bold text-amber-500 mb-2 flex items-center gap-2">
            ⚙️ Pannello Sviluppatore (Admin)
          </h2>
          <p className="text-sm text-slate-400 mb-6">
            Usa questi comandi di manutenzione per popolare e correggere il database.
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 flex-wrap">
            <button onClick={handleFixLang} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold transition-all text-sm text-left flex flex-col">
              <span>1. Correggi Lingua Inglese</span>
              <span className="text-xs font-normal text-slate-500 mt-1">Imposta "EN" alle vecchie carte</span>
            </button>
            
            <button onClick={async () => {
                const res = await fetch('/api/sync-jp-sets');
                const data = await res.json();
                alert(data.message);
              }} className="px-6 py-3 bg-fuchsia-600/20 hover:bg-fuchsia-600 border border-fuchsia-600/50 text-fuchsia-400 hover:text-white rounded-xl font-bold transition-all text-sm text-left flex flex-col">
              <span>2. 📚 Importa Elenco Set Giapponesi</span>
              <span className="text-xs font-normal opacity-70 mt-1">Popola il menu a tendina (Veloce)</span>
            </button>

            <button onClick={handleSyncJP} disabled={isSyncingJP} className="px-6 py-3 bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-600/50 text-indigo-400 hover:text-white rounded-xl font-bold transition-all text-sm text-left flex flex-col disabled:opacity-50 disabled:cursor-not-allowed">
              <span>{isSyncingJP ? '⏳ Scaricamento in corso...' : '3. 🃏 Scarica Carte Shiny Treasure'}</span>
              <span className="text-xs font-normal opacity-70 mt-1">Download da TCGDex (API)</span>
            </button>

            <button onClick={handleSyncLocal} className="px-6 py-3 bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-600/50 text-emerald-400 hover:text-white rounded-xl font-bold transition-all text-sm text-left flex flex-col">
              <span>4. 💾 Importa da File Locale</span>
              <span className="text-xs font-normal opacity-70 mt-1">Carica i dati offline dal tuo PC</span>
            </button>

            {/* NUOVO BOTTONE */}
            <button onClick={handleCreateLocalFile} className="px-6 py-3 bg-teal-600/20 hover:bg-teal-600 border border-teal-600/50 text-teal-400 hover:text-white rounded-xl font-bold transition-all text-sm text-left flex flex-col">
              <span>5. 🪄 Crea File Locale (S12a)</span>
              <span className="text-xs font-normal opacity-70 mt-1">Scarica e formatta automaticamente in src/data/</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}