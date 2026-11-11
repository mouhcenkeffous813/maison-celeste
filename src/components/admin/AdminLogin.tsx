import React, { useState } from 'react';
import { Lock, ArrowRight, ShieldCheck, Sparkles, Store } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const AdminLogin: React.FC = () => {
  const { loginAdmin, config, setCurrentView } = useStore();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = loginAdmin(pin);
    if (!success) {
      setError(true);
      setPin('');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl border border-store-border p-6 sm:p-10 max-w-md w-full shadow-luxury text-center animate-scaleUp">
        
        {/* Brand Header */}
        <div className="w-16 h-16 rounded-2xl bg-store-secondary text-stone-900 mx-auto flex items-center justify-center mb-4 border border-store-primary/30 shadow-xs">
          <Lock className="w-8 h-8 text-store-primary" />
        </div>

        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
          Espace Administrateur
        </h2>
        <p className="text-xs text-stone-500 mt-1 mb-6">
          Gestion de la boutique <strong className="text-stone-800">{config.storeName}</strong>
        </p>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Code PIN d'accès Administrateur
            </label>
            <input
              type="password"
              autoFocus
              maxLength={8}
              placeholder="••••"
              value={pin}
              onChange={e => {
                setPin(e.target.value);
                setError(false);
              }}
              className={`w-full px-4 py-3 text-center text-xl font-mono tracking-widest rounded-2xl border ${
                error ? 'border-rose-500 bg-rose-50/50' : 'border-store-border bg-store-base'
              } focus:outline-none focus:border-store-primary`}
            />
            {error && (
              <p className="text-xs text-rose-500 text-center mt-1.5">
                Code PIN incorrect. Veuillez réessayer.
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Se Connecter</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Back to store */}
        <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
          <button
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-1.5 hover:text-stone-900 transition-colors"
          >
            <Store className="w-3.5 h-3.5" />
            <span>Retour à la Boutique</span>
          </button>

          <span className="text-[11px] bg-stone-100 px-2 py-0.5 rounded text-stone-600 font-mono">
            PIN Démo : 1234
          </span>
        </div>
      </div>
    </div>
  );
};

