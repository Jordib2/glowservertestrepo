import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import pic1 from "../../../assets/pic1.jpg";
import pic2 from "../../../assets/pic2.jpg";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    $: any;
  }
}

export default function GuidebookPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [nextClicks, setNextClicks] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showSwipeHint, setShowSwipeHint] = useState(true);

  const getBookDimensions = () => {
    const w = window.innerWidth;
    if (w < 300) {
      return { width: w - 32, height: Math.round((w - 32) * 1.45) };
    } else if (w < 768) {
      return { width: w - 48, height: Math.round((w - 48) * 1.4) };
    }
    return { width: 200, height: 330 };
  };

  const initBook = () => {
    const mobile = window.innerWidth < 768;
    const { width, height } = getBookDimensions();
    setIsMobile(mobile);
    try { window.$("#book").turn("destroy"); } catch {/*ignore*/}
    window.$("#book").turn({
      width,
      height,
      autoCenter: true,
      gradients: true,
      elevation: 60,
      acceleration: true,
      duration: 800,
      display: mobile ? "single" : "double",
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.$("#book").bind("turned", (_e: any, page: number) => {
      setNextClicks(page - 1);
    });
  };

  const loadScript = (src: string) =>
    new Promise<void>((resolve) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve();
      document.body.appendChild(script);
    });

  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;
    let isSwiping = false;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      isSwiping = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const deltaX = Math.abs(touchStartX - e.touches[0].clientX);
      const deltaY = Math.abs(touchStartY - e.touches[0].clientY);
      if (deltaX > deltaY && deltaX > 10) {
        isSwiping = true;
        e.preventDefault();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isSwiping) return;
      const deltaX = touchStartX - e.changedTouches[0].clientX;
      const deltaY = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(deltaX) < Math.abs(deltaY)) return;
      if (Math.abs(deltaX) < 50) return;
      setShowSwipeHint(false);
      try {
        if (deltaX > 0) {
          window.$("#book").turn("next");
        } else {
          window.$("#book").turn("previous");
        }
      } catch {/*ignore*/}
      isSwiping = false;
    };

    const bookEl = document.getElementById("book");
    bookEl?.addEventListener("touchstart", handleTouchStart, { passive: true });
    bookEl?.addEventListener("touchmove", handleTouchMove, { passive: false });
    bookEl?.addEventListener("touchend", handleTouchEnd);

    const setup = async () => {
      if (window.$ && window.$.fn?.turn) {
        initBook();
      } else {
        await loadScript("https://code.jquery.com/jquery-1.7.1.min.js");
        await loadScript("/turn.min.js");
        initBook();
      }
    };

    setup();

    const handleResize = () => {
      const { width, height } = getBookDimensions();
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      try {
        window.$("#book").turn("size", width, height);
        window.$("#book").turn("display", mobile ? "single" : "double");
      } catch {/*ignore*/}
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      bookEl?.removeEventListener("touchstart", handleTouchStart);
      bookEl?.removeEventListener("touchmove", handleTouchMove);
      bookEl?.removeEventListener("touchend", handleTouchEnd);
      try { window.$("#book").turn("destroy"); } catch {/*ignore*/}
    };
  }, []);

  const { width: bookWidth, height: bookHeight } = getBookDimensions();
  const pageWidth = isMobile ? bookWidth : bookWidth / 2;
  const clicksNeeded = isMobile ? 4 : 2;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        fontFamily: "Georgia, serif",
        padding: "16px",
        paddingTop: "clamp(20px, 5vh, 48px)",
        boxSizing: "border-box",
      }}
    >
      <style>{`
        .page {
          width: ${pageWidth}px;
          height: ${bookHeight}px;
          background: linear-gradient(to bottom right, #000000, #000000);
          position: relative;
          overflow: hidden;
          box-sizing: border-box;
        }
        .page-cover {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100%;
          padding: ${isMobile ? "20px" : "40px"};
          box-sizing: border-box;
          text-align: center;
        }
        .page-cover h1 {
          color: #ffffff;
          font-size: ${isMobile ? "28px" : "34px"};
          line-height: 1.3;
          margin: 0 0 20px 0;
        }
        .page-cover p {
          color: #cccccc;
          font-size: ${isMobile ? "17px" : "20px"};
          line-height: 1.6;
          margin: 0;
        }
        .page-text {
          display: flex;
          flex-direction: column;
          justify-content: space-evenly;
          height: 100%;
          padding: ${isMobile ? "20px 22px" : "32px 36px"};
          box-sizing: border-box;
        }
        .page-text h2 {
          color: #ffffff;
          font-size: ${isMobile ? "24px" : "27px"};
          margin: 0 0 10px 0;
          line-height: 1.3;
        }
        .page-text p {
          color: #ffffff;
          font-size: ${isMobile ? "18px" : "19px"};
          line-height: 1.50;
          margin: 0;
          flex: 1;
          display: flex;
          align-items: center;
        }
        .page-image {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100%;
          padding: ${isMobile ? "20px" : "28px"};
          box-sizing: border-box;
          text-align: center;
          gap: 16px;
        }
        .page-image h2 {
          color: #ffffff;
          font-size: ${isMobile ? "22px" : "26px"};
          margin: 0;
        }
        .page-image img {
          width: ${isMobile ? "75%" : "60%"};
          max-width: 240px;
          border-radius: 12px;
          border: 3px solid rgba(180, 140, 255, 0.6);
          display: block;
          margin: 0 auto;
        }
        .page-final {
          display: flex;
          flex-direction: column;
          justify-content: space-evenly;
          align-items: center;
          height: 100%;
          padding: ${isMobile ? "20px 22px" : "32px 36px"};
          box-sizing: border-box;
          text-align: center;
        }
        .page-final h2 {
          color: #ffffff;
          font-size: ${isMobile ? "20px" : "24px"};
          margin: 0;
          line-height: 1.3;
        }
        .page-final p {
          color: #ffffff;
          font-size: ${isMobile ? "20px" : "18px"};
          line-height: 1.50;
          margin: 0;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.7; }
          50%       { opacity: 1;   }
        }
        .guide-btn-start {
          border: none;
          background: linear-gradient(135deg, #5e1e95 0%, #c594ef 100%);
          color: white;
          font-size: ${isMobile ? "15px" : "17px"};
          padding: ${isMobile ? "12px 28px" : "14px 36px"};
          border-radius: 24px;
          cursor: pointer;
          font-family: Georgia, serif;
          animation: fadeIn 0.4s ease;
          margin-top: 16px;
        }
        .guide-btn-start:hover { opacity: 0.9; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {showSwipeHint && (
        <div style={{
          color: "#ffffff",
          fontSize: isMobile ? "20px" : "22px",
          fontFamily: "Georgia, serif",
          letterSpacing: "0.06em",
          marginBottom: 14,
          animation: "pulse 2s ease-in-out infinite",
        }}>
          Swipe to turn the page
        </div>
      )}

      <div
        id="book"
        style={{
          width: bookWidth,
          height: bookHeight,
          boxShadow: "0 0 40px rgba(160,120,255,.4)",
          position: "relative",
          zIndex: 1,
          opacity: 1,
          WebkitTransform: "translateZ(0)",
          WebkitBackfaceVisibility: "hidden",
        }}
      >
        <div className="page">
          <div className="page-cover">
            <h1>🔮Magical🔮<br />Photography Guide</h1>
            <p>Turn the pages to learn the correct setup before uploading</p>
          </div>
        </div>

        <div className="page">
          <div className="page-text">
            <h2>📷 How to take the picture</h2>
            <p>1. Place the children's cutout on a clean white background.</p>
            <p>2. Position the image exactly in the center of the frame.</p>
            <p>3. Ensure the area is clear of any objects, shadows, decorations, or distractions.</p>
            <p>4. Center the subject and take the photo.</p>
          </div>
        </div>

        <div className="page">
          <div className="page-image">
            <h2>❌ Incorrect Example</h2>
            <img src={pic1} alt="Wrong example" />
          </div>
        </div>

        <div className="page">
          <div className="page-image">
            <h2>✅ Correct Example</h2>
            <img src={pic2} alt="Correct example" />
          </div>
        </div>

        <div className="page">
          <div className="page-final">
            <h2>🔮 Final Step 🔮<br />Photo Check & Verification</h2>
            <p>Once uploaded, your photos will be automatically checked for quality.</p>
            <p>If a photo is rejected, you'll be notified immediately. Simply retake it and try again.</p>
            <p>Before submitting, ensure the photo is clear, well-lit, and fully shows the required subject.</p>
          </div>
        </div>
      </div>

      {nextClicks >= clicksNeeded && (
        <button
          className="guide-btn-start"
          onClick={() => navigate("/image-upload", { state: location.state })}
        >
          Start Uploading!
        </button>
      )}
    </div>
  );
}