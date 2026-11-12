import React, { useState } from 'react';
import { Truck, Search, Sparkles, Building, Home, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatPrice, searchMatches } from '../../utils/formatters';

export const ShippingRates: React.FC = () => {
  const { wilayas, config, setCurrentView } = useStore();
  const [search, setSearch] = useState('');

  const filteredWilayas = wilayas.filter(
    w =>
      searchMatches(w.name, search) ||
      w.arName.includes(search) ||
      w.code.includes(search)
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Back to Home Button */}
      <div className="mb-6">
        <button
          onClick={() => setCurrentView('home')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-stone-200 text-stone-700 hover:text-stone-900 hover:bg-stone-50 text-xs font-bold shadow-xs transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-store-primary" />
          <span>← Retour à la boutique</span>
        </button>
      </div>

      {/* Header */}
      <div className="text-center max-w-lg mx-auto mb-8">
        <div className="w-12 h-12 rounded-2xl bg-store-secondary text-store-primary flex items-center justify-center mx-auto mb-3 shadow-xs">
          <Truck className="w-6 h-6" />
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
          Tarifs de Livraison (58 Wilayas)
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-stone-500">
          Expédition sécurisée partout en Algérie avec Yalidine, ZR Express et nos transporteurs partenaires.
        </p>

        {/* Free Shipping Badge (Shown only if enabled) */}
        {config.freeShippingEnabled && config.freeShippingThreshold > 0 && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>
              LIVRAISON GRATUITE dès <strong>{formatPrice(config.freeShippingThreshold, config.currency)}</strong> d'achat !
            </span>
          </div>
        )}
      </div>

      {/* Search Input */}
      <div className="mb-6 max-w-md mx-auto relative">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Rechercher une wilaya (ex: Alger, Oran, 16...)"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white rounded-2xl border border-store-border focus:outline-none focus:border-store-primary shadow-xs font-medium"
        />
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-3xl border border-store-border overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-store-secondary/60 text-stone-700 uppercase tracking-wider text-[10px] font-bold border-b border-store-border">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Wilaya</th>
                <th className="py-3 px-4 text-right">
                  <span className="flex items-center justify-end gap-1">
                    <Home className="w-3.5 h-3.5 text-store-primary" />
                    <span>À Domicile</span>
                  </span>
                </th>
                <th className="py-3 px-4 text-right">
                  <span className="flex items-center justify-end gap-1">
                    <Building className="w-3.5 h-3.5 text-stone-500" />
                    <span>Stop Desk (Bureau)</span>
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredWilayas.map(wilaya => (
                <tr key={wilaya.id} className="hover:bg-store-secondary/20 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-stone-400">{wilaya.code}</td>
                  <td className="py-3 px-4 font-semibold text-stone-900">
                    <div className="flex items-baseline gap-2">
                      <span>{wilaya.name}</span>
                      <span className="text-[11px] text-stone-400 font-normal">{wilaya.arName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-stone-900 font-mono">
                    {formatPrice(wilaya.homeDeliveryPrice, config.currency)}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-stone-600 font-mono">
                    {formatPrice(wilaya.stopDeskPrice, config.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

