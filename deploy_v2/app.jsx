// Main app — view router, sim time loop, masthead, dock controls, tweaks

const { useState: useStateA, useEffect: useEffectA, useRef: useRefA, useMemo: useMemoA } = React;

// Star field — generated once
function StarField() {
  const stars = useMemoA(() => {
    const arr = [];
    for (let i = 0; i < 220; i++) {
      arr.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() < 0.92 ? 1 : (Math.random() < 0.5 ? 2 : 3),
        mag: 0.3 + Math.random() * 0.6,
        delay: Math.random() * 4,
      });
    }
    return arr;
  }, []);
  return (
    <div className="stars-layer">
      {stars.map((s, i) => (
        <div key={i} className="star" style={{
          left: s.x + '%', top: s.y + '%',
          width: s.size, height: s.size,
          '--mag': s.mag,
          animationDelay: s.delay + 's',
        }} />
      ))}
    </div>
  );
}

// Tweakable defaults
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "orbitSpeed": 30,
  "showLabels": true,
  "showOrbits": true,
  "showAsteroids": true,
  "realisticDistances": false,
  "theme": "dark",
  "soundOn": true
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = window.useTweaks(TWEAK_DEFAULTS);

  const [view, setView] = useStateA('orbital'); // 'orbital' | 'detail' | 'compare' | 'quiz'
  const [selectedPlanet, setSelectedPlanet] = useStateA('earth');
  const [compareLeft, setCompareLeft] = useStateA('earth');
  const [compareRight, setCompareRight] = useStateA('jupiter');
  const [paused, setPaused] = useStateA(false);
  const [hintDismissed, setHintDismissed] = useStateA(() => {
    try { return localStorage.getItem('bosco_hint_dismissed') === '1'; } catch (e) { return false; }
  });
  const dismissHint = () => {
    setHintDismissed(true);
    try { localStorage.setItem('bosco_hint_dismissed', '1'); } catch (e) {}
  };

  // Sim time loop — owned here so all views share it
  const simDaysRef = useRefA(0);
  const [simDaysDisplay, setSimDaysDisplay] = useStateA(0);

  useEffectA(() => {
    let raf;
    let last = performance.now();
    const tick = (t) => {
      const dt = (t - last) / 1000;
      last = t;
      if (!paused) {
        // speed: how many sim-days advance per real second
        // At default 30, Earth (365d) finishes orbit in ~12s
        simDaysRef.current += dt * (window.__orbitSpeed || 30);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused]);

  // Push speed into module global so loop reads latest without re-creating
  useEffectA(() => { window.__orbitSpeed = t.orbitSpeed; }, [t.orbitSpeed]);

  // Update display once per second
  useEffectA(() => {
    const id = setInterval(() => setSimDaysDisplay(simDaysRef.current), 250);
    return () => clearInterval(id);
  }, []);

  // Apply theme
  useEffectA(() => {
    document.documentElement.setAttribute('data-theme', t.theme);
  }, [t.theme]);

  const handleSelectPlanet = (id) => {
    setSelectedPlanet(id);
    setView('detail');
    if (t.soundOn && window.speechSynthesis) {
      const all = [window.SOLAR_DATA.sun, ...window.SOLAR_DATA.planets, window.SOLAR_DATA.dwarf.pluto];
      const p = all.find(x => x.id === id);
      if (p) {
        const u = new SpeechSynthesisUtterance(p.name);
        u.rate = 0.9;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
      }
    }
  };

  const handleCompare = (id) => {
    setCompareLeft(id);
    setCompareRight(id === 'jupiter' ? 'earth' : 'jupiter');
    setView('compare');
  };

  // Format elapsed sim time as Earth years/days
  const elapsedYears = Math.floor(simDaysDisplay / 365.25);
  const elapsedDays = Math.floor(simDaysDisplay % 365.25);

  return (
    <>
      <div className="cosmos-bg" />
      <StarField />

      <div className="app-root">
        <header className="masthead">
          <div>
            <h1 className="masthead-title">
              The Solar System <span className="ampersand">&amp;</span> <em>Bosco</em>
            </h1>
            <div className="masthead-sub">A Field Guide to The Sun, Planets &amp; Beyond · Issue Nº 01</div>
          </div>

          <div className="masthead-meta">
            <span><b>{elapsedYears}</b>Y · <b>{elapsedDays}</b>D ELAPSED</span>
            <span>Speed <b>{t.orbitSpeed}×</b></span>
          </div>

          <div className="nav-tabs">
            <button className={`nav-tab ${view === 'orbital' ? 'active' : ''}`} onClick={() => setView('orbital')}>Orbit</button>
            <button className={`nav-tab ${view === 'mission' ? 'active' : ''}`} onClick={() => setView('mission')}>Mission</button>
            <button className={`nav-tab ${view === 'explore' ? 'active' : ''}`} onClick={() => setView('explore')}>Explore</button>
            <button className={`nav-tab ${view === 'think' ? 'active' : ''}`} onClick={() => setView('think')}>Think</button>
            <button className={`nav-tab ${view === 'compare' ? 'active' : ''}`} onClick={() => setView('compare')}>Compare</button>
            <button className={`nav-tab ${view === 'quiz' ? 'active' : ''}`} onClick={() => setView('quiz')}>Quiz</button>
          </div>
        </header>

        <main className="stage">
          {view === 'orbital' && (
            <>
              <OrbitalView
                simDaysRef={simDaysRef}
                paused={paused}
                showOrbits={t.showOrbits}
                showLabels={t.showLabels}
                showAsteroids={t.showAsteroids}
                realisticDistances={t.realisticDistances}
                onSelectPlanet={handleSelectPlanet}
              />
              <div className="hint-card" hidden={hintDismissed}>
                <button className="hint-close" onClick={dismissHint} aria-label="Dismiss">×</button>
                <div className="hint-eyebrow">For Bosco</div>
                <p className="hint-text">
                  Tap any planet to learn its name and a fun fact. Each planet moves at its <em>real</em> speed around the Sun — Mercury is the quickest, Neptune the slowest.
                </p>
              </div>

              {/* Dock */}
              <div className="dock">
                <button className="dock-btn primary" onClick={() => setPaused(p => !p)} title={paused ? 'Play' : 'Pause'}>
                  {paused ? '▶' : '❚❚'}
                </button>
                <button className="dock-btn" onClick={() => { simDaysRef.current = 0; setSimDaysDisplay(0); }} title="Reset">↻</button>
                <div className="dock-divider" />
                <span className="dock-label">Speed</span>
                <input
                  type="range" min="1" max="200" step="1"
                  value={t.orbitSpeed}
                  onChange={e => setTweak('orbitSpeed', parseInt(e.target.value))}
                />
                <span className="dock-value">{t.orbitSpeed}×</span>
              </div>
            </>
          )}

          {view === 'detail' && (
            <PlanetDetail
              planetId={selectedPlanet}
              onBack={() => setView('orbital')}
              onCompare={handleCompare}
              soundOn={t.soundOn}
            />
          )}

          {view === 'compare' && (
            <CompareView
              initialLeft={compareLeft}
              initialRight={compareRight}
              onBack={() => setView('orbital')}
            />
          )}

          {view === 'quiz' && (
            <QuizView onBack={() => setView('orbital')} soundOn={t.soundOn} />
          )}

          {view === 'think' && (
            <window.ThinkView onBack={() => setView('orbital')} soundOn={t.soundOn} />
          )}

          {view === 'explore' && (
            <window.ExploreView onBack={() => setView('orbital')} soundOn={t.soundOn} />
          )}

          {view === 'mission' && (
            <window.MissionView onBack={() => setView('orbital')} soundOn={t.soundOn} />
          )}
        </main>

        <div className="footer-credit">A Field Guide · Original Illustrations</div>
      </div>

      {/* Tweaks panel */}
      <window.TweaksPanel title="Tweaks">
        <window.TweakSection label="Motion" />
        <window.TweakSlider label="Orbit Speed" min={1} max={200} step={1} value={t.orbitSpeed}
          onChange={v => setTweak('orbitSpeed', v)} unit="×" />
        <window.TweakToggle label="Realistic distances" value={t.realisticDistances}
          onChange={v => setTweak('realisticDistances', v)} />

        <window.TweakSection label="Display" />
        <window.TweakToggle label="Show labels" value={t.showLabels} onChange={v => setTweak('showLabels', v)} />
        <window.TweakToggle label="Show orbit rings" value={t.showOrbits} onChange={v => setTweak('showOrbits', v)} />
        <window.TweakToggle label="Show asteroid belt" value={t.showAsteroids} onChange={v => setTweak('showAsteroids', v)} />

        <window.TweakSection label="Experience" />
        <window.TweakRadio label="Theme" value={t.theme}
          options={[{ label: 'Space', value: 'dark' }, { label: 'Light', value: 'light' }]}
          onChange={v => setTweak('theme', v)} />
        <window.TweakToggle label="Sound on" value={t.soundOn} onChange={v => setTweak('soundOn', v)} />
      </window.TweaksPanel>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
