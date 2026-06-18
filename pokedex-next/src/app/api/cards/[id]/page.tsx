import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// Questo componente legge l'ID della carta direttamente dall'URL
export default async function CardDetail({ params }: { params: { id: string } }) {
  
  // Interroghiamo il database tramite Prisma
  const card = await prisma.card.findUnique({
    where: { id: params.id },
    include: { set: true }, // Vogliamo anche i dati del set associato
  });

  // Se la carta non esiste, mostra la pagina 404
  if (!card) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#141418] font-sans text-white p-8 flex justify-center items-center">
      <div className="max-w-4xl w-full bg-gray-900/80 rounded-3xl border border-gray-700 shadow-2xl p-8 flex flex-col md:flex-row gap-10">
        
        {/* Colonna Sinistra: Immagine */}
        <div className="w-full md:w-1/2 flex flex-col items-center">
          <Link href="/" className="self-start text-gray-500 hover:text-white mb-6 font-semibold transition-colors">
            &larr; Torna al Pokédex
          </Link>
          <img 
            src={card.imageUrl} 
            alt={card.name} 
            className="w-full h-auto rounded-2xl shadow-[0_0_30px_rgba(239,68,68,0.15)] hover:scale-105 transition-transform duration-500" 
          />
        </div>

        {/* Colonna Destra: Informazioni e Bottone */}
        <div className="w-full md:w-1/2 flex flex-col justify-center">
          <div className="mb-4">
            <span className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-full text-xs font-bold text-gray-400 uppercase tracking-wider">
              {card.supertype}
            </span>
            {card.rarity && (
              <span className="ml-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/50 rounded-full text-xs font-bold text-yellow-500 uppercase tracking-wider">
                {card.rarity}
              </span>
            )}
          </div>
          
          <h1 className="text-5xl font-black mb-2 tracking-tight text-white">{card.name}</h1>
          
          <div className="flex items-center gap-3 mb-8 pb-8 border-b border-gray-800">
            {card.set.symbolUrl && <img src={card.set.symbolUrl} alt="Set Symbol" className="w-6 h-6" />}
            <span className="text-xl text-gray-400 font-medium">{card.set.name}</span>
          </div>

          <div className="bg-gray-950 p-6 rounded-2xl border border-gray-800 mb-8">
            <p className="text-gray-400 text-sm uppercase tracking-wider mb-1 font-bold">Valore di Mercato</p>
            <p className="text-4xl font-black text-green-400">
              ${card.priceUsd > 0 ? card.priceUsd.toFixed(2) : "N/D"}
            </p>
          </div>

          {/* Nel prossimo step renderemo questo pulsante funzionante per il salvataggio */}
          <button className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-red-500/20 text-lg flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Aggiungi alla Collezione
          </button>
        </div>

      </div>
    </div>
  );
}