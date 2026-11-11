# 10 — Sécurité, Protection des Données et Audit

Ce document présente l'audit de sécurité de l'application **Maison Céleste**, les protections mises en œuvre pour l'exploitation en production et les recommandations pour le e-commerce COD en Algérie.

---

## 1. Authentification et Contrôle d'Accès Administrateur

### 1.1 Verrouillage par Code PIN
- L'accès au tableau de bord gérant ([`AdminLogin.tsx`](file:///c:/Users/Mohcen/Desktop/e-commerce/src/components/admin/AdminLogin.tsx)) est protégé par un code PIN configurable à 4 chiffres (défaut : `1234`).
- La saisie est masquée avec des pastilles discrètes pour empêcher l'espionnage d'écran (*shoulder surfing*).
- Une temporisation de 500 ms est imposée après un échec pour décourager les tentatives de force brute.

### 1.2 Durée de Vie de la Session (`sessionStorage`)
- Lors d'une connexion réussie, le jeton d'autorisation est enregistré dans le stockage de session du navigateur :
  ```ts
  sessionStorage.setItem('elissia_admin_auth', 'true');
  ```
- **Avantage de sécurité :** Contrairement à un cookie persistant ou à `localStorage`, `sessionStorage` est automatiquement détruit dès que le gérant ferme son onglet ou son navigateur. Un appareil partagé (cybercafé, smartphone familial) ne conserve aucun accès actif.

---

## 2. Validation des Données et Protection des Formulaires

### 2.1 Validation Stricte des Numéros de Téléphone Algériens
La fonction utilitaire [`validateAlgerianPhone`](file:///c:/Users/Mohcen/Desktop/e-commerce/src/utils/formatters.ts) valide rigoureusement les numéros saisis :
```ts
export function validateAlgerianPhone(phone: string): boolean {
  // Accepte: 05XXXXXXXX, 06XXXXXXXX, 07XXXXXXXX, +2135XXXXXXXX, +2136XXXXXXXX, +2137XXXXXXXX
  const cleaned = phone.replace(/[\s\-\.\(\)]/g, '');
  const dzMobileRegex = /^(?:(?:\+|00)213|0)[567]\d{8}$/;
  return dzMobileRegex.test(cleaned);
}
```
Si le numéro n'appartient pas aux préfixes d'opérateurs mobiles algériens valides (Mobilis `06`, Djezzy `07`, Ooredoo `05`), le formulaire bloque la soumission et affiche une alerte contextuelle claire.

### 2.2 Verrouillage Anti-Doublon (*Debounce Submission Lock*)
Pour éviter qu'un acheteur stressé ou victime d'un ralentissement de connexion ne clique plusieurs fois sur `COMMANDER` :
1. Un état `isSubmitting` désactive immédiatement le bouton et affiche un indicateur de chargement.
2. Un verrou par référence mutable (`isSubmittingRef.current = true`) court-circuite tout événement concurrent.
3. Le générateur de commandes vérifie et élimine les collisions d'identifiants avant enregistrement.

---

## 3. Confidentialité des Informations et Audit des Secrets

### 3.1 Aucun Secret dans le Code Source Public
- **Audit de conformité :** Le code ne contient aucun mot de passe de base de données, aucune clé privée Stripe/PayPal, ni aucun jeton secret AWS.
- Les seules variables exposées sont des préfixes publics `VITE_` (identifiants de pixels publicitaires et nom du magasin), conformément aux règles de sécurité Vite.
- Le fichier [`.gitignore`](file:///c:/Users/Mohcen/Desktop/e-commerce/.gitignore) a été créé pour exclure formellement tout fichier `.env` ou `.env.local` du dépôt Git.

### 3.2 Fichier `.env.example`
Un modèle propre sans données sensibles ([`.env.example`](file:///c:/Users/Mohcen/Desktop/e-commerce/.env.example)) est fourni pour guider la configuration de production.

---

## 4. Mesures Anti-Fraude adaptées au Cash on Delivery (Algérie)

Le modèle COD présente un risque inhérent de commandes fantômes ou de refus à la livraison. Le système intègre 3 mécanismes pour limiter ce taux de retour (*taux de déchet*) :

1. **Confirmation Téléphonique / WhatsApp en 1 Clic :**
   - Dès la validation, le client est invité à confirmer sa commande via un lien WhatsApp pré-rempli avec son numéro de commande et le montant exact.
   - Le gérant peut contacter immédiatement les clients dont les commandes restent au statut `pending` avant toute expédition physique.
2. **Consultation de l'Historique par Téléphone :**
   - Le commerçant peut repérer dans le tableau de bord les numéros de téléphone ayant cumulé des commandes annulées ou suspectes.
3. **Calcul Transparent des Frais de Port :**
   - L'affichage clair et contractuel du coût total (prix du bijou + frais d'envoi vers la Wilaya sélectionnée) élimine les mauvaises surprises pour le client au moment de payer le livreur en espèces.
