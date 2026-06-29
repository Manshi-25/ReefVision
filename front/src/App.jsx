
import React, { useEffect, useRef, useState } from 'react';
import ImageUploader from './ImageUploader';
import coralReefImage from './co.jpg';
import logoSvg from './assets/logo.png';

/* ── Bioluminescent particle canvas ── */
function OceanCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const particles = Array.from({ length: 100 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 2.8 + 0.5,
      dx: (Math.random() - 0.5) * 0.3,
      dy: -(Math.random() * 0.35 + 0.08),
      alpha: Math.random() * 0.7 + 0.2,
      hue: Math.random() > 0.5 ? 185 : 155,
    }));
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const g = ctx.createRadialGradient(canvas.width/2, canvas.height, 0, canvas.width/2, canvas.height, canvas.height);
      g.addColorStop(0, 'rgba(0,30,60,0.4)');
      g.addColorStop(1, 'rgba(2,12,24,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.dx; p.y += p.dy;
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue},100%,70%,${p.alpha})`;
        ctx.shadowColor = `hsl(${p.hue},100%,70%)`; ctx.shadowBlur = 10;
        ctx.fill(); ctx.shadowBlur = 0;
      });
      animId = requestAnimationFrame(tick);
    };
    tick();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas id="ocean-canvas" ref={canvasRef} />;
}

/* ══════════════════════════════════════════
   LANDING PAGE
══════════════════════════════════════════ */
function LandingPage({ onEnter }) {
  const [leaving, setLeaving] = useState(false);

  const handleClick = () => {
    setLeaving(true);
    setTimeout(onEnter, 750);
  };

  return (
    <div className={`landing-page${leaving ? ' landing-exit' : ''}`} onClick={handleClick}>
      <OceanCanvas />

      <div className="landing-content">
        {/* Big logo */}
        <div className="landing-logo-wrap">
          <img src={logoSvg} alt="ReefVision" className="landing-logo-img" />
        </div>

        {/* Brand name */}
        <h1 className="landing-brand">ReefVision</h1>

        {/* Click hint */}
        <div className="landing-cta">
          <span className="landing-cta-dot" />
          Click anywhere to dive in
        </div>
      </div>

      {/* Decorative wave */}
      <svg className="landing-wave" viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,60 C240,110 480,10 720,60 C960,110 1200,10 1440,60 L1440,120 L0,120 Z"
          fill="rgba(0,229,255,0.05)"/>
        <path d="M0,80 C360,30 720,130 1080,70 C1260,40 1380,90 1440,80 L1440,120 L0,120 Z"
          fill="rgba(0,184,169,0.06)"/>
      </svg>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN APP
══════════════════════════════════════════ */
function MainApp() {
  return (
    <div className="app-container app-enter">
      <OceanCanvas />

      {/* ── STICKY HEADER ── */}
      <header className="header">
        <div className="header-logo">
          <img src={logoSvg} alt="ReefVision" className="header-logo-img-large" />
          <span className="header-brand">ReefVision</span>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="hero">
        <span className="hero-eyebrow">ML-Powered Marine Conservation</span>

        <h2>See What Lies<br/>Beneath the Surface</h2>
        <p>Upload a reef image and let our multi-model AI instantly assess coral health — detecting bleaching, disease, and damage with precision.</p>

        <div className="hero-stats">
          <div className="stat">
            <span className="stat-value">4</span>
            <span className="stat-label">AI Models</span>
          </div>
          <div className="stat">
            <span className="stat-value">25%</span>
            <span className="stat-label">Marine life supported</span>
          </div>
          <div className="stat">
            <span className="stat-value">&lt;1%</span>
            <span className="stat-label">Of ocean floor</span>
          </div>
        </div>
      </section>

      {/* ── MAIN ── */}
      <main className="main-content">
        <ImageUploader />
        <hr className="divider" />

        <section className="details-section">
          <div className="section-header">
            <h3>Protecting Coral Reefs With Technology</h3>
            <p>Combining deep learning with ocean science to monitor the planet's most vital ecosystems.</p>
          </div>

          <div className="reef-showcase">
            <img src={coralReefImage} alt="Coral Reef" className="coral-image" />
            <div className="reef-text">
              <h4>Why Coral Reef Health Matters</h4>
              <p>Coral reefs support approximately 25% of all marine life while covering less than 1% of the ocean floor. They provide food security, coastal protection, and economic benefits to millions of people worldwide.</p>
              <p>Early detection of bleaching, disease, and damage through AI is essential for effective conservation and rapid response.</p>
            </div>
          </div>

          <div className="feature-grid">
            <div className="feature-card">
              <span className="feature-icon">🌐</span>
              <h5>Global Reef Monitoring</h5>
              <p>Track coral reef health across the globe with our comprehensive AI-driven database and historical health trends.</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🧠</span>
              <h5>Multi-Model AI</h5>
              <p>Choose from CNN, ResNet, DenseNet, or EfficientNet — each trained on thousands of reef images for accurate diagnosis.</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">📊</span>
              <h5>Conservation Insights</h5>
              <p>Gain actionable insights with detailed analysis results and confidence metrics to guide conservation efforts.</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">⚡</span>
              <h5>Instant Analysis</h5>
              <p>Get real-time predictions within seconds — no expertise required, just upload and let the AI do the work.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>© 2026 ReefVision — Powered by AI for Ocean Conservation</p>
      </footer>
    </div>
  );
}

/* ══════════════════════════════════════════
   ROOT — switches between landing & main
══════════════════════════════════════════ */
function App() {
  const [entered, setEntered] = useState(false);
  return entered
    ? <MainApp />
    : <LandingPage onEnter={() => setEntered(true)} />;
}

export default App;