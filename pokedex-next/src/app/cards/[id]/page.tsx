"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AddPriceAlert from '@/components/AddPriceAlert';

export default function CardDetails() {
  const params = useParams();
  const router = useRouter();
  
  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState('Normal');

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
      alert("⚠️ Devi prima accedere o registrarti per gestire il Masterset!");
      router.push('/login');
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      alert("⚠️ Sessione non valida. Effettua di nuovo il login.");
      localStorage.removeItem('pokedex_user');
      router.push('/login');
      return;
    }

    setIsAdding(true);
    try {
      const res = await fetch(`${BACKEND_URL}/collection/add`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          cardId: card.id,
          variant: selectedVariant,
          condition: "NM"
        })
      });

      if (res.ok) {
        alert(`✅ Carta (${selectedVariant}) aggiunta al tuo Masterset!`);
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

  const handleRemoveFromPortfolio = async () => {
    if (!user) {
      alert("⚠️ Devi prima accedere o registrarti per gestire il Masterset!");
      router.push('/login');
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      alert("⚠️ Sessione non valida. Effettua di nuovo il login.");
      localStorage.removeItem('pokedex_user');
      router.push('/login');
      return;
    }

    setIsRemoving(true);
    try {
      const res = await fetch(`${BACKEND_URL}/collection/remove/${card.id}/${encodeURIComponent(selectedVariant)}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      });

      if (res.ok) {
        alert(`🗑️ Carta (${selectedVariant}) rimossa o quantità scalata con successo!`);
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`❌ Impossibile rimuovere: ${errData.message || "Carta non presente in collezione."}`);
      }
    } catch (error) {
      console.error(error);
      alert("❌ Errore di connessione al server back-end.");
    } finally {
      setIsRemoving(false);
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
        <button 
          onClick={() => router.back()} 
          className="text-slate-400 hover:text-white flex items-center gap-2 w-fit transition-colors text-lg font-medium outline-none"
        >
          <span>&larr;</span> Indietro
        </button>
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

          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl mb-6">
            <h3 className="text-white text-lg font-bold mb-4">Gestisci Collezione</h3>
            
            <div className="mb-4">
              <label className="block text-slate-400 text-xs font-bold mb-2 uppercase tracking-wide">
                Condizione / Voto
              </label>
              <select 
                value={selectedVariant}
                onChange={(e) => setSelectedVariant(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors cursor-pointer"
              >
                <option value="Normal">Normale (Ungraded)</option>
                <option value="Reverse Holo">Reverse Holo (Ungraded)</option>
                <option value="PSA 10">Gradata: PSA 10</option>
                <option value="PSA 9">Gradata: PSA 9</option>
                <option value="PSA 8">Gradata: PSA 8</option>
                <option value="BGS 10">Gradata: BGS 10</option>
                <option value="BGS 9.5">Gradata: BGS 9.5</option>
                <option value="CGC 10">Gradata: CGC 10</option>
              </select>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={handleAddToPortfolio}
                disabled={isAdding}
                className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all shadow-lg flex justify-center items-center gap-2 ${
                  isAdding ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/50'
                }`}
              >
                <span className="text-2xl font-normal leading-none mb-1">+</span> Aggiungi
              </button>
              
              <button 
                onClick={handleRemoveFromPortfolio}
                disabled={isRemoving}
                className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all shadow-lg flex justify-center items-center gap-2 ${
                  isRemoving ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-red-600/10 hover:bg-red-600 border border-red-600/50 hover:border-red-600 text-red-400 hover:text-white'
                }`}
              >
                <span className="text-2xl font-normal leading-none mb-1">-</span> Rimuovi
              </button>
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl mb-6">
            <h3 className="text-white text-lg font-bold mb-5">Dettagli Tecnici</h3>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800/80">
                <span className="text-slate-400 text-sm">Rarità</span>
                <span className="text-white text-sm font-medium">{card.rarity || 'Standard'}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-800/80">
                <span className="text-slate-400 text-sm">Tipo</span>
                <span className="text-white text-sm font-medium">{card.supertype}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-800/80">
                <span className="text-slate-400 text-sm">Serie</span>
                <span className="text-white text-sm font-medium">{card.set?.series || 'Pokémon TCG'}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-800/80">
                <span className="text-slate-400 text-sm">Data di Rilascio</span>
                <span className="text-white text-sm font-medium">{card.set?.releaseDate || 'N/D'}</span>
              </div>
            </div>
          </div>

          {/* NUOVO COMPONENTE: Aggiungi Price Alert */}
          {user && (
            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl">
              <h3 className="text-white text-lg font-bold mb-2">Monitora questa Carta</h3>
              <p className="text-slate-400 text-sm mb-4">Ricevi un avviso (o controlla dal tuo profilo) quando il prezzo di mercato scende sotto la soglia che desideri.</p>
              <AddPriceAlert cardId={card.id} />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}