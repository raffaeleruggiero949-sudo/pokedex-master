"use client";

import { useState, useEffect } from 'react';

interface AddToDeckProps {
  cardId: string;
}

export default function AddToDeck({ cardId }: AddToDeckProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [decks, setDecks] = useState<{ id: string; name: string }[]>([]);
  const [selectedDeck, setSelectedDeck] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('pokedex_user');
    if (storedUser) {
      const parsedId = JSON.parse(storedUser).id;
      setUserId(parsedId);
      
      // Recupera i mazzi dell'utente per popolare la tendina
      fetch(`/api/decks?userId=${parsedId}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setDecks(data);
            if (data.length > 0) setSelectedDeck(data[0].id);
          }
        })
        .catch(err => console.error("Errore caricamento mazzi", err));
    }
  }, []);

  const handleAddToDeck = async () => {
    if (!selectedDeck) {
      setMessage('Seleziona un mazzo.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/decks/add-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deckId: selectedDeck,
          cardId: cardId,
        }),
      });

      if (response.ok) {
        setMessage('✅ Carta aggiunta al mazzo!');
        setTimeout(() => setIsOpen(false), 2000);
      } else {
        setMessage('❌ Errore durante l\'aggiunta.');
      }
    } catch (error) {
      setMessage('❌ Errore di rete.');
    } finally {
      setLoading(false);
    }
  };

  if (!userId) return null;

  return (
    <div className="relative mt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl shadow-lg transition-colors"
      >
        🃏 Aggiungi al Mazzo
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 left-0 w-64 p-4 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-10">
          {decks.length === 0 ? (
            <p className="text-sm text-slate-300">Non hai ancora creato nessun mazzo. Vai nel tuo Profilo per crearne uno!</p>
          ) : (
            <>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Scegli il mazzo:
              </label>
              <select
                value={selectedDeck}
                onChange={(e) => setSelectedDeck(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-violet-500 mb-3 cursor-pointer"
              >
                {decks.map(deck => (
                  <option key={deck.id} value={deck.id}>{deck.name}</option>
                ))}
              </select>
              <button
                onClick={handleAddToDeck}
                disabled={loading}
                className="w-full py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold rounded-lg transition-colors"
              >
                {loading ? 'Aggiunta...' : 'Conferma'}
              </button>
            </>
          )}
          
          {message && (
            <p className="text-sm mt-2 font-medium text-center text-slate-300">{message}</p>
          )}
        </div>
      )}
    </div>
  );
}