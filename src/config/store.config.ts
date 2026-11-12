import { StoreConfig, ThemePreset } from '../types';

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'rose-poudre',
    name: 'Rose Poudré (Signature)',
    primary: '#D48C98',
    primaryHover: '#C37985',
    primaryLight: '#FDF4F5',
    secondary: '#F9F1F0',
    bgBase: '#FFFDFB',
    accent: '#E05A6D',
  },
  {
    id: 'or-rose',
    name: 'Or Rose & Soie (Prestige)',
    primary: '#C48B71',
    primaryHover: '#B1765D',
    primaryLight: '#FAF3F0',
    secondary: '#F5EBE6',
    bgBase: '#FCFAF8',
    accent: '#D97757',
  },
  {
    id: 'lavande',
    name: 'Lavande Douce (Cosmétiques)',
    primary: '#9F86C0',
    primaryHover: '#8A6FA9',
    primaryLight: '#F7F4FB',
    secondary: '#EFEBF6',
    bgBase: '#FDFAFD',
    accent: '#BE7C9E',
  },
  {
    id: 'nude-sable',
    name: 'Nude & Cachemire (Minimaliste)',
    primary: '#B8977E',
    primaryHover: '#A48268',
    primaryLight: '#FAF6F2',
    secondary: '#F2EBE3',
    bgBase: '#FDFBF9',
    accent: '#C77D59',
  },
  {
    id: 'noir-dore',
    name: 'Noir & Or (Haute Joaillerie)',
    primary: '#2B2B2B',
    primaryHover: '#171717',
    primaryLight: '#F6F6F6',
    secondary: '#EBEBEB',
    bgBase: '#FAFAFA',
    accent: '#C5A059',
  },
];

export const DEFAULT_STORE_CONFIG: StoreConfig = {
  storeName: 'Maison Céleste',
  storeTagline: 'Haute Joaillerie & Couture d\'Exception • Algérie',
  logoUrl: '/orlea-logo.svg',
  currency: 'DA',
  phone: '0555 12 34 56',
  whatsappNumber: '+213555123456',
  instagramUrl: 'https://instagram.com/maisonceleste.dz',
  facebookUrl: 'https://facebook.com/maisonceleste.dz',
  tiktokUrl: 'https://tiktok.com/@maisonceleste.dz',
  freeShippingThreshold: 10000,
  theme: THEME_PRESETS[0],
  metaPixelId: '',
  tiktokPixelId: '',
  deliveryTimeEstimate: '24h à 48h ouvrées',
  announcementText: '✨ LIVRAISON EXPRESS 58 WILAYAS • PAIEMENT CASH À LA LIVRAISON • PACKAGING DE LUXE OFFERT 🇩🇿 ✨',
  adminPin: '1234',
};

/**
 * Apply theme CSS variables to document root
 */
export function applyThemeVariables(theme: ThemePreset | undefined | null) {
  if (typeof document === 'undefined' || !theme) return;
  const root = document.documentElement;
  if (theme.primary) root.style.setProperty('--color-primary', theme.primary);
  if (theme.primaryHover) root.style.setProperty('--color-primary-hover', theme.primaryHover);
  if (theme.primaryLight) root.style.setProperty('--color-primary-light', theme.primaryLight);
  if (theme.secondary) root.style.setProperty('--color-secondary', theme.secondary);
  if (theme.bgBase) root.style.setProperty('--color-bg-base', theme.bgBase);
  if (theme.accent) root.style.setProperty('--color-accent', theme.accent);
}

