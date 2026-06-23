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
  const [stats, setStats] = useState({ diff: 0, perc: 0 });
  const [loading, setLoading] = useState(true);

  // LA PORTA DEL BACK-END NESTJS
  const BACKEND_URL = 'http://localhost:3001';

  const generateOrLoadChartData = (userId: string, currentTotal: number) => {
    const storageKey = `pokedex_chart_${userId}`;
    const stored = localStorage.getItem(storageKey);
    const today = new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });

    let data = [];
    if (stored) {
      data = JSON.parse(stored);
    } else {
      let tempValue = currentTotal > 0 ? currentTotal * 0.7 : 10; 
      for (let i = 6; i >= 1; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
        data.push({ date: dateStr, valore: parseFloat(tempValue.toFixed(2)) });
        tempValue = tempValue + (Math.random() * (currentTotal * 0.1)) - (currentTotal * 0.02);
        if (tempValue < 0) tempValue = 0;
      }
    }

    const lastEntry = data[data.length - 1];
    if (lastEntry && lastEntry.date === today) {
      lastEntry.valore = parseFloat(currentTotal.toFixed(2));
    } else {
      data.push({ date: today, valore: parseFloat(currentTotal.toFixed(2)) });
    }

    if (data.length > 30) data = data.slice(data.length - 30);
    localStorage.setItem(storageKey, JSON.stringify(data));
    return data;
  };

  // Funzione isolata per caricare o ricaricare i dati (utile dopo aver eliminato una carta)
  const fetchPortfolioData = async (userData: any) => {
    try {
      const res = await fetch(`/api/portfolio?userId=${userData.id}`);
      const data = await res.json();
      
      setPortfolioData(data);
      const totalNum = parseFloat(data.totalValue);
      
      const historyData = generateOrLoadChartData(userData.id, totalNum);
      setChartData(historyData);

      if (historyData.length > 1) {
        const yesterdayVal = historyData[historyData.length - 2].valore;
        const difference = totalNum - yesterdayVal;
        const percentage = yesterdayVal > 0 ? (difference / yesterdayVal) * 100 : 0;
        setStats({ diff: difference, perc: percentage });
      }
    } catch (error) {
      console.error("Errore nel recupero dati:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('pokedex_user');
    if (!storedUser) {
      router.push('/');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    fetchPortfolioData(parsedUser);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // --- NUOVA FUNZIONE: Rimozione Rapida ---
  const handleQuickRemove = async (e: React.MouseEvent, cardId: string, variant: string) => {
    e.preventDefault(); 
    e.stopPropagation();

    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const res = await fetch(`${BACKEND_URL}/collection/remove/${cardId}/${encodeURIComponent(variant)}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        // Ricarica i dati per aggiornare UI e Grafico istantaneamente
        fetchPortfolioData(user);
      } else {
        alert("Errore durante la rimozione della carta.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('pokedex_user');
    localStorage.removeItem('access_token');
    router.push('/');
  };

  const getCardDisplayPrice = (uc: any) => {
    if (!uc.card.priceUsd) return '0.00';
    let price = uc.card.priceUsd;
    if (uc.variant === 'PSA 10' || uc.variant === 'BGS 10' || uc.variant === 'CGC 10') price *= 2.2;
    else if (uc.variant === 'PSA 9' || uc.variant === 'BGS 9.5') price *= 1.15;
    return price.toFixed(2);
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-300">Caricamento Portfolio...</div>;

  const isPositive = stats.diff >= 0;

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
            <p className="text-5xl font-black text-white mb-4">${portfolioData?.totalValue}</p>
            
            <div className={`px-3 py-1 rounded-full w-fit text-sm font-bold border ${
              isPositive 
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                : 'bg-red-500/10 text-red-500 border-red-500/20'
            }`}>
              {isPositive ? '+' : ''}{stats.perc.toFixed(1)}% rispetto a ieri
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl lg:col-span-2 shadow-xl h-72">
            <h2 className="text-slate-400 font-bold mb-4 uppercase tracking-widest text-sm">Andamento Storico</h2>
            <ResponsiveContainer width="100%" height="85%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" tick={{fontSize: 12}} />
                <YAxis 
                  stroke="#64748b" 
                  tick={{fontSize: 12}} 
                  tickFormatter={(value) => `$${value}`} 
                  width={60} 
                  domain={['auto', 'auto']} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="valore" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#3b82f6' }} 
                  activeDot={{ r: 6 }} 
                  animationDuration={500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">🎯 Progresso Masterset</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolioData?.mastersets.length === 0 && (
              <p className="text-slate-500 italic col-span-full">Nessun Masterset iniziato. Aggiungi carte normali o reverse alla collezione!</p>
            )}
            {portfolioData?.mastersets.map((set: any) => (
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
          <h2 className="text-2xl font-bold mb-6 mt-4">🗂️ Carte Collezionate ({portfolioData?.cards.reduce((acc: number, curr: any) => acc + curr.quantity, 0)})</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {portfolioData?.cards.map((uc: any) => {
              const isGraded = uc.variant?.includes('PSA') || uc.variant?.includes('BGS') || uc.variant?.includes('CGC');
              
              return (
                <div key={uc.id} className="relative group bg-slate-900 rounded-xl border border-slate-800 hover:border-blue-500 transition-all flex flex-col h-full">
                  
                  {/* --- BOTTONE DI ELIMINAZIONE RAPIDA (X) --- */}
                  <button
                    onClick={(e) => handleQuickRemove(e, uc.card.id, uc.variant)}
                    className="absolute -top-3 -right-3 z-30 bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:scale-110"
                    title="Rimuovi 1 copia"
                  >
                    ✕
                  </button>
                  
                  {/* Badge della Variante/Gradazione */}
                  {uc.variant && uc.variant !== 'Normal' && (
                    <div className={`absolute -top-2 -left-2 z-10 text-[10px] font-black px-2 py-1 rounded-md shadow-xl border uppercase tracking-wider ${
                      isGraded 
                        ? 'bg-amber-500 text-slate-950 border-amber-300' 
                        : 'bg-indigo-500 text-white border-indigo-400'
                    }`}>
                      {uc.variant}
                    </div>
                  )}

                  <Link href={`/cards/${uc.card.id}`} className="p-2 flex flex-col flex-grow">
                    <div className="relative mb-2">
                      <img src={uc.card.imageUrl} alt={uc.card.name} className={`w-full h-auto rounded-lg ${isGraded ? 'shadow-[0_0_15px_rgba(245,158,11,0.2)]' : ''}`} />
                      
                      {/* Badge della quantità spostato in basso a destra sopra l'immagine */}
                      <div className="absolute bottom-1 right-1 bg-slate-900/90 text-white text-xs font-black px-2 py-1 rounded-md border border-slate-700 shadow-md">
                        x{uc.quantity}
                      </div>
                    </div>

                    <h3 className="font-bold text-sm truncate">{uc.card.name}</h3>
                    <p className="text-emerald-400 font-bold text-sm mt-auto pt-1">${getCardDisplayPrice(uc)}</p>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}