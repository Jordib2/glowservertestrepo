import { useState, useEffect, useRef } from "react";
import "./MagicLoader.css";

const PROGRESS_QUOTES: { upTo: number; text: string }[] = [
  { upTo: 10, text: "The magic starts ✨" },
  { upTo: 20, text: "Your magical collage is gathering light…" },
  { upTo: 30, text: "A little patience for a little magic…" },
  { upTo: 40, text: "The cutouts are learning to dance…" },
  { upTo: 50, text: "Your fantasy world is almost ready…" },
  { upTo: 60, text: "Magic takes a moment to appear…" },
  { upTo: 70, text: "Wonder is being stitched frame by frame…" },
  { upTo: 80, text: "Almost ready to reveal the magic…" },
  { upTo: 90, text: "The magic is almost here!" },
  { upTo: 100, text: "Your magical collage is ready!" },
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

  const normalizedProgress = Math.max(
    0,
    Math.min(100, ((progress - 30) / (300 - 30)) * 100)
  );

  const currentQuote = getQuote(normalizedProgress);

  useEffect(() => {
    if (prevQuoteRef.current && prevQuoteRef.current !== currentQuote) {
      setQuoteVisible(false);
      const t = setTimeout(() => setQuoteVisible(true), 500);
      return () => clearTimeout(t);
    }
    prevQuoteRef.current = currentQuote;
  }, [currentQuote]);

  const pct = Math.round(normalizedProgress);

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
          <div className="ml-progress-label">{progress/3} / 100</div>
        </div>
      </div>
    </div>
  );
}