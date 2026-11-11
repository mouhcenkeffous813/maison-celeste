# 03 — Structure Réelle des Fichiers et Dossiers

Ce document détaille l'organisation de l'ensemble du projet, la responsabilité de chaque sous-dossier et fichier, ainsi que leurs dépendances mutuelles.

---

## 1. Arborescence Complète du Projet

```text
e-commerce/
├── .env.example                      # Gabarit des variables d'environnement de production
├── .gitignore                        # Règles d'exclusion pour Git
├── index.html                        # Point d'entrée HTML5 avec balises meta et polices Google Fonts
├── netlify.toml                      # Configuration de déploiement et redirections Netlify
├── package.json                      # Dépendances npm et scripts de build/dev
├── package-lock.json                 # Verrouillage des versions exactes des paquets
├── postcss.config.js                 # Configuration du préprocesseur PostCSS
├── tailwind.config.js                # Configuration Tailwind CSS (thèmes dynamiques, ombres, polices)
├── tsconfig.json                     # Configuration du compilateur TypeScript
├── vercel.json                       # Configuration de déploiement et règles de cache Vercel
│
├── public/                           # Fichiers statiques copiés tels quels dans le bundle de production
│   ├── orlea-logo.svg                # Logo vectoriel officiel Maison Céleste avec sceau doré
│   └── images/
│       └── products/                 # 24 photographies locales HD des 12 produits du catalogue
│           ├── bague-or-pierre-rouge-1.jpg
│           ├── bague-or-pierre-rouge-2.jpg
│           ├── bague-solitaire-argentee-1.jpg
│           ├── bague-solitaire-argentee-2.jpg
│           ├── bracelet-chaine-doree-1.jpg
│           ├── bracelet-chaine-doree-2.jpg
│           ├── bracelet-perles-blanches-1.jpg
│           ├── bracelet-perles-blanches-2.jpg
│           ├── caftan-rouge-1.jpg
│           ├── caftan-rouge-2.jpg
│           ├── coffret-cadeau-bijoux-1.jpg
│           ├── coffret-cadeau-bijoux-2.jpg
│           ├── coffret-parfum-1.jpg
│           ├── coffret-parfum-2.jpg
│           ├── collier-coeur-dore-1.jpg
│           ├── collier-coeur-dore-2.jpg
│           ├── collier-pendentif-rond-1.jpg
│           ├── collier-pendentif-rond-2.jpg
│           ├── montre-elegante-femme-1.jpg
│           ├── montre-elegante-femme-2.jpg
│           ├── robe-soiree-noire-1.jpg
│           ├── robe-soiree-noire-2.jpg
│           ├── sac-cuir-noir-1.jpg
│           └── sac-cuir-noir-2.jpg
│
└── src/                              # Code source applicatif TypeScript / React
    ├── App.tsx                       # Orchestrateur des vues (Storefront vs Admin)
    ├── main.tsx                      # Point de montage React 18 DOM
    ├── index.css                     # Directives Tailwind et styles globaux
    │
    ├── components/
    │   ├── admin/                    # Composants de gestion administrateur (Back-Office)
    │   │   ├── AdminLayout.tsx       # Shell de navigation du dashboard, en-tête et onglets
    │   │   ├── AdminLogin.tsx        # Écran de verrouillage avec authentification par code PIN
    │   │   ├── AdminOverview.tsx     # Statistiques analytiques, KPIs de vente et graphiques
    │   │   ├── AdminOrders.tsx       # Gestion des commandes, filtres et changement de statut
    │   │   ├── AdminProducts.tsx     # Gestion du catalogue, formulaire d'ajout et variantes
    │   │   ├── AdminSettings.tsx     # Personnalisation de la boutique et sélection de thèmes
    │   │   ├── AdminShipping.tsx     # Grille des frais de livraison des 58 Wilayas
    │   │   ├── OrderDeliverySlip.tsx # Modale d'impression du bordereau de livraison client
    │   │   └── OrderDetailsModal.tsx # Modale d'inspection approfondie d'une commande
    │   │
    │   └── storefront/               # Composants de la boutique publique (Front-Office)
    │       ├── ContactPage.tsx       # Page de contact direct avec formulaire et liens WhatsApp
    │       ├── Footer.tsx            # Pied de page avec garanties, liens et accès secret admin
    │       ├── HomePage.tsx          # Page d'accueil, bannières, filtres par catégorie et grille 2 cols
    │       ├── Navbar.tsx            # Barre de navigation supérieure avec logo, burger et bouton Dashboard
    │       ├── NavigationDrawer.tsx  # Tiroir latéral mobile avec recherche en direct et liens
    │       ├── OrderTracking.tsx     # Page de suivi d'une commande par numéro de téléphone
    │       ├── ProductPage.tsx       # Fiche produit détaillée, carrousel et formulaire express COD
    │       └── ShippingRates.tsx     # Tableau interactif des tarifs de livraison des 58 wilayas
    │
    ├── config/                       # Fichiers de configuration métier
    │   ├── store.config.ts           # Configuration par défaut (nom, réseaux, thèmes CSS, PIN)
    │   └── wilayas.json              # Base de données officielle des 58 Wilayas et communes d'Algérie
    │
    ├── context/                      # Gestion d'état global
    │   └── StoreContext.tsx          # Provider React unifié (produits, commandes, wilayas, session)
    │
    ├── data/                         # Jeux de données d'initialisation (Seeds)
    │   ├── mockOrders.ts             # Commandes de démonstration représentatives du marché algérien
    │   ├── mockProducts.ts           # Catalogue des 12 produits de joaillerie et prêt-à-porter
    │   └── mockReviews.ts            # Témoignages clients vérifiés géolocalisés en Algérie
    │
    ├── services/                     # Couche d'accès aux données
    │   └── api.ts                    # Service d'abstraction asynchrone (CRUD produits, commandes, etc.)
    │
    ├── types/                        # Définitions TypeScript
    │   └── index.ts                  # Interfaces strictes (Product, Order, Wilaya, StoreConfig, etc.)
    │
    └── utils/                        # Fonctions utilitaires réutilisables
        ├── formatters.ts             # Formatage prix (DA), validation téléphones DZ, recherche sans accent
        └── imageCompressor.ts        # Compresseur d'images client basé sur HTML5 Canvas
```

---

## 2. Rôles et Responsabilités Détaillés

### `src/components/admin/`
- **`AdminLayout.tsx` :** Cadre principal de l'administration. Intègre la barre latérale rétractable, l'indicateur de mode, le bouton de déconnexion et le déclencheur de simulation rapide `+ Simuler 1 Commande`.
- **`AdminOverview.tsx` :** Affiche les métriques clés en temps réel (chiffre d'affaires total, commandes en attente, taux de livraison, panier moyen) avec filtres de date et répartition géographique par Wilaya.
- **`AdminProducts.tsx` :** Permet la création et modification complète d'articles (titre, prix promo, description, tailles, variantes de couleurs avec pastilles chromatiques, téléversement d'images compressées) et héberge la modale de gestion des catégories.
- **`OrderDeliverySlip.tsx` :** Génère un bordereau au format A5/A4 prêt pour l'impression thermique ou papier pour le livreur (Yalidine, ZR Express, Procolis, etc.).

### `src/components/storefront/`
- **`HomePage.tsx` :** Vitrine d'accueil affichant les produits sous forme de grille 2 colonnes sur mobile (identique aux standards Instagram shopping), avec pastilles de réduction rouge vif, calcul du pourcentage et bouton d'action `COMMANDER`.
- **`ProductPage.tsx` :** Cœur de la conversion e-commerce. Affiche la galerie photos HD, les variantes, les arguments de réassurance, et le formulaire direct COD 1-page avec calcul automatique des frais de port.
- **`NavigationDrawer.tsx` :** Menu coulissant comprenant une barre de recherche instantanée avec algorithme d'insensibilité aux accents (ex: taper `setif` trouve les articles ou commandes de `Sétif`).

### `src/services/api.ts`
- Fournit l'intégralité des opérations asynchrones. Il encapsule la sérialisation, la gestion des identifiants uniques, la déduction automatique des stocks et la notification des composants via l'événement personnalisé `elissia_store_update`.
