import { useState, useEffect, useRef } from "react";
import "./MagicLoader.css";

const PROGRESS_QUOTES: { upTo: number; text: string }[] = [
  { upTo: 60,  text: "The magic starts ✨" },
  { upTo: 90,  text: "Your magical collage is gathering light…" },
  { upTo: 120, text: "A little patience for a little magic…" },
  { upTo: 150, text: "The cutouts are learning to dance…" },
  { upTo: 180, text: "Your fantasy world is almost ready…" },
  { upTo: 210, text: "Magic takes a moment to appear…" },
  { upTo: 240, text: "Wonder is being stitched frame by frame…" },
  { upTo: 270, text: "Almost ready to reveal the magic…" },
  { upTo: 300, text: "Almost ready to reveal the magic…" },
];

function getQuote(progress: number): string {
  return (
    PROGRESS_QUOTES.find(({ upTo }) => progress <= upTo)?.text ??
    PROGRESS_QUOTES[PROGRESS_QUOTES.length - 1].text
  );
}

export default function MagicLoader({ progress }: { progress: number }) {
  const [quoteVisible, setQuoteVisible] = useState(true);
  const prevQuoteRef = useRef("");
  const currentQuote = getQuote(progress);

  useEffect(() => {
    if (prevQuoteRef.current && prevQuoteRef.current !== currentQuote) {
      setQuoteVisible(false);
      const t = setTimeout(() => setQuoteVisible(true), 500);
      return () => clearTimeout(t);
    }
    prevQuoteRef.current = currentQuote;
  }, [currentQuote]);

  const pct = Math.min(100, Math.round((progress / 300) * 100));

  return (
    <div className="ml-overlay">
      <div className="ml-container">
        <div className="ml-smoke" />
        <div className="ml-smoke" />
        <div className="ml-smoke" />
        <div className="ml-hourglass-wrapper">
          <div className="ml-hourglass">
            <div className="ml-sparkle ml-s1" />
            <div className="ml-sparkle ml-s2" />
            <div className="ml-sparkle ml-s3" />
            <div className="ml-sparkle ml-s4" />
            <div className="ml-glass-top"><div className="ml-sand-top" /></div>
            <div className="ml-glass-bottom"><div className="ml-sand-bottom" /></div>
            <div className="ml-sand-stream">
              {Array.from({ length: 15 }).map((_, i) => <span key={i} />)}
            </div>
          </div>
        </div>
        <div className="ml-text-section">
          <div className="ml-quote" style={{ opacity: quoteVisible ? 1 : 0 }}>
            {currentQuote}
          </div>
          <div className="ml-progress-track">
            <div className="ml-progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="ml-progress-label">{progress} / 300</div>
        </div>
      </div>
    </div>
  );
}