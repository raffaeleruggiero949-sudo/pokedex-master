import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

interface CardDetailInfo {
  id: string;
  name: string;
  supertype: string;
  rarity: string;
  priceUsd: number;
  imageUrl: string;
  set: { name: string; series: string; releaseDate: string };
}

export default function CardDetail() {
  // Prende l'ID direttamente dall'URL
  const { id } = useParams();
  const [card, setCard] = useState<CardDetailInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Chiama la rotta GET /api/cards/:id di NestJS!
    fetch(`http://localhost:3000/api/cards/${id}`)
      .then((response) => response.json())
      .then((data) => {
        setCard(data);
        setLoading(false);
      })
      .catch((error) => console.error("Errore:", error));
  }, [id]);

  if (loading) return <div className="text-white text-center mt-20 text-2xl">Recupero dati dal Pokédex... ⏳</div>;
  if (!card) return <div className="text-red-500 text-center mt-20 text-2xl font-bold">Carta non trovata ❌</div>;

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen text-white font-sans">
      <Link to="/" className="inline-block mb-8 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-600 transition-colors">
        &larr; Torna alla collezione
      </Link>

      <div className="flex flex-col md:flex-row gap-12 items-center md:items-start bg-gray-900/50 p-8 rounded-3xl border border-gray-800 shadow-2xl">
        {/* Immagine a sinistra */}
        <div className="w-full md:w-1/3">
          <img 
            src={card.imageUrl} 
            alt={card.name} 
            className="w-full h-auto rounded-2xl drop-shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-transform hover:scale-105 duration-500"
          />
        </div>

        {/* Statistiche a destra */}
        <div className="w-full md:w-2/3 space-y-6">
          <h1 className="text-6xl font-black tracking-tight">{card.name}</h1>
          
          <div className="flex gap-4">
            <span className="px-4 py-1.5 bg-blue-900/40 text-blue-400 border border-blue-700/50 rounded-full text-sm font-bold tracking-wider uppercase">
              {card.supertype}
            </span>
            <span className="px-4 py-1.5 bg-purple-900/40 text-purple-400 border border-purple-700/50 rounded-full text-sm font-bold tracking-wider uppercase">
              {card.rarity}
            </span>
          </div>

          <div className="p-6 bg-gray-800 rounded-2xl border border-gray-700 space-y-4">
            <h2 className="text-2xl font-bold text-gray-300 border-b border-gray-600 pb-2">Informazioni Espansione</h2>
            <div className="grid grid-cols-2 gap-4 text-lg">
              <p><span className="text-gray-500 block text-sm uppercase">Nome Set</span> {card.set.name}</p>
              <p><span className="text-gray-500 block text-sm uppercase">Serie</span> {card.set.series}</p>
              <p><span className="text-gray-500 block text-sm uppercase">Data Uscita</span> {card.set.releaseDate}</p>
            </div>
          </div>

          <div className="mt-8 p-6 bg-gray-950 rounded-2xl border border-green-900/50 shadow-[0_0_15px_rgba(0,255,0,0.05)]">
            <p className="text-gray-400 text-sm uppercase tracking-widest mb-1">Valore di mercato stimato</p>
            <p className="text-5xl font-black text-green-400">${card.priceUsd}</p>
          </div>
        </div>
      </div>
    </div>
  );
}