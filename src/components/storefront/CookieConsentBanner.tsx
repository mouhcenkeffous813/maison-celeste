import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie, Settings, Check, X } from 'lucide-react';
import { consentManager } from '../../services/consentManager';
import { ConsentPreferences } from '../../types/marketing';
import { useStore } from '../../context/StoreContext';

export const CookieConsentBanner: React.FC = () => {
  const { config } = useStore();
  const [isVisible, setIsVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>(() =>
    consentManager.getPreferences()
  );

  useEffect(() => {
    // Only show banner if user has not decided yet
    if (!consentManager.hasUserDecided()) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    consentManager.acceptAll();
    setIsVisible(false);
  };

  const handleDenyAll = () => {
    consentManager.denyAll();
    setIsVisible(false);
  };

  const handleSaveCustom = () => {
    consentManager.setPreferences({
      status: preferences.marketing || preferences.analytics ? 'granted' : 'denied',
      marketing: preferences.marketing,
      analytics: preferences.analytics,
    });
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-white/95 backdrop-blur-md border border-store-border rounded-3xl p-5 shadow-2xl text-stone-900 space-y-4">
        
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Cookie className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-serif font-bold text-sm text-stone-900">
              Confidentialité & Suivi Publicitaire
            </h3>
            <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
              {config.storeName} utilise des cookies pour assurer le bon fonctionnement de la boutique et, avec votre accord, des pixels publicitaires (Meta, TikTok) pour mesurer nos campagnes.
            </p>
          </div>
        </div>

        {/* Modal / Section Personnalisation */}
        {showCustomize && (
          <div className="space-y-2.5 pt-2 border-t border-stone-100 text-xs">
            {/* Nécessaires */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-100">
              <div>
                <p className="font-semibold text-stone-800">Cookies nécessaires</p>
                <p className="text-[11px] text-stone-400">Fonctionnement du panier et des commandes.</p>
              </div>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider bg-stone-200/60 px-2 py-0.5 rounded-md">
                Toujours actif
              </span>
            </div>

            {/* Publicitaires (Meta, TikTok) */}
            <label className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 hover:bg-stone-100/70 border border-stone-100 cursor-pointer transition-colors">
              <div>
                <p className="font-semibold text-stone-800">Pixels publicitaires</p>
                <p className="text-[11px] text-stone-400">Meta Pixel (Facebook/Instagram) & TikTok Ads.</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.marketing}
                onChange={e =>
                  setPreferences(prev => ({ ...prev, marketing: e.target.checked }))
                }
                className="w-4 h-4 text-store-primary rounded focus:ring-store-primary accent-store-primary cursor-pointer"
              />
            </label>

            {/* Analytics */}
            <label className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 hover:bg-stone-100/70 border border-stone-100 cursor-pointer transition-colors">
              <div>
                <p className="font-semibold text-stone-800">Mesure d'audience</p>
                <p className="text-[11px] text-stone-400">Statistiques anonymes de visites.</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.analytics}
                onChange={e =>
                  setPreferences(prev => ({ ...prev, analytics: e.target.checked }))
                }
                className="w-4 h-4 text-store-primary rounded focus:ring-store-primary accent-store-primary cursor-pointer"
              />
            </label>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-1">
          {showCustomize ? (
            <div className="flex gap-2">
              <button
                onClick={handleSaveCustom}
                className="flex-1 py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Enregistrer mes choix</span>
              </button>
              <button
                onClick={() => setShowCustomize(false)}
                className="py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition-colors"
              >
                Retour
              </button>
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <button
                  onClick={handleAcceptAll}
                  className="flex-1 py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs"
                >
                  Accepter tout
                </button>
                <button
                  onClick={handleDenyAll}
                  className="flex-1 py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors border border-stone-200"
                >
                  Refuser
                </button>
              </div>

              <button
                onClick={() => setShowCustomize(true)}
                className="text-center text-[11px] text-stone-500 hover:text-stone-900 underline underline-offset-2 transition-colors py-1 flex items-center justify-center gap-1"
              >
                <Settings className="w-3 h-3" />
                <span>Personnaliser mes préférences</span>
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
