# 13 — Guide de Maintenance et Exploitation

Ce document s'adresse au responsable technique et au gestionnaire de boutique pour les opérations d'entretien courant, de mise à jour, de sauvegarde et de résolution des incidents.

---

## 1. Gestion des Mises à Jour du Catalogue

### Méthode 1 : Depuis l'Interface Graphique (Recommandée pour le gérant)
1. Ouvrez la boutique et connectez-vous au tableau de bord (`Dashboard`).
2. Rendez-vous dans l'onglet **Catalogue Produits**.
3. Cliquez sur **`+ Nouveau Produit`**.
4. Remplissez le titre, le prix de vente, l'ancien prix barré (pour faire apparaître le badge promo), la catégorie et les spécifications.
5. Déposez une ou plusieurs photos (le compresseur intégré ajuste automatiquement la taille).
6. Cliquez sur **Enregistrer** : le produit est disponible immédiatement pour tous les acheteurs.

### Méthode 2 : Dans le Code Source (`src/data/mockProducts.ts`)
Pour intégrer un produit de manière permanente et native dans les sources du projet :
1. Ouvrez [`src/data/mockProducts.ts`](file:///c:/Users/Mohcen/Desktop/e-commerce/src/data/mockProducts.ts).
2. Ajoutez un nouvel objet respectant l'interface `Product` dans la liste `INITIAL_PRODUCTS`.
3. Placez les photos correspondantes dans [`public/images/products/`](file:///c:/Users/Mohcen/Desktop/e-commerce/public/images/products/).
4. Incrémentez la clé de version dans [`src/services/api.ts`](file:///c:/Users/Mohcen/Desktop/e-commerce/src/services/api.ts) (ex: `celeste_products_v12`) pour purger le cache des navigateurs clients.
5. Compilez et déployez (`git push`).

---

## 2. Sauvegarde et Export des Données de Vente

### Export Comptable des Commandes
Pour sauvegarder l'ensemble des coordonnées clients, wilayas, montants et articles commandés :
1. Dans le tableau de bord, onglet **Commandes**.
2. Cliquez sur le bouton **`Exporter CSV`**.
3. Un fichier horodaté `commandes_maison_celeste_AAAA-MM-JJ.csv` est téléchargé.
4. Ce fichier est compatible avec Microsoft Excel, Google Sheets ou tout ERP logistique algérien.

---

## 3. Maintenance des Dépendances Logicielles

Pour maintenir les bibliothèques à jour sans introduire de régression :

1. **Vérifier les versions obsolètes :**
   ```bash
   npm outdated
   ```
2. **Mettre à jour les correctifs mineurs et de sécurité :**
   ```bash
   npm update
   ```
3. **Tester la compilation après toute mise à jour :**
   ```bash
   npm run build
   ```
   *Règle d'or : Ne jamais déployer en production si `npm run build` retourne un code d'erreur non nul.*

---

## 4. Stratégie de Gestion du Cache Navigateur (*Cache Busting*)

Dans une application stockant des données dans `localStorage` :
- Si vous modifiez un prix ou une photo dans le code source sans modifier la clé de stockage, un visiteur ayant déjà chargé l'ancien catalogue pourrait continuer à voir les anciennes valeurs en cache local.
- **Solution professionnelle implémentée :** La constante `STORAGE_KEYS` dans [`src/services/api.ts`](file:///c:/Users/Mohcen/Desktop/e-commerce/src/services/api.ts) :
  ```ts
  const STORAGE_KEYS = {
    PRODUCTS: 'celeste_products_v11',
    ORDERS: 'celeste_orders_v10',
    WILAYAS: 'orlea_wilayas_v7',
    CONFIG: 'celeste_config_v10',
    REVIEWS: 'celeste_reviews_v10',
    CATEGORIES: 'celeste_categories_v10',
  };
  ```
  Dès que vous incrémentez `PRODUCTS: 'celeste_products_v12'`, tous les visiteurs reçoivent instantanément le catalogue mis à jour lors de leur prochaine visite.

---

## 5. Procédure de Rollback (Retour Arrière d'Urgence)

Si une modification déployée sur Vercel ou Netlify présente une anomalie en production :
1. Connectez-vous sur votre tableau de bord **Vercel** ou **Netlify**.
2. Allez dans l'onglet **Deployments**.
3. Repérez le déploiement précédent fonctionnel.
4. Cliquez sur les trois petits points `...` ➔ **« Instant Rollback »** (ou **« Promote to Production »**).
5. En moins de 3 secondes, l'ancienne version stable redevient active sur l'URL publique.

