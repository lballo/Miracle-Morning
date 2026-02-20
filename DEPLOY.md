# 🌅 My Miracle Morning — Déploiement

## Structure du projet

```
miracle-morning-pwa/
├── index.html          ← L'application
├── manifest.json       ← Manifest PWA (installation Android)
├── sw.js               ← Service Worker (mode offline)
├── icons/              ← Icônes de l'app
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-192x192.png
│   ├── icon-384x384.png
│   └── icon-512x512.png
└── DEPLOY.md           ← Ce fichier
```

---

## 🚀 Option 1 — Netlify (le plus simple, 2 minutes)

C'est la méthode la plus rapide. Aucun compte technique nécessaire.

1. Va sur **https://app.netlify.com/drop**
2. **Glisse le dossier `miracle-morning-pwa`** directement sur la page
3. C'est en ligne ! Tu reçois un URL du type `https://amazing-name-123.netlify.app`
4. *(Optionnel)* Crée un compte gratuit pour personnaliser l'URL

### Nom de domaine personnalisé (optionnel)
- Dans les Settings du site → Domain management → Add custom domain
- Tu peux utiliser un domaine comme `miraclemorning.lauraballo.com`

---

## 🚀 Option 2 — GitHub Pages (gratuit, permanent)

### Étapes :

1. **Crée un compte GitHub** (si pas déjà fait) sur https://github.com

2. **Crée un nouveau repository** :
   - Va sur https://github.com/new
   - Nom : `miracle-morning` (ou ce que tu veux)
   - Visibilité : **Public**
   - Coche **"Add a README file"**
   - Clique **Create repository**

3. **Upload les fichiers** :
   - Sur la page du repo, clique **"Add file"** → **"Upload files"**
   - Glisse **tout le contenu du dossier** `miracle-morning-pwa/` (pas le dossier lui-même, son contenu)
   - Clique **"Commit changes"**

4. **Active GitHub Pages** :
   - Va dans **Settings** → **Pages** (dans le menu de gauche)
   - Source : **Deploy from a branch**
   - Branch : **main** / **/ (root)**
   - Clique **Save**

5. **Attends 1-2 minutes**, ton site sera disponible à :
   `https://TON-USERNAME.github.io/miracle-morning/`

### ⚠️ Important pour GitHub Pages
Si ton repo ne s'appelle pas `miracle-morning`, il faudra adapter le `start_url` et `scope` dans `manifest.json` :
```json
{
  "start_url": "/nom-du-repo/index.html",
  "scope": "/nom-du-repo/"
}
```
Et dans `index.html`, changer l'enregistrement du SW :
```javascript
navigator.serviceWorker.register('/nom-du-repo/sw.js')
```

---

## 🚀 Option 3 — Vercel (gratuit, très rapide)

1. Va sur **https://vercel.com**
2. Connecte-toi avec GitHub
3. Clique **"New Project"** → Import ton repo GitHub
4. Clique **Deploy**
5. En ligne en ~30 secondes !

---

## 📱 Installer sur Android

Une fois l'app en ligne (quelle que soit la méthode) :

1. **Ouvre l'URL** dans Chrome sur ton téléphone Android
2. Chrome affiche automatiquement un bandeau **"Ajouter à l'écran d'accueil"**
   - Si le bandeau n'apparaît pas : tape les **3 points** (⋮) en haut à droite → **"Installer l'application"** ou **"Ajouter à l'écran d'accueil"**
3. Confirme → l'app apparaît sur ton écran d'accueil comme une vraie app
4. Elle s'ouvre en **plein écran** (sans barre d'adresse) et fonctionne **hors-ligne** !

### Sur iPhone/iPad (bonus)
1. Ouvre l'URL dans **Safari**
2. Tape l'icône **Partager** (carré avec flèche) → **"Sur l'écran d'accueil"**
3. Confirme

---

## 🔧 Personnalisation

### Changer l'icône
Remplace les fichiers dans `icons/` par tes propres PNG aux mêmes dimensions. Utilise un outil comme https://realfavicongenerator.net pour générer tous les formats.

### Changer les couleurs du thème
Dans `manifest.json`, modifie `theme_color` et `background_color`.
Dans `index.html`, modifie la variable `--gold` et `--bg` dans le CSS.

### Nom de l'app
Modifie `name` et `short_name` dans `manifest.json`.

---

## ✅ Checklist avant mise en ligne

- [ ] Tester l'app localement (ouvrir `index.html` dans le navigateur)
- [ ] Vérifier que toutes les icônes sont dans le dossier `icons/`
- [ ] Déployer sur Netlify ou GitHub Pages
- [ ] Tester l'URL en ligne sur mobile
- [ ] Installer l'app sur Android via Chrome
- [ ] Vérifier le mode offline (couper internet, recharger)
