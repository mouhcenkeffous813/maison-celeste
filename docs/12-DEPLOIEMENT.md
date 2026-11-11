# 12 — Guide de Déploiement Gratuit Étape par Étape

Ce document est le guide de référence pour déployer publiquement la boutique **Maison Céleste** sur Internet, sans débourser un centime, tout en bénéficiant d'une adresse web sécurisée en HTTPS et d'une distribution mondiale ultra-rapide.

---

## 1. Analyse Comparative des Hébergeurs Gratuits

| Plateforme | Forfait Gratuit | Bande Passante | Mise en Veille | Domaine Fourni | Déploiement Git | Note Globale |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Vercel** *(Recommandé)* | **Hobby (Gratuit à vie)** | **100 Go / mois** | **Aucune (CDN 24h/24)** | `*.vercel.app` (Gratuit) | Oui (Automatique) | **10/10** (Natif Vite/React) |
| **Netlify** *(Alternative)* | **Starter (Gratuit)** | **100 Go / mois** | **Aucune (CDN 24h/24)** | `*.netlify.app` (Gratuit) | Oui (Automatique) | **9.5/10** (Très simple) |
| **Cloudflare Pages** | **Free** | **Illimitée** | **Aucune** | `*.pages.dev` (Gratuit) | Oui (Automatique) | **9/10** (Réseau Anycast rapide) |
| **Render** | **Free Static** | **100 Go / mois** | Aucune pour les sites statiques | `*.onrender.com` | Oui | **8/10** (Plus orienté Docker) |
| **GitHub Pages** | **Free** | **100 Go / mois** | Aucune | `*.github.io` | Via GitHub Actions | **7.5/10** (Nécessite config 404) |

### Pourquoi Vercel est la Solution Idéale ?
1. **Zéro configuration serveur :** Vercel détecte automatiquement le projet comme une application Vite React.
2. **Capacité colossale pour une boutique :** Le forfait gratuit offre **100 Go de bande passante par mois**. Sachant que l'ensemble du bundle JavaScript pèse ~109 KB (gzip), ce forfait permet d'accueillir **plus de 200 000 visiteurs mensuels** sans payer le moindre centime.
3. **Certificat SSL HTTPS automatique :** Cadenas de sécurité vert immédiat pour rassurer les clients sur smartphone.
4. **Fichier `vercel.json` déjà prêt :** La règle de redirection SPA et les en-têtes de mise en cache longue durée pour les images sont déjà configurés dans [`vercel.json`](file:///c:/Users/Mohcen/Desktop/e-commerce/vercel.json).

---

## 2. Déploiement sur Vercel (Méthode Recommandée via GitHub)

### Étape 1 : Initialiser Git et publier le projet sur GitHub

1. Ouvrez un terminal dans le dossier du projet :
   ```bash
   cd c:\Users\Mohcen\Desktop\e-commerce
   ```
2. Initialisez le dépôt Git local :
   ```bash
   git init
   git branch -M main
   ```
3. Ajoutez tous les fichiers et réalisez le commit initial :
   ```bash
   git add .
   git commit -m "Initial commit: Maison Celeste E-commerce COD Algerie"
   ```
4. Créez un nouveau dépôt sur votre compte GitHub (ex. `maison-celeste-store`).
5. Liez votre dépôt local et poussez le code :
   ```bash
   git remote add origin https://github.com/<votre-nom-utilisateur>/maison-celeste-store.git
   git push -u origin main
   ```

---

### Étape 2 : Connecter Vercel et lancer le déploiement

1. Rendez-vous sur le site officiel de **[Vercel](https://vercel.com/)** et connectez-vous avec votre compte GitHub.
2. Cliquez sur le bouton bleu **« Add New... »** puis sélectionnez **« Project »**.
3. Dans la liste de vos dépôts GitHub, cliquez sur **« Import »** en face de `maison-celeste-store`.
4. Vercel détecte automatiquement la configuration :
   - **Framework Preset :** `Vite`
   - **Build Command :** `npm run build`
   - **Output Directory :** `dist`
5. (Optionnel) Déployez la section **« Environment Variables »** pour définir vos variables personnalisées :
   - `VITE_STORE_NAME` = `Maison Céleste`
   - `VITE_WHATSAPP_PHONE` = `213555123456`
   - `VITE_ADMIN_PIN` = `1234`
6. Cliquez sur le bouton **« Deploy »**.
7. En moins de 45 secondes, votre boutique est en ligne ! Vercel vous fournit une adresse publique gratuite du type :
   ```text
   https://maison-celeste-store.vercel.app
   ```

---

## 3. Déploiement sur Netlify (Alternative)

Si vous préférez Netlify :
1. Créez un compte gratuit sur **[Netlify](https://www.netlify.com/)**.
2. Cliquez sur **« Add new site »** ➔ **« Import an existing project »** ➔ **« GitHub »**.
3. Choisissez le dépôt `maison-celeste-store`.
4. Netlify lit automatiquement le fichier [`netlify.toml`](file:///c:/Users/Mohcen/Desktop/e-commerce/netlify.toml) présent à la racine du projet.
5. Cliquez sur **« Deploy maison-celeste-store »**.
6. Votre URL publique gratuite sera disponible sous la forme :
   ```text
   https://maison-celeste.netlify.app
   ```

---

## 4. Associer un Nom de Domaine Personnalisé (Gratuit sur Vercel/Netlify)

Si vous achetez plus tard un nom de domaine personnalisé (ex: `maisonceleste.dz` ou `maisonceleste-luxe.com`) :
1. Dans Vercel, allez dans **Settings** ➔ **Domains**.
2. Entrez votre nom de domaine.
3. Configurez les deux enregistrements DNS chez votre registrar :
   - **CNAME** : `cname.vercel-dns.com`
   - **A** : `76.76.21.21`
4. Vercel génère automatiquement le certificat SSL en moins de 15 minutes.

---

## 5. Mises à Jour Automatiques en Continu (CI/CD)

Grâce à la liaison Git :
Chaque fois que vous modifiez un fichier (prix, description, nouvel article) sur votre ordinateur :
```bash
git add .
git commit -m "Mise a jour du catalogue"
git push origin main
```
Vercel et Netlify détectent instantanément le push, recompilent le projet et mettent à jour le site en ligne en moins de 30 secondes, sans interruption de service pour vos clients !
