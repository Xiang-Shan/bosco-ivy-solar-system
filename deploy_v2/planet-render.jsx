// Original SVG planet renderings — no external images.
// Each planet is a styled SVG that scales to any size.

window.PlanetSVG = function PlanetSVG({ id, size = 200, animate = false }) {
  const s = size;
  const uid = `p-${id}-${Math.random().toString(36).slice(2, 7)}`;

  const renderers = {
    sun: () => (
      <>
        <defs>
          <radialGradient id={uid + '-g'} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff8d8" />
            <stop offset="35%" stopColor="#ffd66a" />
            <stop offset="70%" stopColor="#ff8a1a" />
            <stop offset="100%" stopColor="#d63800" />
          </radialGradient>
          <filter id={uid + '-glow'}>
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>
        <circle cx="100" cy="100" r="100" fill={`url(#${uid}-g)`} />
        {/* sunspots */}
        <ellipse cx="60" cy="80" rx="6" ry="3" fill="#a83a00" opacity="0.55" />
        <ellipse cx="130" cy="120" rx="5" ry="2" fill="#a83a00" opacity="0.5" />
        <ellipse cx="105" cy="60" rx="3" ry="2" fill="#a83a00" opacity="0.4" />
        {/* flares - softer overlays */}
        <circle cx="100" cy="100" r="100" fill={`url(#${uid}-g)`} opacity="0.4" filter={`url(#${uid}-glow)`} />
      </>
    ),

    mercury: () => (
      <>
        <defs>
          <radialGradient id={uid + '-g'} cx="35%" cy="32%" r="75%">
            <stop offset="0%" stopColor="#dcc8b0" />
            <stop offset="50%" stopColor="#8a7560" />
            <stop offset="100%" stopColor="#2a2018" />
          </radialGradient>
          <clipPath id={uid + '-c'}><circle cx="100" cy="100" r="100" /></clipPath>
        </defs>
        <circle cx="100" cy="100" r="100" fill={`url(#${uid}-g)`} />
        <g clipPath={`url(#${uid}-c)`} opacity="0.6">
          {[[50, 60, 14], [130, 50, 10], [70, 130, 18], [150, 130, 12], [110, 90, 8], [40, 110, 9], [160, 90, 7], [90, 160, 11], [130, 165, 6]].map(([x, y, r], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r={r} fill="#3a2e22" opacity="0.35" />
              <circle cx={x - r * 0.2} cy={y - r * 0.2} r={r * 0.85} fill="#a89070" opacity="0.4" />
            </g>
          ))}
        </g>
      </>
    ),

    venus: () => (
      <>
        <defs>
          <radialGradient id={uid + '-g'} cx="35%" cy="32%" r="75%">
            <stop offset="0%" stopColor="#fae6b8" />
            <stop offset="55%" stopColor="#c89b58" />
            <stop offset="100%" stopColor="#3a200a" />
          </radialGradient>
          <clipPath id={uid + '-c'}><circle cx="100" cy="100" r="100" /></clipPath>
        </defs>
        <circle cx="100" cy="100" r="100" fill={`url(#${uid}-g)`} />
        <g clipPath={`url(#${uid}-c)`} opacity="0.5">
          {/* cloud swirls */}
          <path d="M-20 50 Q 60 30, 120 60 T 240 50" stroke="#fff5d0" strokeWidth="6" fill="none" opacity="0.4" />
          <path d="M-20 90 Q 80 70, 140 100 T 260 95" stroke="#fff5d0" strokeWidth="5" fill="none" opacity="0.3" />
          <path d="M-20 130 Q 60 110, 130 140 T 240 130" stroke="#d4a868" strokeWidth="7" fill="none" opacity="0.4" />
          <path d="M-20 165 Q 80 150, 140 170 T 260 165" stroke="#a87838" strokeWidth="5" fill="none" opacity="0.35" />
        </g>
      </>
    ),

    earth: () => (
      <>
        <defs>
          <radialGradient id={uid + '-g'} cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#7ab8e8" />
            <stop offset="55%" stopColor="#2a5a9a" />
            <stop offset="100%" stopColor="#091a3a" />
          </radialGradient>
          <clipPath id={uid + '-c'}><circle cx="100" cy="100" r="100" /></clipPath>
        </defs>
        <circle cx="100" cy="100" r="100" fill={`url(#${uid}-g)`} />
        <g clipPath={`url(#${uid}-c)`}>
          {/* stylized continents (Americas-ish on left, Eurasia/Africa on right) */}
          <path d="M30 60 Q 50 50, 55 70 Q 60 90, 50 110 Q 40 130, 55 145 Q 60 160, 45 170 L 30 165 Q 20 140, 25 120 Q 28 100, 22 85 Z"
                fill="#3a7a44" opacity="0.85" />
          <path d="M75 45 Q 90 40, 100 55 Q 110 70, 105 85 L 95 90 Q 85 80, 80 70 Q 75 60, 75 50 Z"
                fill="#5a8a44" opacity="0.85" />
          <path d="M115 70 Q 140 60, 160 80 Q 175 105, 165 130 Q 150 150, 130 145 Q 110 130, 110 110 Q 110 90, 115 70 Z"
                fill="#5a7a3a" opacity="0.9" />
          <path d="M155 50 Q 170 45, 178 60 L 170 75 Q 160 70, 155 60 Z" fill="#6a8a4a" opacity="0.8" />
          {/* polar ice */}
          <ellipse cx="100" cy="8" rx="40" ry="14" fill="#f0f6fa" opacity="0.85" />
          <ellipse cx="100" cy="192" rx="50" ry="16" fill="#f0f6fa" opacity="0.85" />
          {/* cloud wisps */}
          <ellipse cx="80" cy="120" rx="35" ry="6" fill="#ffffff" opacity="0.35" />
          <ellipse cx="140" cy="40" rx="25" ry="5" fill="#ffffff" opacity="0.4" />
        </g>
      </>
    ),

    mars: () => (
      <>
        <defs>
          <radialGradient id={uid + '-g'} cx="35%" cy="32%" r="75%">
            <stop offset="0%" stopColor="#e8865a" />
            <stop offset="55%" stopColor="#a64020" />
            <stop offset="100%" stopColor="#2a0c04" />
          </radialGradient>
          <clipPath id={uid + '-c'}><circle cx="100" cy="100" r="100" /></clipPath>
        </defs>
        <circle cx="100" cy="100" r="100" fill={`url(#${uid}-g)`} />
        <g clipPath={`url(#${uid}-c)`} opacity="0.65">
          {/* dark mare patches */}
          <path d="M40 80 Q 65 70, 85 85 Q 95 110, 75 120 Q 55 125, 40 105 Z" fill="#5a2010" opacity="0.55" />
          <path d="M115 50 Q 145 55, 155 75 Q 150 95, 130 90 Q 110 80, 115 50 Z" fill="#5a2010" opacity="0.5" />
          <path d="M100 130 Q 130 125, 145 145 Q 140 165, 115 165 Q 95 155, 100 130 Z" fill="#5a2010" opacity="0.55" />
          {/* white polar caps */}
          <ellipse cx="100" cy="10" rx="30" ry="9" fill="#f0e0d4" opacity="0.85" />
          <ellipse cx="100" cy="190" rx="35" ry="11" fill="#f0e0d4" opacity="0.9" />
        </g>
      </>
    ),

    jupiter: () => (
      <>
        <defs>
          <radialGradient id={uid + '-g'} cx="35%" cy="32%" r="75%">
            <stop offset="0%" stopColor="#f5dcb0" />
            <stop offset="55%" stopColor="#c89868" />
            <stop offset="100%" stopColor="#3a2010" />
          </radialGradient>
          <clipPath id={uid + '-c'}><circle cx="100" cy="100" r="100" /></clipPath>
        </defs>
        <circle cx="100" cy="100" r="100" fill={`url(#${uid}-g)`} />
        <g clipPath={`url(#${uid}-c)`} opacity="0.75">
          {/* horizontal bands */}
          <rect x="0" y="20" width="200" height="14" fill="#e8c890" opacity="0.55" />
          <rect x="0" y="40" width="200" height="10" fill="#8a5a30" opacity="0.5" />
          <rect x="0" y="58" width="200" height="14" fill="#d4a878" opacity="0.45" />
          <rect x="0" y="78" width="200" height="12" fill="#a87850" opacity="0.4" />
          <rect x="0" y="95" width="200" height="16" fill="#f5dcb0" opacity="0.4" />
          <rect x="0" y="118" width="200" height="11" fill="#8a5a30" opacity="0.5" />
          <rect x="0" y="135" width="200" height="14" fill="#d4a878" opacity="0.45" />
          <rect x="0" y="155" width="200" height="10" fill="#a87850" opacity="0.5" />
          <rect x="0" y="172" width="200" height="14" fill="#e8c890" opacity="0.5" />
          {/* Great Red Spot */}
          <ellipse cx="125" cy="120" rx="20" ry="9" fill="#a83820" opacity="0.85" />
          <ellipse cx="125" cy="120" rx="15" ry="6" fill="#c85838" opacity="0.6" />
        </g>
      </>
    ),

    saturn: () => (
      <>
        <defs>
          <radialGradient id={uid + '-g'} cx="35%" cy="32%" r="75%">
            <stop offset="0%" stopColor="#f7e6b8" />
            <stop offset="55%" stopColor="#c8a868" />
            <stop offset="100%" stopColor="#3a2810" />
          </radialGradient>
          <clipPath id={uid + '-c'}><circle cx="100" cy="100" r="100" /></clipPath>
        </defs>
        <circle cx="100" cy="100" r="100" fill={`url(#${uid}-g)`} />
        <g clipPath={`url(#${uid}-c)`} opacity="0.65">
          <rect x="0" y="25" width="200" height="16" fill="#e8c890" opacity="0.45" />
          <rect x="0" y="48" width="200" height="12" fill="#a88858" opacity="0.4" />
          <rect x="0" y="68" width="200" height="20" fill="#f5dcb0" opacity="0.4" />
          <rect x="0" y="95" width="200" height="14" fill="#c8a878" opacity="0.4" />
          <rect x="0" y="115" width="200" height="18" fill="#e8c890" opacity="0.4" />
          <rect x="0" y="140" width="200" height="12" fill="#a88858" opacity="0.4" />
          <rect x="0" y="158" width="200" height="16" fill="#d4b478" opacity="0.45" />
        </g>
      </>
    ),

    uranus: () => (
      <>
        <defs>
          <radialGradient id={uid + '-g'} cx="35%" cy="32%" r="75%">
            <stop offset="0%" stopColor="#d4eef0" />
            <stop offset="55%" stopColor="#5a9aa8" />
            <stop offset="100%" stopColor="#0a2832" />
          </radialGradient>
          <clipPath id={uid + '-c'}><circle cx="100" cy="100" r="100" /></clipPath>
        </defs>
        <circle cx="100" cy="100" r="100" fill={`url(#${uid}-g)`} />
        <g clipPath={`url(#${uid}-c)`} opacity="0.3">
          <rect x="0" y="60" width="200" height="20" fill="#a8d0d8" opacity="0.4" />
          <rect x="0" y="110" width="200" height="18" fill="#a8d0d8" opacity="0.35" />
        </g>
      </>
    ),

    neptune: () => (
      <>
        <defs>
          <radialGradient id={uid + '-g'} cx="35%" cy="32%" r="75%">
            <stop offset="0%" stopColor="#8aaee8" />
            <stop offset="55%" stopColor="#2a4a9e" />
            <stop offset="100%" stopColor="#050e30" />
          </radialGradient>
          <clipPath id={uid + '-c'}><circle cx="100" cy="100" r="100" /></clipPath>
        </defs>
        <circle cx="100" cy="100" r="100" fill={`url(#${uid}-g)`} />
        <g clipPath={`url(#${uid}-c)`}>
          {/* dark storm */}
          <ellipse cx="80" cy="85" rx="16" ry="9" fill="#0a1a4a" opacity="0.55" />
          {/* cirrus wisps */}
          <ellipse cx="120" cy="60" rx="40" ry="4" fill="#ffffff" opacity="0.25" />
          <ellipse cx="90" cy="135" rx="50" ry="3" fill="#ffffff" opacity="0.2" />
        </g>
      </>
    ),

    pluto: () => (
      <>
        <defs>
          <radialGradient id={uid + '-g'} cx="35%" cy="32%" r="75%">
            <stop offset="0%" stopColor="#e8d4a8" />
            <stop offset="55%" stopColor="#8a6a48" />
            <stop offset="100%" stopColor="#2a1808" />
          </radialGradient>
          <clipPath id={uid + '-c'}><circle cx="100" cy="100" r="100" /></clipPath>
        </defs>
        <circle cx="100" cy="100" r="100" fill={`url(#${uid}-g)`} />
        <g clipPath={`url(#${uid}-c)`}>
          {/* Tombaugh Regio (heart) */}
          <path d="M70 95 Q 65 75, 85 75 Q 100 80, 100 100 Q 100 80, 115 75 Q 135 75, 130 95 Q 125 115, 100 135 Q 75 115, 70 95 Z"
                fill="#f0dcb0" opacity="0.6" />
          {/* dark patches */}
          <ellipse cx="40" cy="80" rx="18" ry="12" fill="#3a2410" opacity="0.4" />
          <ellipse cx="155" cy="130" rx="20" ry="14" fill="#3a2410" opacity="0.45" />
        </g>
      </>
    ),

    moon: () => (
      <>
        <defs>
          <radialGradient id={uid + '-g'} cx="35%" cy="32%" r="75%">
            <stop offset="0%" stopColor="#e8e2d4" />
            <stop offset="55%" stopColor="#888070" />
            <stop offset="100%" stopColor="#1a1610" />
          </radialGradient>
          <clipPath id={uid + '-c'}><circle cx="100" cy="100" r="100" /></clipPath>
        </defs>
        <circle cx="100" cy="100" r="100" fill={`url(#${uid}-g)`} />
        <g clipPath={`url(#${uid}-c)`} opacity="0.55">
          <ellipse cx="65" cy="70" rx="22" ry="16" fill="#3a342a" opacity="0.5" />
          <ellipse cx="110" cy="85" rx="14" ry="11" fill="#3a342a" opacity="0.55" />
          <ellipse cx="130" cy="125" rx="20" ry="14" fill="#3a342a" opacity="0.5" />
          <ellipse cx="75" cy="135" rx="14" ry="10" fill="#3a342a" opacity="0.55" />
          <circle cx="155" cy="60" r="6" fill="#3a342a" opacity="0.5" />
          <circle cx="55" cy="105" r="5" fill="#3a342a" opacity="0.45" />
        </g>
      </>
    ),
  };

  const render = renderers[id] || renderers.mercury;

  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 200 200"
      style={{ display: 'block', borderRadius: '50%', overflow: 'visible' }}
    >
      {render()}
    </svg>
  );
};
