# 01 — Présentation Générale du Projet

## 1. Vue d'ensemble

**Maison Céleste** (anciennement désigné sous le nom de code *Orlea Jewels*) est une solution e-commerce complète, ultra-rapide et responsive, développée pour répondre aux besoins spécifiques de la vente en ligne en Algérie avec paiement à la livraison (**Cash on Delivery - COD**).

L'application allie l'esthétique raffinée d'une maison de haute joaillerie et couture (palette rose poudré, or 18k, soie et typographie classique) à un moteur technique performant conçu pour maximiser le taux de conversion sur smartphone.

---

## 2. Objectifs Métier et Vision

1. **Expérience d'achat fluide (1-Page Checkout COD) :**
   - Suppression des frictions liées aux paniers d'achat traditionnels multi-étapes.
   - Formulaire de commande directe intégré sur chaque fiche produit.
   - Calcul automatique et instantané des frais de livraison pour l'ensemble des **58 Wilayas d'Algérie** (à domicile ou au bureau de retrait *Stop Desk*).

2. **Adaptation au marché algérien :**
   - Format de devises en Dinar Algérien (**DA**).
   - Validation stricte des numéros de téléphone mobiles algériens (formats `05`, `06`, `07`).
   - Intégration de bouton direct **WhatsApp** pour confirmation rapide et réassurance client.
   - Suivi de commande en temps réel via numéro de téléphone sans obligation de créer un compte avec mot de passe.

3. **Autonomie totale du commerçant :**
   - Tableau de bord d'administration complet (**Dashboard Gérant**) sans dépendance à une plateforme tierce payante (Shopify, WooCommerce, etc.).
   - Gestion des stocks en direct avec décrémentation automatique lors d'une commande.
   - Ajout, modification et suppression de produits avec gestionnaire d'images et compression automatique côté client.
   - Gestion dynamique des catégories avec réattribution sécurisée des produits orphelins.
   - Export comptable des commandes au format CSV.

---

## 3. Positionnement Technique

| Critère | Description |
| :--- | :--- |
| **Type d'Application** | Single Page Application (SPA) / JAMstack moderne |
| **Framework Principal** | React 18 avec TypeScript strict |
| **Outil de Build** | Vite 5 (Bundler ultra-rapide basé sur Rollup/ESBuild) |
| **Moteur CSS** | Tailwind CSS 3 avec variables dynamiques pour thèmes interchangeables |
| **Couche Données** | Architecture Repository asynchrone (LocalStorage avec contrat d'interface prêt pour Supabase/REST) |
| **Poids du Bundle** | ~415 KB non compressé (~109 KB gzip) |
| **Hébergement Cible** | Forfait 100% gratuit (Vercel, Netlify, Cloudflare Pages) |

---

## 4. Publics Cibles

1. **Clients Finaux (B2C) :**
   - Acheteurs mobiles naviguant depuis Instagram, Facebook, TikTok ou des campagnes publicitaires digitales.
   - Clients recherchant une commande simple et rapide sans inscription préalable ni carte bancaire.

2. **Équipe Gestionnaire / Commerçant (Back-Office) :**
   - Gérant de la boutique traitant les commandes quotidiennes par téléphone ou WhatsApp.
   - Préparateurs de commandes éditant des bordereaux de livraison et modifiant les statuts (*En attente*, *Confirmée*, *En préparation*, *Expédiée*, *Livrée*, *Annulée*).

