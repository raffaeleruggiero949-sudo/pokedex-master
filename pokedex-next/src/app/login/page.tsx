"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); 
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // LA PORTA DEL BACK-END NESTJS (Solitamente 3001 se Next.js è sulla 3000)
  const BACKEND_URL = 'http://localhost:3001';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    const payload = isLogin ? { email, password } : { email, password, name };

    try {
      const res = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Errore durante la richiesta');
      }

      if (isLogin) {
        // SALVATAGGIO DEL TOKEN DI SICUREZZA
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('pokedex_user', JSON.stringify(data.user));
        
        router.push('/'); // Torna alla home dopo il login
      } else {
        alert('✅ Registrazione completata! Ora puoi fare il login.');
        setIsLogin(true); // Passa alla schermata di accesso
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 font-sans text-slate-100">
      <Link href="/" className="absolute top-8 left-8 text-slate-400 hover:text-white transition-colors font-medium">
        &larr; Torna alla Home
      </Link>

      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 tracking-tight">
            {isLogin ? 'Bentornato' : 'Crea Account'}
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            {isLogin ? 'Accedi per gestire il tuo Masterset.' : 'Registrati per iniziare la tua collezione.'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl text-sm text-center mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <div>
              <label className="block text-slate-400 text-xs font-bold mb-2 uppercase tracking-wide">Nome Allenatore</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors"
                placeholder="Es. Ash Ketchum"
              />
            </div>
          )}

          <div>
            <label className="block text-slate-400 text-xs font-bold mb-2 uppercase tracking-wide">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors"
              placeholder="tuo@indirizzo.com"
            />
          </div>

          <div>
            <label className="block text-slate-400 text-xs font-bold mb-2 uppercase tracking-wide">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-900/50 mt-4 disabled:opacity-50"
          >
            {loading ? 'Attendere...' : (isLogin ? 'ACCEDI' : 'REGISTRATI')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm">
            {isLogin ? "Non hai un account?" : "Hai già un account?"}
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="ml-2 text-blue-400 hover:text-blue-300 font-bold transition-colors"
            >
              {isLogin ? "Registrati ora" : "Accedi"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}