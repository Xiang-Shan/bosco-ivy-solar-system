// Cosmos lessons: Asteroid Belt, Saturn's Rings, Comets, Meteors

const { useState: useStateC1, useEffect: useEffectC1, useRef: useRefC1, useMemo: useMemoC1 } = React;

// ─────────────────────────────────────────────────────────────────
// 6. ASTEROID BELT — zoom into the belt with named asteroids
// ─────────────────────────────────────────────────────────────────

const NAMED_ASTEROIDS = [
  { name: 'Ceres', size: 18, color: '#a89878', fact: "The biggest one in the belt — it's actually a dwarf planet! 940 km wide.", offset: { au: 2.77, theta: 0.2 } },
  { name: 'Vesta', size: 13, color: '#c8b890', fact: 'Second largest. So bright you can sometimes see it with just your eyes.', offset: { au: 2.36, theta: 1.8 } },
  { name: 'Pallas', size: 11, color: '#8a8070', fact: 'Tilted weirdly — its orbit is off-kilter compared to the others.', offset: { au: 2.77, theta: 3.5 } },
  { name: 'Hygiea', size: 10, color: '#a09080', fact: 'Possibly the smallest dwarf planet — almost round, but not quite.', offset: { au: 3.14, theta: 5.0 } },
  { name: 'Eros', size: 6, color: '#b8a080', fact: 'A "peanut-shaped" asteroid! NASA landed a spacecraft on it in 2001.', offset: { au: 1.46, theta: 2.4 } },
];

window.AsteroidBeltLesson = function AsteroidBeltLesson({ speak }) {
  const [selected, setSelected] = useStateC1(null);
  const [zoom, setZoom] = useStateC1(0); // 0..1, 0=full view 1=close
  const [time, setTime] = useStateC1(0);

  useEffectC1(() => {
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

  // 200 background asteroids
  const bgAsteroids = useMemoC1(() => {
    const arr = [];
    for (let i = 0; i < 200; i++) {
      arr.push({
        au: 2.2 + Math.random() * 1.0, // 2.2 to 3.2 AU
        theta: Math.random() * Math.PI * 2,
        speed: 0.1 + Math.random() * 0.1,
        size: 1 + Math.random() * 2,
      });
    }
    return arr;
  }, []);

  // Layout: sun on left, mars orbit, then belt, then jupiter
  const cx = 350, cy = 250;
  const scale = 60 + zoom * 100; // px per AU
  const apply = (au, theta) => ({
    x: cx + Math.cos(theta) * au * scale,
    y: cy + Math.sin(theta) * au * scale * 0.6,
  });

  return (
    <window.LessonStages
      speak={speak}
      stages={[
        { caption: "Between Mars and Jupiter there's a wide, wide ring full of rocks — the Asteroid Belt.", narration: "Between Mars and Jupiter there is a wide ring full of rocks called the asteroid belt." },
        { caption: "It's not crowded like in movies! Most asteroids are millions of kilometers apart. You could fly through and never see one!", narration: "The asteroid belt is not crowded. Most asteroids are millions of kilometers apart." },
        { caption: "Tap a named asteroid to learn about it. Ceres is so big it's even called a dwarf planet — like Pluto!", narration: "Tap a named asteroid to learn about it. Ceres is so big it is called a dwarf planet, like Pluto." },
        { caption: "Why didn't these rocks form a planet? Jupiter's huge gravity stirred them up before they could come together.", narration: "These rocks never formed a planet because Jupiter's strong gravity kept stirring them up." },
      ]}
    >
      <div className="lesson-canvas asteroid-canvas">
        <svg viewBox="0 0 700 500" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="ab-sun" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff8d8" />
              <stop offset="60%" stopColor="#ffcd45" />
              <stop offset="100%" stopColor="#ff8a1a" />
            </radialGradient>
          </defs>

          {/* Sun */}
          <circle cx={cx} cy={cy} r={20 - zoom * 12} fill="url(#ab-sun)" />

          {/* Mars orbit */}
          <ellipse cx={cx} cy={cy} rx={1.52 * scale} ry={1.52 * scale * 0.6} fill="none" stroke="rgba(212, 163, 92, 0.2)" strokeDasharray="3 5" />
          {/* Jupiter orbit */}
          <ellipse cx={cx} cy={cy} rx={5.2 * scale * 0.55} ry={5.2 * scale * 0.6 * 0.55} fill="none" stroke="rgba(212, 163, 92, 0.2)" strokeDasharray="3 5" />

          {/* Mars */}
          <g transform={`translate(${apply(1.52, time * 0.05).x}, ${apply(1.52, time * 0.05).y})`}>
            <circle r={Math.max(3, 6 - zoom * 2)} fill="#c66a3f" />
          </g>
          {/* Jupiter */}
          <g transform={`translate(${apply(5.2 * 0.55, time * 0.02).x}, ${apply(5.2 * 0.55, time * 0.02).y})`}>
            <circle r={Math.max(4, 10 - zoom * 3)} fill="#d4a574" />
          </g>

          {/* Belt asteroids */}
          {bgAsteroids.map((a, i) => {
            const theta = a.theta + time * a.speed;
            const p = apply(a.au, theta);
            return <circle key={i} cx={p.x} cy={p.y} r={a.size} fill="rgba(168, 144, 112, 0.6)" />;
          })}

          {/* Named asteroids */}
          {NAMED_ASTEROIDS.filter(a => a.offset.au >= 2.0 && a.offset.au <= 3.3).map((a, i) => {
            const theta = a.offset.theta + time * 0.04;
            const p = apply(a.offset.au, theta);
            const isSelected = selected === a.name;
            return (
              <g key={a.name} transform={`translate(${p.x}, ${p.y})`} style={{ cursor: 'pointer' }}
                 onClick={() => setSelected(a.name)}>
                <circle r={a.size + 4} fill="none" stroke={isSelected ? 'var(--accent)' : 'transparent'} strokeWidth="1.5" />
                <circle r={a.size} fill={a.color} />
                <ellipse cx={-a.size * 0.3} cy={-a.size * 0.3} rx={a.size * 0.5} ry={a.size * 0.4} fill="rgba(255,255,255,0.2)" />
                <text y={a.size + 14} textAnchor="middle" fill={isSelected ? 'var(--accent)' : 'var(--ink-soft)'}
                      fontFamily="JetBrains Mono" fontSize="9" letterSpacing="2">{a.name.toUpperCase()}</text>
              </g>
            );
          })}

          {/* Labels for orbits */}
          <text x={cx} y={cy + 1.52 * scale * 0.6 + 18} fill="var(--ink-faint)" fontFamily="JetBrains Mono" fontSize="9" letterSpacing="2" textAnchor="middle">MARS ORBIT</text>
          <text x={cx} y={cy - 5.2 * scale * 0.55 * 0.6 - 8} fill="var(--ink-faint)" fontFamily="JetBrains Mono" fontSize="9" letterSpacing="2" textAnchor="middle">JUPITER ORBIT</text>
        </svg>

        {/* Zoom slider */}
        <div className="ab-controls">
          <span className="ab-label">Zoom in →</span>
          <input type="range" min="0" max="1" step="0.01" value={zoom}
                 onChange={e => setZoom(parseFloat(e.target.value))} />
        </div>

        {/* Selected asteroid info panel */}
        {selected && (
          <div className="ab-detail">
            <button className="ab-detail-close" onClick={() => setSelected(null)}>×</button>
            <div className="ab-detail-eyebrow">Asteroid</div>
            <h3>{NAMED_ASTEROIDS.find(a => a.name === selected).name}</h3>
            <p>{NAMED_ASTEROIDS.find(a => a.name === selected).fact}</p>
          </div>
        )}
      </div>
    </window.LessonStages>
  );
};

// ─────────────────────────────────────────────────────────────────
// 7. SATURN'S RINGS — zoom from Saturn portrait down to ice particles
// ─────────────────────────────────────────────────────────────────

window.SaturnRingsLesson = function SaturnRingsLesson({ speak }) {
  const [zoom, setZoom] = useStateC1(0); // 0=portrait 1=close up
  const [time, setTime] = useStateC1(0);

  useEffectC1(() => {
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

  // Generate ring particles
  const particles = useMemoC1(() => {
    const arr = [];
    for (let i = 0; i < 200; i++) {
      arr.push({
        ringR: 1.6 + Math.random() * 1.2, // 1.6 to 2.8 of saturn radius
        theta: Math.random() * Math.PI * 2,
        speed: 0.15 + Math.random() * 0.25,
        size: 1 + Math.random() * 3,
        kind: Math.random() < 0.7 ? 'ice' : 'rock',
      });
    }
    return arr;
  }, []);

  const cx = 350, cy = 250;
  const saturnR = 80 - zoom * 30;
  const ringScale = 1 + zoom * 2;

  return (
    <window.LessonStages
      speak={speak}
      stages={[
        { caption: "Saturn's rings look solid... but they're not! Let's zoom in and see what they're really made of.", narration: "Saturn's rings look solid but they are not. Let's zoom in." },
        { caption: "Pull the zoom slider. Closer... closer... you can see them now: billions of pieces of ice and rock!", narration: "Zoom in. You can see billions of pieces of ice and rock." },
        { caption: "Each chunk is in its own orbit around Saturn. Some are tiny like grains of sand. Others are big as houses, or even small mountains!", narration: "Each chunk is in its own orbit. Some are tiny like sand. Others are as big as houses." },
        { caption: "Gravity holds them in a flat disc. They're SO bright because they're mostly water ice — like little flying ice cubes!", narration: "Saturn's rings are mostly water ice, like flying ice cubes. That is why they shine so bright." },
      ]}
    >
      <div className="lesson-canvas rings-canvas">
        <svg viewBox="0 0 700 500" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="rg-saturn" cx="35%" cy="32%" r="75%">
              <stop offset="0%" stopColor="#f7e6b8" />
              <stop offset="55%" stopColor="#c8a868" />
              <stop offset="100%" stopColor="#3a2810" />
            </radialGradient>
          </defs>

          {/* Saturn portrait (smaller when zooming) */}
          <g opacity={1 - zoom * 0.4}>
            <circle cx={cx} cy={cy} r={saturnR} fill="url(#rg-saturn)" />
            {/* Bands */}
            {[-0.4, -0.15, 0.15, 0.4].map((y, i) => (
              <rect key={i} x={cx - saturnR} y={cy + y * saturnR - 4} width={saturnR * 2} height="8"
                    fill={`rgba(180, 140, 80, ${0.3 + (i % 2) * 0.15})`} clipPath={`circle(${saturnR}px at ${cx}px ${cy}px)`} />
            ))}
          </g>

          {/* Ring system */}
          <g transform={`translate(${cx}, ${cy})`}>
            {/* Continuous ring rings (multiple thin ellipses for at-distance view) */}
            {zoom < 0.7 && [...Array(8)].map((_, i) => {
              const r = saturnR * (1.4 + i * 0.18) * ringScale;
              return (
                <ellipse key={i} cx="0" cy="0" rx={r} ry={r * 0.12 + zoom * 8}
                         fill="none" stroke={`rgba(212, 180, 130, ${0.5 - i * 0.05})`} strokeWidth="1.5" opacity={1 - zoom * 0.5} />
              );
            })}

            {/* Particle dots — appear when zoom > 0.3 */}
            {zoom > 0.2 && particles.map((p, i) => {
              const a = p.theta + time * p.speed;
              const r = p.ringR * saturnR * ringScale;
              const x = Math.cos(a) * r;
              const y = Math.sin(a) * r * (0.12 + zoom * 0.1);
              return (
                <circle key={i} cx={x} cy={y} r={p.size * (0.5 + zoom * 1.2)}
                        fill={p.kind === 'ice' ? '#f0eeea' : '#a89878'} opacity={zoom} />
              );
            })}
          </g>

          {/* Labels */}
          <text x={cx} y={50} textAnchor="middle" fill="var(--accent)" fontFamily="Cormorant Garamond" fontStyle="italic" fontSize="26">
            {zoom < 0.3 ? "Saturn's Rings" : zoom < 0.7 ? 'Closer...' : 'Ice & rock chunks!'}
          </text>
          {zoom > 0.7 && (
            <g transform="translate(60, 420)">
              <rect width="180" height="50" fill="rgba(15, 20, 36, 0.7)" stroke="rgba(212, 163, 92, 0.3)" />
              <circle cx="20" cy="25" r="6" fill="#f0eeea" />
              <text x="35" y="22" fill="var(--ink)" fontFamily="Newsreader" fontSize="12">Ice chunks (70%)</text>
              <text x="35" y="38" fill="var(--ink-faint)" fontFamily="JetBrains Mono" fontSize="9" letterSpacing="2">FROZEN WATER</text>
            </g>
          )}
        </svg>

        <div className="rings-controls">
          <span className="rings-label">Zoom →</span>
          <input type="range" min="0" max="1" step="0.01" value={zoom}
                 onChange={e => setZoom(parseFloat(e.target.value))} />
        </div>
      </div>
    </window.LessonStages>
  );
};

// ─────────────────────────────────────────────────────────────────
// 8. COMETS — elliptical orbit, tail forms near sun
// ─────────────────────────────────────────────────────────────────

window.CometsLesson = function CometsLesson({ speak }) {
  const [time, setTime] = useStateC1(0);

  useEffectC1(() => {
    let raf, last = performance.now();
    const tick = (t) => {
      const dt = (t - last) / 1000;
      last = t;
      setTime(prev => prev + dt * 0.4);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Elliptical orbit. Comet position along orbit.
  const cx = 380, cy = 250;
  const orbitRx = 280, orbitRy = 120;
  const focusX = cx - Math.sqrt(orbitRx * orbitRx - orbitRy * orbitRy); // sun at focus

  // Use eccentric anomaly proxy for position
  const a = (time % (Math.PI * 2));
  const cometX = cx + Math.cos(a) * orbitRx;
  const cometY = cy + Math.sin(a) * orbitRy;

  // Distance from sun
  const dist = Math.hypot(cometX - focusX, cometY - cy);
  const maxDist = orbitRx + Math.abs(cx - focusX);
  const distNorm = dist / maxDist;
  const tailLength = Math.max(0, (1 - distNorm) * 220);

  // Tail direction: away from sun
  const tailAngle = Math.atan2(cometY - cy, cometX - focusX);
  const tailEndX = cometX + Math.cos(tailAngle) * tailLength;
  const tailEndY = cometY + Math.sin(tailAngle) * tailLength;

  return (
    <window.LessonStages
      speak={speak}
      stages={[
        { caption: "Comets are giant snowballs — frozen ice, dust, and rock — that fly through space.", narration: "Comets are giant snowballs of ice, dust, and rock flying through space." },
        { caption: "They travel in long, stretched-out orbits. Most of the time they're FAR from the Sun, in the cold dark.", narration: "Comets travel in long stretched orbits. Most of the time they are far from the Sun in cold darkness." },
        { caption: "But when a comet gets close to the Sun, its ice starts to melt and steam off — making a beautiful glowing TAIL that points away from the Sun.", narration: "When a comet gets close to the sun, its ice melts and makes a glowing tail that points away from the Sun." },
        { caption: "Then it swings around and heads back into the dark, and the tail fades. Maybe in 100 years, it'll come visit us again!", narration: "Then it heads back into the dark and the tail fades. Some comets return every hundred years." },
      ]}
    >
      <div className="lesson-canvas comets-canvas">
        <svg viewBox="0 0 700 500" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="co-sun" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff8d8" />
              <stop offset="60%" stopColor="#ffcd45" />
              <stop offset="100%" stopColor="#ff8a1a" />
            </radialGradient>
            <linearGradient id="co-tail" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(180, 220, 255, 0.85)" />
              <stop offset="100%" stopColor="rgba(180, 220, 255, 0)" />
            </linearGradient>
          </defs>

          {/* Orbit */}
          <ellipse cx={cx} cy={cy} rx={orbitRx} ry={orbitRy} fill="none" stroke="rgba(212, 163, 92, 0.2)" strokeDasharray="4 6" />

          {/* Sun at focus */}
          <circle cx={focusX} cy={cy} r="30" fill="url(#co-sun)">
            <animate attributeName="r" values="30;34;30" dur="3s" repeatCount="indefinite" />
          </circle>
          <text x={focusX} y={cy + 50} fill="var(--accent)" fontFamily="JetBrains Mono" fontSize="10" letterSpacing="3" textAnchor="middle">SUN</text>

          {/* Comet tail */}
          {tailLength > 5 && (
            <>
              {/* Wide dust tail */}
              <path d={`M ${cometX} ${cometY} L ${tailEndX} ${tailEndY}`}
                    stroke="url(#co-tail)" strokeWidth="14" strokeLinecap="round" opacity="0.5" />
              {/* Thin ion tail */}
              <path d={`M ${cometX} ${cometY} L ${tailEndX} ${tailEndY}`}
                    stroke="url(#co-tail)" strokeWidth="5" strokeLinecap="round" />
            </>
          )}

          {/* Comet nucleus */}
          <g transform={`translate(${cometX}, ${cometY})`}>
            <circle r="10" fill="rgba(220, 220, 240, 0.3)" />
            <circle r="6" fill="#d8e0e8" />
            <circle r="3" cx="-1" cy="-2" fill="#ffffff" />
          </g>

          {/* Status */}
          <text x="350" y="50" textAnchor="middle" fill="var(--ink)" fontFamily="Cormorant Garamond" fontStyle="italic" fontSize="22">
            {distNorm < 0.4 ? '☄ Near the Sun — tail glowing!' : distNorm < 0.7 ? 'Returning to the outer dark...' : 'Far from the Sun — no tail'}
          </text>
        </svg>
      </div>
    </window.LessonStages>
  );
};

// ─────────────────────────────────────────────────────────────────
// 9. METEORS — tap to spawn shooting stars
// ─────────────────────────────────────────────────────────────────

window.MeteorsLesson = function MeteorsLesson({ speak }) {
  const [meteors, setMeteors] = useStateC1([]);
  const [time, setTime] = useStateC1(0);
  const idRef = useRefC1(0);

  useEffectC1(() => {
    let raf, last = performance.now();
    const tick = (t) => {
      const dt = (t - last) / 1000;
      last = t;
      setTime(prev => prev + dt);
      // Auto-spawn occasionally
      if (Math.random() < 0.04) {
        spawn();
      }
      // Remove old meteors
      setMeteors(arr => arr.filter(m => (t - m.birth) < 2500));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const spawn = (xPercent) => {
    const x = xPercent != null ? xPercent : (Math.random() * 0.6 + 0.2);
    setMeteors(arr => [...arr, {
      id: idRef.current++,
      birth: performance.now(),
      startX: x * 700,
      startY: 30 + Math.random() * 100,
      angle: 25 + Math.random() * 20, // descending
      speed: 0.6 + Math.random() * 0.4,
    }]);
  };

  const onCanvasClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    spawn(x);
  };

  return (
    <window.LessonStages
      speak={speak}
      stages={[
        { caption: "When you see a 'shooting star', it's not really a star — it's a tiny rock falling into Earth's atmosphere!", narration: "A shooting star is not really a star. It is a tiny rock falling into Earth's air." },
        { caption: "These rocks (called meteoroids) zoom through space. When they hit our atmosphere, they go SO fast that the air heats up and the rock burns — bright like a candle.", narration: "When the rock hits our atmosphere, it goes so fast that the air heats up and it burns bright." },
        { caption: "Most are tiny — smaller than a grain of rice — and burn up in less than a second. That's the streak we see!", narration: "Most meteoroids are smaller than a grain of rice and burn up in less than a second." },
        { caption: "Tap the sky to make your own shooting stars. Make a wish!", narration: "Tap the sky to make your own shooting stars and make a wish." },
      ]}
    >
      <div className="lesson-canvas meteors-canvas" onClick={onCanvasClick}>
        <svg viewBox="0 0 700 500" width="100%" height="100%" preserveAspectRatio="none" style={{ cursor: 'crosshair' }}>
          <defs>
            <linearGradient id="me-tail" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255, 240, 200, 1)" />
              <stop offset="100%" stopColor="rgba(255, 240, 200, 0)" />
            </linearGradient>
          </defs>

          {/* Background stars */}
          {useMemoC1(() => {
            const stars = [];
            for (let i = 0; i < 80; i++) {
              stars.push({ x: Math.random() * 700, y: Math.random() * 350, r: Math.random() * 1.2 + 0.4 });
            }
            return stars;
          }, []).map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="rgba(255, 255, 255, 0.6)" />
          ))}

          {/* Horizon / ground */}
          <path d="M 0 380 Q 150 360, 350 380 Q 550 400, 700 370 L 700 500 L 0 500 Z" fill="rgba(20, 30, 60, 0.8)" />
          <path d="M 0 380 Q 150 360, 350 380 Q 550 400, 700 370" stroke="rgba(120, 100, 80, 0.4)" strokeWidth="1" fill="none" />

          {/* Tiny house silhouette */}
          <g transform="translate(540, 360)">
            <path d="M 0 20 L 0 0 L 20 -12 L 40 0 L 40 20 Z" fill="rgba(40, 50, 70, 0.9)" />
            <rect x="14" y="6" width="12" height="14" fill="rgba(212, 163, 92, 0.6)" />
          </g>

          {/* Meteors */}
          {meteors.map(m => {
            const age = (performance.now() - m.birth) / 1000;
            const x = m.startX + Math.cos(m.angle * Math.PI / 180) * age * 280 * m.speed;
            const y = m.startY + Math.sin(m.angle * Math.PI / 180) * age * 280 * m.speed;
            const opacity = Math.max(0, 1 - age / 2.5);
            const trailLen = 100 * Math.min(1, age * 2);
            const tx = x - Math.cos(m.angle * Math.PI / 180) * trailLen;
            const ty = y - Math.sin(m.angle * Math.PI / 180) * trailLen;
            return (
              <g key={m.id} opacity={opacity}>
                <line x1={tx} y1={ty} x2={x} y2={y} stroke="url(#me-tail)" strokeWidth="3" strokeLinecap="round" />
                <circle cx={x} cy={y} r="3" fill="#fffae0" />
                <circle cx={x} cy={y} r="6" fill="#fffae0" opacity="0.4" />
              </g>
            );
          })}
        </svg>

        <div className="meteors-hint">Click anywhere to make a shooting star ✦</div>
      </div>
    </window.LessonStages>
  );
};
