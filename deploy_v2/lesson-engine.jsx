// Lesson Player — chrome around a lesson interactive
// Provides: title bar, ♪ Listen button, X close, optional step nav, narration

const { useState: useStateLP, useEffect: useEffectLP, useRef: useRefLP } = React;

window.LessonPlayer = function LessonPlayer({ lesson, onClose, speak, children }) {
  // ESC to close
  useEffectLP(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="lesson-player">
      <header className="lesson-bar">
        <button className="lesson-bar-close" onClick={onClose}>← Back to lab</button>
        <div className="lesson-bar-title">
          <span className="lesson-bar-num">№ {lesson.n}</span>
          <span className="lesson-bar-divider">·</span>
          <em>{lesson.title}</em>
        </div>
        <div className="lesson-bar-group">{lesson.group}</div>
      </header>
      <div className="lesson-content">
        {children}
      </div>
    </div>
  );
};

// Reusable "stage navigator" — for lessons with sequential steps
// Pass: stages=[{caption, narration}], rendered visual is the children
window.LessonStages = function LessonStages({ stages, children, speak, autoPlay = false, onStageChange }) {
  const [stage, setStage] = useStateLP(0);
  const total = stages.length;
  const current = stages[stage] || stages[0];

  useEffectLP(() => {
    if (onStageChange) onStageChange(stage);
  }, [stage]);

  const next = () => setStage(s => Math.min(s + 1, total - 1));
  const prev = () => setStage(s => Math.max(s - 1, 0));
  const handleSpeak = () => {
    if (current && current.narration) speak(current.narration);
  };

  return (
    <div className="lesson-stages-shell">
      {typeof children === 'function' ? children(stage, setStage) : children}

      <div className="lesson-stage-panel">
        <div className="lesson-stage-eyebrow">
          Step {stage + 1} of {total}
        </div>
        <p className="lesson-stage-caption">{current.caption}</p>
        <div className="lesson-stage-controls">
          <button className="lesson-btn ghost" onClick={prev} disabled={stage === 0}>← Back</button>
          <button className="lesson-btn listen" onClick={handleSpeak}>♪ Listen</button>
          <button className="lesson-btn primary" onClick={next} disabled={stage === total - 1}>
            {stage === total - 1 ? 'Done' : 'Next →'}
          </button>
        </div>
        <div className="lesson-stage-progress">
          {stages.map((_, i) => (
            <span key={i} className={`lesson-stage-dot ${i <= stage ? 'on' : ''} ${i === stage ? 'cur' : ''}`} onClick={() => setStage(i)} />
          ))}
        </div>
      </div>
    </div>
  );
};

// Inline "♪ Listen" affordance for free-form interactives
window.ListenButton = function ListenButton({ text, speak, label = '♪ Listen' }) {
  return (
    <button className="lesson-btn listen inline" onClick={() => speak(text)}>{label}</button>
  );
};

// Simple lesson thumbnail (mini SVG glyph per lesson)
window.LessonThumbnail = function LessonThumbnail({ id }) {
  const c = 'var(--accent)';
  const dim = 'rgba(212, 163, 92, 0.35)';

  const thumbs = {
    'moon-phases': (
      <svg viewBox="0 0 80 60" width="80" height="60">
        {[0, 1, 2, 3, 4].map(i => {
          const x = 10 + i * 15;
          const phase = i / 4; // 0..1
          return (
            <g key={i}>
              <circle cx={x} cy="30" r="6" fill={dim} />
              <path d={`M ${x} 24 A 6 6 0 0 1 ${x} 36 A ${6 - phase * 12} 6 0 0 ${phase < 0.5 ? 0 : 1} ${x} 24 Z`} fill={c} />
            </g>
          );
        })}
      </svg>
    ),
    'day-night': (
      <svg viewBox="0 0 80 60" width="80" height="60">
        <circle cx="40" cy="30" r="20" fill={dim} />
        <path d="M 40 10 A 20 20 0 0 1 40 50 Z" fill={c} />
        <line x1="40" y1="4" x2="40" y2="10" stroke={c} strokeWidth="1.5" />
        <line x1="40" y1="50" x2="40" y2="56" stroke={c} strokeWidth="1.5" />
      </svg>
    ),
    'seasons': (
      <svg viewBox="0 0 80 60" width="80" height="60">
        <circle cx="40" cy="30" r="8" fill={c} />
        {[0, 1, 2, 3].map(i => {
          const a = (i / 4) * Math.PI * 2;
          const x = 40 + Math.cos(a) * 24;
          const y = 30 + Math.sin(a) * 18;
          return <circle key={i} cx={x} cy={y} r="3" fill={dim} />;
        })}
        <ellipse cx="40" cy="30" rx="26" ry="20" stroke={dim} fill="none" />
      </svg>
    ),
    'eclipses': (
      <svg viewBox="0 0 80 60" width="80" height="60">
        <circle cx="22" cy="30" r="12" fill={c} />
        <circle cx="40" cy="30" r="6" fill="var(--bg-deep)" stroke={c} strokeWidth="1" />
        <circle cx="60" cy="30" r="10" fill={dim} />
      </svg>
    ),
    'tides': (
      <svg viewBox="0 0 80 60" width="80" height="60">
        <ellipse cx="30" cy="30" rx="14" ry="10" fill={dim} />
        <ellipse cx="30" cy="30" rx="18" ry="11" fill="none" stroke={c} />
        <circle cx="62" cy="30" r="4" fill={c} />
        <line x1="48" y1="30" x2="58" y2="30" stroke={c} strokeDasharray="2 2" />
      </svg>
    ),
    'asteroid-belt': (
      <svg viewBox="0 0 80 60" width="80" height="60">
        <circle cx="40" cy="30" r="4" fill={c} />
        {[...Array(20)].map((_, i) => {
          const a = (i / 20) * Math.PI * 2;
          const r = 18 + Math.random() * 8;
          return <circle key={i} cx={40 + Math.cos(a) * r} cy={30 + Math.sin(a) * r * 0.7} r="1" fill={c} opacity="0.6" />;
        })}
      </svg>
    ),
    'saturn-rings': (
      <svg viewBox="0 0 80 60" width="80" height="60">
        <ellipse cx="40" cy="30" rx="26" ry="6" fill="none" stroke={c} strokeWidth="1" />
        <ellipse cx="40" cy="30" rx="22" ry="5" fill="none" stroke={dim} strokeWidth="1" />
        <circle cx="40" cy="30" r="10" fill={c} />
      </svg>
    ),
    'comets': (
      <svg viewBox="0 0 80 60" width="80" height="60">
        <path d="M 10 50 L 50 22" stroke={dim} strokeWidth="3" strokeLinecap="round" opacity="0.5" />
        <path d="M 18 46 L 52 22" stroke={c} strokeWidth="2" strokeLinecap="round" opacity="0.8" />
        <circle cx="55" cy="20" r="4" fill={c} />
      </svg>
    ),
    'meteors': (
      <svg viewBox="0 0 80 60" width="80" height="60">
        <path d="M 10 10 L 30 30" stroke={c} strokeWidth="2" strokeLinecap="round" />
        <path d="M 40 8 L 56 24" stroke={c} strokeWidth="2" strokeLinecap="round" />
        <path d="M 30 20 L 50 40" stroke={dim} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="60" cy="50" r="6" fill={dim} />
      </svg>
    ),
    'gravity': (
      <svg viewBox="0 0 80 60" width="80" height="60">
        <circle cx="40" cy="48" r="10" fill={dim} />
        <circle cx="40" cy="20" r="3" fill={c} />
        <path d="M 40 24 L 40 38" stroke={c} strokeWidth="1.5" strokeDasharray="2 2" />
        <path d="M 36 34 L 40 38 L 44 34" fill="none" stroke={c} strokeWidth="1.5" />
      </svg>
    ),
    'curvature': (
      <svg viewBox="0 0 80 60" width="80" height="60">
        {[10, 18, 26, 34, 42].map(y => (
          <path key={y} d={`M 5 ${y} Q 40 ${y + (y > 26 ? 20 : 12)} 75 ${y}`} stroke={dim} fill="none" />
        ))}
        <circle cx="40" cy="36" r="5" fill={c} />
      </svg>
    ),
    'adventures': (
      <svg viewBox="0 0 80 60" width="80" height="60">
        <path d="M 5 50 L 25 30 L 40 42 L 55 25 L 75 50 Z" fill={dim} />
        <circle cx="60" cy="14" r="6" fill={c} />
        <path d="M 30 50 L 30 40 L 35 40 L 35 50" fill={c} opacity="0.6" />
      </svg>
    ),
  };

  return <div className="lesson-thumb">{thumbs[id] || null}</div>;
};
