// Individual think card with question + interactive answer reveal

const { useState: useStateTC, useEffect: useEffectTC } = React;

window.ThinkCard = function ThinkCard({ card, isOpen, onToggle, speak }) {
  return (
    <div className={`think-card ${isOpen ? 'open' : ''} ${card.featured ? 'featured' : ''}`}>
      <button className="think-card-header" onClick={onToggle}>
        <span className="think-card-num">{card.n}</span>
        <div className="think-card-titles">
          <h2 className="think-card-title">{card.title}</h2>
          <div className="think-card-sub">{card.sub}</div>
        </div>
        <span className="think-card-toggle">{isOpen ? '−' : '+'}</span>
      </button>

      {isOpen && (
        <div className="think-card-body">
          {card.id === 'smallest' && <window.SizeRaceCard mode="smallest" speak={speak} />}
          {card.id === 'biggest' && <window.SizeRaceCard mode="biggest" speak={speak} />}
          {card.id === 'where' && <window.WhereCard speak={speak} />}
          {card.id === 'count' && <window.CountCard speak={speak} />}
          {card.id === 'sun' && <window.SunCard speak={speak} />}
        </div>
      )}
    </div>
  );
};

// ─── Size Race ───
// Animates planets into size order, smallest or biggest highlighted.
window.SizeRaceCard = function SizeRaceCard({ mode, speak }) {
  const [revealed, setRevealed] = useStateTC(false);
  const planets = window.SOLAR_DATA.planets;
  const sorted = [...planets].sort((a, b) => a.diameter_km - b.diameter_km);
  const order = mode === 'biggest' ? [...sorted].reverse() : sorted;
  // Visual sizes - relative scale, capped
  const maxD = Math.max(...planets.map(p => p.diameter_km));
  const sizeFor = (d) => 36 + (d / maxD) * 100;

  const winner = order[0];
  const target = mode === 'biggest' ? 'Jupiter' : 'Mercury';

  useEffectTC(() => {
    if (revealed) speak(target + ' is the ' + (mode === 'biggest' ? 'biggest' : 'smallest') + ' planet.');
  }, [revealed]);

  return (
    <div className="card-content">
      <div className="size-race">
        {(revealed ? order : planets).map((p, i) => (
          <div
            key={p.id}
            className={`size-race-item ${revealed && i === 0 ? 'winner' : ''}`}
            style={{ '--delay': `${i * 0.08}s` }}
          >
            <div className="size-race-planet" style={{ width: sizeFor(p.diameter_km), height: sizeFor(p.diameter_km) }}>
              <window.PlanetSVG id={p.id} size={sizeFor(p.diameter_km)} />
            </div>
            <div className="size-race-name">{p.name}</div>
            {revealed && i === 0 && <div className="size-race-badge">{mode === 'biggest' ? 'BIGGEST' : 'SMALLEST'}</div>}
          </div>
        ))}
      </div>
      <div className="reveal-area">
        {!revealed ? (
          <button className="reveal-btn" onClick={() => setRevealed(true)}>
            Show me the {mode === 'biggest' ? 'biggest' : 'smallest'} →
          </button>
        ) : (
          <div className="reveal-text">
            <em>{winner.name}</em> is the {mode === 'biggest' ? 'biggest' : 'smallest'} planet.
            {mode === 'biggest' && ' It is so huge, all the other planets could fit inside!'}
            {mode === 'smallest' && ' It is even smaller than some moons in our solar system.'}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Where Do We Live ───
window.WhereCard = function WhereCard({ speak }) {
  const [stage, setStage] = useStateTC(0); // 0: lineup, 1: zoomed Earth

  useEffectTC(() => {
    if (stage === 1) speak('We live on Earth. The third planet from the Sun.');
  }, [stage]);

  const planets = window.SOLAR_DATA.planets;
  const maxD = Math.max(...planets.map(p => p.diameter_km));
  const sizeFor = (d) => 24 + (d / maxD) * 64;

  return (
    <div className="card-content where-card">
      {stage === 0 && (
        <>
          <div className="where-lineup">
            {planets.map((p, i) => (
              <div
                key={p.id}
                className={`where-lineup-item ${p.id === 'earth' ? 'is-earth' : ''}`}
                onClick={() => { if (p.id === 'earth') setStage(1); }}
              >
                <window.PlanetSVG id={p.id} size={sizeFor(p.diameter_km)} />
                <div className="where-num">{p.order}</div>
              </div>
            ))}
          </div>
          <div className="reveal-area">
            <p className="where-prompt">Tap the planet you live on...</p>
          </div>
        </>
      )}
      {stage === 1 && (
        <div className="where-zoom">
          <div className="where-earth-big">
            <window.PlanetSVG id="earth" size={260} />
            <div className="where-pin">↓<br/><span>You are here</span></div>
          </div>
          <div className="reveal-text">
            <em>Earth</em> — our home! The third planet from the Sun, and the only one we know with oceans, trees, and you, Bosco.
          </div>
          <button className="reveal-btn small" onClick={() => setStage(0)}>← Try again</button>
        </div>
      )}
    </div>
  );
};

// ─── Counting ───
window.CountCard = function CountCard({ speak }) {
  const [count, setCount] = useStateTC(0);
  const planets = window.SOLAR_DATA.planets;
  const maxD = Math.max(...planets.map(p => p.diameter_km));
  const sizeFor = (d) => 22 + (d / maxD) * 60;

  const next = () => {
    if (count >= 8) { setCount(0); return; }
    const n = count + 1;
    setCount(n);
    speak(String(n));
  };

  useEffectTC(() => {
    if (count === 8) {
      setTimeout(() => speak('Eight planets! From Mercury to Neptune.'), 800);
    }
  }, [count]);

  return (
    <div className="card-content count-card">
      <div className="count-lineup">
        {planets.map((p, i) => (
          <div
            key={p.id}
            className={`count-item ${i < count ? 'counted' : ''} ${i === count - 1 ? 'just-counted' : ''}`}
          >
            <window.PlanetSVG id={p.id} size={sizeFor(p.diameter_km)} />
            <div className="count-num">{i < count ? (i + 1) : '·'}</div>
            <div className="count-name">{p.name}</div>
          </div>
        ))}
      </div>
      <div className="reveal-area">
        <div className="count-big">{count} <span>/ 8</span></div>
        <button className="reveal-btn" onClick={next}>
          {count === 0 ? 'Start counting' : count === 8 ? 'Count again' : `Next: ${count + 1}`}
        </button>
        {count === 8 && (
          <div className="reveal-text">
            There are <em>eight planets</em> in our solar system. Pluto is a tiny dwarf planet, just outside!
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Why Do We Need The Sun (featured) ───
const SUN_REASONS = [
  { icon: 'light', title: 'Light', body: 'Without the Sun, our days would be dark all the time. The Sun lights up our sky and lets us see colors, faces, and the world around us.' },
  { icon: 'warmth', title: 'Warmth', body: "The Sun keeps Earth warm. Without it, the oceans would freeze and the air would be colder than the deepest winter — too cold for any plant or animal." },
  { icon: 'food', title: 'Food & Plants', body: 'Plants drink sunlight to grow — leaves, trees, fruit, and the food we eat. No sunlight, no plants. No plants, no food for animals or for us.' },
  { icon: 'gravity', title: 'Gravity & Home', body: "The Sun's invisible pull holds Earth in its orbit, like a grown-up holding your hand. Without it, Earth would drift away into cold, dark space." },
];

window.SunCard = function SunCard({ speak }) {
  const [active, setActive] = useStateTC(0);

  useEffectTC(() => {
    const r = SUN_REASONS[active];
    if (r) speak(r.title + '. ' + r.body);
  }, [active]);

  return (
    <div className="card-content sun-card">
      <div className="sun-visual">
        <div className="sun-rays-bg">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="sun-ray" style={{ transform: `rotate(${i * 30}deg)` }} />
          ))}
        </div>
        <div className="sun-portrait">
          <window.PlanetSVG id="sun" size={200} />
        </div>
        <div className="sun-pulse"></div>
      </div>

      <div className="sun-reasons">
        <div className="sun-reasons-eyebrow">Four reasons</div>
        <div className="sun-reasons-tabs">
          {SUN_REASONS.map((r, i) => (
            <button
              key={r.icon}
              className={`sun-reason-tab ${i === active ? 'active' : ''}`}
              onClick={() => setActive(i)}
            >
              <window.SunReasonIcon kind={r.icon} />
              <span>{r.title}</span>
            </button>
          ))}
        </div>
        <div className="sun-reason-body">
          <h3>{SUN_REASONS[active].title}</h3>
          <p>{SUN_REASONS[active].body}</p>
        </div>
        <div className="sun-reasons-progress">
          {SUN_REASONS.map((_, i) => (
            <button
              key={i}
              className={`sun-dot ${i === active ? 'active' : ''}`}
              onClick={() => setActive(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Small inline icons for the four reasons
window.SunReasonIcon = function SunReasonIcon({ kind }) {
  const c = 'var(--accent)';
  if (kind === 'light') return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="5" fill={c} />
      {[...Array(8)].map((_, i) => {
        const a = (i * Math.PI * 2) / 8;
        const x1 = 14 + Math.cos(a) * 8, y1 = 14 + Math.sin(a) * 8;
        const x2 = 14 + Math.cos(a) * 12, y2 = 14 + Math.sin(a) * 12;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth="2" strokeLinecap="round" />;
      })}
    </svg>
  );
  if (kind === 'warmth') return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M14 4 C 18 8, 20 12, 18 16 C 16 20, 12 20, 10 16 C 8 12, 10 8, 14 4 Z" fill={c} />
      <circle cx="14" cy="22" r="3" fill={c} />
    </svg>
  );
  if (kind === 'food') return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M14 22 L 14 12" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <path d="M14 14 C 10 12, 7 14, 7 18 C 11 18, 13 16, 14 14 Z" fill={c} />
      <path d="M14 12 C 18 10, 21 12, 21 16 C 17 16, 15 14, 14 12 Z" fill={c} />
      <ellipse cx="14" cy="24" rx="6" ry="1.5" fill={c} opacity="0.4" />
    </svg>
  );
  if (kind === 'gravity') return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <ellipse cx="14" cy="14" rx="10" ry="4" stroke={c} strokeWidth="1.5" fill="none" />
      <circle cx="14" cy="14" r="3" fill={c} />
      <circle cx="23" cy="14" r="1.8" fill={c} />
    </svg>
  );
  return null;
};
