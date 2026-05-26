// Orbital View — top-down with REAL angular velocities
// Pan + pinch-zoom on mobile (and wheel-zoom on desktop).

const { useState, useEffect, useRef, useMemo } = React;

window.OrbitalView = function OrbitalView({ simDaysRef, paused, showOrbits, showLabels, showAsteroids, realisticDistances, onSelectPlanet }) {
  const stageRef = useRef(null);
  const systemRef = useRef(null);
  const [size, setSize] = useState({ w: 1200, h: 700 });
  const planetRefs = useRef({});
  const asteroidRefs = useRef([]);
  const reqRef = useRef();

  // Pan & zoom state — stored in refs to avoid React re-render storms
  const panRef = useRef({ x: 0, y: 0 });
  const scaleRef = useRef(1);
  const [zoomReadout, setZoomReadout] = useState(100); // for the % display only
  const pointersRef = useRef(new Map());
  const lastDistRef = useRef(0);
  const lastPanRef = useRef({ x: 0, y: 0 });
  const draggedRef = useRef(false);

  const applyTransform = () => {
    if (systemRef.current) {
      systemRef.current.style.transform = `translate(${panRef.current.x}px, ${panRef.current.y}px) scale(${scaleRef.current})`;
    }
  };

  useEffect(() => {
    const update = () => {
      if (!stageRef.current) return;
      const r = stageRef.current.getBoundingClientRect();
      setSize({ w: r.width, h: r.height });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const planets = window.SOLAR_DATA.planets;
  const pluto = window.SOLAR_DATA.dwarf.pluto;
  const sun = window.SOLAR_DATA.sun;
  const allBodies = [...planets, pluto];

  const maxAU = realisticDistances
    ? Math.max(...allBodies.map(p => p.orbitAU_real))
    : Math.max(...allBodies.map(p => p.orbitAU_compressed));

  const stageR = Math.min(size.w, size.h) / 2 - 60;
  const auToPx = stageR / maxAU;
  const sunRadius = realisticDistances ? 18 : 30;

  const asteroids = useMemo(() => {
    const innerAU = realisticDistances ? 2.2 : 0.52;
    const outerAU = realisticDistances ? 3.2 : 0.58;
    const arr = [];
    for (let i = 0; i < 140; i++) {
      const au = innerAU + Math.random() * (outerAU - innerAU);
      const a = Math.random() * Math.PI * 2;
      arr.push({ au, a, drift: Math.random() * 0.3 + 0.2 });
    }
    return arr;
  }, [realisticDistances]);

  // Animation loop
  useEffect(() => {
    let alive = true;
    const tick = () => {
      if (!alive) return;
      const simDays = simDaysRef.current;
      allBodies.forEach(p => {
        const au = realisticDistances ? p.orbitAU_real : p.orbitAU_compressed;
        const orbitR = au * auToPx;
        const angle = (simDays / p.orbitalPeriod_days) * Math.PI * 2 + (p.phase || 0);
        const x = Math.cos(angle) * orbitR;
        const y = Math.sin(angle) * orbitR;
        const el = planetRefs.current[p.id];
        if (el) el.style.transform = `translate(${x}px, ${y}px)`;
      });
      asteroids.forEach((a, i) => {
        const angle = a.a + (simDays * a.drift) / 500;
        const r = a.au * auToPx;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        const el = asteroidRefs.current[i];
        if (el) {
          el.style.left = `calc(50% + ${x}px)`;
          el.style.top = `calc(50% + ${y}px)`;
        }
      });
      reqRef.current = requestAnimationFrame(tick);
    };
    reqRef.current = requestAnimationFrame(tick);
    return () => { alive = false; cancelAnimationFrame(reqRef.current); };
  }, [auToPx, realisticDistances, asteroids, simDaysRef]);

  // ── Pan & pinch handlers ──
  const onPointerDown = (e) => {
    e.target.setPointerCapture && e.target.setPointerCapture(e.pointerId);
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    draggedRef.current = false;
    if (pointersRef.current.size === 1) {
      lastPanRef.current = { x: e.clientX, y: e.clientY };
    } else if (pointersRef.current.size === 2) {
      const [a, b] = [...pointersRef.current.values()];
      lastDistRef.current = Math.hypot(a.x - b.x, a.y - b.y);
    }
  };

  const onPointerMove = (e) => {
    if (!pointersRef.current.has(e.pointerId)) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointersRef.current.size === 1) {
      const dx = e.clientX - lastPanRef.current.x;
      const dy = e.clientY - lastPanRef.current.y;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) draggedRef.current = true;
      panRef.current = { x: panRef.current.x + dx, y: panRef.current.y + dy };
      applyTransform();
      lastPanRef.current = { x: e.clientX, y: e.clientY };
    } else if (pointersRef.current.size === 2) {
      const [a, b] = [...pointersRef.current.values()];
      const newDist = Math.hypot(a.x - b.x, a.y - b.y);
      if (lastDistRef.current > 0) {
        const ratio = newDist / lastDistRef.current;
        scaleRef.current = Math.max(0.4, Math.min(4, scaleRef.current * ratio));
        applyTransform();
        setZoomReadout(Math.round(scaleRef.current * 100));
      }
      lastDistRef.current = newDist;
      draggedRef.current = true;
    }
  };

  const onPointerUp = (e) => {
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) lastDistRef.current = 0;
  };

  // Wheel for desktop zoom
  const onWheel = (e) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.001;
    scaleRef.current = Math.max(0.4, Math.min(4, scaleRef.current * (1 + delta)));
    applyTransform();
    setZoomReadout(Math.round(scaleRef.current * 100));
  };

  const handlePlanetClick = (id) => {
    if (!draggedRef.current) onSelectPlanet(id);
  };

  // Reset view
  const resetView = () => {
    panRef.current = { x: 0, y: 0 };
    scaleRef.current = 1;
    applyTransform();
    setZoomReadout(100);
  };

  const zoomBy = (factor) => {
    scaleRef.current = Math.max(0.4, Math.min(4, scaleRef.current * factor));
    applyTransform();
    setZoomReadout(Math.round(scaleRef.current * 100));
  };

  return (
    <div className="orbital-canvas" ref={stageRef}
         onPointerDown={onPointerDown}
         onPointerMove={onPointerMove}
         onPointerUp={onPointerUp}
         onPointerCancel={onPointerUp}
         onWheel={onWheel}
         style={{ touchAction: 'none' }}>
      <div
        className="orbital-system"
        ref={systemRef}
        style={{
          width: size.w,
          height: size.h,
          transformOrigin: 'center center',
        }}
      >
        {showOrbits && allBodies.map(p => {
          const au = realisticDistances ? p.orbitAU_real : p.orbitAU_compressed;
          const d = au * auToPx * 2;
          return (
            <div
              key={'ring-' + p.id}
              className={`orbit-ring ${p.id === 'earth' ? 'highlighted' : ''}`}
              style={{ width: d, height: d, borderStyle: p.id === 'pluto' ? 'dashed' : 'solid' }}
            />
          );
        })}

        {showAsteroids && asteroids.map((_, i) => (
          <div
            key={'ast-' + i}
            ref={el => (asteroidRefs.current[i] = el)}
            className="asteroid"
          />
        ))}

        <div
          className="sun-body"
          style={{ width: sunRadius * 2, height: sunRadius * 2 }}
          onClick={() => handlePlanetClick('sun')}
          title="The Sun"
        >
          <window.PlanetSVG id="sun" size={sunRadius * 2} />
        </div>

        {allBodies.map(p => {
          const r = realisticDistances ? Math.max(3, p.visualRadius * 0.5) : p.visualRadius;
          return (
            <div
              key={p.id}
              className="planet-orbit"
              ref={el => (planetRefs.current[p.id] = el)}
            >
              <div
                className="planet-body"
                style={{ width: r * 2, height: r * 2, backgroundColor: 'transparent' }}
                onClick={() => handlePlanetClick(p.id)}
                title={p.name}
              >
                <window.PlanetSVG id={p.id} size={r * 2} />
              </div>
              {p.hasRings && (
                <div
                  className="saturn-rings"
                  style={{ width: r * 2.4 * 2, height: r * 2.4 * 2 }}
                />
              )}
              {showLabels && (
                <div className="planet-label" style={{ top: r + 4, left: 0, transform: 'translateX(-50%)' }}>
                  <span className="num">{String(p.order).padStart(2, '0')}</span>{p.name.toUpperCase()}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Zoom controls — visible on all devices */}
      <div className="orbital-zoom-controls">
        <button className="orbital-zoom-btn" onClick={() => zoomBy(1.25)} aria-label="Zoom in">+</button>
        <button className="orbital-zoom-btn" onClick={() => zoomBy(1 / 1.25)} aria-label="Zoom out">−</button>
        <button className="orbital-zoom-btn" onClick={resetView} aria-label="Reset view">⊙</button>
        <div className="orbital-zoom-readout">{zoomReadout}%</div>
      </div>
    </div>
  );
};
