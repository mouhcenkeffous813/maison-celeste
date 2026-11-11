# 02 — Architecture Technique & Diagrammes

Ce document décrit l'architecture logicielle du projet **Maison Céleste**, les flux de données entre les différents composants, ainsi que les modèles de conception appliqués.

---

## 1. Architecture Globale du Système

L'application adopte une architecture **Single Page Application (SPA)** découplée basée sur React, organisée autour d'un gestionnaire d'état central (`StoreContext`) et d'un service d'accès aux données asynchrone (`api.ts`).

```mermaid
graph TD
    User["Client Mobile / Desktop"] -->|Navigation / Interactions| UI["Composants Présentationnels (Storefront & Admin)"]
    UI -->|Hooks & Actions| StateContext["StoreContext (React Context + Hooks)"]
    StateContext -->|Appels Asynchrones| ServiceAPI["Service Abstraction API (api.ts)"]
    
    subgraph "Couche Données & Persistance"
        ServiceAPI -->|Lecture / Écriture| LocalEngine["LocalStorage Storage Engine"]
        ServiceAPI -->|Dispatch Événements| EventBus["Window CustomEvent ('elissia_store_update')"]
        LocalEngine -->|Données Initiales| MockSeeds["Jeux de Données & Wilayas (58 Wilayas JSON)"]
    end

    subgraph "Services & Canaux Externes"
        UI -->|Redirection WhatsApp| WhatsAppAPI["WhatsApp Click-to-Chat"]
        UI -->|Animation Confetti| ConfettiLib["Canvas Confetti Engine"]
        StateContext -->|Pixels de Tracking| Analytics["Meta & TikTok Pixel IDs"]
    end
```

---

## 2. Flux de Commande COD (Cash on Delivery)

Le flux de commande a été spécialement optimisé pour le e-commerce algérien : une commande est créée directement depuis la fiche produit, entraînant le calcul instantané des frais de port et la mise à jour des stocks.

```mermaid
sequenceDiagram
    autonumber
    actor Client as Acheteur (Mobile)
    participant Form as ProductPage (Formulaire COD)
    participant Context as StoreContext
    participant API as Service API (api.ts)
    participant Storage as LocalStorage / Backend
    participant WA as WhatsApp API

    Client->>Form: Sélectionne Wilaya, Commune, Type (Domicile / Desk)
    Form->>Form: Calcul instantané des frais de livraison et du Total
    Client->>Form: Remplit Nom & Téléphone puis clique sur [COMMANDER]
    Form->>Form: Validation regex du téléphone (05/06/07 + 8 chiffres)
    Form->>Context: createOrder(orderPayload)
    Context->>API: api.createOrder(data)
    API->>Storage: Génère CMD-DZ-XXXX & sauvegarde
    API->>Storage: Décrémente le stock de la variante
    API-->>Context: Retourne l'objet Order créé
    Context-->>Form: Confirmation & déclenchement Confetti
    Form->>Client: Affiche l'écran de succès avec récapitulatif
    opt Confirmation Accélérée
        Client->>WA: Clique sur "Confirmer plus vite sur WhatsApp"
        WA-->>Client: Ouvre WhatsApp avec message pré-rempli
    end
```

---

## 3. Architecture d'Administration et Gestion de Session

L'accès au tableau de bord gérant est protégé par un système de code PIN et une session temporaire (`sessionStorage`).

```mermaid
graph LR
    subgraph "Entrées d'accès Admin"
        BtnNav["Bouton Navbar 'Dashboard'"]
        SecretClicks["3 clics secrets sur le Copyright Footer"]
        DirectURL["URL avec hash #admin ou paramètre ?admin=true"]
    end

    BtnNav --> AuthGuard["Garde d'Authentification (AdminLogin)"]
    SecretClicks --> AuthGuard
    DirectURL --> AuthGuard

    AuthGuard -->|Vérification du PIN| CheckPIN{"PIN Valide ? (Défaut: 1234)"}
    CheckPIN -->|Non| ErrorMsg["Message d'erreur & Temporisation"]
    CheckPIN -->|Oui| SetSession["sessionStorage.setItem('elissia_admin_auth', 'true')"]
    SetSession --> Dashboard["Tableau de Bord Gérant (AdminLayout)"]

    subgraph "Modules Dashboard"
        Dashboard --> Overview["Vue d'Ensemble & KPIs"]
        Dashboard --> Orders["Gestion des Commandes & Statuts"]
        Dashboard --> Products["Catalogue & Variantes de Produits"]
        Dashboard --> Categories["Gestion des Catégories (CRUD)"]
        Dashboard --> Shipping["Grille Tarifaire des 58 Wilayas"]
        Dashboard --> Settings["Personnalisation & Thèmes CSS"]
    end
```

---

## 4. Modèle de Transition vers un Backend Distant (Supabase / REST)

La couche d'accès aux données dans [`src/services/api.ts`](file:///c:/Users/Mohcen/Desktop/e-commerce/src/services/api.ts) utilise exclusivement des méthodes asynchrones (`async/await`) renvoyant des promesses (`Promise<T>`).

Cette conception en **Repository Pattern** permet de basculer d'un stockage local vers une base de données distante (ex. Supabase PostgreSQL ou Firebase) en modifiant uniquement l'intérieur de `api.ts`, sans changer une seule ligne des composants React :

```mermaid
graph TD
    Storefront["Composants Storefront (React)"] --> StoreContext["StoreContext"]
    AdminPanel["Composants Admin (React)"] --> StoreContext
    StoreContext --> Interface["Contrat d'Interface Asynchrone api.ts"]

    Interface -.->|Implémentation Actuelle| LocalDriver["LocalStorage Driver (Zero-Backend)"]
    Interface -.->|Migration Optionnelle| SupabaseDriver["Supabase Client (PostgreSQL + Auth)"]
    Interface -.->|Migration Optionnelle| RestDriver["REST API (Node.js / Express / NestJS)"]
```

