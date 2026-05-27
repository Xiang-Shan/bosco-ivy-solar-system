// More Earth-Moon-Sun lessons: Seasons, Eclipses, Tides

const { useState: useStateE2, useEffect: useEffectE2, useRef: useRefE2 } = React;

// ─────────────────────────────────────────────────────────────────
// 3. SEASONS — 12-month scrubber, axial tilt visible, dispels misconception
// ─────────────────────────────────────────────────────────────────

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
// Solstices/equinoxes: Jun 21 (north summer), Dec 21 (north winter), Mar 21 (spring eqx), Sep 21 (autumn eqx)
// We'll use month index 0-11 where Jun (5) = max north tilt toward sun, Dec (11) = max away.
function seasonAtMonth(m) {
  // m: 0-11
  // Northern season label
  if (m === 11 || m <= 1) return { name: 'Winter', north: 'cold + short days', south: 'warm + long days' };
  if (m >= 2 && m <= 4) return { name: 'Spring', north: 'warming + balanced', south: 'cooling + balanced' };
  if (m >= 5 && m <= 7) return { name: 'Summer', north: 'hot + long days', south: 'cold + short days' };
  return { name: 'Autumn', north: 'cooling + balanced', south: 'warming + balanced' };
}

window.SeasonsLesson = function SeasonsLesson({ speak }) {
  const [month, setMonth] = useStateE2(5); // June by default
  const [auto, setAuto] = useStateE2(false);

  useEffectE2(() => {
    if (!auto) return;
    let raf, last = performance.now(), acc = 0;
    const tick = (t) => {
      const dt = (t - last) / 1000;
      last = t;
      acc += dt;
      if (acc > 0.4) { acc = 0; setMonth(m => (m + 1) % 12); }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [auto]);

  // Earth's orbital angle around sun (sun at center). m=5 (June) is the position where N pole leans toward sun.
  // Map m → angle: at m=5, angle = 180° (Earth on left side of sun, so N tilt toward sun on right).
  // Actually let's pick: Earth orbits CCW. Position when N leans most toward sun depends on where we put sun.
  // Easy: Earth at angle θ around sun (θ=0 right of sun). At θ=0 (June), Earth is to the right of sun, and the axial tilt (fixed direction toward upper-left) means N pole leans toward sun.
  // At θ=π (December), Earth is to the left of sun, same tilt direction now leans AWAY from sun.
  const orbitAngle = ((month - 5) / 12) * Math.PI * 2; // m=5 → 0, m=11 → π
  const orbitR = 200;
  const sunCx = 350, sunCy = 250;
  const earthX = sunCx + Math.cos(orbitAngle) * orbitR;
  const earthY = sunCy + Math.sin(orbitAngle) * orbitR;

  // Tilt is constant direction (let's say axis points to upper-left in world coords, i.e., -23.4° from vertical)
  const tilt = -23.4;

  const season = seasonAtMonth(month);

  // Northern sun angle: how directly is sun shining on the north hemisphere?
  // It's a function of orbit angle and tilt.
  // At m=5 (north summer): N pole faces sun → high sun, long days
  // At m=11 (north winter): N pole faces away → low sun, short days
  const northSunDirectness = Math.cos(orbitAngle); // 1 = direct (summer), -1 = indirect (winter)
  // Day length in hours at 40°N latitude — approximate
  const dayLen = 12 + northSunDirectness * 3.5; // varies 8.5 to 15.5 hours

  return (
    <window.LessonStages
      speak={speak}
      stages={[
        { caption: "Earth is tilted! Like a spinning top leaning slightly to one side, by about 23 degrees.", narration: "Earth is tilted. It leans about twenty-three degrees, like a spinning top." },
        { caption: "Slide through the year. Notice — Earth stays the same distance from the Sun. It doesn't get closer in summer!", narration: "Earth stays about the same distance from the Sun all year. It doesn't get closer in summer." },
        { caption: "When the North Pole leans TOWARD the Sun (June), the sun shines down more directly there. That's why it's hotter, and days are longer.", narration: "When the North Pole leans toward the Sun, sunlight hits more directly. That is why summer is hot and the days are long." },
        { caption: "When North leans AWAY from the Sun (December), sunlight comes at a slant. Less direct heat, shorter days = winter!", narration: "When the North Pole leans away from the Sun, sunlight is slanted. That makes winter colder, with shorter days." },
      ]}
    >
      <div className="lesson-canvas seasons-canvas">
        <svg viewBox="0 0 700 500" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="se-sun" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff8d8" />
              <stop offset="60%" stopColor="#ffcd45" />
              <stop offset="100%" stopColor="#ff8a1a" />
            </radialGradient>
            <radialGradient id="se-earth" cx="35%" cy="30%" r="75%">
              <stop offset="0%" stopColor="#7ab8e8" />
              <stop offset="55%" stopColor="#2a5a9a" />
              <stop offset="100%" stopColor="#091a3a" />
            </radialGradient>
          </defs>

          {/* Earth's orbit */}
          <ellipse cx={sunCx} cy={sunCy} rx={orbitR} ry={orbitR * 0.7} fill="none" stroke="rgba(212, 163, 92, 0.2)" strokeDasharray="4 6" />

          {/* Sun */}
          <circle cx={sunCx} cy={sunCy} r="40" fill="url(#se-sun)">
            <animate attributeName="r" values="40;44;40" dur="3s" repeatCount="indefinite" />
          </circle>
          <text x={sunCx} y={sunCy + 65} fill="var(--accent)" fontFamily="JetBrains Mono" fontSize="10" letterSpacing="3" textAnchor="middle">SUN</text>

          {/* Sun rays toward Earth */}
          <line x1={sunCx} y1={sunCy} x2={earthX} y2={earthY} stroke="rgba(255, 200, 100, 0.25)" strokeWidth="1.5" strokeDasharray="3 4" />

          {/* Ghost Earth positions at solstices/equinoxes */}
          {[5, 8, 11, 2].map(m => {
            const a = ((m - 5) / 12) * Math.PI * 2;
            const x = sunCx + Math.cos(a) * orbitR;
            const y = sunCy + Math.sin(a) * orbitR * 0.7;
            return <circle key={m} cx={x} cy={y} r="4" fill="rgba(122, 184, 232, 0.25)" />;
          })}

          {/* Earth with tilt */}
          <g transform={`translate(${earthX}, ${earthY * 0.6 + sunCy * 0.4})`}>
            {/* Axis line */}
            <line x1="0" y1="-58" x2="0" y2="58" stroke="rgba(212, 163, 92, 0.3)"
                  strokeWidth="1" strokeDasharray="3 3" transform={`rotate(${tilt})`} />
            <g transform={`rotate(${tilt})`}>
              <circle r="42" fill="url(#se-earth)" />
              {/* Continents */}
              <path d="M -15 -12 Q -5 -18, 8 -10 Q 12 4, 0 14 Q -12 8, -15 -12 Z" fill="#4a7a3a" opacity="0.7" />
              {/* Polar caps */}
              <ellipse cx="0" cy="-38" rx="22" ry="6" fill="#f0f6fa" opacity="0.75" />
              <ellipse cx="0" cy="38" rx="26" ry="6" fill="#f0f6fa" opacity="0.7" />
              {/* Latitude bands */}
              <line x1="-42" y1="-12" x2="42" y2="-12" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
              <line x1="-42" y1="0" x2="42" y2="0" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
              <line x1="-42" y1="12" x2="42" y2="12" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
              {/* Day/night terminator — dark hemisphere points AWAY from sun in world space.
                  The path draws a right-semicircle by default; rotating it by atan2(earthY-sunCy, earthX-sunCx)
                  aligns the right-semicircle direction with the anti-sun vector. The -tilt cancels the parent
                  tilt group so the terminator stays in world space (tilt doesn't move the day/night line). */}
              <path d="M 0 -42 A 42 42 0 0 1 0 42 L 0 -42 Z"
                    fill="rgba(0,0,0,0.5)"
                    transform={`rotate(${-tilt + (Math.atan2(earthY - sunCy, earthX - sunCx) * 180 / Math.PI)})`} />
            </g>
            {/* N/S labels */}
            <text x={Math.sin(tilt * Math.PI / 180) * 56} y={-Math.cos(tilt * Math.PI / 180) * 56 + 4}
                  fill="var(--accent)" fontFamily="JetBrains Mono" fontSize="11" textAnchor="middle">N</text>
            <text x={-Math.sin(tilt * Math.PI / 180) * 56} y={Math.cos(tilt * Math.PI / 180) * 56 + 4}
                  fill="var(--ink-faint)" fontFamily="JetBrains Mono" fontSize="11" textAnchor="middle">S</text>
          </g>

          {/* Month label */}
          <text x={350} y={50} textAnchor="middle" fill="var(--ink)" fontFamily="Cormorant Garamond" fontStyle="italic" fontSize="32">
            {MONTHS[month]}
          </text>
          <text x={350} y={72} textAnchor="middle" fill="var(--accent)" fontFamily="JetBrains Mono" fontSize="10" letterSpacing="3">
            Northern {season.name.toUpperCase()}
          </text>

          {/* Info badges */}
          <g transform="translate(60, 410)">
            <rect width="180" height="68" fill="rgba(15, 20, 36, 0.7)" stroke="rgba(212, 163, 92, 0.3)" />
            <text x="14" y="22" fill="var(--accent)" fontFamily="JetBrains Mono" fontSize="9" letterSpacing="2">NORTH HEMISPHERE</text>
            <text x="14" y="44" fill="var(--ink)" fontFamily="Newsreader" fontSize="13" fontStyle="italic">{season.north}</text>
            <text x="14" y="62" fill="var(--ink-faint)" fontFamily="JetBrains Mono" fontSize="10">DAY: {dayLen.toFixed(1)}h</text>
          </g>
          <g transform="translate(460, 410)">
            <rect width="180" height="68" fill="rgba(15, 20, 36, 0.7)" stroke="rgba(212, 163, 92, 0.3)" />
            <text x="14" y="22" fill="var(--accent)" fontFamily="JetBrains Mono" fontSize="9" letterSpacing="2">SOUTH HEMISPHERE</text>
            <text x="14" y="44" fill="var(--ink)" fontFamily="Newsreader" fontSize="13" fontStyle="italic">{season.south}</text>
            <text x="14" y="62" fill="var(--ink-faint)" fontFamily="JetBrains Mono" fontSize="10">DAY: {(24 - dayLen).toFixed(1)}h</text>
          </g>
        </svg>

        {/* Month scrubber */}
        <div className="seasons-controls">
          <button className="lesson-btn primary" onClick={() => setAuto(a => !a)}>
            {auto ? '❚❚ Pause' : '▶ Play Year'}
          </button>
          <div className="month-scrubber">
            {MONTHS.map((m, i) => (
              <button key={m} className={`month-btn ${i === month ? 'active' : ''}`} onClick={() => setMonth(i)}>
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>
    </window.LessonStages>
  );
};

// ─────────────────────────────────────────────────────────────────
// 4. ECLIPSES — toggle between Solar and Lunar eclipses
// ─────────────────────────────────────────────────────────────────

window.EclipsesLesson = function EclipsesLesson({ speak }) {
  const [type, setType] = useStateE2('solar'); // 'solar' | 'lunar'
  const [moonProgress, setMoonProgress] = useStateE2(0.5); // 0..1, moon position in alignment

  // Layout
  const sunCx = 100, sunCy = 250, sunR = 50;
  const earthCx = type === 'solar' ? 580 : 350, earthCy = 250, earthR = 50;
  const moonR = 18;

  // For solar: moon is between sun and earth — moves left to right across alignment
  // moonProgress 0..1, x position interpolates from sunCx+90 to earthCx-90
  let moonX, moonY;
  if (type === 'solar') {
    moonX = sunCx + 100 + moonProgress * 200;
    moonY = 250 + (moonProgress - 0.5) * 80; // slight arc
  } else {
    // Lunar: moon is on far side of earth from sun
    moonX = earthCx + 90 + moonProgress * 80;
    moonY = 250 + (moonProgress - 0.5) * 30;
  }
  const aligned = Math.abs(moonY - 250) < 8;
  const lunarAligned = type === 'lunar' && aligned;
  const solarAligned = type === 'solar' && aligned && Math.abs(moonX - 380) < 80;

  return (
    <window.LessonStages
      speak={speak}
      stages={[
        { caption: "An eclipse happens when the Sun, Earth, and Moon line up in a special way.", narration: "An eclipse happens when the Sun, Earth, and Moon line up." },
        { caption: "When the Moon passes BETWEEN the Sun and Earth, the Moon's shadow falls on Earth. The Sun looks like it disappears — a Solar Eclipse!", narration: "When the moon is between the Sun and Earth, the moon casts a shadow on Earth. This is a solar eclipse." },
        { caption: "When EARTH is between the Sun and Moon, Earth's shadow falls on the Moon. The Moon turns red — a Lunar Eclipse!", narration: "When the Earth is between the Sun and the Moon, Earth's shadow makes the moon turn red. This is a lunar eclipse." },
        { caption: "Slide the Moon to line up the eclipse. Watch the shadows fall into place!", narration: "Try sliding the moon to line up an eclipse." },
      ]}
    >
      <div className="lesson-canvas eclipses-canvas">
        <div className="ec-toggle">
          <button className={`ec-toggle-btn ${type === 'solar' ? 'active' : ''}`} onClick={() => setType('solar')}>Solar Eclipse</button>
          <button className={`ec-toggle-btn ${type === 'lunar' ? 'active' : ''}`} onClick={() => setType('lunar')}>Lunar Eclipse</button>
        </div>

        <svg viewBox="0 0 700 500" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="ec-sun" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff8d8" />
              <stop offset="60%" stopColor="#ffcd45" />
              <stop offset="100%" stopColor="#ff8a1a" />
            </radialGradient>
            <radialGradient id="ec-earth" cx="35%" cy="30%" r="75%">
              <stop offset="0%" stopColor="#7ab8e8" />
              <stop offset="55%" stopColor="#2a5a9a" />
              <stop offset="100%" stopColor="#091a3a" />
            </radialGradient>
          </defs>

          {/* Sun */}
          <circle cx={sunCx} cy={sunCy} r={sunR} fill="url(#ec-sun)">
            <animate attributeName="r" values={`${sunR};${sunR + 4};${sunR}`} dur="3s" repeatCount="indefinite" />
          </circle>
          <text x={sunCx} y={sunCy + sunR + 22} fill="var(--accent)" fontFamily="JetBrains Mono" fontSize="10" letterSpacing="3" textAnchor="middle">SUN</text>

          {/* Sun rays */}
          {[-1, 0, 1].map(i => (
            <line key={i} x1={sunCx + sunR} y1={sunCy + i * 30} x2={earthCx - earthR - 10} y2={sunCy + i * 30}
                  stroke="rgba(255, 200, 100, 0.25)" strokeWidth="1" strokeDasharray="4 4" />
          ))}

          {/* Earth */}
          <g>
            <circle cx={earthCx} cy={earthCy} r={earthR} fill="url(#ec-earth)" />
            {/* Earth's shadow cone (only relevant for lunar) */}
            {type === 'lunar' && (
              <path d={`M ${earthCx + earthR} ${earthCy - earthR} L 700 ${earthCy - 15} L 700 ${earthCy + 15} L ${earthCx + earthR} ${earthCy + earthR} Z`}
                    fill="rgba(0, 0, 0, 0.5)" />
            )}
          </g>
          <text x={earthCx} y={earthCy + earthR + 22} fill="var(--accent)" fontFamily="JetBrains Mono" fontSize="10" letterSpacing="3" textAnchor="middle">EARTH</text>

          {/* Solar eclipse shadow on Earth */}
          {solarAligned && (
            <circle cx={earthCx - earthR + 10} cy={earthCy} r="14" fill="rgba(0,0,0,0.7)" />
          )}

          {/* Moon - with red tint if lunar eclipse aligned */}
          <g transform={`translate(${moonX}, ${moonY})`}>
            <circle r={moonR} fill={lunarAligned ? '#c85838' : '#bfb8a8'} />
            <circle r={moonR} fill="rgba(0,0,0,0.3)" cx={moonR * 0.3} cy={-moonR * 0.2} />
          </g>
          <text x={moonX} y={moonY + moonR + 18} fill="var(--ink-faint)" fontFamily="JetBrains Mono" fontSize="9" letterSpacing="2" textAnchor="middle">MOON</text>

          {/* Status text */}
          {solarAligned && (
            <text x="350" y="100" textAnchor="middle" fill="var(--accent)" fontFamily="Cormorant Garamond" fontStyle="italic" fontSize="26">
              ☀ Total Solar Eclipse!
            </text>
          )}
          {lunarAligned && (
            <text x="350" y="100" textAnchor="middle" fill="var(--accent)" fontFamily="Cormorant Garamond" fontStyle="italic" fontSize="26">
              🌑 Total Lunar Eclipse!
            </text>
          )}
        </svg>

        <div className="ec-scrub">
          <span className="ec-scrub-label">Slide the Moon →</span>
          <input
            type="range" min="0" max="1" step="0.01" value={moonProgress}
            onChange={e => setMoonProgress(parseFloat(e.target.value))}
          />
        </div>
      </div>
    </window.LessonStages>
  );
};

// ─────────────────────────────────────────────────────────────────
// 5. TIDES — Moon's gravity pulls ocean bulges
// ─────────────────────────────────────────────────────────────────

window.TidesLesson = function TidesLesson({ speak }) {
  const [moonAngle, setMoonAngle] = useStateE2(0); // 0 = moon to right
  const [auto, setAuto] = useStateE2(true);

  useEffectE2(() => {
    if (!auto) return;
    let raf, last = performance.now();
    const tick = (t) => {
      const dt = (t - last) / 1000;
      last = t;
      setMoonAngle(a => (a + dt * 0.4) % (Math.PI * 2));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [auto]);

  const earthCx = 280, earthCy = 250, earthR = 100;
  const moonOrbitR = 220;
  const moonX = earthCx + Math.cos(moonAngle) * moonOrbitR;
  const moonY = earthCy + Math.sin(moonAngle) * moonOrbitR;

  // Ocean bulges: one toward moon, one opposite. Render as elongated ellipse around earth, rotated to moon angle.
  const oceanBulge = 24; // bulge amount

  // Coast indicator on Earth
  const coastSurfaceAngle = 0; // fixed point on Earth
  // Tide height at coast: depends on its angle relative to moon
  const coastAngleFromMoon = coastSurfaceAngle - moonAngle;
  const tideHeight = Math.abs(Math.cos(coastAngleFromMoon)); // peaks at 0 and π (twice/day)
  const tideLabel = tideHeight > 0.7 ? 'High Tide' : tideHeight < 0.3 ? 'Low Tide' : 'Rising/Falling';

  return (
    <window.LessonStages
      speak={speak}
      stages={[
        { caption: "The Moon is far away, but its gravity reaches all the way to Earth — and pulls on our oceans!", narration: "The Moon's gravity reaches Earth and pulls on our oceans." },
        { caption: "Watch: the water bulges out on the side closest to the Moon... AND on the opposite side too!", narration: "Water bulges out on the side closest to the Moon, and on the opposite side too." },
        { caption: "As the Moon moves around Earth, those bulges follow — so coastlines get two high tides and two low tides every day.", narration: "As the moon moves around Earth, the water bulges follow. Each coast gets two high tides and two low tides every day." },
        { caption: "That's why beaches look so different in the morning vs the afternoon!", narration: "That is why beaches look so different in the morning compared to the afternoon." },
      ]}
    >
      <div className="lesson-canvas tides-canvas">
        <svg viewBox="0 0 600 500" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="ti-earth" cx="35%" cy="30%" r="75%">
              <stop offset="0%" stopColor="#7ab8e8" />
              <stop offset="55%" stopColor="#2a5a9a" />
              <stop offset="100%" stopColor="#091a3a" />
            </radialGradient>
          </defs>

          {/* Ocean bulge (ellipse rotated toward moon) */}
          <g transform={`translate(${earthCx}, ${earthCy}) rotate(${moonAngle * 180 / Math.PI})`}>
            <ellipse cx="0" cy="0" rx={earthR + oceanBulge} ry={earthR - 4}
                     fill="rgba(80, 140, 220, 0.45)" stroke="rgba(120, 180, 240, 0.6)" strokeWidth="1.5" />
          </g>

          {/* Earth */}
          <circle cx={earthCx} cy={earthCy} r={earthR - 8} fill="url(#ti-earth)" />
          {/* Land */}
          <g transform={`translate(${earthCx}, ${earthCy})`}>
            <path d="M -40 -30 Q -10 -50, 25 -25 Q 35 0, 15 20 Q -10 30, -40 10 Z" fill="#7a6840" opacity="0.85" />
            <path d="M 30 30 Q 50 20, 60 40 Q 50 55, 30 50 Z" fill="#7a6840" opacity="0.75" />
          </g>

          {/* Coast pin (fixed at right side of earth) */}
          <g transform={`translate(${earthCx + earthR}, ${earthCy})`}>
            <circle r="5" fill="var(--accent)" stroke="var(--bg-deep)" strokeWidth="2" />
            <text y="-12" fill="var(--accent)" fontFamily="JetBrains Mono" fontSize="9" letterSpacing="2" textAnchor="middle">COAST</text>
          </g>

          {/* Tide indicator bar near coast */}
          <g transform="translate(550, 200)">
            <rect x="-12" y="-100" width="24" height="200" fill="rgba(15, 20, 36, 0.6)" stroke="var(--rule)" />
            <rect x="-10" y={100 - tideHeight * 195} width="20" height={tideHeight * 195}
                  fill={tideHeight > 0.7 ? 'var(--accent)' : 'rgba(80, 140, 220, 0.6)'} />
            <text y="-110" textAnchor="middle" fill="var(--ink-soft)" fontFamily="JetBrains Mono" fontSize="9" letterSpacing="2">TIDE</text>
            <text y="120" textAnchor="middle" fill="var(--accent)" fontFamily="JetBrains Mono" fontSize="10" letterSpacing="2">{tideLabel.toUpperCase()}</text>
          </g>

          {/* Moon orbit */}
          <circle cx={earthCx} cy={earthCy} r={moonOrbitR} fill="none" stroke="rgba(212, 163, 92, 0.18)" strokeDasharray="3 5" />
          {/* Moon */}
          <g transform={`translate(${moonX}, ${moonY})`}>
            <circle r="24" fill="#bfb8a8" />
            <circle r="6" cx="-8" cy="-4" fill="#5a544a" opacity="0.6" />
            <circle r="4" cx="6" cy="6" fill="#5a544a" opacity="0.5" />
          </g>
          {/* Gravity pull arrow */}
          <line x1={earthCx + earthR + oceanBulge + 6} y1={earthCy} x2={moonX - 26} y2={moonY}
                stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5"
                transform={`rotate(${moonAngle * 180 / Math.PI}, ${earthCx}, ${earthCy})`} />
        </svg>

        <div className="tides-controls">
          <button className="lesson-btn primary" onClick={() => setAuto(a => !a)}>
            {auto ? '❚❚ Pause' : '▶ Move Moon'}
          </button>
        </div>
      </div>
    </window.LessonStages>
  );
};
