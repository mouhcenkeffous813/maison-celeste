import React, { useState, useEffect } from 'react';
import {
  Target,
  CheckCircle2,
  AlertCircle,
  Save,
  Play,
  RotateCcw,
  ShieldCheck,
  Activity,
  Layers,
  Info,
  ExternalLink,
  Flame,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { trackingManager } from '../../services/trackingManager';
import { consentManager } from '../../services/consentManager';
import { MarketingConfig, TrackedEventLog } from '../../types/marketing';

export const AdminMarketing: React.FC = () => {
  const { showToast } = useStore();
  const [config, setConfig] = useState<MarketingConfig>(() => trackingManager.getConfig());
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<{ platform: string; message: string; success: boolean } | null>(null);
  const [isTesting, setIsTesting] = useState<'meta' | 'tiktok' | null>(null);
  const [logs, setLogs] = useState<TrackedEventLog[]>(() => trackingManager.getRecentLogs());
  const [consentStatus, setConsentStatus] = useState<boolean>(() => consentManager.isMarketingAllowed());

  useEffect(() => {
    // Reload config from manager on mount
    trackingManager.loadConfig().then(cfg => setConfig(cfg));

    const handleLogUpdate = () => {
      setLogs(trackingManager.getRecentLogs());
    };

    const handleConsentUpdate = () => {
      setConsentStatus(consentManager.isMarketingAllowed());
    };

    window.addEventListener('maison_celeste_tracking_log_update', handleLogUpdate);
    window.addEventListener('maison_celeste_consent_update', handleConsentUpdate);

    return () => {
      window.removeEventListener('maison_celeste_tracking_log_update', handleLogUpdate);
      window.removeEventListener('maison_celeste_consent_update', handleConsentUpdate);
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await trackingManager.saveConfig(config);
      showToast('Paramètres Marketing & Pixels enregistrés avec succès !', 'success');
    } catch (err) {
      showToast('Erreur lors de la sauvegarde', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async (platform: 'meta' | 'tiktok') => {
    setIsTesting(platform);
    setTestResult(null);

    // Save first to ensure the latest ID is applied
    await trackingManager.saveConfig(config);

    const result = await trackingManager.testPixel(platform);
    setIsTesting(null);
    setTestResult({
      platform,
      success: result.success,
      message: result.message,
    });

    if (result.success) {
      showToast(`Signal de test ${platform === 'meta' ? 'Meta' : 'TikTok'} émis avec succès !`, 'success');
    } else {
      showToast(result.message, 'error');
    }
  };

  const handleClearLogs = () => {
    trackingManager.clearLogs();
    setLogs([]);
    showToast('Journal des événements réinitialisé', 'info');
  };

  const handleForceConsentToggle = () => {
    if (consentStatus) {
      consentManager.denyAll();
    } else {
      consentManager.acceptAll();
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-store-border p-6 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                Marketing & Tracking Pixels
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                Ads 🇩🇿
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Connectez Meta Pixel (Facebook & Instagram) et TikTok Pixel pour mesurer vos conversions et optimiser vos campagnes publicitaires.
            </p>
          </div>
        </div>

        {/* Consent Badge in Admin */}
        <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-2xl px-3.5 py-2 text-xs">
          <ShieldCheck className={`w-4 h-4 ${consentStatus ? 'text-emerald-600' : 'text-amber-500'}`} />
          <div>
            <p className="font-bold text-stone-800 text-[11px]">
              Consentement : {consentStatus ? 'Accordé' : 'En attente / Refusé'}
            </p>
            <p className="text-[10px] text-stone-500">
              {consentStatus ? 'Pixels autorisés à émettre' : 'Pixels bloqués (RGPD)'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleForceConsentToggle}
            className="ml-2 text-[10px] underline font-medium text-stone-600 hover:text-stone-900"
          >
            {consentStatus ? 'Bloquer' : 'Autoriser'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* CARDS GRID: META PIXEL & TIKTOK PIXEL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* ================= 1. CARTE META PIXEL ================= */}
          <div className="bg-white rounded-3xl border border-store-border p-5 sm:p-6 shadow-card flex flex-col justify-between space-y-5">
            <div>
              {/* Card Header */}
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
                    {/* Meta SVG Logo */}
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02Z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-serif font-bold text-sm text-stone-900">
                      Meta Pixel
                    </h2>
                    <p className="text-[11px] text-stone-500">
                      Facebook Ads & Instagram Ads
                    </p>
                  </div>
                </div>

                {/* Status Switch */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.meta.enabled}
                    onChange={e =>
                      setConfig(prev => ({
                        ...prev,
                        meta: { ...prev.meta, enabled: e.target.checked },
                      }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Status Badge */}
              <div className="mt-3 flex items-center gap-1.5 text-xs">
                <span
                  className={`w-2 h-2 rounded-full ${
                    config.meta.enabled && config.meta.pixelId
                      ? 'bg-emerald-500 animate-pulse'
                      : 'bg-stone-300'
                  }`}
                />
                <span className="font-medium text-stone-600 text-[11px]">
                  {config.meta.enabled && config.meta.pixelId
                    ? 'Prêt & Actif pour Facebook + Instagram'
                    : config.meta.enabled
                    ? 'Incomplet : Saisissez un Pixel ID'
                    : 'Désactivé'}
                </span>
              </div>

              {/* Inputs */}
              <div className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Meta Pixel ID (Facebook / Instagram)
                  </label>
                  <input
                    type="text"
                    placeholder="ex: 123456789012345"
                    value={config.meta.pixelId}
                    onChange={e =>
                      setConfig(prev => ({
                        ...prev,
                        meta: { ...prev.meta, pixelId: e.target.value.trim() },
                      }))
                    }
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-store-base rounded-xl border border-store-border focus:outline-none focus:border-store-primary font-mono"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">
                    Trouvez votre Pixel ID dans votre Meta Events Manager (Gestionnaire d'événements).
                  </p>
                </div>

                {/* Sub-options */}
                <div className="pt-2 space-y-2 text-xs">
                  <label className="flex items-center gap-2 text-stone-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.meta.trackEvents}
                      onChange={e =>
                        setConfig(prev => ({
                          ...prev,
                          meta: { ...prev.meta, trackEvents: e.target.checked },
                        }))
                      }
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 accent-blue-600"
                    />
                    <span>Suivre les événements e-commerce standards (ViewContent, Purchase...)</span>
                  </label>

                  <label className="flex items-center gap-2 text-stone-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.meta.testMode}
                      onChange={e =>
                        setConfig(prev => ({
                          ...prev,
                          meta: { ...prev.meta, testMode: e.target.checked },
                        }))
                      }
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 accent-blue-600"
                    />
                    <span>Mode Diagnostic & Test dans la console du navigateur</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Test Button */}
            <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleTestConnection('meta')}
                disabled={isTesting === 'meta' || !config.meta.pixelId}
                className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isTesting === 'meta' ? 'Test en cours...' : 'Tester le Pixel'}</span>
              </button>
              <a
                href="https://business.facebook.com/events_manager2"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-stone-500 hover:text-stone-900 flex items-center gap-1"
              >
                <span>Events Manager</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* ================= 2. CARTE TIKTOK PIXEL ================= */}
          <div className="bg-white rounded-3xl border border-store-border p-5 sm:p-6 shadow-card flex flex-col justify-between space-y-5">
            <div>
              {/* Card Header */}
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center font-bold text-lg">
                    {/* TikTok SVG Logo */}
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-serif font-bold text-sm text-stone-900">
                      TikTok Pixel
                    </h2>
                    <p className="text-[11px] text-stone-500">
                      TikTok Ads Manager
                    </p>
                  </div>
                </div>

                {/* Status Switch */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.tiktok.enabled}
                    onChange={e =>
                      setConfig(prev => ({
                        ...prev,
                        tiktok: { ...prev.tiktok, enabled: e.target.checked },
                      }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-black"></div>
                </label>
              </div>

              {/* Status Badge */}
              <div className="mt-3 flex items-center gap-1.5 text-xs">
                <span
                  className={`w-2 h-2 rounded-full ${
                    config.tiktok.enabled && config.tiktok.pixelId
                      ? 'bg-emerald-500 animate-pulse'
                      : 'bg-stone-300'
                  }`}
                />
                <span className="font-medium text-stone-600 text-[11px]">
                  {config.tiktok.enabled && config.tiktok.pixelId
                    ? 'Prêt & Actif pour TikTok Ads'
                    : config.tiktok.enabled
                    ? 'Incomplet : Saisissez un Pixel ID'
                    : 'Désactivé'}
                </span>
              </div>

              {/* Inputs */}
              <div className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                    TikTok Pixel ID
                  </label>
                  <input
                    type="text"
                    placeholder="ex: C817293849102"
                    value={config.tiktok.pixelId}
                    onChange={e =>
                      setConfig(prev => ({
                        ...prev,
                        tiktok: { ...prev.tiktok, pixelId: e.target.value.trim() },
                      }))
                    }
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-store-base rounded-xl border border-store-border focus:outline-none focus:border-store-primary font-mono"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">
                    Générez ou copiez votre code Pixel depuis TikTok Ads Manager &gt; Assets &gt; Events.
                  </p>
                </div>

                {/* Sub-options */}
                <div className="pt-2 space-y-2 text-xs">
                  <label className="flex items-center gap-2 text-stone-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.tiktok.trackEvents}
                      onChange={e =>
                        setConfig(prev => ({
                          ...prev,
                          tiktok: { ...prev.tiktok, trackEvents: e.target.checked },
                        }))
                      }
                      className="w-4 h-4 text-black rounded focus:ring-stone-900 accent-black"
                    />
                    <span>Suivre les événements e-commerce standards (CompletePayment, AddToCart...)</span>
                  </label>

                  <label className="flex items-center gap-2 text-stone-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.tiktok.testMode}
                      onChange={e =>
                        setConfig(prev => ({
                          ...prev,
                          tiktok: { ...prev.tiktok, testMode: e.target.checked },
                        }))
                      }
                      className="w-4 h-4 text-black rounded focus:ring-stone-900 accent-black"
                    />
                    <span>Mode Diagnostic & Test dans la console du navigateur</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Test Button */}
            <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleTestConnection('tiktok')}
                disabled={isTesting === 'tiktok' || !config.tiktok.pixelId}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isTesting === 'tiktok' ? 'Test en cours...' : 'Tester le Pixel'}</span>
              </button>
              <a
                href="https://ads.tiktok.com"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-stone-500 hover:text-stone-900 flex items-center gap-1"
              >
                <span>TikTok Ads</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

        </div>

        {/* Diagnostic Output Toast / Banner */}
        {testResult && (
          <div
            className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
              testResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="font-bold">
                Résultat du test {testResult.platform === 'meta' ? 'Meta Pixel' : 'TikTok Pixel'} :
              </p>
              <p className="mt-0.5">{testResult.message}</p>
            </div>
          </div>
        )}

        {/* SAVE BUTTON */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto px-8 py-3.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-soft flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Enregistrement...' : 'Enregistrer la Configuration'}</span>
          </button>
        </div>

      </form>

      {/* ================= 3. ÉVÉNEMENTS STANDARD DU PROJET ================= */}
      <div className="bg-white rounded-3xl border border-store-border p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Activity className="w-4 h-4 text-stone-600" />
            <h2 className="font-serif font-bold text-sm text-stone-900">
              Événements E-commerce Configurés
            </h2>
          </div>
          <span className="text-[10px] text-stone-400 font-mono">6 Événements standards</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-600 text-[10px] font-bold uppercase tracking-wider border-b border-stone-100">
              <tr>
                <th className="py-2.5 px-3">Action Client sur Maison Céleste</th>
                <th className="py-2.5 px-3">Événement Meta (Facebook/Insta)</th>
                <th className="py-2.5 px-3">Événement TikTok</th>
                <th className="py-2.5 px-3">Moment du Déclenchement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700 text-[11px]">
              <tr>
                <td className="py-2.5 px-3 font-semibold text-stone-900">Visite d'une page</td>
                <td className="py-2.5 px-3 font-mono text-blue-600">PageView</td>
                <td className="py-2.5 px-3 font-mono text-stone-900">PageView</td>
                <td className="py-2.5 px-3 text-stone-500">Navigation SPA (sans doublon)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-stone-900">Consultation d'un produit</td>
                <td className="py-2.5 px-3 font-mono text-blue-600">ViewContent</td>
                <td className="py-2.5 px-3 font-mono text-stone-900">ViewContent</td>
                <td className="py-2.5 px-3 text-stone-500">Ouverture de la fiche produit</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-stone-900">Sélection taille / couleur</td>
                <td className="py-2.5 px-3 font-mono text-blue-600">AddToCart</td>
                <td className="py-2.5 px-3 font-mono text-stone-900">AddToCart</td>
                <td className="py-2.5 px-3 text-stone-500">Clic sur variante ou ajout</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-stone-900">Formulaire commande ouvert</td>
                <td className="py-2.5 px-3 font-mono text-blue-600">InitiateCheckout</td>
                <td className="py-2.5 px-3 font-mono text-stone-900">InitiateCheckout</td>
                <td className="py-2.5 px-3 text-stone-500">Défilement vers le formulaire COD</td>
              </tr>
              <tr className="bg-emerald-50/40">
                <td className="py-2.5 px-3 font-bold text-emerald-900">Achat confirmé (COD)</td>
                <td className="py-2.5 px-3 font-mono font-bold text-blue-700">Purchase</td>
                <td className="py-2.5 px-3 font-mono font-bold text-black">CompletePayment</td>
                <td className="py-2.5 px-3 text-emerald-800 font-medium">Uniquement après succès Supabase</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-stone-900">Recherche produit</td>
                <td className="py-2.5 px-3 font-mono text-blue-600">Search</td>
                <td className="py-2.5 px-3 font-mono text-stone-900">Search</td>
                <td className="py-2.5 px-3 text-stone-500">Recherche par mot-clé</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= 4. JOURNAL EN DIRECT DES ÉVÉNEMENTS ÉMIS ================= */}
      <div className="bg-white rounded-3xl border border-store-border p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500" />
            <h2 className="font-serif font-bold text-sm text-stone-900">
              Journal des Événements Suivis en Direct
            </h2>
          </div>
          <button
            onClick={handleClearLogs}
            className="text-[11px] text-stone-400 hover:text-stone-700 flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Effacer le journal</span>
          </button>
        </div>

        {logs.length === 0 ? (
          <div className="p-8 text-center text-stone-400 text-xs bg-stone-50 rounded-2xl border border-stone-100">
            Aucun événement enregistré récemment. Naviguez sur la boutique pour voir les événements s'afficher ici en direct.
          </div>
        ) : (
          <div className="divide-y divide-stone-100 max-h-72 overflow-y-auto">
            {logs.map(log => (
              <div key={log.id} className="py-2.5 flex items-center justify-between text-xs gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      log.status === 'sent'
                        ? 'bg-emerald-100 text-emerald-800'
                        : log.status === 'blocked_consent'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {log.eventName}
                  </span>
                  <span className="font-mono text-stone-400 text-[10px]">{log.timestamp}</span>
                  <span className="truncate text-stone-700 text-[11px]">{log.details}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded font-mono">
                    {log.platform}
                  </span>
                  <span
                    className={`text-[10px] font-semibold ${
                      log.status === 'sent'
                        ? 'text-emerald-600'
                        : log.status === 'blocked_consent'
                        ? 'text-amber-600'
                        : 'text-stone-400'
                    }`}
                  >
                    {log.status === 'sent'
                      ? '✓ Envoyé'
                      : log.status === 'blocked_consent'
                      ? 'Bloqué (consentement)'
                      : 'Désactivé'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
