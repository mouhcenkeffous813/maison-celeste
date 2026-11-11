# Maison Céleste — Solution E-commerce Haute Joaillerie & COD Algérie 🇩🇿

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-3178c6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.14-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4.17-38bdf8.svg)](https://tailwindcss.com/)
[![Deployment](https://img.shields.io/badge/Deploy-Vercel%20%7C%20Netlify-success.svg)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-Proprietary-gold.svg)]()

> **Maison Céleste** (nom de projet : *Orlea Jewels*) est une plateforme e-commerce moderne, responsive et ultra-légère conçue spécifiquement pour le marché algérien. Elle optimise la conversion sur smartphone avec un **formulaire de commande express 1-Page (Cash on Delivery - COD)**, le calcul automatique des tarifs de livraison pour l'ensemble des **58 Wilayas d'Algérie**, et un **Tableau de Bord Administrateur complet** sans abonnement payant.

---

## 💎 Table des Matières

1. [Points Forts & Objectifs Métier](#-points-forts--objectifs-métier)
2. [Aperçu des Fonctionnalités](#-aperçu-des-fonctionnalités)
3. [Stack Technique](#-stack-technique)
4. [Démarrage Rapide en Local](#-démarrage-rapide-en-local)
5. [Déploiement Gratuit en Production](#-déploiement-gratuit-en-production)
6. [Structure de la Documentation Technique](#-structure-de-la-documentation-technique)
7. [Sécurité & Confidentialité](#-sécurité--confidentialité)

---

## ✨ Points Forts & Objectifs Métier

- **Taux de conversion maximal (Mobile First) :** Conçu pour les clientes naviguant depuis Instagram, Facebook ou TikTok, avec grille 2 colonnes, badges de réduction rouges et commande en 1 clic.
- **Zéro friction d'achat :** Pas de création de compte obligatoire ni de formulaire à étapes multiples. Nom, téléphone, Wilaya et commune suffisent.
- **100% Adapté à l'Algérie :** Devises en **DA (Dinars Algériens)**, validation stricte des numéros mobiles algériens (`05`, `06`, `07`), confirmation rapide via **WhatsApp**, et grille complète des **58 Wilayas** (à domicile ou au bureau de retrait *Stop Desk*).
- **Hébergement 100% Gratuit :** Conçu en architecture JAMstack/SPA sans serveur obligatoire. Déployable gratuitement sur Vercel, Netlify ou Cloudflare Pages avec nom de domaine gratuit en HTTPS.
- **Autonomie complète du gérant :** Gestion des commandes, modification des prix, déduction automatique des stocks, gestion dynamique des catégories et génération de bordereaux de livraison pour transporteurs (Yalidine, ZR Express, etc.).

---

## 🛍️ Aperçu des Fonctionnalités

### Expérience Client (Storefront)
- **Vitrine Haute Joaillerie & Couture :** 12 produits emblématiques avec photographies haute résolution 100% correspondantes (*Colliers, Bracelets, Bagues, Coffrets Cadeaux, Montres, Caftans & Robes*).
- **Filtres par Catégories :** Défilement fluide sans rechargement de page.
- **Recherche Tolérante aux Accents :** Taper `setif` ou `argent` trouve immédiatement les articles de `Sétif` ou `argenté`.
- **Galerie & Variantes :** Choix des couleurs avec pastilles chromatiques et des tailles/pointures avec contrôle de stock en direct.
- **Formulaire Express COD :** Frais de livraison calculés instantanément selon la Wilaya sélectionnée.
- **Animation Confetti & WhatsApp :** Célébration visuelle de la commande et lien WhatsApp de confirmation rapide pré-rédigé.
- **Suivi de Colis par Téléphone :** Consultation de l'état d'avancement sans mot de passe.

### Back-Office Gérant (Dashboard Administrateur)
- **Accès Sécurisé par PIN :** Authentification par code PIN 4 chiffres (défaut : `1234`) avec session temporaire `sessionStorage`.
- **Statistiques & KPIs :** Chiffre d'affaires, volume de commandes, panier moyen, graphique de répartition par Wilaya.
- **Gestionnaire de Commandes :** Filtrage multi-critères, mise à jour des statuts (*En attente*, *Confirmée*, *En préparation*, *Expédiée*, *Livrée*, *Annulée*) et export comptable en CSV.
- **Bordereau de Livraison Imprimable :** Fiche d'expédition standardisée A4/A5 pour le livreur.
- **Gestion Dynamique des Catégories :** Ajout et suppression de catégories avec réattribution sécurisée des produits.
- **Bouton de Simulation :** Bouton `+ Simuler 1 Commande` pour démonstrations clients et tests immédiats du CRM.

---

## 🛠️ Stack Technique

- **Langage :** TypeScript 5.7 (Mode strict)
- **UI Framework :** React 18.3.1 (Composants fonctionnels, Hooks)
- **Build Tool :** Vite 5.4.14 (Rollup + ESBuild)
- **Design System :** Tailwind CSS 3.4.17 avec variables dynamiques `:root`
- **Icônes :** Lucide React 0.475.0
- **Animations :** Canvas-Confetti 1.9.4
- **Persistance :** Service Repository asynchrone (`src/services/api.ts`) basé sur LocalStorage, prêt pour bascule Supabase/REST.

---

## 🚀 Démarrage Rapide en Local

### 1. Prérequis
- [Node.js](https://nodejs.org/) v18 ou v20+ installé
- npm v9+

### 2. Installation
```bash
# Cloner ou naviguer dans le dossier du projet
cd c:\Users\Mohcen\Desktop\e-commerce

# Installer les dépendances
npm install
```

### 3. Lancer le serveur de développement
```bash
npm run dev
```
Ouvrez votre navigateur sur **`http://localhost:3000`**.

### 4. Compiler pour la production
```bash
npm run build
```
Le bundle de production optimisé est généré dans le dossier `dist/` en ~4 secondes.

---

## 🌐 Déploiement Gratuit en Production

Le projet est configuré pour un déploiement instantané en **1 clic** sur **Vercel** ou **Netlify** :

1. **Vercel (Recommandé) :** 
   - Créez un compte gratuit sur [Vercel](https://vercel.com).
   - Importez votre dépôt GitHub.
   - Le fichier [`vercel.json`](./vercel.json) gère automatiquement le routage SPA et la mise en cache CDN.
   - Vous obtenez immédiatement une URL publique sécurisée : `https://maison-celeste.vercel.app`.
2. **Netlify (Alternative) :** 
   - Créez un compte gratuit sur [Netlify](https://www.netlify.com).
   - Le fichier [`netlify.toml`](./netlify.toml) est préconfiguré pour la publication du dossier `dist/`.

Pour le guide complet pas à pas, consultez [docs/12-DEPLOIEMENT.md](./docs/12-DEPLOIEMENT.md).

---

## 📚 Structure de la Documentation Technique

L'ensemble de l'architecture et des composants est documenté de manière exhaustive dans le dossier `docs/` :

| Fichier | Contenu et Sujets Traités |
| :--- | :--- |
| [**01 — Présentation**](./docs/01-PRESENTATION.md) | Vision, objectifs e-commerce algérien et positionnement technique |
| [**02 — Architecture**](./docs/02-ARCHITECTURE.md) | Diagrammes Mermaid (Architecture globale, Flux de commande COD, Admin) |
| [**03 — Structure des Fichiers**](./docs/03-STRUCTURE-DES-FICHIERS.md) | Arborescence détaillée, rôle et responsabilités de chaque module |
| [**04 — Technologies**](./docs/04-TECHNOLOGIES.md) | Dépendances, versions de paquets, polices et justifications architecturales |
| [**05 — Fonctionnalités**](./docs/05-FONCTIONNALITES.md) | Guide exhaustif des fonctionnalités Storefront et Back-Office |
| [**06 — Frontend**](./docs/06-FRONTEND.md) | Arbre des composants React, StoreContext, design system et performances |
| [**07 — Backend & Roadmap**](./docs/07-BACKEND.md) | Logique Zero-Backend, Pattern Repository et guide d'intégration Supabase |
| [**08 — Base de Données**](./docs/08-BASE-DE-DONNEES.md) | Schémas ERD, interfaces TypeScript (`Product`, `Order`, `Wilaya`) |
| [**09 — Référence API**](./docs/09-API.md) | Documentation des méthodes asynchrones exposées par `api.ts` |
| [**10 — Sécurité**](./docs/10-SECURITE.md) | Protection par code PIN, validation des formulaires et mesures anti-fraude COD |
| [**11 — Installation Locale**](./docs/11-INSTALLATION-LOCALE.md) | Guide d'installation, commandes testées et dépannage courant |
| [**12 — Guide de Déploiement**](./docs/12-DEPLOIEMENT.md) | Comparatif des hébergeurs gratuits, guide Vercel/Netlify et nom de domaine |
| [**13 — Guide de Maintenance**](./docs/13-MAINTENANCE.md) | Mises à jour du catalogue, export CSV, sauvegardes et stratégie de cache |

---

## 🔒 Sécurité & Confidentialité

- **Aucun secret exposé :** Le code ne contient aucune clé privée ni mot de passe sensible.
- **Protection Git :** Le fichier [`.gitignore`](./.gitignore) exclut formellement les fichiers d'environnement locaux (`.env`, `.env.local`).
- **Modèle d'Environnement :** Consultez [`.env.example`](./.env.example) pour la liste des variables configurables en production.

---

*Développé avec excellence pour Maison Céleste • Tous droits réservés © 2026.*

