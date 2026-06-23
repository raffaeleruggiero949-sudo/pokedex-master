"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CardDetails() {
  const params = useParams();
  const router = useRouter();
  
  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);

  // LA PORTA DEL BACK-END NESTJS
  const BACKEND_URL = 'http://localhost:3001';

  useEffect(() => {
    const storedUser = localStorage.getItem('pokedex_user');
    if (storedUser) setUser(JSON.parse(storedUser));

    if (params.id) {
      const cardId = Array.isArray(params.id) ? params.id[0] : params.id;
      fetch(`/api/cards/${cardId}`)
        .then(async (res) => {
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || `Errore HTTP: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          setCard(data);
          setLoading(false);
        })
        .catch((err) => {
          setErrorMsg(err.message);
          setLoading(false);
        });
    }
  }, [params.id]);

  const handleAddToPortfolio = async () => {
    if (!user) {
      alert("⚠️ Devi prima accedere o registrarti per aggiungere carte al Masterset!");
      router.push('/login');
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      alert("⚠️ Sessione non valida. Effettua di nuovo il login.");
      // Pulisco i dati corrotti/vecchi per forzare un login pulito
      localStorage.removeItem('pokedex_user');
      router.push('/login');
      return;
    }

    setIsAdding(true);
    try {
      // Usiamo la porta del BACKEND (3001) per salvare i dati
      const res = await fetch(`${BACKEND_URL}/collection/add`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          cardId: card.id,
          variant: "Normal", 
          condition: "NM"
        })
      });

      if (res.ok) {
        alert("✅ Carta aggiunta al tuo Masterset con successo!");
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`❌ Errore: ${errData.message || "Impossibile aggiungere la carta."}`);
      }
    } catch (error) {
      console.error(error);
      alert("❌ Errore di connessione al server back-end.");
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-300 text-2xl animate-pulse">Caricamento dettagli...</div>;
  
  if (errorMsg) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
      <h1 className="text-4xl font-black text-red-500 mb-4">Carta non trovata</h1>
      <p className="text-xl text-slate-400 mb-8">{errorMsg}</p>
      <Link href="/" className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-full font-bold transition-all">&larr; Torna alla ricerca</Link>
    </div>
  );

  if (!card) return null;

  const basePrice = card.priceUsd || 0;
  const psa10Price = (basePrice * 2.2).toFixed(2);
  const psa9Price = (basePrice * 1.15).toFixed(2);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Link href="/" className="text-slate-400 hover:text-white flex items-center gap-2 w-fit transition-colors text-lg font-medium">
          <span>&larr;</span> Indietro
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-16 flex flex-col md:flex-row gap-8 lg:gap-16">
        <div className="w-full md:w-2/5 flex justify-center items-start">
          <img src={card.imageUrl} alt={card.name} className="w-full max-w-md h-auto rounded-2xl shadow-2xl shadow-black/50" />
        </div>

        <div className="w-full md:w-3/5 flex flex-col">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">{card.name}</h1>
          <p className="text-slate-400 text-sm font-medium mb-6">
            {card.set?.name || 'Set Sconosciuto'} • {card.id.split('-').pop()} / {card.set?.totalCards || '???'}
          </p>

          <div className="bg-slate-900 rounded-2xl p-6 mb-6 border border-slate-800 shadow-xl">
            <div className="flex justify-between items-end pb-5 border-b border-slate-700/50">
              <div className="flex flex-col">
                <span className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-1">Market Price</span>
                <span className="text-emerald-400 text-5xl font-black tracking-tight">
                  ${basePrice > 0 ? basePrice.toFixed(2) : '0.00'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-5">
              <div className="flex flex-col items-center">
                <span className="text-slate-400 text-xs font-medium mb-1">Ungraded</span>
                <span className="text-white font-bold">${basePrice > 0 ? basePrice.toFixed(2) : '---'}</span>
              </div>
              <div className="flex flex-col items-center border-l border-slate-700/50">
                <span className="text-slate-400 text-xs font-medium mb-1">PSA 10</span>
                <span className="text-white font-bold">${basePrice > 0 ? psa10Price : '---'}</span>
              </div>
              <div className="flex flex-col items-center border-l border-slate-700/50">
                <span className="text-slate-400 text-xs font-medium mb-1">PSA 9</span>
                <span className="text-white font-bold">${basePrice > 0 ? psa9Price : '---'}</span>
              </div>
            </div>
          </div>

          <button 
            onClick={handleAddToPortfolio}
            disabled={isAdding}
            className={`w-full py-4 rounded-xl font-bold text-xl transition-all shadow-lg mb-8 flex justify-center items-center gap-3 ${
              isAdding ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/50'
            }`}
          >
            <span className="text-2xl font-normal leading-none">+</span>
            {isAdding ? 'Aggiunta in corso...' : 'AGGIUNGI AL MASTERSET'}
          </button>

          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl">
            <h3 className="text-white text-lg font-bold mb-5">Card Details</h3>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800/80">
                <span className="text-slate-400 text-sm">Rarity</span>
                <span className="text-white text-sm font-medium">{card.rarity || 'Standard'}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-800/80">
                <span className="text-slate-400 text-sm">Type</span>
                <span className="text-white text-sm font-medium">{card.supertype}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-800/80">
                <span className="text-slate-400 text-sm">Series</span>
                <span className="text-white text-sm font-medium">{card.set?.series || 'Pokémon TCG'}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-800/80">
                <span className="text-slate-400 text-sm">Release Date</span>
                <span className="text-white text-sm font-medium">{card.set?.releaseDate || 'N/D'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}