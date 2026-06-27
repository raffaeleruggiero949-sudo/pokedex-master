"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface DeckCard {
  id: string;
  quantity: number;
  card: { id: string; name: string; imageUrl: string | null };
}

interface Deck {
  id: string;
  name: string;
  description: string | null;
  cards: DeckCard[];
}

export default function DeckDashboard() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Stati per il form di creazione
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDesc, setNewDeckDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('pokedex_user');
    if (storedUser) {
      const parsedId = JSON.parse(storedUser).id;
      setUserId(parsedId);
      fetchDecks(parsedId);
    }
  }, []);

  const fetchDecks = async (id: string) => {
    try {
      const res = await fetch(`/api/decks?userId=${id}`);
      if (res.ok) {
        const data = await res.json();
        setDecks(data);
      }
    } catch (error) {
      console.error('Errore caricamento mazzi', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeckName.trim() || !userId) return;

    setIsCreating(true);
    try {
      const res = await fetch('/api/decks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, name: newDeckName, description: newDeckDesc }),
      });

      if (res.ok) {
        const newDeck = await res.json();
        setDecks([newDeck, ...decks]); // Aggiunge il nuovo mazzo in cima alla lista
        setNewDeckName('');
        setNewDeckDesc('');
      }
    } catch (error) {
      console.error('Errore creazione mazzo', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteDeck = async (deckId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo mazzo? L\'operazione è irreversibile.')) return;

    try {
      const res = await fetch(`/api/decks/${deckId}`, { method: 'DELETE' });
      if (res.ok) {
        setDecks(decks.filter(d => d.id !== deckId));
      }
    } catch (error) {
      console.error('Errore eliminazione', error);
    }
  };

  if (loading) return <div className="text-slate-400">Caricamento Mazzi...</div>;

  return (
    <div className="flex flex-col gap-6">
      {/* FORM CREAZIONE MAZZO */}
      <form onSubmit={handleCreateDeck} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-sm font-bold text-slate-400 mb-2">Nome del Mazzo</label>
          <input
            type="text"
            required
            value={newDeckName}
            onChange={(e) => setNewDeckName(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-violet-500 transition-colors"
            placeholder="es. Mazzo Fuoco Competitivo"
          />
        </div>
        <div className="flex-1 w-full">
          <label className="block text-sm font-bold text-slate-400 mb-2">Descrizione (Opzionale)</label>
          <input
            type="text"
            value={newDeckDesc}
            onChange={(e) => setNewDeckDesc(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-violet-500 transition-colors"
            placeholder="es. Strategia aggressiva..."
          />
        </div>
        <button
          type="submit"
          disabled={isCreating}
          className="w-full md:w-auto px-6 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold rounded-lg transition-colors h-[42px]"
        >
          {isCreating ? 'Creazione...' : 'Crea Mazzo'}
        </button>
      </form>

      {/* LISTA DEI MAZZI */}
      {decks.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
          Non hai ancora creato nessun mazzo. Usa il modulo qui sopra per iniziare!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {decks.map((deck) => {
            const totalCards = deck.cards?.reduce((acc, curr) => acc + curr.quantity, 0) || 0;
            return (
              <div key={deck.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{deck.name}</h3>
                    {deck.description && <p className="text-sm text-slate-400 mt-1">{deck.description}</p>}
                  </div>
                  <button onClick={() => handleDeleteDeck(deck.id)} className="text-red-400 hover:text-red-300 text-sm font-bold p-2 bg-red-400/10 rounded-lg transition-colors">
                    Elimina
                  </button>
                </div>
                
                <div className="mt-auto pt-4 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-sm font-bold text-violet-400">{totalCards} Carte Inserite</span>
                </div>
                
                {deck.cards && deck.cards.length > 0 && (
                  <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
                    {deck.cards.map(deckCard => (
                      <Link href={`/cards/${deckCard.card.id}`} key={deckCard.id} className="relative flex-shrink-0 group">
                        <img src={deckCard.card.imageUrl || ''} alt={deckCard.card.name} className="w-16 rounded-md border border-slate-700 group-hover:border-violet-500 transition-colors" />
                        <span className="absolute -top-2 -right-2 bg-slate-950 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-slate-700">x{deckCard.quantity}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}