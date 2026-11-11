# 09 — Référence de l'API de Service (`api.ts`)

Ce document décrit le contrat d'API complet exposé par le module [`src/services/api.ts`](file:///c:/Users/Mohcen/Desktop/e-commerce/src/services/api.ts). Chaque méthode est asynchrone, retourne une `Promise`, et gère automatiquement la persistance des données.

---

## 1. Méthodes relatives aux Produits (`Products`)

### `api.getProducts(): Promise<Product[]>`
- **Description :** Récupère la liste intégrale des produits actifs et inactifs.
- **Retour :** Tableau d'objets `Product`.
- **Exemple :**
  ```ts
  const catalog = await api.getProducts();
  const activeItems = catalog.filter(p => p.isActive);
  ```

### `api.getProductById(id: string): Promise<Product | null>`
- **Description :** Recherche un produit selon son identifiant unique.
- **Paramètres :** `id` (ex: `"prod-001"`).
- **Retour :** L'objet `Product` trouvé ou `null`.

### `api.createProduct(data: Omit<Product, 'id' | 'createdAt'>): Promise<Product>`
- **Description :** Crée un nouvel article avec génération automatique de l'identifiant `prod-<timestamp>` et de la date du jour.
- **Effet de bord :** Enregistre le produit en tête de liste et notifie l'application via `elissia_store_update`.

### `api.updateProduct(id: string, updates: Partial<Product>): Promise<Product>`
- **Description :** Met à jour partiellement les champs d'un produit existant.
- **Erreurs :** Lève une exception `Error("Product {id} not found")` si l'identifiant est introuvable.

### `api.deleteProduct(id: string): Promise<boolean>`
- **Description :** Supprime définitivement un produit du catalogue.

---

## 2. Méthodes relatives aux Catégories (`Categories`)

### `api.getCategories(): Promise<string[]>`
- **Description :** Retourne la liste ordonnée des catégories de la boutique.

### `api.addCategory(name: string): Promise<string[]>`
- **Description :** Ajoute une nouvelle catégorie si elle n'existe pas déjà (ignorant les espaces superflus).

### `api.deleteCategory(name: string): Promise<string[]>`
- **Description :** Supprime une catégorie et **réassigne automatiquement** tous les produits qui lui appartenaient vers la première catégorie disponible restante (ou `"Général"`).
- **Sécurité :** Empêche l'existence de produits orphelins.

---

## 3. Méthodes relatives aux Commandes (`Orders`)

### `api.getOrders(): Promise<Order[]>`
- **Description :** Récupère l'ensemble des commandes passées, avec déduplication automatique en mémoire.

### `api.getOrderById(id: string): Promise<Order | null>`
- **Description :** Recherche une commande par son identifiant interne (`ord-XXX`).

### `api.getOrdersByPhone(phone: string): Promise<Order[]>`
- **Description :** Utilisé par la page de suivi client ([`OrderTracking.tsx`](file:///c:/Users/Mohcen/Desktop/e-commerce/src/components/storefront/OrderTracking.tsx)). Filtre les commandes dont le numéro de téléphone concorde (espaces ignorés).

### `api.createOrder(data): Promise<Order>`
- **Description :** Enregistre une nouvelle commande COD.
- **Logique interne :**
  1. Génère un numéro de commande algérien unique : `CMD-DZ-XXXX`.
  2. Génère un identifiant unique horodaté : `ord-<timestamp>-<hash>`.
  3. Recherche le produit commandé et **décrémente automatiquement le stock** de la variante correspondante (taille + couleur).
  4. Recalcule le `totalStock` du produit et persiste la mise à jour.
  5. Émet l'événement `elissia_store_update`.

### `api.updateOrderStatus(orderId: string, status: OrderStatus, notes?: string): Promise<Order>`
- **Description :** Met à jour le statut logistique d'une commande (*pending*, *confirmed*, *processing*, *shipped*, *delivered*, *cancelled*) et consigne d'éventuelles notes internes de suivi.

### `api.deleteOrder(orderId: string): Promise<boolean>`
- **Description :** Supprime une commande (réservé au gérant pour le nettoyage de tests).

---

## 4. Méthodes relatives aux Wilayas & Tarifs (`Wilayas`)

### `api.getWilayas(): Promise<Wilaya[]>`
- **Description :** Retourne les informations complètes des **58 Wilayas d'Algérie** (nom en français, nom en arabe, frais de livraison à domicile, frais en bureau Stop Desk, état d'activation et liste des communes).

### `api.updateWilaya(id: number, updates: Partial<Wilaya>): Promise<Wilaya>`
- **Description :** Permet au gérant de modifier les tarifs de livraison ou d'activer/désactiver la livraison pour une Wilaya donnée.

---

## 5. Méthodes relatives aux Paramètres de la Boutique (`StoreConfig`)

### `api.getStoreConfig(): Promise<StoreConfig>`
- **Description :** Récupère la configuration générale de la boutique (nom, devise, téléphone, WhatsApp, pixels marketing, code PIN et thème actif) et applique automatiquement les variables CSS sur le document.

### `api.updateStoreConfig(updates: Partial<StoreConfig>): Promise<StoreConfig>`
- **Description :** Enregistre les modifications de configuration et réapplique les variables de thème si la charte graphique a été modifiée.

---

## 6. Méthodes relatives aux Avis Clients (`Reviews`)

### `api.getReviews(productId?: string): Promise<Review[]>`
- **Description :** Retourne les avis clients, filtrables par produit.

### `api.addReview(data): Promise<Review>`
- **Description :** Ajoute un avis client vérifié, date l'avis en français et **recalcule automatiquement la note moyenne (`rating`) et le nombre total d'avis (`reviewCount`)** de la fiche produit concernée.
