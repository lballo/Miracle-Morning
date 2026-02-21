const { useState, useEffect, useRef, useCallback } = React;

/* ═══════════════════════════════════════════════════
   STORAGE — localStorage persistence
   ═══════════════════════════════════════════════════ */

const Store = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem('mr_' + key);
      return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  },
  set(key, val) {
    try { localStorage.setItem('mr_' + key, JSON.stringify(val)); } catch {}
  },
  remove(key) {
    try { localStorage.removeItem('mr_' + key); } catch {}
  }
};

/* ═══════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════ */

const TAG_META = {
  presence:  { icon: '🌿', label: 'Présence',  color: '#7aaa88' },
  serenite:  { icon: '🌊', label: 'Sérénité',  color: '#8aaab8' },
  focus:     { icon: '🔥', label: 'Focus',      color: '#c49a6a' },
  emotions:  { icon: '🧭', label: 'Émotions',   color: '#b8889a' },
  energie:   { icon: '✨', label: 'Énergie',    color: '#c4a574' },
};

const MOODS = ['Calme', 'Fragile', 'Déterminé', 'Enthousiaste'];

const MOOD_AFFIRMATIONS = {
  'Calme':        'La paix que tu ressens est ta force.\nElle t\'appartient.',
  'Fragile':      'Ta fragilité est un acte de courage.\nElle dit que tu es vivant.',
  'Déterminé':    'Cette énergie en toi est un feu clair.\nUtilise-la avec douceur.',
  'Enthousiaste': 'Laisse cette joie te traverser.\nElle est le signal que tu es aligné.',
};

const BESOINS = [
  { id: 'presence',  icon: '🌿', label: 'Présence',  sub: 'Revenir ici, dans le corps' },
  { id: 'serenite',  icon: '🌊', label: 'Sérénité',  sub: 'Apaiser, ralentir' },
  { id: 'focus',     icon: '🔥', label: 'Focus',      sub: 'Structurer, clarifier' },
  { id: 'emotions',  icon: '🧭', label: 'Émotions',   sub: 'Traverser sans se noyer' },
  { id: 'energie',   icon: '✨', label: 'Énergie',    sub: 'Réveiller l\'élan' },
];

const CITATIONS = {
  presence:  'Je suis présent ici et maintenant\ndans mon corps.',
  serenite:  'Je prends ma place,\nje suis maître de mon temps.',
  focus:     'La clarté naît du silence\net de l\'intention.',
  emotions:  'Ce que je ressens a le droit\nd\'exister pleinement.',
  energie:   'Ce qui est vivant en moi\na le droit de s\'exprimer.',
};

const JOURNAL_QUESTIONS = {
  focus: [
    'Qu\'est-ce que je veux avoir accompli à la fin de ma journée ?',
    'Quelle est la première étape juste aujourd\'hui (simple, concrète, réaliste) ?',
    'Où est-ce que je choisis de poser mon énergie en priorité ?',
  ],
  energie: [
    'Où ai-je envie de dire oui aujourd\'hui ?',
    'Qu\'est-ce qui me motive vraiment en ce moment ?',
    'Qu\'est-ce qui me met naturellement en mouvement ?',
    'Qu\'est-ce que j\'ai envie d\'exprimer ou de créer aujourd\'hui ?',
    'Quelle action simple pourrait nourrir ma joie aujourd\'hui ?',
  ],
  presence: [
    'Qu\'est-ce que je n\'ai plus besoin de chercher à être aujourd\'hui ?',
    'Comment puis-je revenir à moi, ici et maintenant, dans ce que je fais ?',
    'Qu\'est-ce que je ressens dans mon corps en ce moment ?',
    'De quoi ai-je besoin pour être plus présent·e à ma journée ?',
  ],
  serenite: [
    'À partir de ce nouvel état de sérénité, comment est-ce que je vois ma journée ?',
    'Qu\'est-ce qui peut être vécu avec plus de douceur aujourd\'hui ?',
    'De quoi ai-je besoin pour relâcher, même partiellement ?',
  ],
  emotions: [
    'Qu\'est-ce que je ressens ici et maintenant ?',
    'Qu\'est-ce que je peux laisser être, sans lutter ?',
    'Quelle émotion j\'accueille aujourd\'hui ?',
  ],
};

function getRandomQuestion(tag) {
  const questions = JOURNAL_QUESTIONS[tag];
  if (!questions || questions.length === 0) return null;
  return questions[Math.floor(Math.random() * questions.length)];
}

/* ═══════════════════════════════════════════════════
   DEFAULT ROUTINES — Detailed exercise content
   ═══════════════════════════════════════════════════ */

const DEFAULT_ROUTINES = {
  focus: {
    id: 'focus', icon: '🔥', name: 'Focus', tag: 'focus',
    citation: 'La clarté naît du silence et de l\'intention.',
    question: 'Qu\'est-ce que je veux avoir accompli à la fin de ma journée ?\nQuelle est la première étape juste pour moi aujourd\'hui ?',
    steps: [
      {
        name: 'Méditation de centrage', mins: 5,
        desc: 'Attention sur un point précis',
        detail: `Assis·e, dos droit.

Porte ton attention sur un point précis (le souffle dans le nez ou le contact des pieds au sol).

Chaque fois que l'esprit part, reviens simplement à ce point.`,
        affirmation: '« Je suis présent, je reviens à l\'essentiel »',
        qualities: ['Clarté', 'Discernement', 'Stabilité'],
      },
      {
        name: 'Respiration focus', mins: 4,
        desc: 'Respiration carrée',
        detail: `Respiration carrée :

• 5 temps d'inspiration
• 5 temps de rétention
• 5 temps d'expiration
• 5 temps de pause

Répéter 5 cycles.

Effet recherché : rassembler l'attention, réduire la dispersion mentale.`,
        affirmation: null,
        qualities: null,
      },
      {
        name: 'Mouvement dynamique / sport', mins: 20,
        desc: 'Mouvement continu et volontaire',
        detail: `Mouvement continu et volontaire : marche rapide, cardio doux, renforcement léger.

Le corps est engagé, le rythme est régulier.

Intention : transformer l'intention en énergie disponible.

Douche : mouvement rapide et constants qui dynamise le corps.
Possibilité d'alterner plusieurs températures : eau chaude / eau froide pour réveiller le corps.`,
        affirmation: null,
        qualities: null,
      },
      {
        name: 'Affirmations positives', mins: 5,
        desc: 'Clarté et engagement',
        detail: `L'app affiche des affirmations et qualités liées à ton parcours.

Prends le temps de les lire, de les ressentir.`,
        affirmation: '« Je peux avancer avec clarté et engagement. »',
        qualities: ['Engagement', 'Persévérance', 'Confiance'],
        showDynamic: true,
      },
    ],
  },
  emotions: {
    id: 'emotions', icon: '🧭', name: 'Émotions', tag: 'emotions',
    citation: 'Ce que je ressens a le droit d\'exister pleinement.',
    question: 'Qu\'est-ce que je ressens ici et maintenant ?\nQu\'est-ce que je peux laisser être, sans lutter ?',
    steps: [
      {
        name: 'Respiration consciente', mins: 5,
        desc: 'Respiration lente, expiration longue',
        detail: `Respiration lente :

• 4 temps d'inspiration
• 6 temps d'expiration

Sans rétention.
L'expiration est plus longue que l'inspiration.

Effet : apaiser, créer de l'espace autour de l'émotion.`,
        affirmation: null,
        qualities: null,
      },
      {
        name: 'Méditation d\'accueil', mins: 7,
        desc: 'Observer l\'émotion dans le corps',
        detail: `Porte ton attention sur l'émotion présente.

Observe où elle se manifeste dans le corps (poitrine, ventre, gorge…).

Prends le temps de respirer dans cette zone sans chercher à la transformer.

Tu peux poser cette intention : "je t'autorise à être"`,
        affirmation: '« J\'accueille, je ressens mes émotions sans les bloquer et sans les nier. »',
        qualities: ['Sensibilité', 'Courage', 'Présence'],
      },
      {
        name: 'Sport doux / yoga', mins: 12,
        desc: 'Étirements lents, postures tenues',
        detail: `Étirements lents, postures tenues, mouvements fluides.

Synchroniser chaque mouvement avec la respiration.

Intention : redonner au corps sa place d'appui.`,
        affirmation: null,
        qualities: null,
      },
      {
        name: 'Mise en mouvement émotionnelle', mins: 8,
        desc: 'Mouvement libre, danse',
        detail: `Mouvement libre : laisser le corps exprimer ce qui est là. Vivre l'émotion par la danse, par le corps.

Consigne : ressentir plutôt que comprendre.

Douche : je prends le temps de nettoyer, de purifier.`,
        affirmation: null,
        qualities: null,
      },
      {
        name: 'Affirmations & qualités', mins: 5,
        desc: 'Transition douce',
        detail: `Prends le temps de lire les affirmations et qualités qui résonnent avec toi.`,
        affirmation: '« Je peux laisser être ce qui me traverse. »',
        qualities: ['Stabilité', 'Douceur', 'Lucidité'],
        showDynamic: true,
      },
    ],
  },
  energie: {
    id: 'energie', icon: '✨', name: 'Énergie', tag: 'energie',
    citation: 'Ce qui est vivant en moi a le droit de s\'exprimer.',
    question: 'Où ai-je envie de dire oui aujourd\'hui ?\nQu\'est-ce qui me motive vraiment ?',
    steps: [
      {
        name: 'Respiration d\'ancrage', mins: 4,
        desc: 'Main posée sur le ventre',
        detail: `Inspiration profonde par le nez (4 temps)
Expiration par la bouche (6 temps)

Main posée sur le ventre.

Effet : connecter l'élan au corps.`,
        affirmation: null,
        qualities: null,
      },
      {
        name: 'Échauffement', mins: 5,
        desc: 'Mobilisation douce',
        detail: `Mobilisation douce : nuque, épaules, hanches, genoux.

Mouvements circulaires, progressifs.`,
        affirmation: null,
        qualities: null,
      },
      {
        name: 'Mouvement libre / danse', mins: 12,
        desc: 'Sans objectif ni performance',
        detail: `Mettre une musique.

Laisser le corps guider le mouvement, sans objectif ni performance.`,
        affirmation: '« Ce qui est vivant en moi a le droit de s\'exprimer. »',
        qualities: ['Vitalité', 'Créativité', 'Joie'],
      },
      {
        name: 'Respiration dynamique', mins: 3,
        desc: 'Rythme soutenu mais confortable',
        detail: `Inspiration rapide par le nez (2 temps)
Expiration active par la bouche (2 temps)

Rythme soutenu mais confortable.

Effet : nourrir l'énergie sans excès.`,
        affirmation: null,
        qualities: null,
      },
    ],
  },
  presence: {
    id: 'presence', icon: '🌿', name: 'Présence', tag: 'presence',
    citation: 'Je suis présent ici et maintenant dans mon corps.',
    question: 'Qu\'est-ce que je cherche à être ?\nComment puis-je revenir à moi pour être pleinement présent aujourd\'hui ?',
    steps: [
      {
        name: 'Méditation d\'ancrage', mins: 6,
        desc: 'Attention sur les points d\'appui',
        detail: `Assis·e ou debout, attention sur les points d'appui (pieds, bassin).

Respire naturellement et nomme intérieurement ce que tu perçois : "contact", "poids", "chaleur".

Chaque pensée → retour aux appuis.`,
        affirmation: '« Je n\'ai pas besoin de chercher à être, je suis. »\n« Je suis parfaitement imparfait. »',
        qualities: ['Présence', 'Ancrage', 'Simplicité'],
      },
      {
        name: 'Respiration d\'enracinement', mins: 4,
        desc: '4 inspire / 6 expire',
        detail: `Inspiration par le nez 4 temps
Expiration par la bouche 6 temps

Main posée sur le ventre.
Répéter 6–8 cycles.

Je prends conscience de ce que je ressens là dans mon corps ici et maintenant.

Je laisse la sensation me traverser. Si je ressens un endroit de tension, je peux respirer dans la sensation avec cette intention "je t'autorise à être"`,
        affirmation: null,
        qualities: null,
      },
      {
        name: 'Visualisation du chêne', mins: 12,
        desc: 'Racines, forêt, énergie',
        detail: `Debout, je prends le temps de prendre conscience de mes pieds, de mon socle.

Je visualise des racines qui poussent de plus en plus en profondeur comme si j'étais un magnifique chêne.

Je prends le temps de m'enraciner au sein de cette forêt. Je respire profondément.

Je ressens cette énergie remonter le long de mes racines pour m'apporter enracinement et solidité.`,
        affirmation: null,
        qualities: null,
      },
      {
        name: 'Douche consciente', mins: 15,
        desc: 'Présence dans le corps',
        detail: `Choisir une variante selon l'état du jour :

Douche réconfortante (présence)
Eau tiède à chaude.
Sens le contact de l'eau sur la peau, zone par zone.
Respiration lente.
Idéale pour revenir à soi sans stimuler.

Frottement doux (présence active)
Eau tiède.
Frottements lents avec les mains ou un gant, des pieds vers le cœur.
Réveille la sensation sans accélérer.

Eau fraîche courte (ancrage)
20–30 secondes d'eau fraîche en fin de douche, sur les jambes.
Ramène instantanément ici.`,
        affirmation: null,
        qualities: null,
      },
      {
        name: 'Affirmations & qualités', mins: 5,
        desc: 'Je suis assez',
        detail: `Prends le temps de lire les affirmations et qualités qui résonnent avec toi.`,
        affirmation: '« Je n\'ai rien à prouver, je suis assez »',
        qualities: null,
        showDynamic: true,
      },
    ],
  },
  serenite: {
    id: 'serenite', icon: '🌊', name: 'Sérénité', tag: 'serenite',
    citation: 'Je prends ma place, je suis maître de mon temps.',
    question: 'À partir de ce nouvel état de sérénité, comment cela change la vision que j\'ai de ma journée ?',
    steps: [
      {
        name: 'Respiration apaisante', mins: 5,
        desc: 'Rythme 5-5-5',
        detail: `Respiration rythmée apaisante 5-5-5 :

Inspire 5 temps, retiens 5 temps, expire 5 temps.

Ralentir au fur et à mesure.
Accent sur l'expiration.

Effet recherché : activer le calme physiologique.`,
        affirmation: null,
        qualities: null,
      },
      {
        name: 'Méditation de sécurité intérieure', mins: 7,
        desc: 'Lieu sûr, image ressource',
        detail: `Exercice d'ancrage :

Prendre le temps de respirer profondément.

Visualiser un endroit qui amène du lâcher-prise, de la sérénité, de la détente. Vous êtes libre de vous y plonger pleinement, de marcher, de voyager, d'explorer cet endroit.

Prenez conscience de toutes vos sensations : visuelles, kinesthésiques, auditives, olfactives lorsque vous vous trouvez dans cet endroit.

Associez ce lieu à une couleur ou à une image inspirante.`,
        affirmation: '« Je me sens en sécurité à l\'intérieur de moi-même, tout va bien »',
        qualities: ['Calme', 'Stabilité', 'Discernement'],
      },
      {
        name: 'Mouvement doux / étirements', mins: 12,
        desc: 'Étirements lents, expire long',
        detail: `Étirements lents, postures tenues.

Expire longuement à chaque relâchement.

Aucun objectif de performance.

Intention : détendre sans forcer.`,
        affirmation: null,
        qualities: null,
      },
      {
        name: 'Douche réconfortante', mins: 15,
        desc: 'Eau chaude, soutien',
        detail: `Eau chaude, enveloppante.

Visualise l'eau comme un soutien.

Idéale pour l'anxiété et la fatigue émotionnelle.

Renforce le sentiment de contenance.`,
        affirmation: null,
        qualities: null,
      },
      {
        name: 'Affirmations & qualités', mins: 5,
        desc: 'Sécurité intérieure',
        detail: `Prends le temps de lire les affirmations et qualités qui résonnent avec toi.`,
        affirmation: '« Je suis en sécurité à l\'intérieur de moi-même. J\'ai le droit et je mérite de me faire du bien et de prendre soin de moi »',
        qualities: ['Patience', 'Douceur', 'Confiance'],
        showDynamic: true,
      },
    ],
  },
};

/* ═══════════════════════════════════════════════════
   DEFAULT AFFIRMATIONS & QUALITÉS
   ═══════════════════════════════════════════════════ */

const DEFAULT_AFFS = [
  { id: 1, text: 'Je suis présent, je reviens à l\'essentiel.', tags: ['focus','presence'], fav: true, preset: true },
  { id: 2, text: 'Je n\'ai pas besoin de chercher à être, je suis.', tags: ['presence'], fav: true, preset: true },
  { id: 3, text: 'J\'accueille mes émotions sans les bloquer et sans les nier.', tags: ['emotions'], fav: false, preset: true },
  { id: 4, text: 'Ce qui est vivant en moi a le droit de s\'exprimer.', tags: ['energie'], fav: false, preset: true },
  { id: 5, text: 'Je suis en sécurité à l\'intérieur de moi-même.', tags: ['serenite'], fav: true, preset: true },
  { id: 6, text: 'Je peux avancer avec clarté et engagement.', tags: ['focus'], fav: false, preset: true },
  { id: 7, text: 'Je n\'ai rien à prouver, je suis assez.', tags: ['presence'], fav: true, preset: true },
  { id: 8, text: 'Je peux laisser être ce qui me traverse.', tags: ['emotions','serenite'], fav: false, preset: true },
  { id: 9, text: 'Je me sens en sécurité à l\'intérieur de moi-même, tout va bien.', tags: ['serenite'], fav: false, preset: true },
  { id: 10, text: 'Je suis parfaitement imparfait.', tags: ['presence'], fav: false, preset: true },
  { id: 11, text: 'J\'ai le droit et je mérite de prendre soin de moi.', tags: ['serenite','presence'], fav: false, preset: true },
];

const DEFAULT_QUALS = [
  { id: 101, name: 'Clarté', tags: ['focus'], fav: true, preset: true },
  { id: 102, name: 'Discernement', tags: ['focus','serenite'], fav: false, preset: true },
  { id: 103, name: 'Stabilité', tags: ['focus','serenite','emotions'], fav: false, preset: true },
  { id: 104, name: 'Présence', tags: ['presence','emotions'], fav: true, preset: true },
  { id: 105, name: 'Ancrage', tags: ['presence'], fav: false, preset: true },
  { id: 106, name: 'Simplicité', tags: ['presence'], fav: false, preset: true },
  { id: 107, name: 'Sensibilité', tags: ['emotions'], fav: false, preset: true },
  { id: 108, name: 'Courage', tags: ['emotions'], fav: true, preset: true },
  { id: 109, name: 'Douceur', tags: ['serenite','emotions'], fav: false, preset: true },
  { id: 110, name: 'Vitalité', tags: ['energie'], fav: true, preset: true },
  { id: 111, name: 'Créativité', tags: ['energie'], fav: false, preset: true },
  { id: 112, name: 'Joie', tags: ['energie'], fav: false, preset: true },
  { id: 113, name: 'Patience', tags: ['serenite'], fav: false, preset: true },
  { id: 114, name: 'Confiance', tags: ['serenite','focus'], fav: false, preset: true },
  { id: 115, name: 'Lucidité', tags: ['emotions','focus'], fav: false, preset: true },
  { id: 116, name: 'Engagement', tags: ['focus'], fav: false, preset: true },
  { id: 117, name: 'Persévérance', tags: ['focus','energie'], fav: false, preset: true },
  { id: 118, name: 'Calme', tags: ['serenite','presence'], fav: false, preset: true },
];

const MONTHS = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
const ICONS = ['◎','☽','△','♢','⟡','○','⊹'];
const SOUNDS = [
  { id: 'bol', label: 'Bol tibétain' },
  { id: 'carillon', label: 'Carillon doux' },
  { id: 'pluie', label: 'Pluie légère' },
];


/* ═══════════════════════════════════════════════════
   UTILITY COMPONENTS
   ═══════════════════════════════════════════════════ */

function MountainBg({ height = 120, opacity = 0.4 }) {
  return (
    <svg viewBox="0 0 375 120" className="mountain-bg" style={{ height, opacity }}>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d8d0c4" />
          <stop offset="100%" stopColor="#c0b8ac" />
        </linearGradient>
        <linearGradient id="fog" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F6F3ED" stopOpacity="0" />
          <stop offset="100%" stopColor="#F6F3ED" stopOpacity=".95" />
        </linearGradient>
      </defs>
      <rect width="375" height="120" fill="url(#sky)" />
      <circle cx="280" cy="28" r="10" fill="#e0d4c4" opacity=".4" />
      <path d="M0 70 L40 50 L80 60 L130 35 L170 48 L220 30 L260 42 L310 34 L375 40 L375 120 L0 120Z" fill="#c8bfb2" opacity=".35" />
      <path d="M0 85 L50 68 L110 76 L180 55 L240 68 L310 58 L375 64 L375 120 L0 120Z" fill="#b8ada0" opacity=".4" />
      <path d="M0 98 L60 84 L140 92 L220 78 L300 86 L375 80 L375 120 L0 120Z" fill="#a09488" opacity=".35" />
      <rect y="90" width="375" height="30" fill="url(#fog)" />
    </svg>
  );
}

function Toast({ message, visible }) {
  if (!visible) return null;
  return <div className="toast"><span className="toast-icon">✓</span><span className="toast-text">{message}</span></div>;
}

function TagPill({ tag, active, small, onClick }) {
  const m = TAG_META[tag];
  if (!m) return null;
  const style = {
    background: active ? m.color + '18' : 'transparent',
    borderColor: active ? m.color + '40' : 'rgba(44,44,44,0.06)',
  };
  return (
    <div className={`tag-pill ${small ? 'small' : ''}`} style={style} onClick={onClick}>
      <span className="tag-icon">{m.icon}</span>
      <span className="tag-text">{m.label}</span>
    </div>
  );
}

function TabBar({ active, onTab }) {
  const tabs = [
    { id: 'accueil',      icon: '◎', label: 'ACCUEIL' },
    { id: 'routines',     icon: '☰', label: 'ROUTINES' },
    { id: 'journal',      icon: '✎', label: 'JOURNAL' },
    { id: 'affirmations', icon: '✦', label: 'AFFIRM.' },
    { id: 'reveil',       icon: '⏱', label: 'RÉVEIL' },
    { id: 'profil',       icon: '⚙', label: 'PROFIL' },
  ];
  return (
    <div className="tab-bar">
      {tabs.map(t => (
        <div key={t.id} className="tab-item" onClick={() => onTab(t.id)}
          style={{ opacity: active === t.id ? 1 : 0.3 }}>
          <span className="tab-icon">{t.icon}</span>
          <span className="tab-label">{t.label}</span>
        </div>
      ))}
    </div>
  );
}

function StepRow({ step, index, total, onMove, onAdjust, onRemove, onEdit, isEditing, onSave }) {
  return (
    <div className="step-row">
      <div className="step-arrows">
        <span className="step-arrow" onClick={() => onMove(index, -1)} style={{ opacity: index === 0 ? 0.1 : 0.35 }}>▲</span>
        <span className="step-arrow" onClick={() => onMove(index, 1)} style={{ opacity: index === total - 1 ? 0.1 : 0.35 }}>▼</span>
      </div>
      <span className="step-num">{index + 1}</span>
      <div className="step-content">
        {isEditing ? (
          <>
            <input autoFocus defaultValue={step.name} className="input-edit-step"
              onBlur={e => onSave(index, 'name', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && onSave(index, 'name', e.target.value)} />
            <input defaultValue={step.desc} className="input-edit-step desc" placeholder="Description…"
              onBlur={e => onSave(index, 'desc', e.target.value)} />
          </>
        ) : (
          <div onClick={() => onEdit(index)} style={{ cursor: 'text' }}>
            <div className="step-name">{step.name}</div>
            {step.desc && <div className="step-desc">{step.desc}</div>}
          </div>
        )}
      </div>
      <div className="step-duration">
        <button className="step-dur-btn" onClick={() => onAdjust(index, -1)}>−</button>
        <span className="step-dur-val">{step.mins}'</span>
        <button className="step-dur-btn" onClick={() => onAdjust(index, 1)}>+</button>
      </div>
      {total > 1 && <button className="step-delete" onClick={() => onRemove(index)}>✕</button>}
    </div>
  );
}


/* ═══════════════════════════════════════════════════
   ACCUEIL SCREEN — Check-in flow + Timer execution
   ═══════════════════════════════════════════════════ */

function AccueilScreen({ routines, affs, quals, onGoRoutines, onGoAffirmations, onGoJournal, onBesoinChange, directLaunchRoutine, clearDirectLaunch }) {
  const [step, setStep] = useState(0);
  const [mood, setMood] = useState(null);
  const [besoin, setBesoin] = useState(null);

  // Timer state
  const [executing, setExecuting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [paused, setPaused] = useState(false);
  const [completed, setCompleted] = useState(false);
  const timerRef = useRef(null);

  // Forced routine for direct launch from RoutinesScreen
  const [forcedRoutine, setForcedRoutine] = useState(null);
  const activeRoutine = forcedRoutine || (besoin ? (routines.find(r => r.tag === besoin) || routines[0]) : null);

  // Handle directLaunchRoutine from RoutinesScreen
  useEffect(() => {
    if (directLaunchRoutine) {
      setForcedRoutine(directLaunchRoutine);
      setBesoin(directLaunchRoutine.tag);
      setStep(4); // Go directly to routine preview
      clearDirectLaunch();
    }
  }, [directLaunchRoutine]);

  // Timer logic
  useEffect(() => {
    if (!executing || paused || completed) {
      clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          const r = activeRoutine;
          if (currentStep < r.steps.length - 1) {
            setCurrentStep(cs => cs + 1);
            return r.steps[currentStep + 1].mins * 60;
          } else {
            setCompleted(true);
            clearInterval(timerRef.current);
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [executing, paused, completed, currentStep, activeRoutine]);

  const startRoutine = () => {
    if (!activeRoutine || !activeRoutine.steps.length) return;
    setCurrentStep(0);
    setSecondsLeft(activeRoutine.steps[0].mins * 60);
    setPaused(false);
    setCompleted(false);
    setExecuting(true);
  };

  const skipStep = () => {
    const r = activeRoutine;
    if (currentStep < r.steps.length - 1) {
      setCurrentStep(cs => cs + 1);
      setSecondsLeft(r.steps[currentStep + 1].mins * 60);
    } else {
      setCompleted(true);
    }
  };

  const resetFlow = () => {
    setStep(0); setMood(null); setBesoin(null); setForcedRoutine(null);
    setExecuting(false); setCompleted(false);
    setCurrentStep(0); setSecondsLeft(0); setPaused(false);
  };

  const ts = new Date().getHours().toString().padStart(2, '0') + ':' + new Date().getMinutes().toString().padStart(2, '0');

  /* ── Timer Execution View ── */
  if (executing && !completed) {
    const r = activeRoutine;
    const s = r.steps[currentStep];
    const totalSec = s.mins * 60;
    const progress = totalSec > 0 ? ((totalSec - secondsLeft) / totalSec) * 100 : 0;
    const mm = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
    const ss = (secondsLeft % 60).toString().padStart(2, '0');

    return (
      <div className="screen exec-screen">
        <MountainBg height={80} opacity={0.15} />
        <div className="exec-inner">
          {/* Header */}
          <div className="exec-header">
            <div className="exec-step-label">
              ÉTAPE {currentStep + 1} / {r.steps.length}
            </div>
            <div className="exec-step-name">{s.name}</div>
            <div className="exec-step-desc">{s.desc}</div>
            <div className="exec-timer-row">
              <div className="exec-timer">{mm}:{ss}</div>
            </div>
            <div className="timer-progress">
              <div className="timer-progress-fill" style={{ width: progress + '%' }} />
            </div>
          </div>

          {/* Scrollable body: exercise detail + affirmations + qualities */}
          <div className="exec-body">
            {/* Exercise detail */}
            {s.detail && (
              <div className="exec-detail-box">
                <div className="exec-detail-text">{s.detail}</div>
              </div>
            )}

            {/* Single hardcoded affirmation only */}
            {s.affirmation && (
              <div className="exec-aff-light">
                <div className="exec-section-label">AFFIRMATION</div>
                <div className="exec-aff-text">{s.affirmation}</div>
              </div>
            )}

            {/* Single hardcoded qualities list only */}
            {s.qualities && s.qualities.length > 0 && (
              <div className="exec-qual-light">
                <div className="exec-section-label">QUALITÉS</div>
                <div className="exec-qual-text">{s.qualities.join(' · ')}</div>
              </div>
            )}

            {/* Link to affirmations tab */}
            {(s.affirmation || (s.qualities && s.qualities.length > 0)) && (
              <div className="exec-aff-link" onClick={() => onGoAffirmations()}>
                Voir mes affirmations & qualités →
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="exec-controls">
            <button className="btn-secondary" onClick={() => setPaused(!paused)}>
              {paused ? 'REPRENDRE' : 'PAUSE'}
            </button>
            <button className="btn-primary" onClick={skipStep}>SUIVANT</button>
            <button className="btn-secondary" onClick={resetFlow}>ARRÊTER</button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Completed View ── */
  if (completed) {
    return (
      <div className="screen center-screen">
        <MountainBg height={100} opacity={0.2} />
        <div className="center-content">
          <div style={{ fontSize: 32, marginBottom: 20, opacity: 0.6 }}>✓</div>
          <div className="title-serif" style={{ fontSize: 26, marginBottom: 8 }}>Bravo.</div>
          <div className="subtitle-serif" style={{ marginBottom: 36 }}>
            Ta routine est terminée.{'\n'}Passe une belle journée.
          </div>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-secondary" onClick={resetFlow}>RETOUR</button>
            <button className="btn-primary" onClick={() => { resetFlow(); onGoJournal(); }}>J'ÉCRIS MON JOURNAL</button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Step 0: Mood ── */
  if (step === 0) return (
    <div className="screen" style={{ display: 'flex', flexDirection: 'column' }}>
      <MountainBg height={120} opacity={0.4} />
      <div className="screen-inner" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ paddingTop: 80, textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--sans)', fontWeight: 300, fontSize: 12, letterSpacing: 3, color: 'var(--text-soft)', opacity: 0.4 }}>{ts}</div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div className="title-serif" style={{ fontSize: 26, marginBottom: 48 }}>
            Comment te sens-tu{'\n'}ce matin ?
          </div>
          <div className="mood-grid">
            {MOODS.map(m => (
              <div key={m} className="mood-card" onClick={() => { setMood(m); setStep(1); }}>{m}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  /* ── Step 1: Affirmation based on mood ── */
  if (step === 1) {
    const aff = MOOD_AFFIRMATIONS[mood] || MOOD_AFFIRMATIONS['Calme'];
    return (
      <div className="screen center-screen" onClick={() => setStep(2)} style={{ cursor: 'pointer', padding: '0 36px' }}>
        <MountainBg height={110} opacity={0.25} />
        <div className="center-content">
          <div className="small-label" style={{ marginBottom: 24 }}>{mood}</div>
          <div className="title-serif" style={{ fontSize: 24, whiteSpace: 'pre-line' }}>{aff}</div>
          <div className="divider" style={{ margin: '28px auto 0' }} />
          <div className="small-label" style={{ marginTop: 16, opacity: 0.3 }}>Toucher pour continuer</div>
        </div>
      </div>
    );
  }

  /* ── Step 2: Besoin ── */
  if (step === 2) return (
    <div className="screen" style={{ display: 'flex', flexDirection: 'column' }}>
      <MountainBg height={90} opacity={0.25} />
      <div className="screen-inner" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ paddingTop: 74, textAlign: 'center', marginBottom: 4 }}>
          <div className="small-label" style={{ opacity: 0.5 }}>Humeur : {mood}</div>
        </div>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div className="title-serif" style={{ fontSize: 23 }}>
            De quoi as-tu le plus{'\n'}besoin aujourd'hui ?
          </div>
        </div>
        <div className="besoin-list">
          {BESOINS.map(b => (
            <div key={b.id} className="besoin-card" onClick={() => { setBesoin(b.id); onBesoinChange(b.id); setStep(3); }}>
              <span className="besoin-icon">{b.icon}</span>
              <div>
                <div className="besoin-label">{b.label}</div>
                <div className="besoin-sub">{b.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /* ── Step 3: Citation ── */
  if (step === 3) return (
    <div className="screen center-screen" onClick={() => setStep(4)} style={{ cursor: 'pointer', padding: '0 40px' }}>
      <MountainBg height={100} opacity={0.2} />
      <div className="center-content">
        <div className="title-serif" style={{ fontSize: 27, whiteSpace: 'pre-line' }}>
          {CITATIONS[besoin] || CITATIONS.presence}
        </div>
        <div className="divider" style={{ margin: '24px auto 0' }} />
        <div className="small-label" style={{ marginTop: 16, opacity: 0.3 }}>Toucher pour continuer</div>
      </div>
    </div>
  );

  /* ── Step 4: Routine preview ── */
  const r = activeRoutine;
  const tot = r ? r.steps.reduce((s, a) => s + a.mins, 0) : 0;
  const bl = BESOINS.find(b => b.id === besoin)?.label || (r ? r.name : '');

  return (
    <div className="screen" style={{ display: 'flex', flexDirection: 'column' }}>
      <MountainBg height={70} opacity={0.2} />
      <div className="screen-inner" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ paddingTop: 70, textAlign: 'center', marginBottom: 4 }}>
          <div className="title-serif" style={{ fontSize: 21 }}>{forcedRoutine ? r.name : 'Ta routine'}</div>
          <div className="small-label" style={{ marginTop: 6 }}>{forcedRoutine ? '' : bl + ' · '}{tot} min</div>
          <div className="divider" />
        </div>
        <div style={{ flex: 1, overflowY: 'auto', paddingTop: 8 }}>
          {r && r.steps.map((a, i) => (
            <div key={i} className="preview-step">
              <div className="preview-num">{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div className="preview-name">{a.name}</div>
                <div className="preview-desc">{a.desc}</div>
              </div>
              <div className="preview-mins">{a.mins}'</div>
            </div>
          ))}
        </div>
        <div className="bottom-actions">
          <button className="btn-secondary" onClick={() => onGoRoutines()}>MODIFIER</button>
          <button className="btn-primary" onClick={startRoutine}>LANCER</button>
          <button className="btn-secondary" onClick={resetFlow}>RETOUR</button>
        </div>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════
   JOURNAL SCREEN
   ═══════════════════════════════════════════════════ */

function JournalScreen({ besoin }) {
  const [text, setText] = useState('');
  const [entries, setEntries] = useState(() => Store.get('journal', []));
  const [toast, setToast] = useState(null);
  const [question] = useState(() => besoin ? getRandomQuestion(besoin) : null);

  useEffect(() => { Store.set('journal', entries); }, [entries]);

  const handleSave = () => {
    if (!text.trim()) return;
    const now = new Date();
    const d = now.getDate();
    const m = MONTHS[now.getMonth()];
    const y = now.getFullYear();
    const entry = { id: Date.now(), date: `${d} ${m} ${y}`, text: text.trim(), q: question || '' };
    setEntries(prev => [entry, ...prev]);
    setText('');
    setToast('Entrée sauvegardée');
    setTimeout(() => setToast(null), 1800);
  };

  const deleteEntry = (id) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  return (
    <div className="screen">
      <MountainBg height={60} opacity={0.12} />
      <Toast message={toast} visible={!!toast} />
      <div className="screen-inner" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ paddingTop: 64, textAlign: 'center', marginBottom: 12 }}>
          <div className="screen-title">Journal</div>
          <div className="screen-subtitle">ÉCRITURE LIBRE</div>
        </div>

        {/* Dynamic question based on besoin */}
        {question && (
          <div style={{ textAlign: 'center', marginBottom: 14 }}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 17, fontStyle: 'italic', fontWeight: 300, color: 'var(--anthracite)', lineHeight: 1.6, opacity: 0.7 }}>
              {question}
            </div>
            <div className="divider" />
          </div>
        )}

        {/* Write zone */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <span className="journal-dash">—</span>
          <textarea className="journal-textarea" value={text} onChange={e => setText(e.target.value)}
            placeholder="Écris ici ce qui te traverse…" rows={4} />
        </div>

        {text.trim() && (
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <button className="btn-primary" onClick={handleSave}>SAUVEGARDER</button>
          </div>
        )}

        <div className="divider" />

        {/* Entries */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {entries.length === 0 ? (
            <div className="empty-state">Ton journal est vide pour le moment.</div>
          ) : entries.map(e => (
            <div key={e.id} className="journal-entry">
              <div className="journal-entry-header">
                <span className="journal-entry-date">{e.date}</span>
                <span style={{ fontSize: 14, color: 'var(--text-soft)', opacity: 0.2, cursor: 'pointer' }}
                  onClick={() => deleteEntry(e.id)}>✕</span>
              </div>
              {e.q && <div className="journal-entry-q">{e.q}</div>}
              <div className="journal-entry-a">{e.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════
   ROUTINES SCREEN — with save modal for presets
   ═══════════════════════════════════════════════════ */

function RoutinesScreen({ routines, setRoutines, onLaunchRoutine }) {
  const [view, setView] = useState('list');
  const [detailId, setDetailId] = useState(null);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState(null);

  // Save modal state
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveChoice, setSaveChoice] = useState('overwrite'); // 'overwrite' | 'copy'

  // Create state
  const [newName, setNewName] = useState('');
  const [newTag, setNewTag] = useState(null);
  const [newIcon, setNewIcon] = useState('◎');
  const [createSteps, setCreateSteps] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [newCitation, setNewCitation] = useState('');
  const [editingCreate, setEditingCreate] = useState(null);

  const detail = routines.find(r => r.id === detailId);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 1800); };

  const moveStep = (routineId, index, dir) => {
    setRoutines(prev => prev.map(r => {
      if (r.id !== routineId) return r;
      const s = [...r.steps]; const t = index + dir;
      if (t < 0 || t >= s.length) return r;
      [s[index], s[t]] = [s[t], s[index]];
      return { ...r, steps: s };
    }));
  };

  const adjustDuration = (routineId, index, delta) => {
    setRoutines(prev => prev.map(r => {
      if (r.id !== routineId) return r;
      return { ...r, steps: r.steps.map((s, i) => i === index ? { ...s, mins: Math.max(1, Math.min(60, s.mins + delta)) } : s) };
    }));
  };

  const removeStep = (routineId, index) => {
    setRoutines(prev => prev.map(r => {
      if (r.id !== routineId || r.steps.length <= 1) return r;
      return { ...r, steps: r.steps.filter((_, i) => i !== index) };
    }));
  };

  const addStep = (routineId) => {
    setRoutines(prev => prev.map(r => {
      if (r.id !== routineId) return r;
      return { ...r, steps: [...r.steps, { name: 'Nouvelle étape', mins: 5, desc: '' }] };
    }));
  };

  const saveStepField = (routineId, index, field, value) => {
    setRoutines(prev => prev.map(r => {
      if (r.id !== routineId) return r;
      return { ...r, steps: r.steps.map((s, i) => i === index ? { ...s, [field]: value || s[field] } : s) };
    }));
    setEditing(null);
  };

  // Handle save for preset routines
  const handleSave = () => {
    if (detail && !detail.custom) {
      // Preset routine: show modal
      setShowSaveModal(true);
      setSaveChoice('overwrite');
    } else {
      // Custom routine: direct save
      showToast('Routine enregistrée');
    }
  };

  const confirmSave = () => {
    if (saveChoice === 'overwrite') {
      showToast('Parcours mis à jour');
    } else {
      // Save as copy
      const copy = {
        ...detail,
        id: 'custom_' + Date.now(),
        name: detail.name + ' (copie)',
        custom: true,
        steps: detail.steps.map(s => ({ ...s })),
      };
      setRoutines(prev => [...prev, copy]);
      showToast('Copie indépendante créée');
    }
    setShowSaveModal(false);
  };

  // Create helpers
  const mvCreate = (i, d) => { const s = [...createSteps]; const t = i + d; if (t < 0 || t >= s.length) return; [s[i], s[t]] = [s[t], s[i]]; setCreateSteps(s); };
  const adjCreate = (i, d) => setCreateSteps(p => p.map((s, j) => j === i ? { ...s, mins: Math.max(1, Math.min(60, s.mins + d)) } : s));
  const rmCreate = (i) => { if (createSteps.length <= 1) return; setCreateSteps(p => p.filter((_, j) => j !== i)); };
  const saveCreateField = (i, field, val) => { setCreateSteps(p => p.map((s, j) => j === i ? { ...s, [field]: val || s[field] } : s)); setEditingCreate(null); };

  const createRoutine = () => {
    if (!newName.trim()) return;
    const newR = {
      id: 'custom_' + Date.now(),
      icon: newIcon,
      name: newName.trim(),
      tag: newTag,
      steps: [...createSteps],
      citation: newCitation || null,
      question: newQuestion || null,
      custom: true,
    };
    setRoutines(prev => [...prev, newR]);
    showToast('Routine créée');
    setTimeout(() => setView('list'), 400);
  };

  const deleteRoutine = (id) => {
    setRoutines(prev => prev.filter(r => r.id !== id));
    setView('list');
    showToast('Routine supprimée');
  };

  /* ── LIST VIEW ── */
  if (view === 'list') return (
    <div className="screen">
      <MountainBg height={80} opacity={0.2} />
      <Toast message={toast} visible={!!toast} />
      <div className="screen-inner" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ paddingTop: 68, textAlign: 'center', marginBottom: 12 }}>
          <div className="screen-title">Mes routines</div>
          <div className="screen-subtitle">{routines.length} PARCOURS</div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {routines.map(r => {
            const tot = r.steps.reduce((s, a) => s + a.mins, 0);
            return (
              <div key={r.id} className="routine-item" onClick={() => { setDetailId(r.id); setView('detail'); }}>
                <span className="routine-icon">{r.icon}</span>
                <div style={{ flex: 1 }}>
                  <div className="routine-name-row">
                    <span className="routine-name">{r.name}</span>
                    {r.tag && <TagPill tag={r.tag} active small />}
                    {r.custom ? <span className="badge-perso">PERSO</span> : <span className="badge-pre">PRÉ.</span>}
                  </div>
                  <div className="routine-meta">{r.steps.length} activités · {tot} min</div>
                </div>
                <span className="routine-chevron">›</span>
              </div>
            );
          })}
        </div>
        <div style={{ paddingBottom: 10, textAlign: 'center' }}>
          <div className="btn-terre" onClick={() => {
            setView('create'); setNewName(''); setNewTag(null); setNewIcon('◎');
            setCreateSteps([{ name: 'Nouvelle étape', mins: 5, desc: '' }]);
            setNewQuestion(''); setNewCitation('');
          }}>+ CRÉER UNE ROUTINE</div>
        </div>
      </div>
    </div>
  );

  /* ── CREATE VIEW ── */
  if (view === 'create') {
    const cTotal = createSteps.reduce((s, a) => s + a.mins, 0);
    return (
      <div className="screen">
        <Toast message={toast} visible={!!toast} />
        <div className="screen-inner" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ paddingTop: 66 }}>
            <div className="back-btn" onClick={() => setView('list')}>← Routines</div>
            <div style={{ textAlign: 'center', marginBottom: 4 }}>
              <div className="screen-title">Créer une routine</div>
              <div className="divider" />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', paddingTop: 4 }}>
            {/* Name & Identity */}
            <div className="form-section">
              <div className="form-label">NOM & IDENTITÉ</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div className="form-sublabel" style={{ minWidth: 44 }}>Icône</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {ICONS.map(ic => (
                    <div key={ic} className={`icon-choice ${newIcon === ic ? 'active' : ''}`}
                      onClick={() => setNewIcon(ic)}>{ic}</div>
                  ))}
                </div>
              </div>
              <input className="input-terre" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nom de la routine…" style={{ marginBottom: 12 }} />
              <div className="form-sublabel" style={{ marginBottom: 8 }}>BESOIN ASSOCIÉ (optionnel)</div>
              <div className="tag-row">
                <div className={`tag-none ${newTag === null ? 'active' : ''}`} onClick={() => setNewTag(null)}>Aucun</div>
                {Object.keys(TAG_META).map(t => <TagPill key={t} tag={t} small active={newTag === t} onClick={() => setNewTag(newTag === t ? null : t)} />)}
              </div>
            </div>

            {/* Steps */}
            <div style={{ padding: '12px 0 8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div className="form-label" style={{ marginBottom: 0 }}>ÉTAPES</div>
                <div className="form-sublabel">{createSteps.length} étape{createSteps.length > 1 ? 's' : ''} · {cTotal} min</div>
              </div>
              {createSteps.map((s, i) => (
                <StepRow key={i} step={s} index={i} total={createSteps.length}
                  onMove={mvCreate} onAdjust={adjCreate} onRemove={rmCreate}
                  onEdit={setEditingCreate} isEditing={editingCreate === i}
                  onSave={(idx, field, val) => saveCreateField(idx, field, val)} />
              ))}
              <div className="add-step-btn" onClick={() => setCreateSteps(p => [...p, { name: 'Nouvelle étape', mins: 5, desc: '' }])}>
                <span className="add-icon">+</span>
                <span>Ajouter une étape</span>
              </div>
            </div>

            {/* Question */}
            <div className="form-section">
              <div className="form-label">QUESTION JOURNAL (optionnel)</div>
              <input className="input-bg" value={newQuestion} onChange={e => setNewQuestion(e.target.value)} placeholder="Question de clôture…" />
            </div>

            {/* Citation */}
            <div className="form-section">
              <div className="form-label">CITATION D'OUVERTURE (optionnel)</div>
              <input className="input-bg" value={newCitation} onChange={e => setNewCitation(e.target.value)} placeholder="Une phrase pour ouvrir ta routine…" />
            </div>
          </div>

          <div className="bottom-actions">
            <button className="btn-secondary" onClick={() => setView('list')}>ANNULER</button>
            <button className={`btn-primary ${!newName.trim() ? 'disabled' : ''}`} onClick={createRoutine}>CRÉER</button>
          </div>
        </div>
      </div>
    );
  }

  /* ── DETAIL VIEW ── */
  if (view === 'detail' && detail) {
    const tot = detail.steps.reduce((s, a) => s + a.mins, 0);
    return (
      <div className="screen">
        <Toast message={toast} visible={!!toast} />

        {/* Save Modal for preset routines */}
        {showSaveModal && (
          <div className="overlay">
            <div className="overlay-bg" onClick={() => setShowSaveModal(false)} />
            <div className="overlay-panel">
              <div className="modal-title">Enregistrer les modifications</div>

              <div onClick={() => setSaveChoice('overwrite')} className="radio-row">
                <div className={`radio-outer ${saveChoice === 'overwrite' ? 'active' : ''}`}>
                  {saveChoice === 'overwrite' && <div className="radio-inner" />}
                </div>
                <div>
                  <div className="radio-label">Mettre à jour le parcours</div>
                  <div className="radio-desc">Les modifications s'appliquent au parcours existant</div>
                </div>
              </div>

              <div onClick={() => setSaveChoice('copy')} className="radio-row">
                <div className={`radio-outer ${saveChoice === 'copy' ? 'active' : ''}`}>
                  {saveChoice === 'copy' && <div className="radio-inner" />}
                </div>
                <div>
                  <div className="radio-label">Enregistrer comme copie</div>
                  <div className="radio-desc">Crée une routine personnelle indépendante</div>
                </div>
              </div>

              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setShowSaveModal(false)}>ANNULER</button>
                <button className="btn-primary" onClick={confirmSave}>ENREGISTRER</button>
              </div>
            </div>
          </div>
        )}

        <div className="screen-inner" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ paddingTop: 66 }}>
            <div className="back-btn" onClick={() => { setView('list'); setEditing(null); }}>← Routines</div>
            <div className="detail-header">
              <span className="detail-icon">{detail.icon}</span>
              <div className="detail-name">{detail.name}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              {detail.tag && <TagPill tag={detail.tag} active small />}
              {detail.custom ? <span className="badge-perso">PERSONNELLE</span> : <span className="badge-pre">PRÉ-ENREGISTRÉ</span>}
            </div>
            <div className="routine-meta">{detail.steps.length} activités · {tot} min</div>
            <div className="divider" style={{ margin: '8px 0' }} />
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {detail.steps.map((s, i) => (
              <StepRow key={i} step={s} index={i} total={detail.steps.length}
                onMove={(idx, dir) => moveStep(detail.id, idx, dir)}
                onAdjust={(idx, d) => adjustDuration(detail.id, idx, d)}
                onRemove={(idx) => removeStep(detail.id, idx)}
                onEdit={setEditing} isEditing={editing === i}
                onSave={(idx, field, val) => saveStepField(detail.id, idx, field, val)} />
            ))}
            <div className="add-step-btn" onClick={() => addStep(detail.id)}>
              <span className="add-icon">+</span>
              <span>Ajouter une étape</span>
            </div>
          </div>

          <div className="bottom-actions">
            {detail.custom && (
              <button className="btn-secondary danger" onClick={() => deleteRoutine(detail.id)}>SUPPRIMER</button>
            )}
            <button className="btn-primary" onClick={handleSave}>ENREGISTRER</button>
            <button className="btn-primary" onClick={() => onLaunchRoutine(detail)}>LANCER</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}


/* ═══════════════════════════════════════════════════
   RÉVEIL SCREEN
   ═══════════════════════════════════════════════════ */

function ReveilScreen({ onStartRoutine }) {
  const [alarmOn, setAlarmOn] = useState(() => Store.get('alarm_on', false));
  const [hour, setHour] = useState(() => Store.get('alarm_h', 6));
  const [minute, setMinute] = useState(() => Store.get('alarm_m', 0));
  const [sound, setSound] = useState(() => Store.get('alarm_sound', 'bol'));
  const [ringing, setRinging] = useState(false);

  useEffect(() => { Store.set('alarm_on', alarmOn); }, [alarmOn]);
  useEffect(() => { Store.set('alarm_h', hour); }, [hour]);
  useEffect(() => { Store.set('alarm_m', minute); }, [minute]);
  useEffect(() => { Store.set('alarm_sound', sound); }, [sound]);

  // Check alarm
  useEffect(() => {
    if (!alarmOn) return;
    const check = setInterval(() => {
      const now = new Date();
      if (now.getHours() === hour && now.getMinutes() === minute) {
        setRinging(true);
      }
    }, 10000);
    return () => clearInterval(check);
  }, [alarmOn, hour, minute]);

  if (ringing) {
    return (
      <div className="screen center-screen">
        <MountainBg height={100} opacity={0.2} />
        <div className="center-content">
          <div className="ringing-icon">◎</div>
          <div className="title-serif" style={{ fontSize: 28, marginBottom: 12 }}>Réveil</div>
          <div className="subtitle-serif" style={{ marginBottom: 36 }}>
            Il est temps de commencer{'\n'}ta routine.
          </div>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
            <button className="btn-secondary" onClick={() => setRinging(false)}>REPORTER</button>
            <button className="btn-primary" onClick={() => { setRinging(false); onStartRoutine(); }}>COMMENCER</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="screen center-screen">
      <MountainBg height={80} opacity={0.15} />
      <div className="center-content">
        <div className="screen-title" style={{ marginBottom: 32 }}>Réveil</div>

        {/* Toggle */}
        <div className="reveil-toggle" onClick={() => setAlarmOn(!alarmOn)}>
          <div className={`toggle-track ${alarmOn ? 'active' : ''}`}>
            <div className="toggle-thumb" />
          </div>
          <span className="toggle-label">{alarmOn ? 'Activé' : 'Désactivé'}</span>
        </div>

        {/* Time picker */}
        {alarmOn && (
          <>
            <div className="time-picker">
              <div className="time-col">
                <span className="time-arrow" onClick={() => setHour(h => (h + 1) % 24)}>▲</span>
                <span className="time-val">{hour.toString().padStart(2, '0')}</span>
                <span className="time-arrow" onClick={() => setHour(h => (h - 1 + 24) % 24)}>▼</span>
              </div>
              <span className="time-sep">:</span>
              <div className="time-col">
                <span className="time-arrow" onClick={() => setMinute(m => (m + 5) % 60)}>▲</span>
                <span className="time-val">{minute.toString().padStart(2, '0')}</span>
                <span className="time-arrow" onClick={() => setMinute(m => (m - 5 + 60) % 60)}>▼</span>
              </div>
            </div>

            {/* Sound selection */}
            <div className="sound-section">
              <div className="form-label" style={{ textAlign: 'center', marginBottom: 12 }}>SON DE RÉVEIL</div>
              <div className="sound-list">
                {SOUNDS.map(s => (
                  <div key={s.id} className={`sound-item ${sound === s.id ? 'active' : ''}`}
                    onClick={() => setSound(s.id)}>{s.label}</div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════
   AFFIRMATIONS & QUALITÉS SCREEN — Full CRUD
   ═══════════════════════════════════════════════════ */

function AffirmationsScreen() {
  const [tab, setTab] = useState('affirmations');
  const [filterTag, setFilterTag] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingTags, setEditingTags] = useState(null); // separate tag editing state
  const [showAdd, setShowAdd] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [newText, setNewText] = useState('');
  const [newTags, setNewTags] = useState([]);

  const [affs, setAffs] = useState(() => Store.get('affirmations', DEFAULT_AFFS));
  const [quals, setQuals] = useState(() => Store.get('qualites', DEFAULT_QUALS));

  useEffect(() => { Store.set('affirmations', affs); }, [affs]);
  useEffect(() => { Store.set('qualites', quals); }, [quals]);

  const isAff = tab === 'affirmations';
  const items = isAff ? affs : quals;
  const setItems = isAff ? setAffs : setQuals;
  const filtered = filterTag ? items.filter(i => i.tags.includes(filterTag)) : items;

  const toggleFav = id => setItems(p => p.map(x => x.id === id ? { ...x, fav: !x.fav } : x));
  const delItem = id => { setItems(p => p.filter(x => x.id !== id)); setDeleteTarget(null); };
  const togNewTag = t => setNewTags(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);
  const togItemTag = (id, tag) => setItems(p => p.map(x => x.id === id ? { ...x, tags: x.tags.includes(tag) ? x.tags.filter(t => t !== tag) : [...x.tags, tag] } : x));

  const addItem = () => {
    if (!newText.trim()) return;
    const id = Date.now();
    if (isAff) setAffs(p => [...p, { id, text: newText.trim(), tags: [...newTags], fav: false, preset: false }]);
    else setQuals(p => [...p, { id, name: newText.trim(), tags: [...newTags], fav: false, preset: false }]);
    setNewText(''); setNewTags([]); setShowAdd(false);
  };

  const updateText = (id, val) => {
    if (isAff) setAffs(p => p.map(x => x.id === id ? { ...x, text: val || x.text } : x));
    else setQuals(p => p.map(x => x.id === id ? { ...x, name: val || x.name } : x));
    setEditingId(null);
  };

  return (
    <div className="screen">
      <MountainBg height={60} opacity={0.12} />

      {/* Add bottom sheet */}
      {showAdd && (
        <div className="bottom-sheet">
          <div className="overlay-bg" onClick={() => { setShowAdd(false); setNewText(''); setNewTags([]); }} />
          <div className="bottom-sheet-panel">
            <div className="modal-title" style={{ fontSize: 18 }}>
              {isAff ? 'Nouvelle affirmation' : 'Nouvelle qualité'}
            </div>
            <input className="input-add" value={newText} onChange={e => setNewText(e.target.value)}
              placeholder={isAff ? '« Mon affirmation… »' : 'Ma qualité…'} />
            <div className="form-label" style={{ marginBottom: 8 }}>ASSOCIER À UN PARCOURS</div>
            <div className="tag-row" style={{ marginBottom: 16 }}>
              {Object.keys(TAG_META).map(t => <TagPill key={t} tag={t} active={newTags.includes(t)} onClick={() => togNewTag(t)} />)}
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => { setShowAdd(false); setNewText(''); setNewTags([]); }}>ANNULER</button>
              <button className={`btn-primary ${!newText.trim() ? 'disabled' : ''}`} onClick={addItem}>AJOUTER</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteTarget !== null && (
        <div className="overlay">
          <div className="overlay-bg" onClick={() => setDeleteTarget(null)} />
          <div className="overlay-panel" style={{ width: 300, textAlign: 'center' }}>
            <div className="modal-title" style={{ fontSize: 17 }}>
              Supprimer {isAff ? 'cette affirmation' : 'cette qualité'} ?
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setDeleteTarget(null)}>ANNULER</button>
              <button className="btn-secondary danger" onClick={() => delItem(deleteTarget)}>SUPPRIMER</button>
            </div>
          </div>
        </div>
      )}

      <div className="screen-inner" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ paddingTop: 64, textAlign: 'center', marginBottom: 6 }}>
          <div className="screen-title">Affirmations & Qualités</div>
        </div>

        {/* Tabs */}
        <div className="tab-switch">
          {[['affirmations', 'Affirmations'], ['qualites', 'Qualités']].map(([v, l]) => (
            <div key={v} className={`tab-switch-item ${tab === v ? 'active' : ''}`}
              onClick={() => { setTab(v); setEditingId(null); setEditingTags(null); setFilterTag(null); }}>{l}</div>
          ))}
        </div>

        {/* Filters */}
        <div className="tag-row center" style={{ marginBottom: 8 }}>
          <div className={`tag-none ${filterTag === null ? 'active' : ''}`} onClick={() => setFilterTag(null)}>Tous</div>
          {Object.keys(TAG_META).map(t => <TagPill key={t} tag={t} small active={filterTag === t} onClick={() => setFilterTag(filterTag === t ? null : t)} />)}
        </div>

        <div className="aff-count-row">
          <span className="aff-count">{filtered.length} élément{filtered.length > 1 ? 's' : ''}</span>
          <span className="aff-hint">♥ = affiché plus souvent</span>
        </div>

        {/* Items list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filtered.map(item => {
            const isEd = editingId === item.id;
            const isTagEd = editingTags === item.id;
            const txt = isAff ? item.text : item.name;

            return (
              <div key={item.id} className="aff-item">
                <div className="aff-row">
                  {/* Text column */}
                  <div className="aff-text-col">
                    {isEd ? (
                      isAff ? (
                        <textarea autoFocus defaultValue={txt} rows={2} className="input-edit-aff"
                          onBlur={e => updateText(item.id, e.target.value)} />
                      ) : (
                        <input autoFocus defaultValue={txt} className="input-edit-qual"
                          onBlur={e => updateText(item.id, e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && updateText(item.id, e.target.value)} />
                      )
                    ) : (
                      <div onClick={() => setEditingId(item.id)} style={{ cursor: 'text' }}>
                        {isAff && <span className="aff-quote">« </span>}
                        <span className={isAff ? 'aff-text' : 'qual-text'}>{txt}</span>
                        {isAff && <span className="aff-quote"> »</span>}
                      </div>
                    )}

                    {/* Tags row */}
                    <div className="aff-tags-row">
                      {item.tags.map(t => <TagPill key={t} tag={t} active small />)}
                      {item.preset && <span className="badge-pre-sm">PRÉ.</span>}
                    </div>

                    {/* Tag editor (expanded) — available for ALL items */}
                    {isTagEd && (
                      <div className="tag-editor">
                        <div className="form-sublabel" style={{ marginBottom: 8 }}>MODIFIER LES TAGS</div>
                        <div className="tag-row">
                          {Object.keys(TAG_META).map(t => (
                            <TagPill key={t} tag={t} active={item.tags.includes(t)} small
                              onClick={() => togItemTag(item.id, t)} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="aff-actions">
                    <button className={`icon-btn fav ${item.fav ? 'active' : ''}`}
                      onClick={() => toggleFav(item.id)}>
                      {item.fav ? '♥' : '♡'}
                    </button>
                    <button className={`icon-btn tag-toggle ${isTagEd ? 'active' : ''}`}
                      onClick={() => setEditingTags(isTagEd ? null : item.id)}
                      title="Modifier les tags">
                      #
                    </button>
                    <button className={`icon-btn edit ${isEd ? 'active' : ''}`}
                      onClick={() => setEditingId(isEd ? null : item.id)}
                      title="Modifier le texte">
                      ✎
                    </button>
                    <button className="icon-btn delete"
                      onClick={() => setDeleteTarget(item.id)}
                      title="Supprimer">
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ paddingBottom: 8, textAlign: 'center' }}>
          <div className="btn-terre" onClick={() => setShowAdd(true)}>
            {isAff ? '+ AJOUTER UNE AFFIRMATION' : '+ AJOUTER UNE QUALITÉ'}
          </div>
        </div>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════
   PROFIL SCREEN
   ═══════════════════════════════════════════════════ */

function ProfilScreen() {
  const settings = [
    { l: 'Durée par défaut', v: '45 min' },
    { l: 'Son de transition', v: 'Bol tibétain' },
    { l: 'Son de fin', v: 'Carillon doux' },
    { l: 'Thème visuel', v: 'Montagne' },
  ];

  const resetData = () => {
    if (confirm('Effacer toutes les données ? Cette action est irréversible.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="screen">
      <MountainBg height={60} opacity={0.1} />
      <div className="screen-inner" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ paddingTop: 68, textAlign: 'center', marginBottom: 16 }}>
          <div className="screen-title">Réglages</div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {settings.map((x, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderBottom: '0.5px solid var(--sep)' }}>
              <div style={{ fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 300, color: 'var(--anthracite)' }}>{x.l}</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 15, color: 'var(--text-soft)', fontStyle: 'italic' }}>{x.v}</div>
            </div>
          ))}

          <div style={{ marginTop: 28, padding: '16px 0', borderTop: '0.5px solid var(--sep)' }}>
            <div className="form-label" style={{ marginBottom: 12 }}>À PROPOS</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 15, fontStyle: 'italic', color: 'var(--text-soft)', lineHeight: 1.6 }}>
              Miracle Routine — soin matinal pour personnes sensibles.
            </div>
          </div>

          <div style={{ marginTop: 20, padding: '16px 0', borderTop: '0.5px solid var(--sep)' }}>
            <div onClick={resetData} style={{
              fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: 3, color: '#b85a50',
              opacity: 0.5, cursor: 'pointer', textTransform: 'uppercase',
            }}>RÉINITIALISER LES DONNÉES</div>
          </div>
        </div>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════
   APP — Main shell
   ═══════════════════════════════════════════════════ */

function App() {
  const [tab, setTab] = useState('accueil');
  const [currentBesoin, setCurrentBesoin] = useState(null);
  const [directLaunchRoutine, setDirectLaunchRoutine] = useState(null);
  const [routines, setRoutines] = useState(() => {
    const stored = Store.get('routines', null);
    return stored || Object.values(DEFAULT_ROUTINES);
  });
  const [affs, setAffs] = useState(() => Store.get('affirmations', DEFAULT_AFFS));
  const [quals, setQuals] = useState(() => Store.get('qualites', DEFAULT_QUALS));

  useEffect(() => { Store.set('routines', routines); }, [routines]);
  useEffect(() => { Store.set('affirmations', affs); }, [affs]);
  useEffect(() => { Store.set('qualites', quals); }, [quals]);

  return (
    <div className="app-shell">
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {tab === 'accueil' && (
          <AccueilScreen
            routines={routines}
            affs={affs}
            quals={quals}
            onGoRoutines={() => setTab('routines')}
            onGoAffirmations={() => setTab('affirmations')}
            onGoJournal={() => setTab('journal')}
            onBesoinChange={setCurrentBesoin}
            directLaunchRoutine={directLaunchRoutine}
            clearDirectLaunch={() => setDirectLaunchRoutine(null)}
          />
        )}
        {tab === 'routines' && <RoutinesScreen routines={routines} setRoutines={setRoutines}
          onLaunchRoutine={(r) => { setDirectLaunchRoutine(r); setCurrentBesoin(r.tag); setTab('accueil'); }} />}
        {tab === 'journal' && <JournalScreen besoin={currentBesoin} />}
        {tab === 'affirmations' && <AffirmationsScreen />}
        {tab === 'reveil' && <ReveilScreen onStartRoutine={() => setTab('accueil')} />}
        {tab === 'profil' && <ProfilScreen />}
      </div>
      <TabBar active={tab} onTab={setTab} />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
