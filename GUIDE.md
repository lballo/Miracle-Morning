# 🌅 My Miracle Morning — Guide de déploiement

## 📦 Structure du projet

```
miracle-morning-pwa/
├── index.html       ← L'application complète
├── manifest.json    ← Requis pour l'installation Android (NE PAS SUPPRIMER)
├── sw.js            ← Service Worker pour le mode offline
└── icons/
    ├── icon-192x192.png
    └── icon-512x512.png
```

**⚠️ IMPORTANT** : les 4 fichiers doivent être déployés ensemble au même niveau. Le manifest.json DOIT être un vrai fichier (pas intégré dans le HTML) sinon Android ne reconnaît pas l'app.

---

## 🚀 Déployer en 2 minutes — Netlify Drop

1. Va sur **https://app.netlify.com/drop**
2. **Glisse le dossier `miracle-morning-pwa`** sur la page
3. C'est en ligne ! Tu reçois un URL type `https://xxxxx.netlify.app`
4. *(Optionnel)* Crée un compte gratuit pour garder le site et personnaliser l'URL

---

## 📱 Installer sur Android

1. Ouvre l'URL dans **Chrome** sur ton téléphone
2. Attends quelques secondes — une bannière apparaît **"Installer l'application"**
3. Si rien n'apparaît : menu **⋮** → **"Installer l'application"** ou **"Ajouter à l'écran d'accueil"**
4. L'app s'installe avec son icône sur l'écran d'accueil
5. Elle s'ouvre en **plein écran** (sans barre Chrome) et fonctionne **hors-ligne**

### Sur iPhone
1. Ouvre l'URL dans **Safari**
2. Bouton **Partager** → **"Sur l'écran d'accueil"**

---

## 🔄 Alternatives à Netlify

### GitHub Pages
1. Crée un repo GitHub, upload les fichiers
2. Settings → Pages → Deploy from main branch
3. URL : `https://ton-user.github.io/nom-repo/`

### Vercel
1. https://vercel.com → connecte GitHub → importe le repo → Deploy

---

## ✅ Checklist

- [ ] Les 4 fichiers sont dans le même dossier
- [ ] Déployé sur Netlify / GitHub Pages / Vercel
- [ ] Testé sur mobile Chrome → installation OK
- [ ] Mode offline vérifié (couper wifi, recharger)
