import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Login() {
  // Stato per alternare tra Login e Registrazione
  const [isRegister, setIsRegister] = useState(false);
  
  // Stati per i campi del modulo
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Per ora stampiamo i dati in console. Nel prossimo passo li invieremo al Back-end!
    console.log(isRegister ? "Registrazione:" : "Login:", { name, email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#141418] font-sans p-4">
      <div className="w-full max-w-md bg-gray-900/80 p-8 rounded-3xl border border-gray-700 shadow-2xl backdrop-blur-sm">
        
        {/* Pulsante per tornare alla Home */}
        <Link to="/" className="text-gray-500 hover:text-white text-sm mb-6 inline-block transition-colors">
          &larr; Torna al Pokédex
        </Link>

        <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
          {isRegister ? 'Crea un Account' : 'Bentornato Allenatore'}
        </h2>
        <p className="text-gray-400 text-sm mb-8">
          {isRegister ? 'Inizia a costruire la tua collezione personale.' : 'Accedi per gestire le tue carte.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Il campo Nome appare solo se ci si sta registrando */}
          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Nome</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                placeholder="Ash Ketchum"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
              placeholder="ash@pallet-town.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-red-500/20 mt-4"
          >
            {isRegister ? 'Registrati' : 'Accedi'}
          </button>
        </form>

        {/* Interruttore Login/Registrazione */}
        <p className="mt-8 text-center text-gray-400 text-sm">
          {isRegister ? 'Hai già un account?' : 'Non hai ancora un account?'}
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="ml-2 text-red-500 hover:text-red-400 font-bold underline transition-colors"
          >
            {isRegister ? 'Accedi' : 'Registrati'}
          </button>
        </p>

      </div>
    </div>
  );
}