// Earth-Moon-Sun lessons: Moon Phases, Day/Night, Seasons, Eclipses, Tides
// Each lesson is a self-contained interactive React component.

const { useState: useStateE1, useEffect: useEffectE1, useRef: useRefE1, useMemo: useMemoE1 } = React;

// ─────────────────────────────────────────────────────────────────
// 1. MOON PHASES — drag moon around Earth, watch its lit fraction change
// ─────────────────────────────────────────────────────────────────

// Compute SVG path for the lit (visible) portion of the moon at a given phase.
// phase: 0 = new, 0.25 = first quarter, 0.5 = full, 0.75 = last quarter
function moonLitPath(phase, r = 50) {
  const t = phase * 2 * Math.PI;
  const cosT = Math.cos(t);
  const rx = Math.abs(cosT * r);
  const outerSweep = phase < 0.5 ? 1 : 0;
  const innerSweep = ((cosT < 0) === (phase < 0.5)) ? 1 : 0;
  return `M 0,-${r} A ${r},${r} 0 0 ${outerSweep} 0,${r} A ${rx},${r} 0 0 ${innerSweep} 0,-${r} Z`;
}

function MoonGlyph({ phase, size = 80 }) {
  const r = 50;
  return (
    <svg width={size} height={size} viewBox={`-${r} -${r} ${r*2} ${r*2}`} style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id="mg-dark" cx="35%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#3a3630" />
          <stop offset="100%" stopColor="#1a1610" />
        </radialGradient>
        <radialGradient id="mg-lit" cx="35%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#f0e8d4" />
          <stop offset="55%" stopColor="#a89878" />
          <stop offset="100%" stopColor="#5a4838" />
        </radialGradient>
      </defs>
      {/* Dark base */}
      <circle cx="0" cy="0" r={r} fill="url(#mg-dark)" />
      {/* Lit portion */}
      <path d={moonLitPath(phase, r)} fill="url(#mg-lit)" />
      {/* Subtle craters on lit side */}
      {phase > 0.05 && phase < 0.95 && (
        <g opacity="0.3" style={{ mixBlendMode: 'multiply' }}>
          <circle cx="-15" cy="-10" r="6" fill="#3a342a" />
          <circle cx="10" cy="15" r="4" fill="#3a342a" />
          <circle cx="20" cy="-20" r="3" fill="#3a342a" />
        </g>
      )}
    </svg>
  );
}

const PHASE_NAMES = [
  { name: 'New Moon', phase: 0.0 },
  { name: 'Waxing Crescent', phase: 0.125 },
  { name: 'First Quarter', phase: 0.25 },
  { name: 'Waxing Gibbous', phase: 0.375 },
  { name: 'Full Moon', phase: 0.5 },
  { name: 'Waning Gibbous', phase: 0.625 },
  { name: 'Last Quarter', phase: 0.75 },
  { name: 'Waning Crescent', phase: 0.875 },
];

window.MoonPhasesLesson = function MoonPhasesLesson({ speak }) {
  // Angle of moon around Earth, in radians (0 = right, between Earth and Sun = NEW MOON)
  const [angle, setAngle] = useStateE1(Math.PI); // start at full moon (opposite sun)
  const canvasRef = useRefE1(null);
  const dragRef = useRefE1(false);

  // Auto-orbit (slow) when not dragging
  useEffectE1(() => {
    let raf;
    let last = performance.now();
    const tick = (t) => {
      const dt = (t - last) / 1000;
      last = t;
      if (!dragRef.current) {
        setAngle(a => (a + dt * 0.15) % (Math.PI * 2));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Convert angle → phase. Sun is to the right of Earth (at angle 0).
  // When moon is at angle 0 (between Earth and Sun, same side as Sun), it's NEW moon.
  // When moon is at angle π (opposite side from Sun), it's FULL moon.
  // Phase value: 0 = new, increases waxing toward 0.5 = full, then waning back to 1.0 = new.
  // Map: angle 0 → phase 0; angle π/2 → phase 0.25 (first quarter, lit on right); angle π → 0.5 (full); angle 3π/2 → 0.75 (last quarter).
  // Moon's lit side faces the Sun, always on its right side from Earth's overhead view.
  // From Earth, when moon is at angle π/2 (above Earth), we see... hmm.
  // Actually for the LIT-fraction visible from Earth: it depends on angle θ as
  //   lit_fraction = (1 - cos(θ)) / 2, where θ = angle from sun direction
  // But we also need to know if it's waxing or waning. Going counterclockwise (angle increasing):
  //   angle 0 → π/2 → π → 3π/2 → 2π  ↔  new → 1st quarter → full → last quarter → new
  // So phase = angle / (2π).
  const phase = (angle / (Math.PI * 2));

  // Position moon on the canvas based on angle
  // Earth at center (250, 250). Moon orbit radius = 170.
  const moonOrbitR = 170;
  const earthCx = 250;
  const earthCy = 250;
  const moonX = earthCx + Math.cos(angle) * moonOrbitR;
  const moonY = earthCy + Math.sin(angle) * moonOrbitR;

  // Drag handlers — on the moon, compute angle from center
  const onPointerDown = (e) => {
    dragRef.current = true;
    const rect = canvasRef.current.getBoundingClientRect();
    const scale = 500 / rect.width;
    const onMove = (ev) => {
      const x = (ev.clientX - rect.left) * scale - earthCx;
      const y = (ev.clientY - rect.top) * scale - earthCy;
      let a = Math.atan2(y, x);
      if (a < 0) a += Math.PI * 2;
      setAngle(a);
    };
    const onUp = () => {
      dragRef.current = false;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    onMove(e);
  };

  // Snap to a named phase
  const jumpToPhase = (p) => {
    dragRef.current = true;
    setAngle(p * Math.PI * 2);
    setTimeout(() => { dragRef.current = false; }, 1500);
  };

  // Current phase name
  let curPhaseName = 'Crescent';
  let minDist = Infinity;
  PHASE_NAMES.forEach(p => {
    const d = Math.min(Math.abs(p.phase - phase), 1 - Math.abs(p.phase - phase));
    if (d < minDist) { minDist = d; curPhaseName = p.name; }
  });

  return (
    <window.LessonStages
      speak={speak}
      stages={[
        { caption: "Bosco, look! The Sun shines on the Moon from one side. Only half of the Moon is lit — like a flashlight in a dark room.", narration: "The Sun shines on the Moon from one side. Only half of the Moon is lit." },
        { caption: "Try dragging the Moon around the Earth. As it moves, look at the picture in the middle to see what we'd see from Earth.", narration: "Try dragging the Moon around the Earth. Watch how its shape changes." },
        { caption: "When the Moon is between Earth and the Sun, we see the dark side. We call this a New Moon. When it's on the far side, we see the full lit side — a Full Moon!", narration: "When the moon is between Earth and the Sun, we see the dark side. When it's far away, we see a full moon." },
        { caption: "So the Moon doesn't really change shape — it's our angle changing! Tap the eight phase chips below to compare.", narration: "The moon doesn't really change shape — it is our angle changing. The eight phases are: new, waxing crescent, first quarter, waxing gibbous, full, waning gibbous, last quarter, and waning crescent." },
      ]}
    >
      <div className="lesson-canvas moon-phase-canvas">
        <svg ref={canvasRef} viewBox="0 0 500 500" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
          {/* Sun off to the right with rays */}
          <defs>
            <radialGradient id="mp-sun-g" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff8d8" />
              <stop offset="50%" stopColor="#ffcd45" />
              <stop offset="100%" stopColor="#ff8a1a" />
            </radialGradient>
          </defs>
          <circle cx="540" cy="250" r="60" fill="url(#mp-sun-g)" opacity="0.95">
            <animate attributeName="r" values="60;65;60" dur="3s" repeatCount="indefinite" />
          </circle>
          {/* Sun rays */}
          {[-90, -45, 0, 45, 90].map(deg => (
            <line key={deg} x1="490" y1={250 + deg * 0.8} x2="430" y2={250 + deg * 0.8}
                  stroke="rgba(255, 200, 100, 0.4)" strokeWidth="1" strokeDasharray="4 4" />
          ))}
          <text x="540" y="345" fill="var(--accent)" fontFamily="JetBrains Mono" fontSize="9" letterSpacing="2" textAnchor="middle">SUNLIGHT →</text>

          {/* Orbit ring */}
          <circle cx={earthCx} cy={earthCy} r={moonOrbitR} fill="none" stroke="rgba(212, 163, 92, 0.18)" strokeDasharray="3 5" />

          {/* Earth */}
          <g transform={`translate(${earthCx}, ${earthCy})`}>
            <defs>
              <radialGradient id="mp-earth" cx="35%" cy="30%" r="75%">
                <stop offset="0%" stopColor="#7ab8e8" />
                <stop offset="55%" stopColor="#2a5a9a" />
                <stop offset="100%" stopColor="#091a3a" />
              </radialGradient>
            </defs>
            <circle r="36" fill="url(#mp-earth)" />
            {/* tiny continent */}
            <path d="M -10 -8 Q -4 -12, 4 -6 Q 8 4, 0 10 Q -8 6, -10 -8 Z" fill="#4a7a3a" opacity="0.7" />
            <ellipse cx="0" cy="-32" rx="14" ry="5" fill="#f0f6fa" opacity="0.6" />
          </g>
          <text x={earthCx} y={earthCy + 60} fill="var(--ink-faint)" fontFamily="JetBrains Mono" fontSize="9" letterSpacing="2" textAnchor="middle">EARTH</text>

          {/* Moon's lit side indicator: an arrow showing which side is lit */}
          <g transform={`translate(${moonX}, ${moonY})`}>
            <line x1="0" y1="0" x2={(540 - moonX) * 0.15} y2={(250 - moonY) * 0.15}
                  stroke="rgba(255, 200, 100, 0.5)" strokeWidth="1" />
          </g>

          {/* Moon — draggable. Rendered as half-lit (phase 0.25 = right half lit), then rotated
              so the lit half always points toward the Sun. This matches reality: the Moon's
              sun-facing hemisphere is always lit, only our viewing angle changes. */}
          <g transform={`translate(${moonX}, ${moonY}) rotate(${Math.atan2(250 - moonY, 540 - moonX) * 180 / Math.PI})`}
             style={{ cursor: 'grab' }}
             onPointerDown={onPointerDown}>
            <circle r="32" fill="rgba(232, 226, 212, 0.05)" />
            <MoonGlyph phase={0.25} size={48} />
          </g>

          {/* "How we see it from Earth" preview circle near Earth */}
          <g transform={`translate(${earthCx}, ${earthCy - 100})`}>
            <circle r="34" fill="rgba(0, 0, 0, 0.3)" stroke="rgba(212, 163, 92, 0.5)" strokeWidth="1" />
            <MoonGlyph phase={phase} size={56} />
            <text y="-44" fill="var(--accent)" fontFamily="JetBrains Mono" fontSize="9" letterSpacing="2" textAnchor="middle">FROM EARTH</text>
            <text y="50" fill="var(--ink-soft)" fontFamily="Cormorant Garamond" fontStyle="italic" fontSize="14" textAnchor="middle">{curPhaseName}</text>
          </g>

          {/* Drag hint */}
          <text x={moonX} y={moonY + 48} fill="var(--ink-faint)" fontFamily="JetBrains Mono" fontSize="8" letterSpacing="2" textAnchor="middle">DRAG ME</text>
        </svg>

        {/* Phase chips */}
        <div className="phase-chips">
          {PHASE_NAMES.map(p => {
            const active = Math.abs(p.phase - phase) < 0.0625 || Math.abs(p.phase - phase) > (1 - 0.0625);
            return (
              <button
                key={p.name}
                className={`phase-chip ${active ? 'active' : ''}`}
                onClick={() => jumpToPhase(p.phase)}
              >
                <MoonGlyph phase={p.phase} size={32} />
                <span>{p.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </window.LessonStages>
  );
};

// ─────────────────────────────────────────────────────────────────
// 2. DAY & NIGHT — Earth spinning, sunlight from one side, tiny person moves through day/night
// ─────────────────────────────────────────────────────────────────

window.DayNightLesson = function DayNightLesson({ speak }) {
  const [rotation, setRotation] = useStateE1(0); // 0..360
  const [auto, setAuto] = useStateE1(true);
  const dragRef = useRefE1(false);

  useEffectE1(() => {
    let raf, last = performance.now();
    const tick = (t) => {
      const dt = (t - last) / 1000;
      last = t;
      if (auto && !dragRef.current) {
        setRotation(r => (r + dt * 30) % 360);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [auto]);

  const earthCx = 280, earthCy = 250, earthR = 140;

  // Person's longitude on Earth (fixed at 0° relative to surface). As earth rotates, person moves.
  const personAngleSurface = 0; // person at "front" of surface, rotates with planet
  const personAngleWorld = (personAngleSurface + rotation) % 360;
  const personRad = (personAngleWorld * Math.PI) / 180;
  // Sun is at angle 0 (right). Person at angle 0 = noon. angle 90 = sunset. angle 180 = midnight. angle 270 = sunrise.
  const personX = earthCx + Math.cos(personRad) * earthR;
  const personY = earthCy + Math.sin(personRad) * earthR;

  const localTime = (() => {
    // angle 0 → 12:00 noon; angle 90 → 18:00; 180 → 00:00; 270 → 06:00
    const hours = ((12 + personAngleWorld / 15) % 24);
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  })();

  const isDayTime = Math.cos(personRad) > 0;

  return (
    <window.LessonStages
      speak={speak}
      stages={[
        { caption: "Earth spins like a top. One whole spin = one day and one night.", narration: "Earth spins like a top. One full spin takes 24 hours." },
        { caption: "The Sun lights up only half of Earth at a time. The other half is in darkness — that's nighttime.", narration: "The Sun lights up only half of Earth. The other half is in darkness." },
        { caption: "See the tiny person? As Earth spins, they move from noon, into evening, into midnight, into morning, and back to noon again.", narration: "As Earth spins, the person moves from noon, to evening, to midnight, to morning, and back to noon." },
        { caption: "So we don't make the Sun rise — Earth turns toward it! Pretty wild, right?", narration: "The Sun doesn't really rise or set. Earth turns toward it and away from it." },
      ]}
    >
      <div className="lesson-canvas dn-canvas">
        <svg viewBox="0 0 700 500" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="dn-earth" cx="35%" cy="30%" r="75%">
              <stop offset="0%" stopColor="#7ab8e8" />
              <stop offset="55%" stopColor="#2a5a9a" />
              <stop offset="100%" stopColor="#091a3a" />
            </radialGradient>
            <radialGradient id="dn-sun" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff8d8" />
              <stop offset="60%" stopColor="#ffcd45" />
              <stop offset="100%" stopColor="#ff8a1a" />
            </radialGradient>
          </defs>

          {/* Sun far right with rays */}
          <circle cx="640" cy="250" r="55" fill="url(#dn-sun)">
            <animate attributeName="r" values="55;60;55" dur="3s" repeatCount="indefinite" />
          </circle>
          {[-2, -1, 0, 1, 2].map(i => (
            <line key={i} x1="585" y1={250 + i * 40} x2="450" y2={250 + i * 40}
                  stroke="rgba(255, 200, 100, 0.5)" strokeWidth="1.5" strokeDasharray="6 4" />
          ))}
          <text x="640" y="335" fill="var(--accent)" fontFamily="JetBrains Mono" fontSize="10" letterSpacing="2" textAnchor="middle">SUN</text>

          {/* Earth with surface continents that rotate */}
          <g transform={`translate(${earthCx}, ${earthCy})`}>
            <circle r={earthR} fill="url(#dn-earth)" />
            <g transform={`rotate(${rotation})`}>
              {/* Continents on the surface */}
              <path d="M -50 -30 Q -30 -50, 0 -40 Q 30 -30, 40 0 Q 30 30, 0 40 Q -30 30, -50 -30 Z" fill="#4a7a3a" opacity="0.75" />
              <path d="M 60 -80 Q 90 -70, 100 -40 L 90 -20 Q 70 -30, 60 -50 Z" fill="#5a8a44" opacity="0.7" />
              <path d="M -90 50 Q -70 40, -60 70 Q -75 90, -100 75 Z" fill="#7a6840" opacity="0.7" />
              <ellipse cx="0" cy={-earthR + 8} rx="50" ry="14" fill="#f0f6fa" opacity="0.65" />
              <ellipse cx="0" cy={earthR - 8} rx="60" ry="14" fill="#f0f6fa" opacity="0.7" />
            </g>
            {/* Day/night terminator — dark side faces AWAY from sun (sun is to the right, so left half is night) */}
            <path d={`M 0 ${-earthR} A ${earthR} ${earthR} 0 0 0 0 ${earthR} L 0 ${-earthR} Z`} fill="rgba(0,0,0,0.6)" />
          </g>

          {/* Person pin */}
          <g transform={`translate(${personX}, ${personY})`}>
            <circle r="6" fill={isDayTime ? 'var(--accent)' : '#a8c8e8'} stroke="var(--bg-deep)" strokeWidth="2" />
            <circle r="14" fill="none" stroke={isDayTime ? 'var(--accent)' : '#a8c8e8'} strokeWidth="1.5" opacity="0.5">
              <animate attributeName="r" values="14;22;14" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
            </circle>
          </g>

          {/* Time + day/night label */}
          <g transform={`translate(${earthCx}, ${earthCy + 200})`}>
            <text textAnchor="middle" fill="var(--accent)" fontFamily="JetBrains Mono" fontSize="11" letterSpacing="3">
              {isDayTime ? 'DAY · ' : 'NIGHT · '}{localTime}
            </text>
          </g>

          {/* Axis */}
          <line x1={earthCx} y1={earthCy - earthR - 20} x2={earthCx} y2={earthCy + earthR + 20}
                stroke="rgba(212, 163, 92, 0.3)" strokeWidth="1" strokeDasharray="3 4" />
          <text x={earthCx} y={earthCy - earthR - 28} fill="var(--ink-faint)" fontFamily="JetBrains Mono" fontSize="9" textAnchor="middle" letterSpacing="2">N · POLE</text>
        </svg>

        {/* Controls */}
        <div className="dn-controls">
          <button className="lesson-btn primary" onClick={() => setAuto(a => !a)}>
            {auto ? '❚❚ Pause' : '▶ Spin Earth'}
          </button>
          <input
            type="range" min="0" max="360" step="1" value={rotation}
            onChange={e => { dragRef.current = true; setRotation(parseInt(e.target.value)); }}
            onMouseUp={() => { dragRef.current = false; }}
            onTouchEnd={() => { dragRef.current = false; }}
          />
          <span className="dn-rotation">{Math.round(rotation)}°</span>
        </div>
      </div>
    </window.LessonStages>
  );
};
