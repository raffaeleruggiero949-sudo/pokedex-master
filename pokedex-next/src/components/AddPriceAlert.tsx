"use client";

import { useState, useEffect } from 'react';

interface AddPriceAlertProps {
  cardId: string;
}

export default function AddPriceAlert({ cardId }: AddPriceAlertProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [targetPrice, setTargetPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('pokedex_user');
    if (storedUser) {
      setUserId(JSON.parse(storedUser).id);
    }
  }, []);

  const handleCreateAlert = async () => {
    if (!targetPrice || isNaN(Number(targetPrice))) {
      setMessage('Inserisci un prezzo valido.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/price-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          cardId,
          targetPrice: Number(targetPrice),
        }),
      });

      if (response.ok) {
        setMessage('✅ Alert creato con successo!');
        setTimeout(() => setIsOpen(false), 2000);
      } else {
        setMessage('❌ Errore durante la creazione.');
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
        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition-colors"
      >
        🔔 Imposta Price Alert
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 left-0 w-64 p-4 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-10">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Avvisami se scende sotto a ($):
          </label>
          <input
            type="number"
            step="0.01"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500 mb-3"
            placeholder="es. 49.99"
          />
          <button
            onClick={handleCreateAlert}
            disabled={loading}
            className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-lg transition-colors"
          >
            {loading ? 'Salvataggio...' : 'Salva Alert'}
          </button>
          
          {message && (
            <p className="text-sm mt-2 font-medium text-center text-slate-300">{message}</p>
          )}
        </div>
      )}
    </div>
  );
}