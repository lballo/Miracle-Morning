const { useState, useEffect, useRef, useCallback } = React;

/* ═══════════════════════════════════════════════════
   STORAGE — localStorage persistence
   ═══════════════════════════════════════════════════ */

const Store = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem('mm_' + key);
      return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  },
  set(key, val) {
    try { localStorage.setItem('mm_' + key, JSON.stringify(val)); } catch {}
  },
  remove(key) {
    try { localStorage.removeItem('mm_' + key); } catch {}
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

const DEFAULT_ROUTINES = {
  presence: {
    id: 'presence', icon: '🌿', name: 'Présence', tag: 'presence',
    steps: [
      { name: 'Méditation d\'ancrage', mins: 6, desc: 'Attention sur les appuis' },
      { name: 'Respiration', mins: 4, desc: '4 inspire / 6 expire' },
      { name: 'Mini méditation', mins: 4, desc: 'Conscience des sensations' },
      { name: 'Visualisation du chêne', mins: 12, desc: 'Racines, forêt, énergie' },
      { name: 'Douche consciente', mins: 15, desc: 'Eau tiède, présence' },
      { name: 'Affirmations', mins: 5, desc: 'Je suis assez' },
    ],
    citation: 'Je suis présent ici et maintenant dans mon corps.',
    question: 'Qu\'est-ce que je n\'ai plus besoin d\'être ?',
  },
  serenite: {
    id: 'serenite', icon: '🌊', name: 'Sérénité', tag: 'serenite',
    steps: [
      { name: 'Respiration apaisante', mins: 5, desc: '5 inspire / 5 expire' },
      { name: 'Méditation sécurité', mins: 7, desc: 'Lieu sûr, image ressource' },
      { name: 'Mouvement doux', mins: 12, desc: 'Étirements, expire long' },
      { name: 'Douche réconfortante', mins: 15, desc: 'Eau chaude, soutien' },
      { name: 'Affirmations', mins: 5, desc: 'Sécurité intérieure' },
    ],
    citation: 'Je prends ma place, je suis maître de mon temps.',
    question: 'Qu\'est-ce que j\'accepte de lâcher ?',
  },
  focus: {
    id: 'focus', icon: '🔥', name: 'Focus', tag: 'focus',
    steps: [
      { name: 'Méditation centrage', mins: 5, desc: 'Attention sur le souffle' },
      { name: 'Respiration focus', mins: 4, desc: 'Carrée 5-5-5-5' },
      { name: 'Sport dynamique', mins: 20, desc: 'Cardio doux' },
      { name: 'Douche dynamique', mins: 15, desc: 'Alternance chaud/froid' },
      { name: 'Affirmations', mins: 5, desc: 'Clarté et engagement' },
    ],
    citation: 'La clarté naît du silence et de l\'intention.',
    question: 'Qu\'est-ce que je choisis avec clarté aujourd\'hui ?',
  },
  emotions: {
    id: 'emotions', icon: '🧭', name: 'Émotions', tag: 'emotions',
    steps: [
      { name: 'Respiration consciente', mins: 5, desc: '4 inspire / 6 expire' },
      { name: 'Méditation d\'accueil', mins: 7, desc: 'Localiser l\'émotion' },
      { name: 'Sport doux', mins: 12, desc: 'Étirements lents' },
      { name: 'Danse libre', mins: 8, desc: 'Ressentir' },
      { name: 'Douche douce', mins: 15, desc: 'Relâcher' },
      { name: 'Affirmations', mins: 5, desc: 'Laisser traverser' },
    ],
    citation: 'Ce que je ressens a le droit d\'exister pleinement.',
    question: 'Quelle émotion j\'accueille aujourd\'hui ?',
  },
  energie: {
    id: 'energie', icon: '✨', name: 'Énergie', tag: 'energie',
    steps: [
      { name: 'Respiration ancrage', mins: 4, desc: 'Main sur ventre' },
      { name: 'Échauffement', mins: 5, desc: 'Mobilisation douce' },
      { name: 'Danse libre', mins: 12, desc: 'Sans performance' },
      { name: 'Respiration dynamique', mins: 3, desc: 'Rythme soutenu' },
    ],
    citation: 'Ce qui est vivant en moi a le droit de s\'exprimer.',
    question: 'Qu\'est-ce qui me donne de l\'élan ?',
  },
};

const DEFAULT_AFFS = [
  { id: 1, text: 'Je suis présent, je reviens à l\'essentiel.', tags: ['focus','presence'], fav: true, preset: true },
  { id: 2, text: 'Je n\'ai pas besoin de chercher à être, je suis.', tags: ['presence'], fav: true, preset: true },
  { id: 3, text: 'J\'accueille mes émotions sans les bloquer.', tags: ['emotions'], fav: false, preset: true },
  { id: 4, text: 'Ce qui est vivant en moi a le droit de s\'exprimer.', tags: ['energie'], fav: false, preset: true },
  { id: 5, text: 'Je suis en sécurité à l\'intérieur de moi-même.', tags: ['serenite'], fav: true, preset: true },
  { id: 6, text: 'Je peux avancer avec clarté et engagement.', tags: ['focus'], fav: false, preset: true },
  { id: 7, text: 'Je n\'ai rien à prouver, je suis assez.', tags: ['presence'], fav: true, preset: true },
  { id: 8, text: 'Je peux laisser être ce qui me traverse.', tags: ['emotions','serenite'], fav: false, preset: true },
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
      <span className="tag-text" style={{ color: active ? m.color : '#8a8078', opacity: active ? 1 : 0.4 }}>{m.label}</span>
    </div>
  );
}

function TabBar({ active, onTab }) {
  const tabs = [
    { id: 'accueil', icon: '◎', label: 'Accueil' },
    { id: 'routines', icon: '≡', label: 'Routines' },
    { id: 'reveil', icon: '◐', label: 'Réveil' },
    { id: 'journal', icon: '✎', label: 'Journal' },
    { id: 'affirmations', icon: '✦', label: 'Affirm.' },
    { id: 'profil', icon: '○', label: 'Profil' },
  ];
  return (
    <div className="tab-bar">
      {tabs.map(t => (
        <div key={t.id} className="tab-item" onClick={() => onTab(t.id)}>
          <span className="tab-icon" style={{
            color: active === t.id ? '#C4A08A' : '#8a8078',
            opacity: active === t.id ? 1 : 0.3,
          }}>{t.icon}</span>
          <span className="tab-label" style={{
            color: active === t.id ? '#C4A08A' : '#8a8078',
            fontWeight: active === t.id ? 400 : 300,
            opacity: active === t.id ? 1 : 0.35,
          }}>{t.label}</span>
        </div>
      ))}
    </div>
  );
}

function StepRow({ step, index, total, onMove, onAdjust, onRemove, onEdit, isEditing, onSave }) {
  return (
    <div className="step-row">
      <div className="step-arrows">
        <div className="step-arrow" style={{ opacity: index === 0 ? 0.08 : 0.3 }}
          onClick={() => index > 0 && onMove(index, -1)}>▲</div>
        <div className="step-arrow" style={{ opacity: index === total - 1 ? 0.08 : 0.3 }}
          onClick={() => index < total - 1 && onMove(index, 1)}>▼</div>
      </div>
      <div className="step-num">{index + 1}</div>
      <div className="step-content">
        {isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <input autoFocus defaultValue={step.name}
              onBlur={e => onSave(index, 'name', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && onSave(index, 'name', e.target.value)}
              style={{ fontFamily: 'var(--serif)', fontSize: 13, color: 'var(--anthracite)',
                background: 'var(--terre-bg)', border: 'none', outline: 'none',
                padding: '3px 6px', width: '100%', borderBottom: '1px solid rgba(196,160,138,0.2)' }} />
            <input defaultValue={step.desc} placeholder="Description…"
              onBlur={e => onSave(index, 'desc', e.target.value)}
              style={{ fontFamily: 'var(--sans)', fontSize: 10, fontWeight: 300, color: 'var(--text-soft)',
                background: 'var(--terre-bg)', border: 'none', outline: 'none',
                padding: '2px 6px', width: '100%', borderBottom: '1px solid rgba(196,160,138,0.1)' }} />
          </div>
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
      <button className="step-delete" style={{ opacity: total <= 1 ? 0.05 : 0.2 }}
        onClick={() => total > 1 && onRemove(index)}>✕</button>
    </div>
  );
}


/* ═══════════════════════════════════════════════════
   ACCUEIL SCREEN — 5-step flow with timer
   ═══════════════════════════════════════════════════ */

function AccueilScreen({ routines, onGoRoutines }) {
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

  const activeRoutine = besoin ? (routines.find(r => r.tag === besoin) || routines[0]) : null;

  // Timer logic
  useEffect(() => {
    if (!executing || paused || completed) {
      clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          // Move to next step or finish
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
    setStep(0); setMood(null); setBesoin(null);
    setExecuting(false); setCompleted(false);
    setCurrentStep(0); setSecondsLeft(0); setPaused(false);
  };

  const ts = new Date().getHours().toString().padStart(2, '0') + ':' + new Date().getMinutes().toString().padStart(2, '0');

  // Executing a routine — timer view
  if (executing && !completed) {
    const r = activeRoutine;
    const s = r.steps[currentStep];
    const totalSec = s.mins * 60;
    const progress = totalSec > 0 ? ((totalSec - secondsLeft) / totalSec) * 100 : 0;
    const mm = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
    const ss = (secondsLeft % 60).toString().padStart(2, '0');

    return (
      <div className="screen" style={{ display: 'flex', flexDirection: 'column' }}>
        <MountainBg height={80} opacity={0.15} />
        <div className="screen-inner" style={{ position: 'relative', zIndex: 2, flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          {/* Step counter */}
          <div style={{ fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: 4, color: '#C4A08A', opacity: 0.45, textTransform: 'uppercase', marginBottom: 28 }}>
            {currentStep + 1} / {r.steps.length}
          </div>

          <div className="timer-label">{s.name}</div>
          <div className="timer-desc">{s.desc}</div>

          <div className="timer-progress" style={{ maxWidth: 200, margin: '28px auto' }}>
            <div className="timer-progress-fill" style={{ width: progress + '%' }} />
          </div>

          <div className="timer-display">{mm}:{ss}</div>

          <div style={{ display: 'flex', gap: 16, marginTop: 40, alignItems: 'center' }}>
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

  // Completed
  if (completed) {
    return (
      <div className="screen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <MountainBg height={100} opacity={0.2} />
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 40px' }}>
          <div style={{ fontSize: 28, marginBottom: 20, opacity: 0.6 }}>✓</div>
          <div style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontStyle: 'italic', fontSize: 24, color: '#2C2C2C', lineHeight: 1.5, marginBottom: 8 }}>
            Bravo.
          </div>
          <div style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontStyle: 'italic', fontSize: 16, color: '#8a8078', lineHeight: 1.5, marginBottom: 36 }}>
            Ta routine est terminée.{'\n'}Passe une belle journée.
          </div>
          <button className="btn-primary" onClick={resetFlow}>RETOUR</button>
        </div>
      </div>
    );
  }

  // Step 0: Mood
  if (step === 0) return (
    <div className="screen" style={{ display: 'flex', flexDirection: 'column' }}>
      <MountainBg height={120} opacity={0.4} />
      <div className="screen-inner" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ paddingTop: 80, textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--sans)', fontWeight: 300, fontSize: 10, letterSpacing: 3, color: '#8a8078', opacity: 0.4 }}>{ts}</div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontStyle: 'italic', fontSize: 24, color: '#2C2C2C', textAlign: 'center', lineHeight: 1.5, marginBottom: 48 }}>
            Comment te sens-tu{'\n'}ce matin ?
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', maxWidth: 280 }}>
            {MOODS.map(m => (
              <div key={m} className="mood-card" onClick={() => { setMood(m); setStep(1); }}>{m}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Step 1: Affirmation
  if (step === 1) {
    const aff = MOOD_AFFIRMATIONS[mood] || MOOD_AFFIRMATIONS['Calme'];
    return (
      <div className="screen" onClick={() => setStep(2)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 36px', cursor: 'pointer' }}>
        <MountainBg height={110} opacity={0.25} />
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--sans)', fontWeight: 300, fontSize: 9, letterSpacing: 4, color: '#C4A08A', opacity: 0.45, textTransform: 'uppercase', marginBottom: 24 }}>{mood}</div>
          <div style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontStyle: 'italic', fontSize: 22, color: '#2C2C2C', lineHeight: 1.55, whiteSpace: 'pre-line' }}>{aff}</div>
          <div className="divider" style={{ margin: '28px auto 0' }} />
          <div style={{ fontFamily: 'var(--sans)', fontWeight: 300, fontSize: 9, letterSpacing: 4, color: '#C4A08A', opacity: 0.3, marginTop: 16, textTransform: 'uppercase' }}>Toucher pour continuer</div>
        </div>
      </div>
    );
  }

  // Step 2: Besoin
  if (step === 2) return (
    <div className="screen" style={{ display: 'flex', flexDirection: 'column' }}>
      <MountainBg height={90} opacity={0.25} />
      <div className="screen-inner" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ paddingTop: 74, textAlign: 'center', marginBottom: 4 }}>
          <div style={{ fontFamily: 'var(--sans)', fontWeight: 300, fontSize: 9, letterSpacing: 3, color: '#C4A08A', opacity: 0.5, textTransform: 'uppercase' }}>Humeur : {mood}</div>
        </div>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontStyle: 'italic', fontSize: 21, color: '#2C2C2C', lineHeight: 1.5 }}>
            De quoi as-tu le plus{'\n'}besoin aujourd'hui ?
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, overflowY: 'auto', paddingBottom: 20 }}>
          {BESOINS.map(b => (
            <div key={b.id} className="besoin-card" onClick={() => { setBesoin(b.id); setStep(3); }}>
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

  // Step 3: Citation
  if (step === 3) return (
    <div className="screen" onClick={() => setStep(4)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 40px', cursor: 'pointer' }}>
      <MountainBg height={100} opacity={0.2} />
      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontStyle: 'italic', fontSize: 25, color: '#2C2C2C', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
          {CITATIONS[besoin] || CITATIONS.presence}
        </div>
        <div className="divider" style={{ margin: '24px auto 0' }} />
        <div style={{ fontFamily: 'var(--sans)', fontWeight: 300, fontSize: 9, letterSpacing: 4, color: '#C4A08A', opacity: 0.35, marginTop: 16, textTransform: 'uppercase' }}>Toucher pour continuer</div>
      </div>
    </div>
  );

  // Step 4: Routine preview
  const r = activeRoutine;
  const tot = r ? r.steps.reduce((s, a) => s + a.mins, 0) : 0;
  const bl = BESOINS.find(b => b.id === besoin)?.label || '';

  return (
    <div className="screen" style={{ display: 'flex', flexDirection: 'column' }}>
      <MountainBg height={70} opacity={0.2} />
      <div className="screen-inner" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ paddingTop: 70, textAlign: 'center', marginBottom: 4 }}>
          <div style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontStyle: 'italic', fontSize: 19, color: '#2C2C2C' }}>Ta routine</div>
          <div style={{ fontFamily: 'var(--sans)', fontWeight: 300, fontSize: 9, letterSpacing: 4, color: '#C4A08A', opacity: 0.5, marginTop: 6, textTransform: 'uppercase' }}>{bl} · {tot} min</div>
          <div className="divider" />
        </div>
        <div style={{ flex: 1, overflowY: 'auto', paddingTop: 8 }}>
          {r && r.steps.map((a, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '11px 0', borderBottom: i < r.steps.length - 1 ? '0.5px solid rgba(44,44,44,0.05)' : 'none' }}>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 13, color: '#C4A08A', opacity: 0.35, minWidth: 16, textAlign: 'right' }}>{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 15, fontWeight: 400, color: '#2C2C2C' }}>{a.name}</div>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 10, fontWeight: 300, color: '#8a8078', marginTop: 2 }}>{a.desc}</div>
              </div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 13, color: '#8a8078', opacity: 0.5 }}>{a.mins}'</div>
            </div>
          ))}
        </div>
        <div style={{ paddingBottom: 10, display: 'flex', gap: 12, justifyContent: 'center' }}>
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

function JournalScreen() {
  const [view, setView] = useState('today');
  const [text, setText] = useState('');
  const [toast, setToast] = useState(false);
  const [entries, setEntries] = useState(() => Store.get('journal', []));

  useEffect(() => { Store.set('journal', entries); }, [entries]);

  const handleSave = () => {
    if (!text.trim()) return;
    const now = new Date();
    const dateStr = now.getDate() + ' ' + MONTHS[now.getMonth()];
    const newEntry = {
      id: Date.now(),
      date: dateStr,
      timestamp: now.toISOString(),
      q: 'Qu\'est-ce que je n\'ai plus besoin d\'être ?',
      a: text.trim(),
    };
    setEntries(prev => [newEntry, ...prev]);
    setText('');
    setToast(true);
    setTimeout(() => { setToast(false); setView('history'); }, 1500);
  };

  const deleteEntry = (id) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  return (
    <div className="screen">
      <MountainBg height={70} opacity={0.15} />
      <Toast message="Journal enregistré" visible={toast} />

      <div className="screen-inner" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ paddingTop: 68, textAlign: 'center', marginBottom: 8 }}>
          <div className="screen-title" style={{ fontSize: 20 }}>Mon journal</div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 16 }}>
          {[['today', 'Aujourd\'hui'], ['history', 'Historique']].map(([v, l]) => (
            <div key={v} onClick={() => setView(v)} style={{
              fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: 3, fontWeight: 300,
              textTransform: 'uppercase', padding: '6px 14px', cursor: 'pointer',
              color: view === v ? '#2C2C2C' : '#8a8078',
              borderBottom: view === v ? '0.5px solid #C4A08A' : '0.5px solid transparent',
              opacity: view === v ? 1 : 0.4,
            }}>{l}</div>
          ))}
        </div>

        {view === 'today' ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Questions */}
            <div style={{ textAlign: 'center', paddingTop: 16, marginBottom: 20 }}>
              <div style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontStyle: 'italic', fontSize: 18, color: '#2C2C2C', lineHeight: 1.55 }}>
                Qu'est-ce que je n'ai plus{'\n'}besoin d'être aujourd'hui ?
              </div>
              <div className="divider" />
              <div style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontStyle: 'italic', fontSize: 16, color: '#2C2C2C', opacity: 0.55, lineHeight: 1.5 }}>
                Qu'est-ce que j'accepte{'\n'}de lâcher ?
              </div>
            </div>

            {/* Text area */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <span style={{ fontFamily: 'var(--serif)', fontSize: 16, color: '#C4A08A', opacity: 0.25, lineHeight: 1.8, flexShrink: 0 }}>—</span>
              <textarea
                className="journal-textarea"
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Écrire ici..."
              />
            </div>

            {/* Save button */}
            <div style={{ paddingBottom: 12, textAlign: 'center' }}>
              <button
                className={`btn-primary ${!text.trim() ? 'disabled' : ''}`}
                onClick={handleSave}
                style={{ letterSpacing: 5 }}
              >J'ENREGISTRE</button>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {entries.length === 0 && (
              <div style={{ textAlign: 'center', paddingTop: 40 }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 14, fontStyle: 'italic', color: '#8a8078', opacity: 0.4 }}>
                  Aucune entrée pour le moment.
                </div>
              </div>
            )}
            {entries.map(h => (
              <div key={h.id || h.date} style={{ padding: '14px 0', borderBottom: '0.5px solid rgba(44,44,44,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontFamily: 'var(--sans)', fontSize: 10, fontWeight: 400, color: '#2C2C2C' }}>{h.date}</span>
                  <button className="step-delete" style={{ opacity: 0.2, margin: 0 }} onClick={() => deleteEntry(h.id)}>✕</button>
                </div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 13, fontStyle: 'italic', color: '#8a8078', marginBottom: 4 }}>{h.q}</div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 13, color: '#2C2C2C', opacity: 0.7, lineHeight: 1.5 }}>{h.a}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════
   ROUTINES SCREEN
   ═══════════════════════════════════════════════════ */

function RoutinesScreen({ routines, setRoutines }) {
  const [view, setView] = useState('list');
  const [detailId, setDetailId] = useState(null);
  const [editing, setEditing] = useState(null);
  const [showSave, setShowSave] = useState(false);
  const [toast, setToast] = useState(null);

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

  // LIST VIEW
  if (view === 'list') return (
    <div className="screen">
      <MountainBg height={80} opacity={0.2} />
      <Toast message={toast} visible={!!toast} />
      <div className="screen-inner" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ paddingTop: 68, textAlign: 'center', marginBottom: 12 }}>
          <div className="screen-title" style={{ fontSize: 20 }}>Mes routines</div>
          <div className="screen-subtitle">{routines.length} PARCOURS</div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {routines.map((r, i) => {
            const tot = r.steps.reduce((s, a) => s + a.mins, 0);
            return (
              <div key={r.id} className="routine-item" onClick={() => { setDetailId(r.id); setView('detail'); }}>
                <span style={{ fontSize: 18 }}>{r.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontFamily: 'var(--serif)', fontSize: 15, fontWeight: 400, color: '#2C2C2C' }}>{r.name}</span>
                    {r.tag && <TagPill tag={r.tag} active small />}
                  </div>
                  <div style={{ fontFamily: 'var(--sans)', fontSize: 10, fontWeight: 300, color: '#8a8078', marginTop: 1 }}>
                    {r.steps.length} act. · {tot} min
                  </div>
                </div>
                <span style={{ fontFamily: 'var(--sans)', fontSize: 12, color: '#8a8078', opacity: 0.2 }}>›</span>
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

  // CREATE VIEW
  if (view === 'create') {
    const cTotal = createSteps.reduce((s, a) => s + a.mins, 0);
    return (
      <div className="screen">
        <Toast message={toast} visible={!!toast} />
        <div className="screen-inner" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ paddingTop: 66 }}>
            <div className="btn-terre" style={{ marginBottom: 14, padding: '0', opacity: 0.45 }} onClick={() => setView('list')}>← ROUTINES</div>
            <div style={{ textAlign: 'center', marginBottom: 4 }}>
              <div className="screen-title" style={{ fontSize: 20 }}>Créer une routine</div>
              <div className="divider" />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', paddingTop: 4 }}>
            {/* Name & Identity */}
            <div style={{ padding: '12px 0 16px', borderBottom: '0.5px solid rgba(44,44,44,0.05)' }}>
              <div style={{ fontFamily: 'var(--sans)', fontSize: 8, letterSpacing: 4, color: '#C4A08A', opacity: 0.45, textTransform: 'uppercase', marginBottom: 10 }}>NOM & IDENTITÉ</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 9, fontWeight: 300, color: '#8a8078', minWidth: 40 }}>Icône</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {ICONS.map(ic => (
                    <div key={ic} onClick={() => setNewIcon(ic)} style={{
                      width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, cursor: 'pointer',
                      background: newIcon === ic ? 'var(--terre-bg)' : 'transparent',
                      border: `0.5px solid ${newIcon === ic ? 'rgba(196,160,138,0.3)' : 'rgba(44,44,44,0.04)'}`,
                      color: newIcon === ic ? '#2C2C2C' : '#8a8078', opacity: newIcon === ic ? 1 : 0.35,
                    }}>{ic}</div>
                  ))}
                </div>
              </div>
              <input className="input-terre" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nom de la routine…" style={{ marginBottom: 12 }} />
              <div style={{ fontFamily: 'var(--sans)', fontSize: 8, letterSpacing: 3, color: '#8a8078', opacity: 0.45, textTransform: 'uppercase', marginBottom: 8 }}>BESOIN ASSOCIÉ (optionnel)</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                <div onClick={() => setNewTag(null)} style={{
                  fontFamily: 'var(--sans)', fontSize: 8, letterSpacing: 2, padding: '3px 8px', cursor: 'pointer',
                  textTransform: 'uppercase',
                  color: newTag === null ? '#2C2C2C' : '#8a8078', opacity: newTag === null ? 0.7 : 0.3,
                  background: newTag === null ? 'var(--terre-bg)' : 'transparent',
                  border: `0.5px solid ${newTag === null ? 'rgba(196,160,138,0.2)' : 'rgba(44,44,44,0.04)'}`,
                }}>Aucun</div>
                {Object.keys(TAG_META).map(t => <TagPill key={t} tag={t} small active={newTag === t} onClick={() => setNewTag(newTag === t ? null : t)} />)}
              </div>
            </div>

            {/* Steps */}
            <div style={{ padding: '12px 0 8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 8, letterSpacing: 4, color: '#C4A08A', opacity: 0.45, textTransform: 'uppercase' }}>ÉTAPES</div>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 9, fontWeight: 300, color: '#8a8078', opacity: 0.45 }}>{createSteps.length} étape{createSteps.length > 1 ? 's' : ''} · {cTotal} min</div>
              </div>
              {createSteps.map((s, i) => (
                <StepRow key={i} step={s} index={i} total={createSteps.length}
                  onMove={mvCreate} onAdjust={adjCreate} onRemove={rmCreate}
                  onEdit={setEditingCreate} isEditing={editingCreate === i}
                  onSave={(idx, field, val) => saveCreateField(idx, field, val)} />
              ))}
              <div onClick={() => setCreateSteps(p => [...p, { name: 'Nouvelle étape', mins: 5, desc: '' }])} style={{ padding: '12px 0', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <span style={{ fontFamily: 'var(--sans)', fontSize: 14, color: '#C4A08A', opacity: 0.3, width: 36, textAlign: 'center' }}>+</span>
                <span style={{ fontFamily: 'var(--sans)', fontSize: 11, fontWeight: 300, color: '#C4A08A', opacity: 0.45 }}>Ajouter une étape</span>
              </div>
            </div>

            {/* Question */}
            <div style={{ padding: '12px 0', borderTop: '0.5px solid rgba(44,44,44,0.05)' }}>
              <div style={{ fontFamily: 'var(--sans)', fontSize: 8, letterSpacing: 4, color: '#C4A08A', opacity: 0.45, textTransform: 'uppercase', marginBottom: 8 }}>QUESTION JOURNAL (optionnel)</div>
              <input className="input-bg" value={newQuestion} onChange={e => setNewQuestion(e.target.value)} placeholder="Question de clôture…" />
            </div>

            {/* Citation */}
            <div style={{ padding: '12px 0', borderTop: '0.5px solid rgba(44,44,44,0.05)' }}>
              <div style={{ fontFamily: 'var(--sans)', fontSize: 8, letterSpacing: 4, color: '#C4A08A', opacity: 0.45, textTransform: 'uppercase', marginBottom: 8 }}>CITATION D'OUVERTURE (optionnel)</div>
              <input className="input-bg" value={newCitation} onChange={e => setNewCitation(e.target.value)} placeholder="Une phrase pour ouvrir ta routine…" />
            </div>
          </div>

          <div style={{ paddingBottom: 10, display: 'flex', justifyContent: 'center', gap: 14 }}>
            <button className="btn-secondary" onClick={() => setView('list')}>ANNULER</button>
            <button className={`btn-primary ${!newName.trim() ? 'disabled' : ''}`} onClick={createRoutine}>CRÉER</button>
          </div>
        </div>
      </div>
    );
  }

  // DETAIL VIEW
  if (view === 'detail' && detail) {
    const tot = detail.steps.reduce((s, a) => s + a.mins, 0);
    return (
      <div className="screen">
        <Toast message={toast} visible={!!toast} />
        <div className="screen-inner" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ paddingTop: 66 }}>
            <div className="btn-terre" style={{ marginBottom: 12, padding: 0, opacity: 0.45 }} onClick={() => { setView('list'); setEditing(null); }}>← ROUTINES</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
              <span style={{ fontSize: 20 }}>{detail.icon}</span>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 21, fontWeight: 400, color: '#2C2C2C' }}>{detail.name}</div>
            </div>
            <div style={{ fontFamily: 'var(--sans)', fontSize: 10, fontWeight: 300, color: '#8a8078' }}>{detail.steps.length} act. · {tot} min</div>
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
            <div onClick={() => addStep(detail.id)} style={{ padding: '12px 0', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <span style={{ fontFamily: 'var(--sans)', fontSize: 14, color: '#C4A08A', opacity: 0.3, width: 36, textAlign: 'center' }}>+</span>
              <span style={{ fontFamily: 'var(--sans)', fontSize: 11, fontWeight: 300, color: '#C4A08A', opacity: 0.45 }}>Ajouter une étape</span>
            </div>
          </div>

          <div style={{ paddingBottom: 10, display: 'flex', justifyContent: 'center', gap: 10 }}>
            {detail.custom && <button className="btn-secondary" style={{ color: '#b85a50', opacity: 0.6 }} onClick={() => deleteRoutine(detail.id)}>SUPPRIMER</button>}
            <button className="btn-primary" onClick={() => { showToast('Routine enregistrée'); }}>ENREGISTRER</button>
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
  const [enabled, setEnabled] = useState(() => Store.get('reveil_enabled', true));
  const [hours, setHours] = useState(() => Store.get('reveil_hours', 6));
  const [minutes, setMinutes] = useState(() => Store.get('reveil_minutes', 0));
  const [days, setDays] = useState(() => Store.get('reveil_days', [1,2,3,4,5]));
  const [sound, setSound] = useState(() => Store.get('reveil_sound', 'bol'));
  const [ringing, setRinging] = useState(false);
  const [snoozed, setSnoozed] = useState(false);

  useEffect(() => { Store.set('reveil_enabled', enabled); }, [enabled]);
  useEffect(() => { Store.set('reveil_hours', hours); }, [hours]);
  useEffect(() => { Store.set('reveil_minutes', minutes); }, [minutes]);
  useEffect(() => { Store.set('reveil_days', days); }, [days]);
  useEffect(() => { Store.set('reveil_sound', sound); }, [sound]);

  const dayLabels = [{id:1,l:'L'},{id:2,l:'M'},{id:3,l:'M'},{id:4,l:'J'},{id:5,l:'V'},{id:6,l:'S'},{id:0,l:'D'}];
  const dim = !enabled ? 0.35 : 1;

  if (ringing) {
    const hh = hours.toString().padStart(2, '0'), mm = minutes.toString().padStart(2, '0');
    return (
      <div className="screen" style={{ display: 'flex', flexDirection: 'column' }}>
        <svg viewBox="0 0 375 220" style={{ width: '100%', height: 220, position: 'absolute', top: 0 }}>
          <defs>
            <linearGradient id="as2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#d8c8b8" /><stop offset="100%" stopColor="#e8dcd0" /></linearGradient>
            <linearGradient id="af2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#F6F3ED" stopOpacity="0" /><stop offset="100%" stopColor="#F6F3ED" /></linearGradient>
          </defs>
          <rect width="375" height="220" fill="url(#as2)" />
          <circle cx="188" cy="50" r="28" fill="#e8dcd0" opacity=".5" />
          <path d="M0 120 L40 90 L140 65 L230 55 L375 70 L375 220 L0 220Z" fill="#c8bfb2" opacity=".3" />
          <path d="M0 145 L110 130 L240 118 L375 112 L375 220 L0 220Z" fill="#b8ada0" opacity=".35" />
          <rect y="180" width="375" height="40" fill="url(#af2)" />
        </svg>
        <div style={{ position: 'relative', zIndex: 2, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 40px' }}>
          <div className="ringing-time">{hh}:{mm}</div>
          <div className="ringing-dot" />
          {snoozed && <div style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: 3, color: '#C4A08A', opacity: 0.5, textTransform: 'uppercase', marginBottom: 16 }}>SNOOZE · 5 MIN</div>}
          <div style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontStyle: 'italic', fontSize: 20, color: '#2C2C2C', textAlign: 'center', lineHeight: 1.5, marginBottom: 48 }}>
            {snoozed ? 'Encore un instant…' : 'C\'est l\'heure de prendre\nsoin de toi.'}
          </div>
          <button className="btn-primary" onClick={() => { setRinging(false); onStartRoutine(); }}>JE DÉMARRE MA ROUTINE</button>
          {!snoozed && <button className="btn-terre" style={{ marginTop: 16 }} onClick={() => setSnoozed(true)}>SNOOZE · 5 MIN</button>}
          <button className="btn-secondary" style={{ marginTop: 4 }} onClick={() => { setRinging(false); setSnoozed(false); }}>ARRÊTER</button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <MountainBg height={80} opacity={0.15} />
      <div className="screen-inner" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ paddingTop: 70, textAlign: 'center', marginBottom: 6 }}>
          <div className="screen-title">Réveil matinal</div>
          <div style={{ fontFamily: 'var(--sans)', fontWeight: 300, fontSize: 10, color: '#8a8078', marginTop: 6 }}>Un réveil doux pour entrer dans ta journée.</div>
        </div>

        {/* Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 0 14px', borderBottom: '0.5px solid rgba(44,44,44,0.05)' }}>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 300, color: '#2C2C2C' }}>Réveil activé</div>
          <div className="toggle-track" style={{ background: enabled ? '#C4A08A' : 'rgba(44,44,44,0.08)' }} onClick={() => setEnabled(!enabled)}>
            <div className="toggle-thumb" style={{ left: enabled ? 22 : 2 }} />
          </div>
        </div>

        <div style={{ opacity: dim, flex: 1, overflowY: 'auto' }}>
          {/* Time picker */}
          <div style={{ padding: '20px 0 16px', borderBottom: '0.5px solid rgba(44,44,44,0.05)' }}>
            <div style={{ fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: 4, color: '#C4A08A', opacity: 0.45, textTransform: 'uppercase', marginBottom: 14 }}>HEURE</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {[{ v: hours, fn: d => setHours(h => (h + d + 24) % 24), s: 1 }, null, { v: minutes, fn: d => setMinutes(m => (m + d + 60) % 60), s: 5 }].map((x, i) => (
                x === null ? <div key={i} style={{ fontFamily: 'var(--serif)', fontSize: 36, fontWeight: 300, color: '#C4A08A', opacity: 0.3 }}>:</div> :
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <button className="time-arrow" onClick={() => enabled && x.fn(x.s)}>▲</button>
                  <div className="time-digit">{x.v.toString().padStart(2, '0')}</div>
                  <button className="time-arrow" onClick={() => enabled && x.fn(-x.s)}>▼</button>
                </div>
              ))}
            </div>
          </div>

          {/* Days */}
          <div style={{ padding: '16px 0', borderBottom: '0.5px solid rgba(44,44,44,0.05)' }}>
            <div style={{ fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: 4, color: '#C4A08A', opacity: 0.45, textTransform: 'uppercase', marginBottom: 12 }}>JOURS</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
              {dayLabels.map((d, idx) => {
                const a = days.includes(d.id);
                return (
                  <div key={idx} className="day-btn"
                    style={{ background: a ? '#C4A08A' : 'transparent', border: a ? 'none' : '0.5px solid rgba(44,44,44,0.08)' }}
                    onClick={() => enabled && setDays(p => a ? p.filter(x => x !== d.id) : [...p, d.id])}>
                    <span style={{ fontFamily: 'var(--sans)', fontSize: 10, fontWeight: a ? 400 : 300, color: a ? '#F6F3ED' : '#8a8078', opacity: a ? 1 : 0.5 }}>{d.l}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sound */}
          <div style={{ padding: '16px 0' }}>
            <div style={{ fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: 4, color: '#C4A08A', opacity: 0.45, textTransform: 'uppercase', marginBottom: 12 }}>SON</div>
            {SOUNDS.map(s => (
              <div key={s.id} className="sound-row" style={{ background: sound === s.id ? 'var(--terre-bg)' : 'transparent' }}
                onClick={() => enabled && setSound(s.id)}>
                <div className="radio-outer" style={{ border: `1.5px solid ${sound === s.id ? '#C4A08A' : 'rgba(44,44,44,0.1)'}` }}>
                  {sound === s.id && <div className="radio-inner" />}
                </div>
                <span style={{ fontFamily: 'var(--serif)', fontSize: 14, color: '#2C2C2C', opacity: sound === s.id ? 0.9 : 0.5 }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ paddingBottom: 10, textAlign: 'center' }}>
          <button className="btn-terre" onClick={() => enabled && setRinging(true)} style={{ opacity: enabled ? 0.55 : 0.2 }}>TESTER LE RÉVEIL</button>
        </div>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════
   AFFIRMATIONS & QUALITÉS SCREEN
   ═══════════════════════════════════════════════════ */

function AffirmationsScreen() {
  const [tab, setTab] = useState('affirmations');
  const [filterTag, setFilterTag] = useState(null);
  const [editingId, setEditingId] = useState(null);
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
            <div style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontStyle: 'italic', fontSize: 16, color: '#2C2C2C', marginBottom: 14, textAlign: 'center' }}>
              {isAff ? 'Nouvelle affirmation' : 'Nouvelle qualité'}
            </div>
            <input value={newText} onChange={e => setNewText(e.target.value)}
              placeholder={isAff ? '« Mon affirmation… »' : 'Ma qualité…'}
              style={{ width: '100%', fontFamily: 'var(--serif)', fontSize: 14, fontStyle: 'italic', color: '#2C2C2C',
                background: 'var(--terre-bg)', border: 'none', outline: 'none', padding: '10px 12px',
                borderBottom: '1px solid rgba(196,160,138,0.2)', marginBottom: 14 }} />
            <div style={{ fontFamily: 'var(--sans)', fontSize: 8, letterSpacing: 3, color: '#C4A08A', opacity: 0.45, textTransform: 'uppercase', marginBottom: 8 }}>ASSOCIER</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 14 }}>
              {Object.keys(TAG_META).map(t => <TagPill key={t} tag={t} active={newTags.includes(t)} onClick={() => togNewTag(t)} />)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
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
          <div className="overlay-panel" style={{ width: 280, padding: '24px 20px 18px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 15, fontStyle: 'italic', color: '#2C2C2C', marginBottom: 18 }}>
              Supprimer {isAff ? 'cette affirmation' : 'cette qualité'} ?
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
              <button className="btn-secondary" onClick={() => setDeleteTarget(null)}>ANNULER</button>
              <button className="btn-secondary" style={{ color: '#b85a50', opacity: 0.7 }} onClick={() => delItem(deleteTarget)}>SUPPRIMER</button>
            </div>
          </div>
        </div>
      )}

      <div className="screen-inner" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ paddingTop: 64, textAlign: 'center', marginBottom: 4 }}>
          <div className="screen-title" style={{ fontSize: 19 }}>Affirmations & Qualités</div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 8 }}>
          {[['affirmations', 'Affirmations'], ['qualites', 'Qualités']].map(([v, l]) => (
            <div key={v} onClick={() => { setTab(v); setEditingId(null); setFilterTag(null); }} style={{
              fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: 3, fontWeight: 300,
              textTransform: 'uppercase', padding: '6px 14px', cursor: 'pointer',
              color: tab === v ? '#2C2C2C' : '#8a8078',
              borderBottom: tab === v ? '0.5px solid #C4A08A' : '0.5px solid transparent',
              opacity: tab === v ? 1 : 0.4,
            }}>{l}</div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 6 }}>
          <div onClick={() => setFilterTag(null)} style={{
            fontFamily: 'var(--sans)', fontSize: 8, letterSpacing: 2, padding: '3px 8px', cursor: 'pointer',
            textTransform: 'uppercase',
            color: filterTag === null ? '#2C2C2C' : '#8a8078', opacity: filterTag === null ? 0.7 : 0.3,
            background: filterTag === null ? 'var(--terre-bg)' : 'transparent',
            border: `0.5px solid ${filterTag === null ? 'rgba(196,160,138,0.2)' : 'rgba(44,44,44,0.04)'}`,
          }}>Tous</div>
          {Object.keys(TAG_META).map(t => <TagPill key={t} tag={t} small active={filterTag === t} onClick={() => setFilterTag(filterTag === t ? null : t)} />)}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 2px', marginBottom: 4 }}>
          <span style={{ fontFamily: 'var(--sans)', fontSize: 9, fontWeight: 300, color: '#8a8078', opacity: 0.45 }}>{filtered.length} élément{filtered.length > 1 ? 's' : ''}</span>
          <span style={{ fontFamily: 'var(--sans)', fontSize: 8, color: '#C4A08A', opacity: 0.35 }}>♥ = plus souvent</span>
        </div>

        {/* Items list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filtered.map(item => {
            const isEd = editingId === item.id;
            const txt = isAff ? item.text : item.name;
            const canEdit = !item.preset;

            return (
              <div key={item.id} className="aff-item">
                <div className="aff-row">
                  {isAff && <span className="aff-quote">«</span>}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {isEd && canEdit ? (
                      isAff ? (
                        <textarea autoFocus defaultValue={txt} rows={2}
                          onBlur={e => updateText(item.id, e.target.value)}
                          style={{ width: '100%', fontFamily: 'var(--serif)', fontSize: 13, fontStyle: 'italic', color: '#2C2C2C',
                            background: 'var(--terre-bg)', border: 'none', outline: 'none', padding: '4px 6px',
                            resize: 'none', borderBottom: '1px solid rgba(196,160,138,0.2)', lineHeight: 1.5 }} />
                      ) : (
                        <input autoFocus defaultValue={txt}
                          onBlur={e => updateText(item.id, e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && updateText(item.id, e.target.value)}
                          style={{ fontFamily: 'var(--serif)', fontSize: 14, color: '#2C2C2C',
                            background: 'var(--terre-bg)', border: 'none', outline: 'none', padding: '3px 6px',
                            width: '100%', borderBottom: '1px solid rgba(196,160,138,0.2)' }} />
                      )
                    ) : (
                      <div onClick={() => canEdit && setEditingId(item.id)} style={{ cursor: canEdit ? 'text' : 'default' }}>
                        <div className={isAff ? 'aff-text' : 'qual-text'}>{txt}</div>
                      </div>
                    )}

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 4, alignItems: 'center' }}>
                      {item.tags.map(t => <TagPill key={t} tag={t} active small />)}
                      {item.preset && <span style={{ fontFamily: 'var(--sans)', fontSize: 6, letterSpacing: 1, color: '#C4A08A', opacity: 0.3, textTransform: 'uppercase', marginLeft: 2 }}>PRÉ.</span>}
                      {canEdit && <span onClick={() => setEditingId(isEd ? null : item.id)} style={{ fontFamily: 'var(--sans)', fontSize: 8, color: '#C4A08A', opacity: 0.25, cursor: 'pointer', padding: '0 3px' }}>✎</span>}
                    </div>

                    {isEd && canEdit && (
                      <div style={{ padding: '6px 0 2px', display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                        {Object.keys(TAG_META).map(t => (
                          <TagPill key={t} tag={t} active={item.tags.includes(t)} small onClick={() => togItemTag(item.id, t)} />
                        ))}
                      </div>
                    )}
                  </div>

                  <button className="fav-btn" onClick={() => toggleFav(item.id)}>
                    <span style={{ color: '#C4A08A', opacity: item.fav ? 0.7 : 0.15 }}>{item.fav ? '♥' : '♡'}</span>
                  </button>

                  {canEdit ? (
                    <button className="del-btn" onClick={() => setDeleteTarget(item.id)}>✕</button>
                  ) : <div style={{ width: 14 }} />}
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
          <div className="screen-title" style={{ fontSize: 20 }}>Réglages</div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {settings.map((x, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: '0.5px solid rgba(44,44,44,0.05)' }}>
              <div style={{ fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 300, color: '#2C2C2C' }}>{x.l}</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 13, color: '#8a8078', fontStyle: 'italic' }}>{x.v}</div>
            </div>
          ))}

          <div style={{ marginTop: 28, padding: '16px 0', borderTop: '0.5px solid rgba(44,44,44,0.05)' }}>
            <div style={{ fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: 3, color: '#C4A08A', opacity: 0.4, textTransform: 'uppercase', marginBottom: 12 }}>À PROPOS</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 13, fontStyle: 'italic', color: '#8a8078', lineHeight: 1.6 }}>
              Miracle Morning — soin matinal pour personnes sensibles.
            </div>
          </div>

          <div style={{ marginTop: 20, padding: '16px 0', borderTop: '0.5px solid rgba(44,44,44,0.05)' }}>
            <div onClick={resetData} style={{
              fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: 3, color: '#b85a50',
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
  const [routines, setRoutines] = useState(() => {
    const stored = Store.get('routines', null);
    return stored || Object.values(DEFAULT_ROUTINES);
  });

  useEffect(() => { Store.set('routines', routines); }, [routines]);

  return (
    <div className="app-shell">
      {tab === 'accueil' && <AccueilScreen routines={routines} onGoRoutines={() => setTab('routines')} />}
      {tab === 'routines' && <RoutinesScreen routines={routines} setRoutines={setRoutines} />}
      {tab === 'reveil' && <ReveilScreen onStartRoutine={() => setTab('accueil')} />}
      {tab === 'journal' && <JournalScreen />}
      {tab === 'affirmations' && <AffirmationsScreen />}
      {tab === 'profil' && <ProfilScreen />}
      <TabBar active={tab} onTab={setTab} />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));
