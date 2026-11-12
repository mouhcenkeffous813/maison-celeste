import React, { useState } from 'react';
import { Truck, Search, Check, Sparkles, Building, Home, Save, RotateCcw } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatPrice, searchMatches } from '../../utils/formatters';
import { Wilaya } from '../../types';

export const AdminShipping: React.FC = () => {
  const { wilayas, config, updateWilaya, updateConfig, showToast } = useStore();
  const [search, setSearch] = useState('');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number>(
    config.freeShippingThreshold || 10000
  );
  const [freeShippingEnabled, setFreeShippingEnabled] = useState<boolean>(
    config.freeShippingEnabled ?? false
  );

  // Local state for inline edits
  const [editingValues, setEditingValues] = useState<Record<number, { home: number; desk: number }>>({});

  const handlePriceChange = (id: number, field: 'home' | 'desk', value: number) => {
    setEditingValues(prev => ({
      ...prev,
      [id]: {
        home: field === 'home' ? value : prev[id]?.home ?? (wilayas.find(w => w.id === id)?.homeDeliveryPrice || 0),
        desk: field === 'desk' ? value : prev[id]?.desk ?? (wilayas.find(w => w.id === id)?.stopDeskPrice || 0),
      }
    }));
  };

  const handleSaveWilaya = async (wilaya: Wilaya) => {
    const edits = editingValues[wilaya.id];
    if (edits) {
      await updateWilaya(wilaya.id, {
        homeDeliveryPrice: edits.home,
        stopDeskPrice: edits.desk,
      });
      // clear local edit state for this row
      setEditingValues(prev => {
        const copy = { ...prev };
        delete copy[wilaya.id];
        return copy;
      });
    }
  };

  const handleToggleDeliverable = async (wilaya: Wilaya) => {
    await updateWilaya(wilaya.id, { isDeliverable: !wilaya.isDeliverable });
  };

  const handleSaveThreshold = async () => {
    await updateConfig({ freeShippingThreshold, freeShippingEnabled });
    showToast(
      freeShippingEnabled
        ? `Livraison gratuite activée dès ${freeShippingThreshold} DA !`
        : 'Livraison gratuite désactivée (frais toujours facturés)',
      'success'
    );
  };

  const filteredWilayas = wilayas.filter(
    w =>
      searchMatches(w.name, search) ||
      w.arName.includes(search) ||
      w.code.includes(search)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
            Tarifs de Livraison (58 Wilayas)
          </h2>
          <p className="text-xs text-stone-500">
            Ajustez vos tarifs Domicile et Stop Desk selon votre contrat transporteur (Yalidine, ZR Express, etc.).
          </p>
        </div>
      </div>

      {/* Global Free Shipping Card with Activate / Deactivate Toggle */}
      <div className="bg-gradient-to-r from-stone-900 to-stone-800 text-white rounded-3xl p-5 sm:p-6 shadow-luxury flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border border-stone-800">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-amber-300 flex-shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-base font-bold">
                Seuil de Livraison Gratuite Globale
              </h3>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                  freeShippingEnabled
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-stone-700/60 text-stone-400 border-stone-600'
                }`}
              >
                {freeShippingEnabled ? '● Activé' : '○ Désactivé'}
              </span>
            </div>
            <p className="text-xs text-stone-300 mt-0.5">
              {freeShippingEnabled
                ? 'Les frais de port sont offerts dès que le panier atteint le seuil ci-contre.'
                : 'La livraison gratuite est désactivée. Les frais de port de chaque Wilaya sont toujours facturés.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Toggle Switch */}
          <button
            type="button"
            onClick={() => setFreeShippingEnabled(!freeShippingEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              freeShippingEnabled ? 'bg-emerald-500' : 'bg-stone-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                freeShippingEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>

          {/* Amount input */}
          <div className={`flex items-center gap-1.5 ${!freeShippingEnabled ? 'opacity-40 pointer-events-none' : ''}`}>
            <input
              type="number"
              step={500}
              min={0}
              disabled={!freeShippingEnabled}
              value={freeShippingThreshold}
              onChange={e => setFreeShippingThreshold(Number(e.target.value))}
              className="w-28 px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white font-mono text-sm font-bold text-center focus:outline-none focus:border-store-primary"
            />
            <span className="text-xs font-bold text-stone-300">DA</span>
          </div>

          <button
            onClick={handleSaveThreshold}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl text-xs font-bold shadow-soft transition-all"
          >
            Sauvegarder
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white rounded-2xl border border-store-border p-3 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher une wilaya par nom ou code (ex: Alger, Oran, 16...)"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-store-base rounded-xl border border-store-border focus:outline-none focus:border-store-primary font-medium"
          />
        </div>
      </div>

      {/* Wilayas Table */}
      <div className="bg-white rounded-3xl border border-store-border overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-store-secondary/40 text-stone-700 uppercase tracking-wider text-[10px] font-bold border-b border-store-border">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Wilaya</th>
                <th className="py-3 px-4">Livraison Active</th>
                <th className="py-3 px-4">Tarif Domicile (DA)</th>
                <th className="py-3 px-4">Tarif Stop Desk (DA)</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredWilayas.map(wilaya => {
                const isModified = editingValues[wilaya.id] !== undefined;
                const homeVal = editingValues[wilaya.id]?.home ?? wilaya.homeDeliveryPrice;
                const deskVal = editingValues[wilaya.id]?.desk ?? wilaya.stopDeskPrice;

                return (
                  <tr
                    key={wilaya.id}
                    className={`hover:bg-store-secondary/20 transition-colors ${
                      !wilaya.isDeliverable ? 'opacity-50 bg-stone-50' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-stone-400">{wilaya.code}</td>

                    <td className="py-3 px-4 font-semibold text-stone-900">
                      <div className="flex items-baseline gap-2">
                        <span>{wilaya.name}</span>
                        <span className="text-[11px] text-stone-400 font-normal">{wilaya.arName}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleDeliverable(wilaya)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                          wilaya.isDeliverable
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-stone-200 text-stone-600'
                        }`}
                      >
                        {wilaya.isDeliverable ? 'Active' : 'Désactivée'}
                      </button>
                    </td>

                    {/* Home Price Input */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Home className="w-3.5 h-3.5 text-stone-400" />
                        <input
                          type="number"
                          step={50}
                          min={0}
                          value={homeVal}
                          onChange={e =>
                            handlePriceChange(wilaya.id, 'home', Number(e.target.value))
                          }
                          className="w-24 px-2.5 py-1 bg-store-base border border-stone-200 rounded-lg text-xs font-mono font-bold text-stone-900 focus:outline-none focus:border-store-primary"
                        />
                        <span className="text-[10px] text-stone-400">DA</span>
                      </div>
                    </td>

                    {/* Desk Price Input */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-stone-400" />
                        <input
                          type="number"
                          step={50}
                          min={0}
                          value={deskVal}
                          onChange={e =>
                            handlePriceChange(wilaya.id, 'desk', Number(e.target.value))
                          }
                          className="w-24 px-2.5 py-1 bg-store-base border border-stone-200 rounded-lg text-xs font-mono font-bold text-stone-900 focus:outline-none focus:border-store-primary"
                        />
                        <span className="text-[10px] text-stone-400">DA</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      {isModified && (
                        <button
                          onClick={() => handleSaveWilaya(wilaya)}
                          className="px-3 py-1 bg-store-primary hover:bg-store-primary-hover text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1 ml-auto"
                        >
                          <Save className="w-3 h-3" />
                          <span>Sauvegarder</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

