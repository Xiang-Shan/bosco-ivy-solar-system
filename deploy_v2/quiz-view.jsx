// Kid-friendly quiz — 6 simple questions

const { useState: useStateQ } = React;

const QUIZ_QUESTIONS = [
  {
    q: "Which planet has beautiful rings made of ice?",
    options: ['Mars', 'Saturn', 'Jupiter', 'Mercury'],
    correct: 1,
  },
  {
    q: "Which planet do WE live on?",
    options: ['Mars', 'Venus', 'Earth', 'Neptune'],
    correct: 2,
  },
  {
    q: "Which is the BIGGEST planet in our solar system?",
    options: ['Saturn', 'Jupiter', 'Earth', 'Neptune'],
    correct: 1,
  },
  {
    q: "Which planet is closest to the Sun?",
    options: ['Venus', 'Earth', 'Mercury', 'Mars'],
    correct: 2,
  },
  {
    q: "Which planet is called the 'Red Planet'?",
    options: ['Jupiter', 'Venus', 'Mars', 'Uranus'],
    correct: 2,
  },
  {
    q: "What is at the very center of our solar system?",
    options: ['Earth', 'The Sun', 'The Moon', 'Jupiter'],
    correct: 1,
  },
];

window.QuizView = function QuizView({ onBack, soundOn }) {
  const [step, setStep] = useStateQ(0);
  const [score, setScore] = useStateQ(0);
  const [answered, setAnswered] = useStateQ(null);

  const all = [window.SOLAR_DATA.sun, ...window.SOLAR_DATA.planets];

  const findPlanetId = (name) => {
    if (name === 'The Sun') return 'sun';
    const p = window.SOLAR_DATA.planets.find(x => x.name === name);
    return p ? p.id : null;
  };

  const done = step >= QUIZ_QUESTIONS.length;

  const pick = (i) => {
    if (answered !== null) return;
    setAnswered(i);
    const correct = QUIZ_QUESTIONS[step].correct === i;
    if (correct) setScore(s => s + 1);
    if (soundOn && window.speechSynthesis) {
      const u = new SpeechSynthesisUtterance(correct ? 'Yes! Well done!' : 'Try again next time.');
      u.rate = 0.95;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    }
    setTimeout(() => {
      setAnswered(null);
      setStep(s => s + 1);
    }, 1400);
  };

  if (done) {
    return (
      <div className="quiz-stage">
        <button className="back-btn" onClick={onBack}>← Back to Orbit</button>
        <div className="quiz-card quiz-result">
          <div className="quiz-eyebrow">Bosco's Score</div>
          <div className="quiz-result-score">{score}<span style={{ color: 'var(--ink-faint)', fontSize: 60 }}>/{QUIZ_QUESTIONS.length}</span></div>
          <div className="quiz-result-total">
            {score === QUIZ_QUESTIONS.length ? 'A perfect score — you know the solar system!' :
              score >= 4 ? 'Great work! Let\'s explore more.' :
              'Let\'s look at the planets again together.'}
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 32 }}>
            <button className="speak-btn" onClick={() => { setStep(0); setScore(0); }}>↻ Play Again</button>
            <button className="speak-btn" onClick={onBack}>← Back to Orbit</button>
          </div>
        </div>
      </div>
    );
  }

  const Q = QUIZ_QUESTIONS[step];

  return (
    <div className="quiz-stage">
      <button className="back-btn" onClick={onBack}>← Back to Orbit</button>
      <div className="quiz-card">
        <div className="quiz-progress">
          {QUIZ_QUESTIONS.map((_, i) => (
            <div key={i} className={`quiz-dot ${i < step ? 'done' : ''} ${i === step ? 'current' : ''}`} />
          ))}
        </div>
        <div className="quiz-eyebrow">Question {step + 1} of {QUIZ_QUESTIONS.length}</div>
        <h2 className="quiz-q">{Q.q}</h2>
        <div className="quiz-options">
          {Q.options.map((opt, i) => {
            const pid = findPlanetId(opt);
            let cls = 'quiz-opt';
            if (answered !== null) {
              if (i === Q.correct) cls += ' correct';
              else if (i === answered) cls += ' wrong';
            }
            return (
              <button key={i} className={cls} onClick={() => pick(i)} disabled={answered !== null}>
                <span className="quiz-opt-letter">{String.fromCharCode(65 + i)}</span>
                <span>{opt}</span>
                {pid && (
                  <div className="planet-thumb">
                    <window.PlanetSVG id={pid} size={40} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
