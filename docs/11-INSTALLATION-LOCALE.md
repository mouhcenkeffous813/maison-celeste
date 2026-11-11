# 11 — Guide d'Installation et Lancement Local

Ce guide pas à pas fournit les instructions exactes et vérifiées pour cloner, installer et faire tourner **Maison Céleste** en environnement de développement local sur Windows, macOS ou Linux.

---

## 1. Prérequis Système

| Outil | Version Requise | Commande de Vérification |
| :--- | :---: | :--- |
| **Node.js** | `>= 18.0.0` (Recommandé : `20.x` LTS) | `node -v` |
| **npm** | `>= 9.0.0` | `npm -v` |
| **Git** | `>= 2.30.0` | `git -v` |

---

## 2. Procédure d'Installation

### Étape 1 : Se positionner dans le répertoire du projet
Ouvrez votre terminal (PowerShell sur Windows ou Terminal sur macOS/Linux) :
```bash
cd c:\Users\Mohcen\Desktop\e-commerce
```

### Étape 2 : Installer les dépendances
Installez l'ensemble des modules déclarés dans `package.json` :
```bash
npm install
```
*Note : Si vous rencontrez un avertissement d'arborescence, exécutez `npm install --legacy-peer-deps`.*

---

## 3. Commandes d'Exécution Disponibles

### Lancement du Serveur de Développement
Pour démarrer le serveur de développement avec rechargement à chaud (Hot Module Replacement - HMR) :
```bash
npm run dev
```
Par défaut, Vite lance l'application sur :
- **URL locale :** `http://localhost:3000` (ou `http://localhost:5173`)
- **Accès réseau local :** `http://<votre-ip-locale>:3000` (accessible depuis un smartphone connecté au même réseau Wi-Fi).

### Compilation pour la Production
Pour compiler et minifier l'ensemble du projet :
```bash
npm run build
```
Cette commande exécute le compilateur TypeScript (`tsc`) puis génère les artefacts optimisés dans le dossier `dist/`.

### Prévisualisation du Bundle de Production
Pour tester le rendu réel de production avant déploiement :
```bash
npm run preview
```
Cette commande lance un serveur local servant directement le contenu compilé du dossier `dist/`.

---

## 4. Dépannage Courant

### Port déjà utilisé (`Error: listen EADDRINUSE: address already in use :::3000`)
Si un autre processus occupe le port 3000 :
- Spécifiez un autre port au lancement :
  ```bash
  npx vite --port 3001
  ```
- Ou tuez le processus en cours (PowerShell) :
  ```powershell
  Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
  ```

### Erreur de restriction d'exécution des scripts PowerShell
Si PowerShell bloque l'exécution de `npm` avec le message `impossible de charger le fichier... script non signé` :
Exécutez dans votre session PowerShell :
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

