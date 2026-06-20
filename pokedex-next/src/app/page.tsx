'use client';

import { useEffect, useState } from 'react';

export default function HomePage() {
  const [sets, setSets] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Carica il database all'avvio
  useEffect(() => {
    const fetchSets = async () => {
      try {
        const res = await fetch('/api/sets');
        const data = await res.json();
        setSets(data);
      } catch (error) {
        console.error("Errore nel caricamento:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSets();
  }, []);

  const handleSetSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const setId = e.target.value;
    if (!setId) {
      setCards([]);
      return;
    }

    // Estrae le carte incluse nell'oggetto Set dall'API
    const selected = sets.find((s) => s.id === setId);
    if (selected && selected.cards) {
      setCards(selected.cards);
    } else {
      setCards([]);
    }
  };

  // Suddivide i set dinamicamente controllando l'ultimo carattere dell'ID
  const japaneseSets = sets.filter((s) => s.id.match(/[a-z]$/));
  const englishSets = sets.filter((s) => !s.id.match(/[a-z]$/));

  if (loading) {
    return <div className="p-10 font-bold text-lg">Inizializzazione database in corso...</div>;
  }

  return (
    <main className="p-8 min-h-screen bg-slate-50 text-slate-900">
      <h1 className="text-3xl font-extrabold mb-8">
        Collezione Carte
      </h1>

      <div className="flex flex-col md:flex-row gap-8 mb-10 bg-white p-6 rounded-xl shadow-md border border-slate-200">
        {/* Tendina Inglese */}
        <div className="flex flex-col w-full md:w-1/2">
          <label htmlFor="en-sets" className="font-semibold mb-2 text-blue-600">
            Espansioni Inglesi
          </label>
          <select
            id="en-sets"
            className="p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            onChange={handleSetSelection}
            defaultValue=""
          >
            <option value="">Seleziona un set...</option>
            {englishSets.map((set) => (
              <option key={set.id} value={set.id}>
                {set.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tendina Giapponese */}
        <div className="flex flex-col w-full md:w-1/2">
          <label htmlFor="jp-sets" className="font-semibold mb-2 text-emerald-600">
            Espansioni Giapponesi
          </label>
          <select
            id="jp-sets"
            className="p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            onChange={handleSetSelection}
            defaultValue=""
          >
            <option value="">Seleziona un set...</option>
            {japaneseSets.map((set) => (
              <option key={set.id} value={set.id}>
                {set.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Rendering della griglia delle carte */}
      <div>
        <h2 className="text-xl font-bold mb-6 border-b border-slate-300 pb-2">
          {cards.length > 0 ? `Trovate ${cards.length} carte in questa espansione:` : 'Seleziona un set per visualizzare le carte'}
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {cards.map((card) => (
            <div 
              key={card.id} 
              className="bg-white rounded-xl overflow-hidden hover:scale-105 transition-transform duration-200 shadow-md border border-slate-200 flex flex-col"
            >
              <div className="aspect-[63/88] w-full bg-slate-100 flex items-center justify-center">
                <img
                  src={card.image || card.imageUrl || `https://via.placeholder.com/240x330/e2e8f0/475569?text=${encodeURIComponent(card.name)}`}
                  alt={card.name}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3 mt-auto">
                <p className="font-semibold text-sm truncate" title={card.name}>{card.name}</p>
                {card.rarity && <p className="text-xs text-slate-500 mt-1">{card.rarity}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}