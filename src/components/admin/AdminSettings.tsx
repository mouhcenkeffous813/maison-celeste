import React, { useState } from 'react';
import {
  Palette,
  Store,
  Phone,
  MessageCircle,
  Share2,
  Code2,
  Lock,
  Sparkles,
  Save,
  RotateCcw,
  Check
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { THEME_PRESETS } from '../../config/store.config';
import { ThemePreset } from '../../types';

export const AdminSettings: React.FC = () => {
  const { config, updateConfig, setThemePreset, resetDemoData, showToast } = useStore();

  const [storeName, setStoreName] = useState(config.storeName);
  const [storeTagline, setStoreTagline] = useState(config.storeTagline);
  const [phone, setPhone] = useState(config.phone);
  const [whatsappNumber, setWhatsappNumber] = useState(config.whatsappNumber);
  const [instagramUrl, setInstagramUrl] = useState(config.instagramUrl);
  const [facebookUrl, setFacebookUrl] = useState(config.facebookUrl);
  const [tiktokUrl, setTiktokUrl] = useState(config.tiktokUrl);
  const [metaPixelId, setMetaPixelId] = useState(config.metaPixelId);
  const [tiktokPixelId, setTiktokPixelId] = useState(config.tiktokPixelId);
  const [deliveryTimeEstimate, setDeliveryTimeEstimate] = useState(config.deliveryTimeEstimate);
  const [announcementText, setAnnouncementText] = useState(config.announcementText);
  const [adminPin, setAdminPin] = useState(config.adminPin);

  // Custom Theme state
  const [customPrimary, setCustomPrimary] = useState(config.theme.primary);
  const [customSecondary, setCustomSecondary] = useState(config.theme.secondary);

  const handleSelectPreset = async (preset: ThemePreset) => {
    await setThemePreset(preset);
    setCustomPrimary(preset.primary);
    setCustomSecondary(preset.secondary);
  };

  const handleApplyCustomColor = async () => {
    const customTheme: ThemePreset = {
      id: 'custom',
      name: 'Personnalisé',
      primary: customPrimary,
      primaryHover: customPrimary,
      primaryLight: customSecondary,
      secondary: customSecondary,
      bgBase: '#FFFDFB',
      accent: '#E05A6D',
    };
    await setThemePreset(customTheme);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateConfig({
      storeName: storeName.trim(),
      storeTagline: storeTagline.trim(),
      phone: phone.trim(),
      whatsappNumber: whatsappNumber.trim(),
      instagramUrl: instagramUrl.trim(),
      facebookUrl: facebookUrl.trim(),
      tiktokUrl: tiktokUrl.trim(),
      metaPixelId: metaPixelId.trim(),
      tiktokPixelId: tiktokPixelId.trim(),
      deliveryTimeEstimate: deliveryTimeEstimate.trim(),
      announcementText: announcementText.trim(),
      adminPin: adminPin.trim() || '1234',
    });
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
          Paramètres White-Label (Personnalisation Marque Blanche)
        </h2>
        <p className="text-xs text-stone-500">
          Adaptez l'identité visuelle, la palette de couleurs, les coordonnées WhatsApp et les pixels de tracking pour n'importe quelle boutique cliente en quelques clics.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* ================= 1. THEME & COLORS ================= */}
        <div className="bg-white rounded-3xl border border-store-border p-5 sm:p-6 shadow-card space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-stone-100">
            <Palette className="w-5 h-5 text-store-primary" />
            <div>
              <h3 className="font-serif text-base font-bold text-stone-900">
                Design System & Palette de Couleurs Dynamiques
              </h3>
              <p className="text-xs text-stone-500">
                Chaque changement de couleur se répercute instantanément sur l'ensemble de la boutique.
              </p>
            </div>
          </div>

          {/* Luxury Presets */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2.5">
              Styles Prédéfinis (Presets Féminins & Luxe)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {THEME_PRESETS.map(preset => {
                const isSelected = config.theme.id === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-store-primary bg-store-secondary/60 ring-2 ring-store-primary/30'
                        : 'border-store-border hover:border-stone-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex -space-x-1">
                        <span
                          className="w-5 h-5 rounded-full border border-white shadow-xs"
                          style={{ backgroundColor: preset.primary }}
                        />
                        <span
                          className="w-5 h-5 rounded-full border border-white shadow-xs"
                          style={{ backgroundColor: preset.secondary }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-stone-800">
                        {preset.name}
                      </span>
                    </div>

                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-store-primary text-white flex items-center justify-center text-[10px]">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Color Picker */}
          <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-stone-700">Couleur Primaire Personnalisée :</label>
              <input
                type="color"
                value={customPrimary}
                onChange={e => setCustomPrimary(e.target.value)}
                className="w-8 h-8 rounded-lg border border-stone-300 cursor-pointer p-0"
              />
              <span className="font-mono text-xs uppercase font-bold text-stone-700">
                {customPrimary}
              </span>
            </div>

            <button
              type="button"
              onClick={handleApplyCustomColor}
              className="px-3 py-1.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors"
            >
              Appliquer ce code HEX
            </button>
          </div>
        </div>

        {/* ================= 2. STORE BRANDING ================= */}
        <div className="bg-white rounded-3xl border border-store-border p-5 sm:p-6 shadow-card space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-stone-100">
            <Store className="w-5 h-5 text-store-primary" />
            <div>
              <h3 className="font-serif text-base font-bold text-stone-900">
                Identité de la Boutique
              </h3>
              <p className="text-xs text-stone-500">
                Nom commercial, slogan et messages d'annonce.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Nom de la Boutique
              </label>
              <input
                type="text"
                required
                value={storeName}
                onChange={e => setStoreName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-store-base rounded-xl border border-store-border focus:outline-none focus:border-store-primary font-serif font-bold text-base"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Slogan / Sous-titre
              </label>
              <input
                type="text"
                value={storeTagline}
                onChange={e => setStoreTagline(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-store-base rounded-xl border border-store-border focus:outline-none focus:border-store-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Bannière d'Annonce Supérieure
            </label>
            <input
              type="text"
              value={announcementText}
              onChange={e => setAnnouncementText(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-store-base rounded-xl border border-store-border focus:outline-none focus:border-store-primary font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Estimation du délai de livraison
            </label>
            <input
              type="text"
              value={deliveryTimeEstimate}
              onChange={e => setDeliveryTimeEstimate(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-store-base rounded-xl border border-store-border focus:outline-none focus:border-store-primary"
            />
          </div>
        </div>

        {/* ================= 3. CONTACT & SOCIALS ================= */}
        <div className="bg-white rounded-3xl border border-store-border p-5 sm:p-6 shadow-card space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-stone-100">
            <MessageCircle className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="font-serif text-base font-bold text-stone-900">
                Numéro WhatsApp & Réseaux Sociaux
              </h3>
              <p className="text-xs text-stone-500">
                Utilisé pour la confirmation automatique de commande en 1 clic.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Numéro WhatsApp Boutique (Format international ex: +213555123456)
              </label>
              <input
                type="text"
                required
                value={whatsappNumber}
                onChange={e => setWhatsappNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-store-base rounded-xl border border-store-border focus:outline-none focus:border-store-primary font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Téléphone Service Client Public
              </label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-store-base rounded-xl border border-store-border focus:outline-none focus:border-store-primary font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Lien Instagram
              </label>
              <input
                type="url"
                value={instagramUrl}
                onChange={e => setInstagramUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-store-base rounded-xl border border-store-border focus:outline-none focus:border-store-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Lien Facebook
              </label>
              <input
                type="url"
                value={facebookUrl}
                onChange={e => setFacebookUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-store-base rounded-xl border border-store-border focus:outline-none focus:border-store-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Lien TikTok
              </label>
              <input
                type="url"
                value={tiktokUrl}
                onChange={e => setTiktokUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-store-base rounded-xl border border-store-border focus:outline-none focus:border-store-primary"
              />
            </div>
          </div>
        </div>

        {/* ================= 4. TRACKING PIXELS & SECURITY ================= */}
        <div className="bg-white rounded-3xl border border-store-border p-5 sm:p-6 shadow-card space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-stone-100">
            <Code2 className="w-5 h-5 text-store-primary" />
            <div>
              <h3 className="font-serif text-base font-bold text-stone-900">
                Pixels de Tracking (Meta Facebook & TikTok)
              </h3>
              <p className="text-xs text-stone-500">
                Injectés automatiquement sur les pages et lors de la confirmation d'achat.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Meta Pixel ID (Facebook / Instagram Ads)
              </label>
              <input
                type="text"
                placeholder="ex: 123456789012345"
                value={metaPixelId}
                onChange={e => setMetaPixelId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-store-base rounded-xl border border-store-border focus:outline-none focus:border-store-primary font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                TikTok Pixel ID
              </label>
              <input
                type="text"
                placeholder="ex: C817293849102"
                value={tiktokPixelId}
                onChange={e => setTiktokPixelId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-store-base rounded-xl border border-store-border focus:outline-none focus:border-store-primary font-mono"
              />
            </div>
          </div>

          {/* Admin PIN */}
          <div className="pt-3 border-t border-stone-100">
            <div className="max-w-xs">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Code PIN Administrateur
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  maxLength={6}
                  value={adminPin}
                  onChange={e => setAdminPin(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-store-base rounded-xl border border-store-border focus:outline-none focus:border-store-primary font-mono font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save & Reset Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3.5 bg-store-primary hover:bg-store-primary-hover text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-soft flex items-center justify-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Enregistrer Tous les Paramètres</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (confirm('Voulez-vous réinitialiser toutes les données de démo par défaut ?')) {
                resetDemoData();
              }
            }}
            className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1.5 p-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Réinitialiser les données de démo</span>
          </button>
        </div>
      </form>
    </div>
  );
};

