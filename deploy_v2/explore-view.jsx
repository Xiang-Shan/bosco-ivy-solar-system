// Explore View — interactive lab with all the deep-dive lessons
// Layout: lesson card grid → click → fullscreen lesson player

const { useState: useStateE, useEffect: useEffectE } = React;

window.EXPLORE_LESSONS = [
  // Earth-Moon-Sun group
  { id: 'moon-phases', n: '01', group: 'Earth · Moon · Sun', title: 'The Moon Changes Shape', sub: 'Why we see crescents, halves, and full moons', accent: 'silver', component: 'MoonPhasesLesson' },
  { id: 'day-night', n: '02', group: 'Earth · Moon · Sun', title: 'Day & Night', sub: 'Why the Sun rises and sets', accent: 'gold', component: 'DayNightLesson' },
  { id: 'seasons', n: '03', group: 'Earth · Moon · Sun', title: 'The Four Seasons', sub: "Why winter is colder \u2014 and shorter \u2014 in the north", accent: 'gold', component: 'SeasonsLesson' },
  { id: 'eclipses', n: '04', group: 'Earth · Moon · Sun', title: 'Eclipses', sub: 'When the Moon hides the Sun, or Earth hides the Moon', accent: 'silver', component: 'EclipsesLesson' },
  { id: 'tides', n: '05', group: 'Earth · Moon · Sun', title: 'Why the Ocean Rises', sub: "The Moon's invisible pull on water", accent: 'blue', component: 'TidesLesson' },

  // Solar system phenomena
  { id: 'asteroid-belt', n: '06', group: 'The Solar System', title: 'The Asteroid Belt', sub: "A river of rocks between Mars and Jupiter", accent: 'stone', component: 'AsteroidBeltLesson' },
  { id: 'saturn-rings', n: '07', group: 'The Solar System', title: "Saturn's Rings", sub: 'Billions of ice chunks dancing in orbit', accent: 'gold', component: 'SaturnRingsLesson' },
  { id: 'comets', n: '08', group: 'The Solar System', title: 'Comets', sub: 'Frozen visitors with glowing tails', accent: 'blue', component: 'CometsLesson' },
  { id: 'meteors', n: '09', group: 'The Solar System', title: 'Shooting Stars', sub: 'Tiny rocks burning up in our sky', accent: 'gold', component: 'MeteorsLesson' },

  // Physics
  { id: 'gravity', n: '10', group: 'How the Universe Works', title: 'Gravity on Other Worlds', sub: "Drop a ball \u2014 watch what happens on each planet", accent: 'gold', component: 'GravityLesson' },
  { id: 'curvature', n: '11', group: 'How the Universe Works', title: 'How Space Bends', sub: "Einstein\u2019s great idea \u2014 mass curves space itself", accent: 'silver', component: 'CurvatureLesson' },

  // Bonus
  { id: 'adventures', n: '12', group: 'Voyager\u2019s Logbook', title: 'Standing on Other Worlds', sub: 'What you\u2019d see, feel, and hear on the Sun, the Moon, and each planet', accent: 'gold', component: 'AdventuresLesson', featured: true },
];

window.ExploreView = function ExploreView({ onBack, soundOn }) {
  const [activeLesson, setActiveLesson] = useStateE(null);

  const speak = React.useCallback((text) => {
    if (!soundOn || !window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    u.pitch = 1.0;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }, [soundOn]);

  // Group lessons by group field
  const groups = React.useMemo(() => {
    const m = new Map();
    window.EXPLORE_LESSONS.forEach(l => {
      if (!m.has(l.group)) m.set(l.group, []);
      m.get(l.group).push(l);
    });
    return [...m.entries()];
  }, []);

  if (activeLesson) {
    const Lesson = window[activeLesson.component];
    return (
      <window.LessonPlayer
        lesson={activeLesson}
        onClose={() => setActiveLesson(null)}
        speak={speak}
        soundOn={soundOn}
      >
        {Lesson ? <Lesson speak={speak} soundOn={soundOn} /> : (
          <div className="lesson-placeholder">
            <div className="lesson-eyebrow">Coming Soon</div>
            <h2>{activeLesson.title}</h2>
            <p>This lesson is still being prepared.</p>
          </div>
        )}
      </window.LessonPlayer>
    );
  }

  return (
    <div className="explore-stage">
      <button className="back-btn" onClick={onBack}>← Back to Orbit</button>

      <div className="explore-scroll">
        <div className="explore-header">
          <div className="explore-eyebrow">Field Laboratory · Twelve Interactive Lessons</div>
          <h1 className="explore-title">Look <em>Closer</em></h1>
          <p className="explore-intro">
            Each card opens a hands-on experiment. Drag, scrub, tap — and watch the universe explain itself.
          </p>
        </div>

        {groups.map(([groupName, lessons]) => (
          <div key={groupName} className="explore-group">
            <div className="explore-group-rule">
              <span>{groupName}</span>
              <em>{lessons.length} lessons</em>
            </div>
            <div className="explore-grid">
              {lessons.map(l => (
                <button
                  key={l.id}
                  className={`explore-card accent-${l.accent} ${l.featured ? 'featured' : ''}`}
                  onClick={() => setActiveLesson(l)}
                >
                  <div className="explore-card-num">{l.n}</div>
                  <window.LessonThumbnail id={l.id} />
                  <div className="explore-card-body">
                    <h3>{l.title}</h3>
                    <p>{l.sub}</p>
                  </div>
                  <div className="explore-card-arrow">→</div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
