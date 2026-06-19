"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CardDetails() {
  const params = useParams();
  const router = useRouter();
  
  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null); // Nuovo stato per gli errori
  const [user, setUser] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    // 1. Carica l'utente dal localStorage
    const storedUser = localStorage.getItem('pokedex_user');
    if (storedUser) setUser(JSON.parse(storedUser));

    // 2. Chiamata all'API per i dettagli
    if (params.id) {
      // Garantiamo che sia una stringa
      const cardId = Array.isArray(params.id) ? params.id[0] : params.id;

      fetch(`/api/cards/${cardId}`)
        .then(async (res) => {
          if (!res.ok) {
            // Se il backend risponde con un errore (es. 404 o 500), estraiamo il messaggio
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
          console.error("Errore nella fetch:", err);
          setErrorMsg(err.message); // Salviamo il messaggio di errore!
          setLoading(false);
        });
    }
  }, [params.id]);

  const handleAddToPortfolio = async () => {
    if (!user) {
      alert("⚠️ Devi prima accedere o registrarti per avere un Portfolio!");
      router.push('/login');
      return;
    }

    setIsAdding(true);
    try {
      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          cardId: card.id
        })
      });

      const result = await res.json();
      if (res.ok) {
        alert("✅ " + result.message);
      } else {
        alert("❌ Errore durante l'aggiunta.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsAdding(false);
    }
  };

  // --- SCHERMATE DI CARICAMENTO ED ERRORE ---
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white text-2xl animate-pulse">Ricerca nel Pokédex...</div>;
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white p-4">
        <h1 className="text-4xl font-black text-red-500 mb-4">Ops! Qualcosa è andato storto.</h1>
        <p className="text-xl text-gray-400 mb-8">{errorMsg}</p>
        <Link href="/" className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-full font-bold transition-all">
          &larr; Torna alla ricerca
        </Link>
      </div>
    );
  }

  if (!card) return null;

  // --- GRAFICA PRINCIPALE ---
  return (
    <div className="container mx-auto px-4 py-12 font-sans min-h-screen text-white">
      <Link href="/" className="text-gray-400 hover:text-white mb-8 inline-block transition-all">
        &larr; Torna alla ricerca
      </Link>

      <div className="flex flex-col md:flex-row gap-12 items-center md:items-start bg-gray-800/40 p-8 rounded-3xl border border-gray-700 shadow-2xl">
        
        <div className="w-full md:w-1/3">
          <img 
            src={card.imageUrl} 
            alt={card.name} 
            className="w-full h-auto rounded-2xl shadow-xl hover:scale-105 transition-transform duration-300"
          />
        </div>

        <div className="w-full md:w-2/3 flex flex-col h-full justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400">
                {card.name}
              </h1>
              <div className="bg-gray-900 px-4 py-2 rounded-xl border border-gray-700 shadow-inner">
                <span className="text-sm text-gray-400 uppercase tracking-widest block text-center mb-1">Prezzo Mercato</span>
                <span className="text-3xl font-black text-green-400">${card.priceUsd || '0.00'}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 mt-6 mb-8">
              <span className="px-4 py-1 bg-red-600/20 text-red-400 border border-red-600 rounded-full font-mono text-sm uppercase">
                {card.supertype}
              </span>
              <span className="px-4 py-1 bg-blue-600/20 text-blue-400 border border-blue-600 rounded-full font-mono text-sm uppercase">
                Rarità: {card.rarity || 'Normale'}
              </span>
              <span className="px-4 py-1 bg-purple-600/20 text-purple-400 border border-purple-600 rounded-full font-mono text-sm uppercase">
                Lingua: {card.language}
              </span>
            </div>

            <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 mb-8">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                {card.set?.logoUrl && <img src={card.set.logoUrl} alt="set logo" className="h-8 object-contain" />}
                Dettagli Espansione
              </h3>
              <p className="text-gray-300"><strong className="text-white">Nome Set:</strong> {card.set?.name}</p>
              <p className="text-gray-300"><strong className="text-white">Serie:</strong> {card.set?.series}</p>
              <p className="text-gray-300"><strong className="text-white">Data d'uscita:</strong> {card.set?.releaseDate}</p>
              <p className="text-gray-300"><strong className="text-white">Carte totali nel set:</strong> {card.set?.totalCards}</p>
            </div>
          </div>

          <div className="mt-auto pt-8 border-t border-gray-700 flex items-center gap-6">
            <button 
              onClick={handleAddToPortfolio}
              disabled={isAdding}
              className={`w-full md:w-auto px-8 py-4 rounded-full font-black text-xl transition-all shadow-lg flex justify-center items-center gap-2 ${
                isAdding 
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white hover:-translate-y-1'
              }`}
            >
              {isAdding ? 'Salvataggio in corso...' : '➕ Aggiungi al Portfolio'}
            </button>
            <p className="text-sm text-gray-500 hidden md:block">
              Clicca per aggiornare la tua collezione personale.<br/>
              Se possiedi doppioni, clicca più volte!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}