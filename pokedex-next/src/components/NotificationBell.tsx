"use client";

import { useState, useEffect, useRef } from 'react';

interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    const storedUser = localStorage.getItem('pokedex_user');
    if (!storedUser) return;
    const userId = JSON.parse(storedUser).id;

    try {
      const res = await fetch(`/api/notifications?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Errore caricamento notifiche", error);
    }
  };

  // Carica all'avvio e controlla nuove notifiche ogni 30 secondi (Ottimo per la demo!)
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Chiude il menu a tendina se clicchi fuori
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Apre la campanella e azzera il pallino rosso
  const handleToggle = async () => {
    setIsOpen(!isOpen);
    
    // Se stiamo APRENDO il menu e ci sono notifiche non lette...
    if (!isOpen && unreadCount > 0) {
      const storedUser = localStorage.getItem('pokedex_user');
      if (!storedUser) return;
      const userId = JSON.parse(storedUser).id;

      try {
        // Chiama il backend per marcarle come lette
        await fetch(`/api/notifications?userId=${userId}`, { method: 'PATCH' });
        
        // Spegne il pallino rosso istantaneamente
        setUnreadCount(0);
        
        // Cambia il colore di sfondo delle notifiche per farle sembrare lette
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      } catch (error) {
        console.error("Errore nel marcare le notifiche come lette", error);
      }
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* BOTTONE CAMPANELLA */}
      <button 
        onClick={handleToggle}
        className="relative p-2 rounded-full hover:bg-slate-800 transition-all flex items-center justify-center"
      >
        <span className="text-2xl hover:scale-110 transition-transform">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full border-2 border-slate-900 text-xs font-bold flex items-center justify-center text-white animate-bounce shadow-[0_0_10px_rgba(239,68,68,0.8)]">
            {unreadCount}
          </span>
        )}
      </button>

      {/* MENU A TENDINA */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden transform opacity-100 transition-all">
          <div className="p-4 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
            <h3 className="font-bold text-slate-100">Le tue Notifiche</h3>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                Nessuna notifica presente.
              </div>
            ) : (
              notifications.map(notif => (
                <div 
                  key={notif.id} 
                  className={`p-4 border-b border-slate-800/50 text-sm transition-colors ${
                    !notif.isRead ? 'bg-slate-800/40 border-l-4 border-l-blue-500' : 'opacity-60'
                  }`}
                >
                  <p className="text-slate-200">{notif.message}</p>
                  <span className="text-[10px] font-bold uppercase text-slate-500 mt-2 block">
                    {new Date(notif.createdAt).toLocaleDateString('it-IT')} alle {new Date(notif.createdAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}