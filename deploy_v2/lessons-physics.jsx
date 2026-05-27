// Physics & adventure lessons: Gravity, Curvature, Adventures

const { useState: useStateP1, useEffect: useEffectP1, useRef: useRefP1, useMemo: useMemoP1 } = React;

// ─────────────────────────────────────────────────────────────────
// 10. GRAVITY — drop a ball on each planet, compare fall speeds
// ─────────────────────────────────────────────────────────────────

// Real surface gravity in g (Earth = 1.0)
const PLANET_GRAVITY = {
  sun: 27.9,
  mercury: 0.38,
  venus: 0.91,
  earth: 1.0,
  moon: 0.165,
  mars: 0.38,
  jupiter: 2.53,
  saturn: 1.07,
  uranus: 0.89,
  neptune: 1.14,
  pluto: 0.063,
};

const GRAVITY_PLANETS = [
  { id: 'moon', name: 'Moon', tip: 'Pluto-like — bounce slow & far' },
  { id: 'mars', name: 'Mars', tip: '1/3 of Earth — leap like a kangaroo' },
  { id: 'earth', name: 'Earth', tip: 'Home — normal gravity' },
  { id: 'jupiter', name: 'Jupiter', tip: '2.5× — you\'d feel SO heavy' },
  { id: 'sun', name: 'Sun', tip: '28× — crushed flat!' },
];

window.GravityLesson = function GravityLesson({ speak }) {
  const [active, setActive] = useStateP1('earth');
  const [dropping, setDropping] = useStateP1(false);
  const [ballY, setBallY] = useStateP1(0);

  const drop = () => {
    setDropping(true);
    setBallY(0);
    const g = PLANET_GRAVITY[active];
    const start = performance.now();
    const tick = (t) => {
      const elapsed = (t - start) / 1000;
      // y = 0.5 * g * t²  (in our units, scale so Earth in 1 sec drops the full height)
      const fallHeight = 0.5 * g * elapsed * elapsed * 240;
      if (fallHeight >= 240) {
        setBallY(240);
        setDropping(false);
        return;
      }
      setBallY(fallHeight);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const planet = active;
  const g = PLANET_GRAVITY[planet];
  // Estimated drop time
  const dropTime = Math.sqrt(2 * 240 / (g * 240));
  // Bosco's weight (~15kg) on this planet:
  const weight = Math.round(15 * g);

  return (
    <window.LessonStages
      speak={speak}
      stages={[
        { caption: "Gravity is how much a planet pulls things toward it. Big heavy planets pull harder!", narration: "Gravity is how much a planet pulls. Big heavy planets pull harder." },
        { caption: "Pick a planet, then tap DROP. Watch how fast the ball falls — and compare!", narration: "Pick a planet and tap drop. Watch how fast the ball falls." },
        { caption: "On the Moon, balls fall slooooowly — that's why astronauts bounce around. On Jupiter, balls SLAM down — Bosco would feel super heavy.", narration: "On the Moon, balls fall slowly. On Jupiter, balls slam down fast." },
        { caption: "Same ball, different planet, totally different fall. Same Bosco, totally different weight!", narration: "Same ball, different planet, totally different fall. Same Bosco, totally different weight." },
      ]}
    >
      <div className="lesson-canvas gravity-canvas">
        <svg viewBox="0 0 700 500" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
          {/* Planet surface (different color per planet) */}
          {(() => {
            const surfaceColors = {
              sun: ['#ff8a1a', '#d63800'],
              mercury: ['#8a7560', '#3a2e22'],
              moon: ['#a89c8c', '#3a342a'],
              venus: ['#c89858', '#4a2a10'],
              earth: ['#3a7a44', '#091a3a'],
              mars: ['#a64020', '#2a0c04'],
              jupiter: ['#c89868', '#3a2010'],
              saturn: ['#c8a868', '#3a2810'],
              uranus: ['#7eb8c4', '#0a2832'],
              neptune: ['#2a4a9e', '#050e30'],
              pluto: ['#8a6a48', '#2a1808'],
            };
            const [top, bottom] = surfaceColors[planet] || surfaceColors.earth;
            return (
              <>
                <defs>
                  <linearGradient id="gr-ground" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={top} />
                    <stop offset="100%" stopColor={bottom} />
                  </linearGradient>
                </defs>
                <rect x="0" y="380" width="700" height="120" fill="url(#gr-ground)" />
                {/* Surface texture lines */}
                <path d="M 0 380 L 100 372 L 220 384 L 350 376 L 480 386 L 600 374 L 700 382" stroke="rgba(0,0,0,0.2)" fill="none" />
              </>
            );
          })()}

          {/* Drop tower / starting line */}
          <line x1="80" y1="140" x2="200" y2="140" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="4 4" />
          <text x="84" y="132" fill="var(--accent)" fontFamily="JetBrains Mono" fontSize="9" letterSpacing="2">DROP HEIGHT</text>

          {/* Falling ball */}
          <g transform={`translate(140, ${140 + ballY})`}>
            <circle r="14" fill="#d4a35c" />
            <circle r="14" fill="rgba(255,255,255,0.25)" cx="-4" cy="-4" />
          </g>

          {/* "Bosco" pin on the right showing weight comparison */}
          <g transform="translate(560, 360)">
            <rect x="-30" y="-90" width="60" height="90" fill="rgba(15, 20, 36, 0.7)" stroke="rgba(212, 163, 92, 0.4)" />
            <text x="0" y="-75" textAnchor="middle" fill="var(--accent)" fontFamily="JetBrains Mono" fontSize="9" letterSpacing="2">BOSCO'S</text>
            <text x="0" y="-65" textAnchor="middle" fill="var(--accent)" fontFamily="JetBrains Mono" fontSize="9" letterSpacing="2">WEIGHT</text>
            <text x="0" y="-30" textAnchor="middle" fill="var(--ink)" fontFamily="Cormorant Garamond" fontStyle="italic" fontSize="28">{weight}</text>
            <text x="0" y="-12" textAnchor="middle" fill="var(--ink-faint)" fontFamily="JetBrains Mono" fontSize="9">kg</text>
          </g>

          {/* Gravity indicator */}
          <g transform="translate(80, 380)">
            <rect x="0" y="-200" width="20" height="200" fill="rgba(0,0,0,0.3)" stroke="rgba(212, 163, 92, 0.3)" />
            <rect x="2" y={-Math.min(195, g * 70)} width="16" height={Math.min(195, g * 70)} fill="var(--accent)" opacity="0.8" />
            <text x="-8" y="-205" fill="var(--accent)" fontFamily="JetBrains Mono" fontSize="9" letterSpacing="2">{g.toFixed(2)}g</text>
          </g>

          {/* Planet name big */}
          <text x="350" y="50" textAnchor="middle" fill="var(--ink)" fontFamily="Cormorant Garamond" fontStyle="italic" fontSize="32">
            On {GRAVITY_PLANETS.find(p => p.id === planet)?.name || planet}
          </text>
          <text x="350" y="74" textAnchor="middle" fill="var(--accent)" fontFamily="JetBrains Mono" fontSize="10" letterSpacing="3">
            {GRAVITY_PLANETS.find(p => p.id === planet)?.tip.toUpperCase() || ''}
          </text>
        </svg>

        <div className="gr-controls">
          <div className="gr-planets">
            {GRAVITY_PLANETS.map(p => (
              <button key={p.id} className={`gr-planet ${active === p.id ? 'active' : ''}`}
                      onClick={() => { setActive(p.id); setBallY(0); }}>
                <window.PlanetSVG id={p.id === 'moon' ? 'moon' : p.id} size={32} />
                <span>{p.name}</span>
              </button>
            ))}
          </div>
          <button className="lesson-btn primary" onClick={drop} disabled={dropping}>
            {dropping ? 'Falling...' : '↓ Drop the ball'}
          </button>
        </div>
      </div>
    </window.LessonStages>
  );
};

// ─────────────────────────────────────────────────────────────────
// 11. CURVATURE — Einstein's rubber-sheet visualization
// ─────────────────────────────────────────────────────────────────

window.CurvatureLesson = function CurvatureLesson({ speak }) {
  const [mass, setMass] = useStateP1(50); // 0..100
  const [time, setTime] = useStateP1(0);
  const [showOrbit, setShowOrbit] = useStateP1(true);

  useEffectP1(() => {
    let raf, last = performance.now();
    const tick = (t) => {
      const dt = (t - last) / 1000;
      last = t;
      setTime(prev => prev + dt);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const cx = 350, cy = 240;
  const massScale = mass / 50;
  const wellDepth = 60 * massScale;
  const sunR = 12 + massScale * 18;

  // Grid lines warped by gravity well
  const gridLines = useMemoP1(() => {
    const lines = [];
    const w = 600, h = 360;
    const xStart = cx - w / 2, yStart = cy - h / 2 + 30;
    // Horizontal lines warp downward near center
    for (let i = 0; i <= 12; i++) {
      const yBase = yStart + (i / 12) * h;
      let path = `M ${xStart} ${yBase}`;
      for (let j = 1; j <= 60; j++) {
        const x = xStart + (j / 60) * w;
        const dx = x - cx, dy = yBase - cy;
        const r = Math.sqrt(dx * dx + dy * dy) + 1;
        const wellPull = wellDepth * Math.exp(-r * r / 8000);
        path += ` L ${x} ${yBase + wellPull}`;
      }
      lines.push(path);
    }
    return lines;
  }, [wellDepth]);

  // Orbiting planet
  const orbitR = 110;
  const planetAngle = time * 0.6;
  const planetX = cx + Math.cos(planetAngle) * orbitR;
  const planetYRaw = cy + Math.sin(planetAngle) * orbitR * 0.4;
  // Sink toward well
  const dx = planetX - cx, dy = planetYRaw - cy;
  const r = Math.sqrt(dx * dx + dy * dy) + 1;
  const planetWell = wellDepth * Math.exp(-r * r / 8000);
  const planetY = planetYRaw + planetWell;

  return (
    <window.LessonStages
      speak={speak}
      stages={[
        { caption: "A very smart scientist named Einstein had a wild idea: gravity isn't really a pull — heavy things BEND space itself!", narration: "Einstein had a wild idea. Gravity is not really a pull. Heavy things bend space itself." },
        { caption: "Imagine space is a giant stretchy bedsheet. Put a heavy ball (like the Sun) in the middle — the sheet dips down.", narration: "Imagine space is a stretchy bedsheet. A heavy ball makes it dip down." },
        { caption: "Now roll a marble nearby. It rolls around the dip, like water swirling in a sink. That's how planets orbit the Sun!", narration: "Roll a marble nearby. It rolls around the dip. That is how planets orbit the Sun." },
        { caption: "Make the mass bigger and watch the dip get deeper. Bigger mass = bigger curve = stronger gravity. Mind blown? 🤯", narration: "Bigger mass makes a bigger curve, which means stronger gravity." },
      ]}
    >
      <div className="lesson-canvas curvature-canvas">
        <svg viewBox="0 0 700 500" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="cv-sun" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff8d8" />
              <stop offset="60%" stopColor="#ffcd45" />
              <stop offset="100%" stopColor="#ff8a1a" />
            </radialGradient>
          </defs>

          {/* Warped grid */}
          {gridLines.map((d, i) => (
            <path key={i} d={d} stroke="rgba(212, 163, 92, 0.35)" strokeWidth="0.8" fill="none" />
          ))}

          {/* Vertical grid lines (warped horizontally) */}
          {useMemoP1(() => {
            const lines = [];
            const w = 600, h = 360;
            const xStart = cx - w / 2, yStart = cy - h / 2 + 30;
            for (let i = 0; i <= 12; i++) {
              const xBase = xStart + (i / 12) * w;
              let path = `M ${xBase} ${yStart}`;
              for (let j = 1; j <= 40; j++) {
                const y = yStart + (j / 40) * h;
                const dx = xBase - cx, dy = y - cy;
                const r = Math.sqrt(dx * dx + dy * dy) + 1;
                const wellPull = wellDepth * Math.exp(-r * r / 8000);
                path += ` L ${xBase} ${y + wellPull}`;
              }
              lines.push(path);
            }
            return lines;
          }, [wellDepth]).map((d, i) => (
            <path key={'v' + i} d={d} stroke="rgba(212, 163, 92, 0.25)" strokeWidth="0.6" fill="none" />
          ))}

          {/* Orbit path (visible faintly) */}
          {showOrbit && (
            <ellipse cx={cx} cy={cy + wellDepth * 0.3} rx={orbitR} ry={orbitR * 0.4}
                     fill="none" stroke="rgba(122, 184, 232, 0.3)" strokeDasharray="3 4" />
          )}

          {/* Central mass (sun) */}
          <g transform={`translate(${cx}, ${cy + wellDepth * 0.3})`}>
            <circle r={sunR} fill="url(#cv-sun)" />
            <circle r={sunR + 4} fill="none" stroke="rgba(255, 200, 100, 0.3)" />
          </g>

          {/* Orbiting planet */}
          <g transform={`translate(${planetX}, ${planetY})`}>
            <circle r="8" fill="#5b9fd9" />
            <circle r="4" cx="-1" cy="-1" fill="#7ab8e8" />
          </g>

          {/* Labels */}
          <text x={cx} y="50" textAnchor="middle" fill="var(--ink)" fontFamily="Cormorant Garamond" fontStyle="italic" fontSize="24">
            Space-Time Curvature
          </text>
          <text x={cx} y="74" textAnchor="middle" fill="var(--accent)" fontFamily="JetBrains Mono" fontSize="9" letterSpacing="3">
            EINSTEIN · 1915
          </text>
        </svg>

        <div className="cv-controls">
          <span className="cv-label">Mass</span>
          <input type="range" min="10" max="100" step="1" value={mass}
                 onChange={e => setMass(parseInt(e.target.value))} />
          <span className="cv-value">{mass}×</span>
        </div>
      </div>
    </window.LessonStages>
  );
};

// ─────────────────────────────────────────────────────────────────
// 12. ADVENTURES — what you'd see standing on each world
// ─────────────────────────────────────────────────────────────────

const ADVENTURES = [
  {
    id: 'sun', name: 'The Sun', sky: ['#fff0a0', '#ffa040', '#cc4000'], ground: ['#ff8000', '#a02000'],
    eyebrow: 'IMPOSSIBLE VISIT', vibe: 'A roaring storm of plasma',
    paragraphs: [
      'You couldn\'t stand here — there\'s no ground at all! The Sun is a giant ball of glowing gas, 5,500°C on the surface.',
      'Looking up, the sky would be... well, you\'d be IN the sky. Plasma flares as tall as Earth would curl above you.',
      'Spacecraft can only get close, never land. The Parker Solar Probe is the closest we\'ve ever sent.',
    ],
  },
  {
    id: 'moon', name: 'The Moon', sky: ['#000010', '#000028', '#000040'], ground: ['#9a8e7e', '#3a342a'],
    eyebrow: "EARTH'S COMPANION", vibe: 'Silent, dusty, breathtaking',
    paragraphs: [
      "No air, no sound. Stand still and you'd see Earth hanging in the BLACK sky — blue and beautiful.",
      'The ground is fine gray dust, like flour. Your footprints from 1969 are still there because there\'s no wind.',
      "Jump! With only 1/6 Earth's gravity, you'd leap as high as a basketball hoop. Days last 14 Earth days, then 14 nights.",
    ],
  },
  {
    id: 'mercury', name: 'Mercury', sky: ['#000010', '#100018', '#280028'], ground: ['#a89888', '#3a2e22'],
    eyebrow: 'PLANET ONE', vibe: 'Scorched + frozen at once',
    paragraphs: [
      "The Sun looks 3× bigger and 7× brighter than on Earth — but the sky is black because there's no air.",
      'Daytime: 430°C — hot enough to melt lead. Nighttime, just hours later: -180°C — colder than Antarctica.',
      "Craters everywhere. The longest day on Mercury lasts 176 Earth days — almost six months from one noon to the next.",
    ],
  },
  {
    id: 'venus', name: 'Venus', sky: ['#a08040', '#806020', '#604010'], ground: ['#a08040', '#5a3818'],
    eyebrow: 'THE HOTTEST WORLD', vibe: 'Yellow hell-sky, crushing weight',
    paragraphs: [
      "The sky glows orange-yellow and the air is so thick it would feel like standing under 900 meters of ocean.",
      'It\'s the hottest planet — 465°C — even hotter than Mercury. The clouds are made of sulfuric acid.',
      "Spacecraft we landed there melted in under 2 hours. You'd hear constant rumbling thunder.",
    ],
  },
  {
    id: 'mars', name: 'Mars', sky: ['#d0a890', '#a87858', '#604838'], ground: ['#c66a3f', '#4a1c0a'],
    eyebrow: 'PLANET FOUR · "OUR NEIGHBOR"', vibe: 'Rusty deserts, butterscotch sky',
    paragraphs: [
      "Stand on red dust under a butterscotch-orange sky. The Sun looks small — about half the size we see from Earth.",
      'Tallest mountain: Olympus Mons, three Mount Everests stacked. Deepest canyon: 4,000 km long (4× the Grand Canyon).',
      "Mornings can be -80°C. A summer afternoon at the equator? Warm enough for shorts! Future astronauts will likely visit here first.",
    ],
  },
  {
    id: 'jupiter', name: 'Jupiter', sky: ['#e8c890', '#c89868', '#8a5a30'], ground: null,
    eyebrow: 'GAS GIANT', vibe: 'No ground — endless storms',
    paragraphs: [
      "There's no ground to stand on. Jupiter is all gas — you'd just keep falling through layers of clouds.",
      "Winds blow 600 km/h. The Great Red Spot is a storm bigger than Earth that's been raging for 300+ years.",
      "Deep down, the pressure crushes hydrogen into a strange metal. The center is hotter than the Sun's surface.",
    ],
  },
  {
    id: 'saturn', name: 'Saturn', sky: ['#f5dcb0', '#c8a868', '#8a6840'], ground: null,
    eyebrow: 'PLANET SIX · THE RINGED GIANT', vibe: 'Falling through honey-colored clouds',
    paragraphs: [
      "Saturn has no surface either. You'd fall through pale yellow-cream clouds for thousands of kilometers.",
      "Look UP and see the rings stretching across the sky — billions of ice chunks shining brighter than the Moon does on Earth.",
      "Saturn is so light, if you had a bathtub big enough, it would FLOAT.",
    ],
  },
  {
    id: 'uranus', name: 'Uranus', sky: ['#d4eef0', '#7eb8c4', '#1a3a45'], ground: null,
    eyebrow: 'PLANET SEVEN · TIPPED ON ITS SIDE', vibe: 'Eerie pale blue, sideways seasons',
    paragraphs: [
      "An icy blue ocean of liquid methane. The sky is pale teal, very still and very cold — -224°C.",
      "Uranus is tipped 90° on its side, so its poles take turns facing the Sun. Each season lasts 21 EARTH YEARS.",
      "Faint, dark rings circle it — you might not even notice them at first.",
    ],
  },
  {
    id: 'neptune', name: 'Neptune', sky: ['#8aaee8', '#2a4a9e', '#0a1a4a'], ground: null,
    eyebrow: 'PLANET EIGHT · WINDIEST WORLD', vibe: 'Deep blue gloom, ferocious winds',
    paragraphs: [
      "Deep cobalt blue sky, no clear surface. The Sun looks like a bright star, 900× dimmer than from Earth.",
      "Winds blow 2,000 km/h — five times faster than a hurricane on Earth. The fastest winds in the solar system.",
      "It rains DIAMONDS in the deep atmosphere — pressure crushes methane into actual gem crystals.",
    ],
  },
  {
    id: 'pluto', name: 'Pluto', sky: ['#1a1428', '#0a0810', '#000000'], ground: ['#c9a98a', '#3a2818'],
    eyebrow: 'DWARF PLANET · THE FRONTIER', vibe: 'Icy plains under a midnight noon',
    paragraphs: [
      "Even at noon, it's as dim as twilight on Earth. The Sun is just a very bright star.",
      "The ground is frozen nitrogen and methane, dotted with red-brown patches. Mountains made of solid water ice.",
      "There's even a heart-shaped plain called Sputnik Planitia — a smooth frozen sea wider than Texas.",
    ],
  },
];

window.AdventuresLesson = function AdventuresLesson({ speak }) {
  const [active, setActive] = useStateP1('moon'); // start at moon — most relatable
  const adv = ADVENTURES.find(a => a.id === active);

  return (
    <div className="adventures-shell">
      <div className="adv-sidebar">
        <div className="adv-sidebar-eyebrow">Pick a world</div>
        <div className="adv-list">
          {ADVENTURES.map(a => (
            <button key={a.id} className={`adv-list-item ${active === a.id ? 'active' : ''}`}
                    onClick={() => setActive(a.id)}>
              <window.PlanetSVG id={a.id} size={36} />
              <span>{a.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="adv-viewport" style={{
        background: `linear-gradient(to bottom, ${adv.sky.join(', ')})`,
      }}>
        {/* Stars (only in night/space environments) */}
        {(adv.id === 'moon' || adv.id === 'mercury' || adv.id === 'pluto') && (
          <div className="adv-stars">
            {[...Array(60)].map((_, i) => (
              <div key={i} className="adv-star" style={{
                left: Math.random() * 100 + '%',
                top: Math.random() * 60 + '%',
                width: Math.random() * 2 + 0.5 + 'px',
                height: Math.random() * 2 + 0.5 + 'px',
              }} />
            ))}
          </div>
        )}

        {/* Sun/light source — bigger on Mercury, smaller far out */}
        {adv.id !== 'sun' && (
          <div className="adv-sun" style={{
            width: adv.id === 'mercury' ? 80 : adv.id === 'venus' ? 60 : adv.id === 'earth' ? 50 : adv.id === 'mars' ? 36 : adv.id === 'jupiter' ? 22 : adv.id === 'saturn' ? 14 : adv.id === 'uranus' ? 8 : adv.id === 'neptune' ? 4 : adv.id === 'pluto' ? 3 : adv.id === 'moon' ? 50 : 40,
            height: adv.id === 'mercury' ? 80 : adv.id === 'venus' ? 60 : adv.id === 'earth' ? 50 : adv.id === 'mars' ? 36 : adv.id === 'jupiter' ? 22 : adv.id === 'saturn' ? 14 : adv.id === 'uranus' ? 8 : adv.id === 'neptune' ? 4 : adv.id === 'pluto' ? 3 : adv.id === 'moon' ? 50 : 40,
            opacity: adv.id === 'venus' ? 0.3 : adv.id === 'pluto' ? 0.5 : 0.9,
          }} />
        )}

        {/* Earth in sky (Moon only) */}
        {adv.id === 'moon' && (
          <div className="adv-earth-in-sky">
            <window.PlanetSVG id="earth" size={90} />
            <div className="adv-earth-label">Earth</div>
          </div>
        )}

        {/* Saturn rings overhead */}
        {adv.id === 'saturn' && (
          <svg className="adv-rings-overhead" viewBox="0 0 800 200" preserveAspectRatio="none">
            <path d="M 0 100 Q 400 60, 800 100" stroke="rgba(212, 180, 130, 0.7)" strokeWidth="4" fill="none" />
            <path d="M 0 110 Q 400 70, 800 110" stroke="rgba(180, 150, 100, 0.5)" strokeWidth="2" fill="none" />
            <path d="M 0 120 Q 400 80, 800 120" stroke="rgba(212, 180, 130, 0.4)" strokeWidth="3" fill="none" />
          </svg>
        )}

        {/* Ground */}
        {adv.ground && (
          <div className="adv-ground" style={{
            background: `linear-gradient(to bottom, ${adv.ground[0]}, ${adv.ground[1]})`,
          }}>
            {/* Surface details — craters/rocks/dunes */}
            {[...Array(8)].map((_, i) => (
              <div key={i} className="adv-surface-rock" style={{
                left: (i * 12 + Math.random() * 6) + '%',
                bottom: Math.random() * 30 + 'px',
                width: 20 + Math.random() * 40 + 'px',
                height: 6 + Math.random() * 10 + 'px',
                background: adv.ground[1],
              }} />
            ))}
          </div>
        )}

        {/* If gas giant, show roiling clouds */}
        {!adv.ground && (
          <>
            <div className="adv-clouds adv-cloud-1" />
            <div className="adv-clouds adv-cloud-2" />
            <div className="adv-clouds adv-cloud-3" />
          </>
        )}

        {/* Tiny astronaut/observer silhouette */}
        {adv.ground && adv.id !== 'sun' && (
          <div className="adv-astronaut">
            <svg width="20" height="36" viewBox="0 0 20 36">
              <circle cx="10" cy="6" r="5" fill="rgba(255,255,255,0.85)" />
              <rect x="6" y="11" width="8" height="14" fill="rgba(255,255,255,0.85)" rx="2" />
              <rect x="6" y="24" width="3" height="10" fill="rgba(255,255,255,0.85)" />
              <rect x="11" y="24" width="3" height="10" fill="rgba(255,255,255,0.85)" />
            </svg>
          </div>
        )}

        {/* Info panel */}
        <div className="adv-info">
          <div className="adv-info-eyebrow">{adv.eyebrow}</div>
          <h2 className="adv-info-title">{adv.name}</h2>
          <div className="adv-info-vibe">{adv.vibe}</div>
          <div className="adv-info-paragraphs">
            {adv.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <button className="lesson-btn listen inline" onClick={() => speak(adv.paragraphs.join(' '))}>
            ♪ Read me about {adv.name}
          </button>
        </div>
      </div>
    </div>
  );
};
