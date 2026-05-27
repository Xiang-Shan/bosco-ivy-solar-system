// Mission Control View — NASA-style per-planet telemetry & zoom
// Layout: left planet selector, center zoomable planet viewer with overlays, right telemetry panels.

const { useState: useStateM, useEffect: useEffectM, useRef: useRefM, useMemo: useMemoM } = React;

// Per-planet NASA-style data (composition, missions, features, interior layers)
const MISSION_DATA = {
  sun: {
    designation: 'STAR-001',
    classification: 'G2V Yellow Dwarf',
    composition: [
      { label: 'Hydrogen', pct: 73.5, color: '#ffd66a' },
      { label: 'Helium', pct: 24.9, color: '#ffa040' },
      { label: 'Other', pct: 1.6, color: '#a85a20' },
    ],
    features: ['Photosphere · 5,500°C', 'Solar Corona · 1M°C', 'Sunspots & flares', 'Magnetic field reversal every 11y'],
    missions: [
      { y: '1976', name: 'Helios 2', status: 'success' },
      { y: '1990', name: 'Ulysses', status: 'success' },
      { y: '1995', name: 'SOHO', status: 'active' },
      { y: '2010', name: 'Solar Dynamics Obs', status: 'active' },
      { y: '2018', name: 'Parker Solar Probe', status: 'active' },
    ],
    layers: [
      { name: 'Core', pct: 25, color: '#fff5a0' },
      { name: 'Radiative Z.', pct: 45, color: '#ffd76a' },
      { name: 'Convective Z.', pct: 25, color: '#ff9530' },
      { name: 'Photosphere', pct: 5, color: '#ff6010' },
    ],
  },
  mercury: {
    designation: 'PLANET-001',
    classification: 'Terrestrial · Inner',
    composition: [
      { label: 'Iron Core', pct: 70, color: '#8a6a4a' },
      { label: 'Silicate Mantle', pct: 28, color: '#a89888' },
      { label: 'Thin Exosphere', pct: 2, color: '#d8c4a8' },
    ],
    features: ['Caloris Basin · 1,550 km', 'Iron core (largest ratio)', 'No atmosphere', 'Day temp: 430°C · Night: −180°C'],
    missions: [
      { y: '1974', name: 'Mariner 10', status: 'success' },
      { y: '2011', name: 'MESSENGER', status: 'success' },
      { y: '2025', name: 'BepiColombo', status: 'active' },
    ],
    layers: [
      { name: 'Iron Core', pct: 75, color: '#a88858' },
      { name: 'Silicate Mantle', pct: 20, color: '#c8b298' },
      { name: 'Crust', pct: 5, color: '#d4c0a8' },
    ],
  },
  venus: {
    designation: 'PLANET-002',
    classification: 'Terrestrial · Inner',
    composition: [
      { label: 'CO₂', pct: 96.5, color: '#c89858' },
      { label: 'N₂', pct: 3.5, color: '#a08040' },
      { label: 'Trace SO₂', pct: 0.015, color: '#604010' },
    ],
    features: ['Surface pressure: 92 atm', 'Sulfuric acid clouds', 'Retrograde rotation', '465°C surface (hottest)'],
    missions: [
      { y: '1962', name: 'Mariner 2', status: 'success' },
      { y: '1970', name: 'Venera 7 (landed)', status: 'success' },
      { y: '1989', name: 'Magellan', status: 'success' },
      { y: '2030', name: 'DAVINCI+ (planned)', status: 'planned' },
    ],
    layers: [
      { name: 'Iron Core', pct: 30, color: '#8a6a40' },
      { name: 'Mantle', pct: 60, color: '#c89858' },
      { name: 'Crust', pct: 7, color: '#d8b878' },
      { name: 'Atmosphere', pct: 3, color: '#f5dcb0' },
    ],
  },
  earth: {
    designation: 'PLANET-003 · HOME',
    classification: 'Terrestrial · Habitable',
    composition: [
      { label: 'N₂', pct: 78.1, color: '#5b9fd9' },
      { label: 'O₂', pct: 20.9, color: '#3d7bb0' },
      { label: 'Argon', pct: 0.93, color: '#1a3a5e' },
      { label: 'CO₂', pct: 0.04, color: '#0a1a3a' },
    ],
    features: ['Liquid water surface · 71%', 'Plate tectonics · active', 'Magnetic field · strong', 'Only known life · confirmed'],
    missions: [
      { y: '1957', name: 'Sputnik 1', status: 'success' },
      { y: '1969', name: 'Apollo 11 · Moon', status: 'success' },
      { y: '1998', name: 'ISS · still up', status: 'active' },
      { y: 'OPS', name: '4,800+ active satellites', status: 'active' },
    ],
    layers: [
      { name: 'Inner Core (Fe)', pct: 9, color: '#d4a574' },
      { name: 'Outer Core (Fe)', pct: 22, color: '#a87838' },
      { name: 'Mantle', pct: 60, color: '#6a4a28' },
      { name: 'Crust', pct: 5, color: '#3a7a44' },
      { name: 'Hydrosphere', pct: 2, color: '#2a5a9a' },
      { name: 'Atmosphere', pct: 2, color: '#7ab8e8' },
    ],
  },
  mars: {
    designation: 'PLANET-004',
    classification: 'Terrestrial · Outer',
    composition: [
      { label: 'CO₂', pct: 95.3, color: '#c66a3f' },
      { label: 'N₂', pct: 2.7, color: '#a35430' },
      { label: 'Argon', pct: 1.6, color: '#7a3818' },
      { label: 'Trace', pct: 0.4, color: '#4a1c0a' },
    ],
    features: ['Olympus Mons · 22 km tall', 'Valles Marineris · 4,000 km long', 'Polar ice caps · water + CO₂', 'Iron oxide surface (rust)'],
    missions: [
      { y: '1976', name: 'Viking 1 & 2', status: 'success' },
      { y: '1997', name: 'Pathfinder · Sojourner', status: 'success' },
      { y: '2004', name: 'Spirit & Opportunity', status: 'success' },
      { y: '2012', name: 'Curiosity', status: 'active' },
      { y: '2021', name: 'Perseverance + Ingenuity', status: 'active' },
    ],
    layers: [
      { name: 'Iron Core', pct: 15, color: '#a83828' },
      { name: 'Mantle', pct: 60, color: '#c66a3f' },
      { name: 'Crust', pct: 22, color: '#d48458' },
      { name: 'Thin Atmosphere', pct: 3, color: '#e8a884' },
    ],
  },
  jupiter: {
    designation: 'PLANET-005',
    classification: 'Gas Giant',
    composition: [
      { label: 'Hydrogen', pct: 89.8, color: '#e8c890' },
      { label: 'Helium', pct: 10.2, color: '#c89868' },
      { label: 'Trace', pct: 0.3, color: '#a83820' },
    ],
    features: ['Great Red Spot · 300+ yr storm', 'Mass: 2.5× all others combined', '95 confirmed moons', 'Strongest magnetic field'],
    missions: [
      { y: '1973', name: 'Pioneer 10', status: 'success' },
      { y: '1979', name: 'Voyager 1 & 2', status: 'success' },
      { y: '1995', name: 'Galileo', status: 'success' },
      { y: '2016', name: 'Juno', status: 'active' },
      { y: '2030', name: 'Europa Clipper', status: 'planned' },
    ],
    layers: [
      { name: 'Rocky Core', pct: 5, color: '#5a3a1a' },
      { name: 'Metallic H', pct: 35, color: '#a85a20' },
      { name: 'Liquid H', pct: 50, color: '#c89868' },
      { name: 'Gas Atmosphere', pct: 10, color: '#e8c890' },
    ],
  },
  saturn: {
    designation: 'PLANET-006',
    classification: 'Gas Giant · Ringed',
    composition: [
      { label: 'Hydrogen', pct: 96.3, color: '#f7e6b8' },
      { label: 'Helium', pct: 3.25, color: '#c8a868' },
      { label: 'Trace', pct: 0.45, color: '#8a6840' },
    ],
    features: ['Ring system: 7 main groups', 'Rings: 99.9% water ice', '146 moons inc. Titan, Enceladus', 'Density less than water — would float!'],
    missions: [
      { y: '1979', name: 'Pioneer 11', status: 'success' },
      { y: '1980', name: 'Voyager 1 & 2', status: 'success' },
      { y: '1997', name: 'Cassini-Huygens', status: 'success' },
      { y: '2027', name: 'Dragonfly · Titan', status: 'planned' },
    ],
    layers: [
      { name: 'Rocky Core', pct: 8, color: '#5a3818' },
      { name: 'Metallic H', pct: 30, color: '#a88858' },
      { name: 'Liquid H', pct: 50, color: '#c8a868' },
      { name: 'Atmosphere', pct: 12, color: '#f7e6b8' },
    ],
  },
  uranus: {
    designation: 'PLANET-007',
    classification: 'Ice Giant',
    composition: [
      { label: 'Hydrogen', pct: 82.5, color: '#a8d8e0' },
      { label: 'Helium', pct: 15.2, color: '#7eb8c4' },
      { label: 'Methane (CH₄)', pct: 2.3, color: '#4a8a98' },
    ],
    features: ["Axis tilted 97.77° · rolls", 'Seasons: 21 Earth years each', '27 moons · all named for Shakespeare/Pope', 'Faint dark ring system'],
    missions: [
      { y: '1986', name: 'Voyager 2 · flyby', status: 'success' },
      { y: '2040s', name: 'Uranus Orbiter (proposed)', status: 'planned' },
    ],
    layers: [
      { name: 'Rocky Core', pct: 18, color: '#3a5860' },
      { name: 'Icy Mantle', pct: 60, color: '#5a9aa8' },
      { name: 'Gas Envelope', pct: 22, color: '#a8d8e0' },
    ],
  },
  neptune: {
    designation: 'PLANET-008',
    classification: 'Ice Giant',
    composition: [
      { label: 'Hydrogen', pct: 80, color: '#4a6fc7' },
      { label: 'Helium', pct: 19, color: '#2a4a9e' },
      { label: 'Methane (CH₄)', pct: 1.5, color: '#0a1e4a' },
    ],
    features: ['Strongest winds in system · 2,100 km/h', 'Great Dark Spot storm', '14 known moons · Triton retrograde', 'Discovered by math before sight (1846)'],
    missions: [
      { y: '1989', name: 'Voyager 2 · flyby', status: 'success' },
      { y: '2030s', name: 'Neptune Probe (proposed)', status: 'planned' },
    ],
    layers: [
      { name: 'Rocky Core', pct: 20, color: '#2a3858' },
      { name: 'Icy Mantle', pct: 55, color: '#3354a8' },
      { name: 'Gas Envelope', pct: 25, color: '#4a6fc7' },
    ],
  },
  pluto: {
    designation: 'DWARF-001',
    classification: 'Dwarf Planet · Kuiper Belt',
    composition: [
      { label: 'N₂ (thin)', pct: 90, color: '#c9a98a' },
      { label: 'Methane', pct: 5, color: '#a88a6c' },
      { label: 'Carbon Mono.', pct: 5, color: '#5a3818' },
    ],
    features: ['Tombaugh Regio · heart-shaped plain', 'Mountains of water ice', '5 moons · Charon is half its size', 'Discovered 1930 · classified dwarf 2006'],
    missions: [
      { y: '2015', name: 'New Horizons · flyby', status: 'success' },
    ],
    layers: [
      { name: 'Rocky Core', pct: 50, color: '#5a3818' },
      { name: 'Water Ice Mantle', pct: 40, color: '#c9a98a' },
      { name: 'N₂ Frost Surface', pct: 10, color: '#f0dcb0' },
    ],
  },
};

window.MissionView = function MissionView({ onBack, soundOn }) {
  const planets = window.SOLAR_DATA.planets;
  const allBodies = [window.SOLAR_DATA.sun, ...planets, window.SOLAR_DATA.dwarf.pluto];
  const [activeId, setActiveId] = useStateM('earth');
  const [zoom, setZoom] = useStateM(0.5); // 0=orbital 0.5=planetary 1=surface

  const active = allBodies.find(b => b.id === activeId);
  const data = MISSION_DATA[activeId];

  // Live "telemetry" clock
  const [now, setNow] = useStateM(new Date());
  useEffectM(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const speak = (text) => {
    if (!soundOn || !window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  const zoomLabel = zoom < 0.33 ? 'ORBITAL' : zoom < 0.66 ? 'PLANETARY' : 'SURFACE';
  const planetSize = 200 + zoom * 360; // 200 → 560

  return (
    <div className="mission-view">
      <button className="back-btn" onClick={onBack}>← Back to Orbit</button>

      {/* Mission control header strip */}
      <header className="mission-header">
        <div className="mission-hdr-cell">
          <div className="mission-hdr-label">Target</div>
          <div className="mission-hdr-value">{active.name.toUpperCase()}</div>
        </div>
        <div className="mission-hdr-cell">
          <div className="mission-hdr-label">Designation</div>
          <div className="mission-hdr-value">{data.designation}</div>
        </div>
        <div className="mission-hdr-cell">
          <div className="mission-hdr-label">Classification</div>
          <div className="mission-hdr-value">{data.classification}</div>
        </div>
        <div className="mission-hdr-cell">
          <div className="mission-hdr-label">Signal</div>
          <div className="mission-hdr-value status-on">▮▮▮▮▯ NOMINAL</div>
        </div>
        <div className="mission-hdr-cell">
          <div className="mission-hdr-label">UTC</div>
          <div className="mission-hdr-value mono">{now.toUTCString().slice(17, 25)}</div>
        </div>
      </header>

      <div className="mission-body">
        {/* Left: planet target list */}
        <aside className="mission-targets">
          <div className="mission-section-label">Targets · {allBodies.length}</div>
          {allBodies.map(b => (
            <button
              key={b.id}
              className={`mission-target ${activeId === b.id ? 'active' : ''}`}
              onClick={() => setActiveId(b.id)}
            >
              <window.PlanetSVG id={b.id} size={32} />
              <div className="mission-target-text">
                <div className="mission-target-name">{b.name}</div>
                <div className="mission-target-id">{MISSION_DATA[b.id].designation}</div>
              </div>
              {activeId === b.id && <div className="mission-target-mark">●</div>}
            </button>
          ))}
        </aside>

        {/* Center: planet viewer */}
        <section className="mission-viewer">
          <div className="mission-viewer-grid">
            {/* Grid overlay lines */}
            <svg className="mission-grid-overlay" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="m-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(212, 163, 92, 0.06)" strokeWidth="0.15" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#m-grid)" />
              {/* Center crosshair */}
              <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(212, 163, 92, 0.15)" strokeWidth="0.1" strokeDasharray="0.6 0.6" />
              <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(212, 163, 92, 0.15)" strokeWidth="0.1" strokeDasharray="0.6 0.6" />
            </svg>

            {/* Planet */}
            <div className="mission-planet-wrap" style={{ width: planetSize, height: planetSize }}>
              <window.PlanetSVG id={active.id} size={planetSize} />

              {/* Rings for ringed planets */}
              {active.hasRings && (
                <div className="mission-rings" style={{
                  width: planetSize * (active.id === 'saturn' ? 2.0 : active.id === 'uranus' ? 1.7 : 1.6),
                  height: planetSize * (active.id === 'saturn' ? 2.0 : active.id === 'uranus' ? 1.7 : 1.6),
                  borderWidth: active.id === 'saturn' ? 6 : 2,
                  borderColor: active.id === 'saturn' ? 'rgba(212, 180, 130, 0.75)' : active.id === 'uranus' ? 'rgba(168, 216, 224, 0.45)' : 'rgba(120, 140, 200, 0.4)',
                  boxShadow: active.id === 'saturn'
                    ? '0 0 0 10px rgba(180, 150, 100, 0.35), 0 0 0 16px rgba(150, 120, 80, 0.18)'
                    : active.id === 'uranus'
                    ? '0 0 0 3px rgba(126, 184, 196, 0.18)'
                    : '0 0 0 3px rgba(100, 120, 180, 0.15)',
                }} />
              )}

              {/* Reticle frame around planet */}
              <svg className="mission-reticle" viewBox="0 0 100 100">
                <g stroke="var(--accent)" fill="none" strokeWidth="0.3">
                  {/* Corner brackets */}
                  <path d="M 2 12 L 2 2 L 12 2" />
                  <path d="M 88 2 L 98 2 L 98 12" />
                  <path d="M 98 88 L 98 98 L 88 98" />
                  <path d="M 12 98 L 2 98 L 2 88" />
                  {/* Tick marks */}
                  <line x1="50" y1="0" x2="50" y2="3" />
                  <line x1="50" y1="97" x2="50" y2="100" />
                  <line x1="0" y1="50" x2="3" y2="50" />
                  <line x1="97" y1="50" x2="100" y2="50" />
                </g>
              </svg>

              {/* Pointer labels for surface features (zoomed in) */}
              {zoom > 0.6 && (active.id === 'mars' ? (
                <div className="mission-pointers">
                  <FeaturePointer x="35%" y="38%" label="OLYMPUS MONS · 22km" />
                  <FeaturePointer x="60%" y="58%" label="VALLES MARINERIS" />
                  <FeaturePointer x="50%" y="12%" label="POLAR ICE CAP" />
                </div>
              ) : active.id === 'jupiter' ? (
                <div className="mission-pointers">
                  <FeaturePointer x="62%" y="60%" label="GREAT RED SPOT" />
                  <FeaturePointer x="40%" y="30%" label="NORTH TEMPERATE BELT" />
                </div>
              ) : active.id === 'earth' ? (
                <div className="mission-pointers">
                  <FeaturePointer x="48%" y="44%" label="CONTINENTAL LANDMASS" />
                  <FeaturePointer x="50%" y="10%" label="ARCTIC ICE" />
                </div>
              ) : active.id === 'saturn' ? (
                <div className="mission-pointers">
                  <FeaturePointer x="42%" y="45%" label="EQUATORIAL BAND" />
                  <FeaturePointer x="62%" y="52%" label="HEXAGON STORM (N)" />
                </div>
              ) : active.id === 'pluto' ? (
                <div className="mission-pointers">
                  <FeaturePointer x="48%" y="55%" label="TOMBAUGH REGIO (HEART)" />
                </div>
              ) : null)}
            </div>

            {/* Bottom-left zoom indicator */}
            <div className="mission-zoom-readout">
              <div className="mission-zoom-label">ZOOM · {zoomLabel}</div>
              <div className="mission-zoom-bar">
                <div className="mission-zoom-fill" style={{ width: (zoom * 100) + '%' }} />
              </div>
            </div>
          </div>

          {/* Zoom controls */}
          <div className="mission-zoom-controls">
            <button className={`mission-zoom-btn ${zoom < 0.33 ? 'active' : ''}`} onClick={() => setZoom(0.15)}>Orbital</button>
            <button className={`mission-zoom-btn ${zoom >= 0.33 && zoom < 0.66 ? 'active' : ''}`} onClick={() => setZoom(0.5)}>Planetary</button>
            <button className={`mission-zoom-btn ${zoom >= 0.66 ? 'active' : ''}`} onClick={() => setZoom(0.95)}>Surface</button>
            <input type="range" min="0" max="1" step="0.01" value={zoom}
                   onChange={e => setZoom(parseFloat(e.target.value))} />
          </div>
        </section>

        {/* Right: telemetry panels */}
        <aside className="mission-telemetry">
          {/* Physical readouts */}
          <div className="mission-panel">
            <div className="mission-panel-label">Physical · Telemetry</div>
            <table className="mission-table">
              <tbody>
                <tr><td>Diameter</td><td>{(active.diameter_km / 1000).toFixed(1)}k <em>km</em></td></tr>
                {active.orbitalPeriod_days && <tr><td>Orbital Period</td><td>{active.orbitalPeriod_days.toFixed(0)} <em>days</em></td></tr>}
                {active.rotationPeriod_days && <tr><td>Rotation</td><td>{Math.abs(active.rotationPeriod_days).toFixed(2)} <em>days{active.rotationPeriod_days < 0 ? ' · retro' : ''}</em></td></tr>}
                {active.axialTilt_deg != null && <tr><td>Axial Tilt</td><td>{active.axialTilt_deg.toFixed(1)}<em>°</em></td></tr>}
                {active.moons != null && <tr><td>Moons</td><td>{active.moons}</td></tr>}
              </tbody>
            </table>
          </div>

          {/* Composition bars */}
          <div className="mission-panel">
            <div className="mission-panel-label">Composition</div>
            <div className="mission-bars">
              {data.composition.map((c, i) => (
                <div key={i} className="mission-bar-row">
                  <div className="mission-bar-track">
                    <div className="mission-bar-fill" style={{ width: c.pct + '%', background: c.color }} />
                  </div>
                  <div className="mission-bar-meta">
                    <span className="mission-bar-label">{c.label}</span>
                    <span className="mission-bar-pct">{c.pct < 0.1 ? c.pct.toFixed(3) : c.pct.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interior schematic */}
          <div className="mission-panel">
            <div className="mission-panel-label">Interior · Cross-Section</div>
            <div className="mission-interior">
              <svg viewBox="0 0 100 100" width="100%" height="100%">
                {(() => {
                  let radius = 50;
                  return data.layers.map((layer, i) => {
                    const r = radius;
                    radius -= layer.pct * 0.5;
                    return <circle key={i} cx="50" cy="50" r={r} fill={layer.color} stroke="rgba(0,0,0,0.2)" strokeWidth="0.3" />;
                  });
                })()}
              </svg>
              <div className="mission-interior-legend">
                {data.layers.map((l, i) => (
                  <div key={i} className="mission-interior-row">
                    <span className="mission-interior-dot" style={{ background: l.color }} />
                    <span>{l.name}</span>
                    <em>{l.pct}%</em>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Notable features */}
          <div className="mission-panel">
            <div className="mission-panel-label">Notable Features</div>
            <ul className="mission-features">
              {data.features.map((f, i) => (
                <li key={i}><span className="bullet">▸</span>{f}</li>
              ))}
            </ul>
          </div>

          {/* Mission history */}
          <div className="mission-panel">
            <div className="mission-panel-label">Mission Log · {data.missions.length} entries</div>
            <ul className="mission-log">
              {data.missions.map((m, i) => (
                <li key={i} className={`mission-log-row status-${m.status}`}>
                  <span className="mission-log-year">{m.y}</span>
                  <span className="mission-log-name">{m.name}</span>
                  <span className="mission-log-dot">●</span>
                </li>
              ))}
            </ul>
          </div>

          <button className="lesson-btn listen" onClick={() => {
            speak(`Mission target: ${active.name}. Designation: ${data.designation}. ${data.features[0]}. ${data.features[1]}.`);
          }}>♪ Read Telemetry</button>
        </aside>
      </div>
    </div>
  );
};

function FeaturePointer({ x, y, label }) {
  return (
    <div className="mission-feature" style={{ left: x, top: y }}>
      <div className="mission-feature-dot" />
      <div className="mission-feature-line" />
      <div className="mission-feature-label">{label}</div>
    </div>
  );
}
