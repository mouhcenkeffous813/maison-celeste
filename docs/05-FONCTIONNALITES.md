# 05 — Guide Détaillé des Fonctionnalités

Ce document recense l'ensemble des fonctionnalités implémentées dans le projet **Maison Céleste**, avec le détail de leur fonctionnement et les fichiers source associés.

---

## 1. Fonctionnalités Côté Client (Storefront)

### 1.1 Page d'Accueil & Vitrine de Vente ([`HomePage.tsx`](file:///c:/Users/Mohcen/Desktop/e-commerce/src/components/storefront/HomePage.tsx))
- **Bannière d'annonces supérieure :** Message de livraison express 58 Wilayas et paiement à la livraison animé.
- **Hero Banner Prestige :** Typographie luxe, badges de réassurance (Livraison rapide, Paiement cash, Échange 48h, Support WhatsApp 7j/7).
- **Barre de défilement des catégories (Pills) :** Filtre instantané par catégorie sans rechargement de page (*Tout*, *Colliers & Pendentifs*, *Bracelets & Joncs*, *Bagues & Alliances*, *Coffrets & Packs*, *Montres & Accessoires*, *Caftans & Prêt-à-Porter*).
- **Grille de produits 2 colonnes (Mobile First) :**
  - Image du produit au format carré avec zoom progressif au survol.
  - Badge rouge de réduction automatique calculé dynamiquement (ex. `-23%`).
  - Titre épuré en français et pastilles d'aperçu des couleurs disponibles.
  - Double affichage tarifaire : prix de vente en gras et ancien prix barré.
  - Bouton d'action proéminent **`COMMANDER`**.

### 1.2 Fiche Produit & Formulaire COD 1-Page ([`ProductPage.tsx`](file:///c:/Users/Mohcen/Desktop/e-commerce/src/components/storefront/ProductPage.tsx))
- **Galerie d'images interactive :** Carrousel avec flèches de navigation, puces indicatrices et rangée de miniatures cliquables. Synchronisation automatique de la photo affichée lors du choix d'une couleur.
- **Sélecteur dynamique de variantes :**
  - Pastilles chromatiques de couleurs avec noms personnalisés.
  - Boutons de sélection de tailles / pointures avec vérification du stock en temps réel.
- **Arguments clés (Bullet Points) :** Liste des garanties et spécifications techniques (acier 316L, or 18k, résistance à l'eau, velours de soie, etc.).
- **Formulaire express Cash on Delivery (COD) :**
  - Saisie du nom complet et numéro de téléphone avec validation automatique du format algérien (`05`, `06`, `07`).
  - Menu déroulant des **58 Wilayas** avec mise à jour automatique des communes associées.
  - Choix du mode de livraison : **À Domicile** ou **Au Bureau de livraison (Stop Desk)** avec recalcul immédiat des frais de livraison.
  - Sélecteur de quantité incrémentable (`- 1 +`).
  - Total général affiché en vert en temps réel (`Prix des produits + Frais de livraison`).
  - Déclencheur anti-double-clic (*debounce lock*) pour éviter la soumission de commandes en doublon.
- **Écran de Confirmation de Commande :**
  - Explosion de confettis multicolores.
  - Numéro de commande unique généré (`CMD-DZ-XXXX`).
  - Bouton direct **« Confirmer plus vite sur WhatsApp »** ouvrant l'application WhatsApp avec un message pré-rédigé contenant le nom, le numéro de commande et le montant total.
- **Grille de Produits Recommandés (« Produits connexes ») :** 4 suggestions d'articles de la même catégorie pour favoriser la vente incitative (*cross-selling*).
- **Avis Clients Vérifiés :** Section de témoignages d'acheteuses réelles situées à Alger, Oran, Constantine, Sétif, Blida, etc., avec bouton d'ajout d'avis.

### 1.3 Menu Tiroir Mobile ([`NavigationDrawer.tsx`](file:///c:/Users/Mohcen/Desktop/e-commerce/src/components/storefront/NavigationDrawer.tsx))
- En-tête avec logo officiel et nom de la boutique.
- **Recherche instantanée insensible aux accents :** L'algorithme (`searchMatches`) normalise les caractères (ex: taper `setif` ou `argent` trouve les articles ou les commandes contenant `Sétif` ou `argenté`).
- Liens vers *Accueil*, *Catégories*, *État de commande*, *Tarifs de livraison*, *Contactez-nous*.

### 1.4 Suivi de Commande Client ([`OrderTracking.tsx`](file:///c:/Users/Mohcen/Desktop/e-commerce/src/components/storefront/OrderTracking.tsx))
- Permet à un acheteur de retrouver l'état de ses commandes en saisissant simplement son numéro de téléphone algérien.
- Barre de progression visuelle des statuts : *Enregistrée* ➔ *Confirmée* ➔ *En préparation* ➔ *Expédiée* ➔ *Livrée*.

---

## 2. Fonctionnalités d'Administration (Back-Office)

### 2.1 Authentification et Sécurité ([`AdminLogin.tsx`](file:///c:/Users/Mohcen/Desktop/e-commerce/src/components/admin/AdminLogin.tsx))
- Clavier numérique tactile ou saisie clavier pour le code PIN administrateur à 4 chiffres (défaut : `1234`).
- Mémorisation de session dans `sessionStorage` (déconnexion automatique à la fermeture de l'onglet).
- Bouton direct **« Dashboard »** dans la barre de navigation pour le commerçant, complété par un accès secret en 3 clics sur le copyright du footer.

### 2.2 Tableau de Bord & Statistiques ([`AdminOverview.tsx`](file:///c:/Users/Mohcen/Desktop/e-commerce/src/components/admin/AdminOverview.tsx))
- **Cartes KPIs principales :** Chiffre d'affaires total encaissé, Nombre total de commandes, Commandes en attente de confirmation, Panier moyen en DA.
- **Filtres de période :** Aujourd'hui, 7 derniers jours, 30 derniers jours, Toutes les périodes.
- **Classement des Wilayas :** Graphique à barres interactif affichant le volume des ventes par Wilaya (ex. Alger, Oran, Sétif, Constantine).
- **Bouton de Simulation :** Bouton `+ Simuler 1 Commande` générant instantanément une fausse commande réaliste (nom algérien, wilaya, article aléatoire) pour tester le CRM et réaliser des démonstrations clients.

### 2.3 Gestion des Commandes ([`AdminOrders.tsx`](file:///c:/Users/Mohcen/Desktop/e-commerce/src/components/admin/AdminOrders.tsx))
- Liste tabulaire avec badge coloré pour chaque statut (*pending*, *confirmed*, *processing*, *shipped*, *delivered*, *cancelled*).
- Recherche multi-critères : par nom de client, numéro de téléphone, numéro de commande ou wilaya.
- Modification instantanée du statut avec champ de notes internes pour le service client.
- **Export CSV comptable :** Téléchargement en un clic de l'ensemble des commandes pour Excel ou logiciel de gestion.
- **Bordereau de livraison imprimable ([`OrderDeliverySlip.tsx`](file:///c:/Users/Mohcen/Desktop/e-commerce/src/components/admin/OrderDeliverySlip.tsx)) :** Fiche d'expédition prête à être imprimée ou collée sur le colis pour les transporteurs algériens (Yalidine, ZR Express, etc.).

### 2.4 Gestion des Produits & Variantes ([`AdminProducts.tsx`](file:///c:/Users/Mohcen/Desktop/e-commerce/src/components/admin/AdminProducts.tsx))
- Création et édition complète d'articles : titre, slug, catégorie, prix de vente, prix d'origine barré, description longue et courte.
- **Gestionnaire d'images :** Téléversement d'images avec compression automatique côté client via Canvas HTML5 ([`imageCompressor.ts`](file:///c:/Users/Mohcen/Desktop/e-commerce/src/utils/imageCompressor.ts)), support de galeries multi-photos.
- **Constructeur de variantes :** Définition de couleurs avec sélecteur de teinte hexadécimale et gestion des pointures/tailles avec stock individuel.
- **Gestion dynamique des catégories :**
  - Ajout d'une nouvelle catégorie personnalisée depuis la modale ou directement dans le formulaire produit.
  - Suppression d'une catégorie avec boîte de dialogue de sécurité et réattribution automatique des produits vers une catégorie de repli pour éviter toute perte de données.

### 2.5 Grille Tarifaire des 58 Wilayas ([`AdminShipping.tsx`](file:///c:/Users/Mohcen/Desktop/e-commerce/src/components/admin/AdminShipping.tsx))
- Consultation et modification des tarifs de livraison à domicile et en stop-desk pour chacune des 58 Wilayas.
- Possibilité d'activer ou de désactiver la livraison vers une Wilaya spécifique.

### 2.6 Paramètres de la Boutique & Marque Blanche ([`AdminSettings.tsx`](file:///c:/Users/Mohcen/Desktop/e-commerce/src/components/admin/AdminSettings.tsx))
- Modification du nom commercial, du slogan, du logo et des coordonnées de contact (WhatsApp, téléphone).
- Modification du code PIN administrateur.
- **Sélecteur de thèmes CSS :** Changement en direct entre 5 chartes chromatiques prédéfinies (*Rose Poudré Signature*, *Or Rose & Soie*, *Lavande Douce*, *Nude & Cachemire*, *Noir & Or Haute Joaillerie*).
