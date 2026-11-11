import React, { useState } from 'react';
import { ShieldCheck, Truck, RotateCcw, Heart, Phone, Sparkles, MessageCircle, Lock } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const Footer: React.FC = () => {
  const { config, setCurrentView, setSelectedCategory, isAdminLoggedIn, showToast } = useStore();
  const [secretClicks, setSecretClicks] = useState(0);

  // Secret 3-click trigger on the copyright to open admin without any client seeing an admin button
  const handleSecretClick = () => {
    setSecretClicks(prev => {
      const next = prev + 1;
      if (next >= 3) {
        setCurrentView('admin');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        showToast('Accès Administrateur Déverrouillé', 'info');
        return 0;
      }
      return next;
    });
    setTimeout(() => setSecretClicks(0), 1500);
  };

  return (
    <footer className="bg-stone-900 text-stone-300 pt-12 pb-8 border-t border-stone-800">
      <div className="max-w-6xl mx-auto px-4">
        {/* Top Trust Icons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-10 border-b border-stone-800 text-center">
          <div className="p-3">
            <Truck className="w-6 h-6 text-store-primary mx-auto mb-2" />
            <p className="text-xs font-bold text-white uppercase tracking-wider">Livraison 58 Wilayas</p>
            <p className="text-[11px] text-stone-400 mt-0.5">Domicile ou Stop Desk</p>
          </div>
          <div className="p-3">
            <ShieldCheck className="w-6 h-6 text-store-primary mx-auto mb-2" />
            <p className="text-xs font-bold text-white uppercase tracking-wider">Paiement à la Livraison</p>
            <p className="text-[11px] text-stone-400 mt-0.5">Réglez après vérification</p>
          </div>
          <div className="p-3">
            <RotateCcw className="w-6 h-6 text-store-primary mx-auto mb-2" />
            <p className="text-xs font-bold text-white uppercase tracking-wider">Échange Garanti</p>
            <p className="text-[11px] text-stone-400 mt-0.5">Taille non adaptée ? Échange sous 48h</p>
          </div>
          <div className="p-3">
            <MessageCircle className="w-6 h-6 text-store-primary mx-auto mb-2" />
            <p className="text-xs font-bold text-white uppercase tracking-wider">Service Client Dédié</p>
            <p className="text-[11px] text-stone-400 mt-0.5">À votre écoute sur WhatsApp 7j/7</p>
          </div>
        </div>

        {/* Main Footer Links matching Screenshot 3 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 py-10 border-b border-stone-800">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-3">
              <img
                src={config.logoUrl || '/orlea-logo.svg'}
                alt={config.storeName}
                className="w-10 h-10 rounded-2xl object-cover border border-stone-700 shadow-xs"
              />
              <h2 className="font-sans font-bold text-2xl text-white tracking-tight">
                {config.storeName}
              </h2>
            </div>
            <p className="text-xs text-stone-400 font-light leading-relaxed max-w-sm">
              {config.storeTagline || 'Haute Joaillerie & Cadeaux de Prestige en Algérie. Sublimez vos moments précieux.'}
            </p>
            <div className="pt-1 flex items-center gap-2 text-xs text-stone-300 font-medium">
              <Phone className="w-4 h-4 text-store-primary" />
              <span>Contact : {config.phone}</span>
            </div>
          </div>

          {/* Boutique Navigation Links (Screenshot 3) */}
          <div className="md:col-span-4 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              BOUTIQUE
            </h3>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button
                  onClick={() => {
                    setCurrentView('contact');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-store-primary transition-colors"
                >
                  Contactez-nous
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView('home');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-store-primary transition-colors"
                >
                  À propos
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView('tracking');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-store-primary transition-colors"
                >
                  État de commande (FAQs & Suivi)
                </button>
              </li>
            </ul>
          </div>

          {/* Livraison Links (Screenshot 3) */}
          <div className="md:col-span-3 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              LIVRAISON
            </h3>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button
                  onClick={() => {
                    setCurrentView('shipping');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-store-primary transition-colors"
                >
                  Tarifs de livraison
                </button>
              </li>
            </ul>

            {/* Courier Badges */}
            <div className="pt-3">
              <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-mono text-stone-400">
                <span className="px-2 py-0.5 bg-stone-800 rounded border border-stone-700">Yalidine</span>
                <span className="px-2 py-0.5 bg-stone-800 rounded border border-stone-700">ZR Express</span>
                <span className="px-2 py-0.5 bg-stone-800 rounded border border-stone-700 text-rose-400 font-bold">COD 🇩🇿</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright matching Screenshot 3 */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <p
            onClick={handleSecretClick}
            className="cursor-default select-none transition-colors hover:text-stone-400"
            title=""
          >
            Tous les droits sont réservés © {new Date().getFullYear()} {config.storeName}
          </p>

          {/* Only shown if the merchant is ALREADY authenticated */}
          {isAdminLoggedIn && (
            <button
              onClick={() => {
                setCurrentView('admin');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-[11px] bg-stone-800 text-stone-300 hover:text-white px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Lock className="w-3 h-3 text-store-primary" />
              <span>Tableau de Bord Gérant</span>
            </button>
          )}
        </div>
      </div>
    </footer>
  );
};

