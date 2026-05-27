// Planet Detail View — magazine-style spread with rotating planet + facts

const { useState: useStateD, useEffect: useEffectD, useRef: useRefD } = React;

window.PlanetDetail = function PlanetDetail({ planetId, onBack, onCompare, soundOn }) {
  const data = window.SOLAR_DATA;
  let planet;
  let isEarth = planetId === 'earth';
  let isSun = planetId === 'sun';

  if (isSun) planet = data.sun;
  else if (planetId === 'pluto') planet = data.dwarf.pluto;
  else planet = data.planets.find(p => p.id === planetId);

  if (!planet) return null;

  // Visual size for the planet portrait — scaled but capped
  const visualSize = isSun ? 480 : Math.min(420, 90 + planet.visualRadius * 8);

  // Spin duration scaled from real rotation period
  // Real rotation in days → animate over (sec) at default speed
  const rotDays = Math.abs(planet.rotationPeriod_days || 1);
  // Map: 1 day = 4s, capped between 6s and 90s for visibility
  const spinDur = Math.max(8, Math.min(90, rotDays * 6));
  const spinDir = (planet.rotationPeriod_days || 1) < 0 ? -1 : 1;

  // Earth day/night sweep
  const [dayAngle, setDayAngle] = useStateD(0);
  useEffectD(() => {
    if (!isEarth) return;
    let raf, last = performance.now();
    const tick = (t) => {
      const dt = (t - last) / 1000;
      last = t;
      setDayAngle(a => (a + dt * 12) % 360); // 30 sec for full rotation
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isEarth]);

  // Moon orbit around Earth
  const [moonAngle, setMoonAngle] = useStateD(0);
  useEffectD(() => {
    if (!isEarth) return;
    let raf, last = performance.now();
    const tick = (t) => {
      const dt = (t - last) / 1000;
      last = t;
      setMoonAngle(a => (a + dt * 22) % 360);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isEarth]);

  const speak = () => {
    if (!soundOn || !window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(planet.name);
    u.rate = 0.9; u.pitch = 1.0;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  const speakFact = () => {
    if (!soundOn || !window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(planet.wowFact);
    u.rate = 0.92;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  return (
    <div className="detail-view">
      <button className="back-btn" onClick={onBack}>← Back to Orbit</button>

      <div className="detail-visual">
        <div style={{ position: 'relative', width: visualSize, height: visualSize }}>
          <div
            className="detail-planet-large"
            style={{
              width: visualSize,
              height: visualSize,
              boxShadow: isSun
                ? `0 0 120px 30px rgba(255, 180, 80, 0.4), 0 0 200px 60px rgba(255, 140, 50, 0.2)`
                : `0 0 80px 10px rgba(212, 163, 92, 0.12)`,
              animation: isSun ? 'none' : `slow-spin ${spinDur}s linear infinite ${spinDir < 0 ? 'reverse' : 'normal'}`,
            }}
          >
            <window.PlanetSVG id={planet.id} size={visualSize} />
          </div>
          {planet.hasRings && (
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              width: visualSize * 2.0, height: visualSize * 2.0,
              transform: 'translate(-50%, -50%) rotateX(72deg) rotateZ(-15deg)',
              borderRadius: '50%',
              border: '5px solid rgba(212, 180, 130, 0.7)',
              boxShadow: '0 0 0 9px rgba(180, 150, 100, 0.3), 0 0 0 14px rgba(150, 120, 80, 0.18)',
              pointerEvents: 'none',
            }} />
          )}
          {isEarth && (
            <>
              <div
                className="day-night-shade"
                style={{
                  background: `linear-gradient(${dayAngle}deg, rgba(0,0,0,0.0) 49%, rgba(0,0,0,0.45) 51%)`,
                }}
              />
              {/* Moon */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%', left: '50%',
                  transform: `rotate(${moonAngle}deg) translateX(${visualSize * 0.78}px) rotate(${-moonAngle}deg)`,
                  transformOrigin: '0 0',
                }}
              >
                <div style={{
                  position: 'absolute',
                  transform: 'translate(-50%, -50%)',
                }}>
                  <window.PlanetSVG id="moon" size={44} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="detail-content">
        <div className="detail-eyebrow">
          {isSun ? 'The Star at the Center' : planet.order === 9 ? 'Beyond the Eighth Orbit' : `Planet №${String(planet.order).padStart(2, '0')} of the Solar System`}
        </div>
        <h1 className="detail-name">
          {!isSun && <span className="planet-num">{String(planet.order).padStart(2, '0')}</span>}
          {planet.name}
        </h1>
        <div className="detail-kind">{planet.kind}</div>

        <p className="detail-blurb">{planet.blurb}</p>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="speak-btn" onClick={speak}>♪ Say the Name</button>
          <button className="speak-btn" onClick={speakFact}>♪ Read the Fact</button>
          {!isSun && (
            <button className="speak-btn" onClick={() => onCompare(planet.id)}>⇋ Compare</button>
          )}
        </div>

        <div className="fact-grid">
          {planet.facts.map((f, i) => (
            <div className="fact-row" key={i}>
              <div className="fact-label">{f.label}</div>
              <div className="fact-value">{f.value}</div>
            </div>
          ))}
        </div>

        <div className="wow-fact">
          <div className="wow-eyebrow">Did You Know</div>
          <p>{planet.wowFact}</p>
        </div>

        {isEarth && (
          <div className="wow-fact" style={{ marginTop: 16 }}>
            <div className="wow-eyebrow">About The Moon</div>
            <p>{planet.moon.blurb} It circles Earth once every {planet.moon.orbitalPeriod_days} days.</p>
          </div>
        )}
      </div>
    </div>
  );
};
