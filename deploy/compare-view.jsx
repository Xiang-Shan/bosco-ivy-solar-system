// Compare two planets side-by-side

const { useState: useStateC } = React;

window.CompareView = function CompareView({ initialLeft, initialRight, onBack }) {
  const all = [window.SOLAR_DATA.sun, ...window.SOLAR_DATA.planets, window.SOLAR_DATA.dwarf.pluto];
  const [leftId, setLeftId] = useStateC(initialLeft || 'earth');
  const [rightId, setRightId] = useStateC(initialRight || 'jupiter');

  const left = all.find(p => p.id === leftId);
  const right = all.find(p => p.id === rightId);

  // Build comparable stats
  const rows = [
    { lbl: 'Position', l: left.order ? `${left.order}` + suffix(left.order) + ' from Sun' : '— center —', r: right.order ? `${right.order}` + suffix(right.order) + ' from Sun' : '— center —' },
    { lbl: 'Diameter', l: `${(left.diameter_km / 1000).toFixed(0)},000 km`, r: `${(right.diameter_km / 1000).toFixed(0)},000 km`, winner: left.diameter_km > right.diameter_km ? 'l' : 'r' },
    { lbl: 'Year length', l: left.orbitalPeriod_days ? formatYear(left.orbitalPeriod_days) : '—', r: right.orbitalPeriod_days ? formatYear(right.orbitalPeriod_days) : '—', winner: (left.orbitalPeriod_days || 0) > (right.orbitalPeriod_days || 0) ? 'l' : 'r' },
    { lbl: 'Day length', l: left.rotationPeriod_days ? formatDay(left.rotationPeriod_days) : '—', r: right.rotationPeriod_days ? formatDay(right.rotationPeriod_days) : '—' },
    { lbl: 'Moons', l: left.moons != null ? String(left.moons) : '—', r: right.moons != null ? String(right.moons) : '—', winner: (left.moons || 0) > (right.moons || 0) ? 'l' : 'r' },
    { lbl: 'Rings', l: left.hasRings ? 'Yes' : 'No', r: right.hasRings ? 'Yes' : 'No' },
  ];

  // Visual size — scale so largest fits in ~280px
  const maxD = Math.max(left.diameter_km, right.diameter_km);
  const sizeFor = (d) => Math.max(60, (d / maxD) * 260);

  return (
    <div className="compare-stage">
      <button className="back-btn" onClick={onBack}>← Back to Orbit</button>
      <div className="compare-vs">vs</div>

      <div className="compare-side">
        <div className="compare-picker">
          A: <select className="compare-select" value={leftId} onChange={e => setLeftId(e.target.value)}>
            {all.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <h2 className="compare-name">{left.name}</h2>
        <div className="compare-planet" style={{
          width: sizeFor(left.diameter_km),
          height: sizeFor(left.diameter_km),
        }}>
          <window.PlanetSVG id={left.id} size={sizeFor(left.diameter_km)} />
        </div>
        <div className="compare-stats">
          {rows.map((r, i) => (
            <div className={`compare-stat ${r.winner === 'l' ? 'winner' : ''}`} key={i}>
              <span className="lbl">{r.lbl}</span>
              <span className="val">{r.l}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="compare-divider" />

      <div className="compare-side">
        <div className="compare-picker">
          B: <select className="compare-select" value={rightId} onChange={e => setRightId(e.target.value)}>
            {all.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <h2 className="compare-name">{right.name}</h2>
        <div className="compare-planet" style={{
          width: sizeFor(right.diameter_km),
          height: sizeFor(right.diameter_km),
        }}>
          <window.PlanetSVG id={right.id} size={sizeFor(right.diameter_km)} />
        </div>
        <div className="compare-stats">
          {rows.map((r, i) => (
            <div className={`compare-stat ${r.winner === 'r' ? 'winner' : ''}`} key={i}>
              <span className="lbl">{r.lbl}</span>
              <span className="val">{r.r}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

function suffix(n) {
  const s = ['th', 'st', 'nd', 'rd'], v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
function formatYear(days) {
  if (days < 365) return `${days.toFixed(0)} days`;
  const y = days / 365.25;
  if (y < 10) return `${y.toFixed(1)} Earth years`;
  return `${y.toFixed(0)} Earth years`;
}
function formatDay(days) {
  const d = Math.abs(days);
  if (d < 1) return `${(d * 24).toFixed(1)} hours`;
  if (d < 2) return `${(d * 24).toFixed(0)} hours`;
  return `${d.toFixed(0)} Earth days`;
}
