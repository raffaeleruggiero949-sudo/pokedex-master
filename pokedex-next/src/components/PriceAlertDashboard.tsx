"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Alert {
  id: string;
  targetPrice: number;
  isActive: boolean;
  cardId: string;
  card: { name: string; imageUrl: string | null };
}

export default function PriceAlertDashboard() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  // READ: Recupera gli alert
  useEffect(() => {
    const fetchAlerts = async () => {
      const storedUser = localStorage.getItem('pokedex_user');
      if (!storedUser) return;
      
      const userId = JSON.parse(storedUser).id;
      
      try {
        const res = await fetch(`/api/price-alerts?userId=${userId}`);
        if (res.ok) {
          const data = await res.json();
          setAlerts(data);
        }
      } catch (error) {
        console.error('Errore caricamento alert', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  // UPDATE: Cambia lo stato Attivo/Inattivo (Modificato manualmente o dal Cron)
  const toggleAlertStatus = async (alertId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/price-alerts/${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (res.ok) {
        setAlerts(alerts.map(a => a.id === alertId ? { ...a, isActive: !currentStatus } : a));
      } else {
        alert("Errore nell'aggiornamento dello stato.");
      }
    } catch (error) {
      console.error('Errore aggiornamento', error);
    }
  };

  // DELETE: Elimina l'alert definitivamente
  const deleteAlert = async (alertId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo alert?')) return;

    try {
      const res = await fetch(`/api/price-alerts/${alertId}`, { method: 'DELETE' });
      if (res.ok) {
        setAlerts(alerts.filter(a => a.id !== alertId));
      }
    } catch (error) {
      console.error('Errore eliminazione', error);
    }
  };

  if (loading) return <div className="text-slate-400">Caricamento Price Alerts...</div>;

  if (alerts.length === 0) return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
      Non hai ancora impostato nessun Price Alert. Cerca una carta e clicca su "Imposta Price Alert".
    </div>
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-950 text-slate-400 text-sm border-b border-slate-800">
            <th className="p-4 font-medium">Carta</th>
            <th className="p-4 font-medium">Soglia Desiderata</th>
            <th className="p-4 font-medium">Stato (Clicca per modificare)</th>
            <th className="p-4 font-medium text-right">Azioni</th>
          </tr>
        </thead>
        <tbody>
          {alerts.map((alert) => (
            <tr key={alert.id} className="border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors">
              <td className="p-4">
                <Link href={`/cards/${alert.cardId}`} className="font-bold text-blue-400 hover:underline">
                  {alert.card.name}
                </Link>
              </td>
              <td className="p-4 font-mono text-emerald-400 font-bold">
                ${alert.targetPrice.toFixed(2)}
              </td>
              <td className="p-4">
                <button
                  onClick={() => toggleAlertStatus(alert.id, alert.isActive)}
                  title={alert.isActive ? "Spegni Alert" : "Riaccendi Alert"}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-transform hover:scale-105 active:scale-95 ${
                    alert.isActive 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(52,211,153,0.1)]' 
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                >
                  {alert.isActive ? '🟢 IN RICERCA' : '⚪ INATTIVO'}
                </button>
              </td>
              <td className="p-4 text-right">
                <button
                  onClick={() => deleteAlert(alert.id)}
                  className="text-red-400 hover:text-red-300 font-medium text-sm transition-colors bg-red-400/10 hover:bg-red-400/20 px-3 py-1 rounded-lg border border-red-400/20"
                >
                  Elimina
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}