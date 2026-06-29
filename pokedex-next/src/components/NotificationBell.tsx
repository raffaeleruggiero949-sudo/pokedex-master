"use client";

import { useEffect, useState } from "react";

type Notification = {
  id: string;
  message: string;
  isRead: boolean;
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Chiama l'API appena il componente viene caricato
    const fetchNotifications = async () => {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    };

    fetchNotifications();
    
    // Opzionale: Ricarica le notifiche ogni 60 secondi
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      {/* Bottone Campanella */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-300 hover:text-white"
      >
        🔔
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>
        )}
      </button>

      {/* Menu a tendina delle notifiche */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="p-3 text-sm font-bold border-b border-gray-700 text-white">
            Notifiche
          </div>
          <ul className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <li className="p-3 text-sm text-gray-400">Nessuna nuova notifica</li>
            ) : (
              notifications.map((notif) => (
                <li key={notif.id} className="p-3 text-sm border-b border-gray-700 hover:bg-gray-700 text-gray-200">
                  {notif.message}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}