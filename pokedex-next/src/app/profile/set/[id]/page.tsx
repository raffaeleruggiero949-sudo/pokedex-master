"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function MastersetDetails() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('pokedex_user');
    if (!storedUser) {
      router.push('/');
      return;
    }
    
    const user = JSON.parse(storedUser);
    const setId = Array.isArray(params.id) ? params.id[0] : params.id;

    fetch(`/api/portfolio/set/${setId}?userId=${user.id}`)
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [params.id, router]);

  if (loading) return <div className="min-h-screen bg-slate-950 flex justify-center items-center text-white animate-pulse text-xl">Apertura raccoglitore in corso...</div>;
  if (!data || data.error) return <div className="min-h-screen bg-slate-950 text-white text-center pt-20">Errore: Masterset non trovato.</div>;

  const { set, collection } = data;
  const collectedCount = collection.filter((c: any) => c.owned).length;
  // Calcolo reale sui dati estratti (sicuro al 100%)
  const percentage = collection.length > 0 ? ((collectedCount / collection.length) * 100).toFixed(1) : "0.0";

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 pb-16">
      
      <header className="bg-slate-900 border-b border-slate-800 px-8 py-6 mb-8 flex flex-col md:flex-row justify-between items-center shadow-lg gap-4 sticky top-0 z-50">
        <div className="flex items-center gap-6">
           {set.logoUrl && <img src={set.logoUrl} alt="logo" className="h-16 object-contain drop-shadow-lg" />}
           <div>
             <h1 className="text-3xl font-black text-white">{set.name}</h1>
             <p className="text-slate-400 font-medium mt-1">Progresso: {collectedCount} / {collection.length} carte trovate ({percentage}%)</p>
           </div>
        </div>
        <Link href="/profile" className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-full font-bold transition-all text-sm border border-slate-700">
          &larr; Torna al Profilo
        </Link>
      </header>

      <div className="max-w-7xl mx-auto px-4">
        {/* Barra di Progresso */}
        <div className="w-full bg-slate-900 rounded-full h-4 mb-10 overflow-hidden border border-slate-800 shadow-inner">
          <div className="bg-blue-500 h-full transition-all duration-1000 relative" style={{ width: `${percentage}%` }}>
            <div className="absolute inset-0 bg-white/20 w-full animate-pulse"></div>
          </div>
        </div>

        {/* Griglia Carte Raccoglitore */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-5">
          {collection.map((card: any) => (
            <Link href={`/cards/${card.id}`} key={card.id}>
              <div className={`relative p-2 rounded-xl border transition-all cursor-pointer h-full flex flex-col group ${
                card.owned 
                  ? 'bg-slate-900 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:border-emerald-400 hover:-translate-y-2' 
                  : 'bg-slate-950 border-slate-800 opacity-70 hover:opacity-100 hover:border-slate-500 hover:-translate-y-1'
              }`}>
                
                {/* Badge Quantità (solo se posseduta) */}
                {card.owned && (
                  <div className="absolute -top-3 -right-3 z-10 bg-emerald-500 text-slate-950 text-xs font-black w-7 h-7 rounded-full flex items-center justify-center border-2 border-slate-900 shadow-lg">
                    {card.quantity}
                  </div>
                )}

                {/* Immagine con Effetto Grayscale per le mancanti */}
                <div className="overflow-hidden rounded-lg mb-2">
                  <img 
                    src={card.imageUrl} 
                    alt={card.name} 
                    className={`w-full h-auto transform transition-all duration-500 ${!card.owned ? 'grayscale brightness-50 sepia-[.2]' : 'group-hover:scale-110'}`} 
                  />
                </div>
                
                <h3 className={`font-bold text-xs text-center truncate mt-auto ${!card.owned ? 'text-slate-500' : 'text-white'}`}>
                  {card.name}
                </h3>
                
                {/* Scritta Mancante */}
                {!card.owned && (
                  <span className="text-[10px] text-center text-red-500/80 font-black uppercase mt-1 tracking-widest">
                    Mancante
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}