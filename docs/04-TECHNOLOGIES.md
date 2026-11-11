# 04 — Technologies et Dépendances

Ce document recense les technologies, bibliothèques, dépendances directes et outils de développement utilisés dans le projet, ainsi que les justifications architecturales de leur choix.

---

## 1. Stack Technique Principale

| Technologie | Version | Rôle dans le Projet |
| :--- | :---: | :--- |
| **React** | `^18.3.1` | Bibliothèque UI déclarative basée sur les composants et les Hooks (`useState`, `useEffect`, `useMemo`, `useCallback`). |
| **TypeScript** | `^5.7.3` | Typage statique strict garantissant la robustesse des modèles de données et la détection d'erreurs à la compilation. |
| **Vite** | `^5.4.14` | Environnement de développement et bundler de production ultra-rapide basé sur Rollup et ESBuild. |
| **Tailwind CSS** | `^3.4.17` | Framework utilitaire CSS permettant un design sur mesure sans surcoût de fichiers CSS volumineux. |
| **PostCSS** | `^8.5.2` | Moteur de transformation CSS avec autopréfixage pour compatibilité tous navigateurs. |

---

## 2. Dépendances de Production (`dependencies`)

D'après le fichier [`package.json`](file:///c:/Users/Mohcen/Desktop/e-commerce/package.json) :

### 1. `lucide-react` (`^0.475.0`)
- **Usage :** Ensemble complet d'icônes SVG légères et cohérentes pour l'ensemble du Storefront et de l'administration (ex. `ShoppingBag`, `Sparkles`, `Truck`, `ShieldCheck`, `Phone`, `LayoutDashboard`).
- **Avantage :** Arbre secouable (*tree-shakable*), seules les icônes effectivement importées sont incluses dans le bundle final.

### 2. `canvas-confetti` (`^1.9.4`)
- **Usage :** Animation visuelle de confettis déclenchée lors de la soumission réussie d'une commande COD sur la fiche produit.
- **Avantage :** Renforce la gratification psychologique de l'acheteur algérien et confirme visuellement la prise en compte de sa commande.

### 3. `clsx` (`^2.1.1`) & `tailwind-merge` (`^3.0.2`)
- **Usage :** Concaténation conditionnelle sécurisée des classes CSS Tailwind sans conflit de spécificité.

---

## 3. Dépendances de Développement (`devDependencies`)

| Dépendance | Version | Rôle |
| :--- | :---: | :--- |
| `@vitejs/plugin-react` | `^4.3.4` | Intégration officielle du plugin React dans Vite avec Fast Refresh (HMR instantané). |
| `@types/react` | `^18.3.18` | Définitions de types TypeScript pour React. |
| `@types/react-dom` | `^18.3.5` | Définitions de types TypeScript pour le DOM React. |
| `@types/canvas-confetti` | `^1.9.0` | Définitions de types TypeScript pour la bibliothèque de confettis. |
| `@types/node` | `^22.13.4` | Types Node.js pour la résolution de chemins dans `vite.config.ts`. |
| `autoprefixer` | `^10.4.20` | Ajout automatique des préfixes vendeurs CSS (`-webkit-`, etc.). |

---

## 4. Polices Typographiques et CDN Externes

Configurées dans [`index.html`](file:///c:/Users/Mohcen/Desktop/e-commerce/index.html) via Google Fonts :

1. **`Playfair Display` (Serif)** :
   - Typographie de luxe utilisée pour les titres de prestige, le nom de la marque et les montants promotionnels.
2. **`Plus Jakarta Sans` (Sans-Serif)** :
   - Typographie moderne et ultra-lisible sur mobile, utilisée pour les corps de texte, labels, boutons et tableaux.

---

## 5. Justification du Choix d'une Architecture Zero-Server / SPA

1. **Coût d'hébergement nul :**
   - Une application React compilée en fichiers statiques (`HTML`, `JS`, `CSS`, `JPG/SVG`) peut être servie gratuitement par des réseaux de distribution mondiaux (CDN) comme Vercel, Netlify ou Cloudflare Pages, sans serveur Node.js actif ni frais mensuels de VPS.
2. **Temps de réponse instantané en Algérie :**
   - Aucune latence serveur lors des clics ou du changement d'onglets. Le calcul des frais des 58 wilayas et la filtration des catégories s'exécutent directement dans le navigateur du client en moins de 5 millisecondes.
3. **Résilience et tolérance aux coupures :**
   - L'application continue de fonctionner et de calculer les totaux même si la connexion mobile 3G/4G de l'acheteur subit des micro-coupures.

