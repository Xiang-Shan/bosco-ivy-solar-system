// Think View — interactive Q&A cards for Bosco to explore
// Each card has its own animated/interactive answer.

const { useState: useStateT, useEffect: useEffectT, useMemo: useMemoT } = React;

window.ThinkView = function ThinkView({ onBack, soundOn }) {
  const [openCard, setOpenCard] = useStateT(null);

  const cards = [
    { id: 'smallest', n: '01', title: 'Which planet is the smallest?', sub: 'Eight planets, lined up by size' },
    { id: 'biggest', n: '02', title: 'Which planet is the biggest?', sub: 'A giant among giants' },
    { id: 'where', n: '03', title: 'What planet do we live on?', sub: 'Our home in the solar system' },
    { id: 'count', n: '04', title: 'How many planets are there?', sub: "Let's count them together" },
    { id: 'sun', n: '05', title: 'Why do we need the Sun?', sub: "Four reasons life on Earth needs our star", featured: true },
  ];

  const speak = (text) => {
    if (!soundOn || !window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.92;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  return (
    <div className="think-stage">
      <button className="back-btn" onClick={onBack}>← Back to Orbit</button>

      <div className="think-scroll">
        <div className="think-header">
          <div className="think-eyebrow">A Thinking Companion · For Bosco</div>
          <h1 className="think-title">Wonderings <em>&amp;</em> Discoveries</h1>
          <p className="think-intro">Five questions worth thinking about. Tap a card to discover the answer together — each one comes alive when you do.</p>
        </div>

        <div className="think-cards">
          {cards.map(c => (
            <window.ThinkCard
              key={c.id}
              card={c}
              isOpen={openCard === c.id}
              onToggle={() => setOpenCard(openCard === c.id ? null : c.id)}
              speak={speak}
            />
          ))}
        </div>

        <div className="think-footer">
          <em>End of field notes.</em> Tap any planet in the orbital view to keep exploring.
        </div>
      </div>
    </div>
  );
};
