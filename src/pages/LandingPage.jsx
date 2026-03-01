import { useState, useEffect, useRef } from "react";

const NAV_LINKS = ["Home", "Features", "About"];

const FEATURES = [
  {
    icon: "🤖",
    title: "AI Recipe Import",
    desc: "Instantly import recipes from any website with one click using Gemini AI.",
    color: "#4ade80",
  },
  {
    icon: "📊",
    title: "Nutrition Analysis",
    desc: "Detailed breakdown of calories, macros, and micronutrients per serving.",
    color: "#34d399",
  },
  {
    icon: "📅",
    title: "Custom Meal Planning",
    desc: "Build personalized weekly meal plans that match your dietary goals.",
    color: "#6ee7b7",
  },
  {
    icon: "🔍",
    title: "Smart Search",
    desc: "Filter by dietary needs — vegan, gluten-free, low-carb and more.",
    color: "#a7f3d0",
  },
  {
    icon: "🧮",
    title: "Meal Calculator",
    desc: "Build custom meals and see real-time nutritional values instantly.",
    color: "#4ade80",
  },
  {
    icon: "🌐",
    title: "Chrome Extension",
    desc: "Capture recipes directly from any cooking website while you browse.",
    color: "#34d399",
  },
];

const STATS = [
  { number: "500+", label: "Recipes Analyzed" },
  { number: "50+", label: "Supported Sites" },
  { number: "100%", label: "AI Powered" },
  { number: "Free", label: "To Get Started" },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Find a Recipe",
    desc: "Browse any cooking website or paste a URL directly into NutriPlan.",
  },
  {
    step: "02",
    title: "AI Extracts Data",
    desc: "Our Gemini AI instantly pulls ingredients, steps, and serving info.",
  },
  {
    step: "03",
    title: "Get Nutrition Facts",
    desc: "See a complete breakdown of calories, protein, carbs, and fats.",
  },
  {
    step: "04",
    title: "Plan Your Meals",
    desc: "Save recipes, build meal plans, and track your nutrition goals.",
  },
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [visible, setVisible] = useState({
  stats: true, featHead: true,
  feat0: true, feat1: true, feat2: true,
  feat3: true, feat4: true, feat5: true,
  howHead: true, step0: true, step1: true,
  step2: true, step3: true,
  ext: true, cta: true,
  });
  const sectionRefs = useRef({});

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -50px 0px" }
    );
    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const registerRef = (id) => (el) => {
    sectionRefs.current[id] = el;
  };

  return (
    <div style={styles.root}>
      {/* Background blobs */}
      <div style={styles.blob1} />
      <div style={styles.blob2} />
      <div style={styles.blob3} />

      {/* NAVBAR */}
      <nav style={{ ...styles.nav, ...(scrolled ? styles.navScrolled : {}) }}>
        <div style={styles.navInner}>
          <div style={styles.logo}>
            <span style={styles.logoLeaf}>🌿</span>
            <span style={styles.logoText}>NutriPlan</span>
          </div>

          {/* Desktop nav */}
          <div style={styles.navLinks}>
            {NAV_LINKS.map((link) => (
              <a key={link} href={`#${link.toLowerCase()}`} style={styles.navLink}>
                {link}
              </a>
            ))}
          </div>

          <div style={styles.navActions}>
            <a href="/login" style={styles.loginBtn}>Login</a>
            <a href="/signup" style={styles.signupBtn}>Sign Up</a>
          </div>

          {/* Mobile menu toggle */}
          <button style={styles.menuBtn} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={styles.mobileMenu}>
            {NAV_LINKS.map((link) => (
              <a key={link} href={`#${link.toLowerCase()}`} style={styles.mobileLink}
                onClick={() => setMenuOpen(false)}>
                {link}
              </a>
            ))}
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <a href="/login" style={styles.loginBtn}>Login</a>
              <a href="/signup" style={styles.signupBtn}>Sign Up</a>
            </div>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section id="home" style={styles.hero}>
        <div style={styles.heroBadge}>
          <span style={styles.badgeDot} />
          AI-Powered Nutrition Tracking
        </div>

        <h1 style={styles.heroTitle}>
          Your Smart
          <br />
          <span style={styles.heroAccent}>Nutrition</span>
          <br />
          Companion
        </h1>

        <p style={styles.heroSub}>
          Import recipes from any website, analyze nutrition instantly,
          and build meal plans tailored to your goals — all powered by AI.
        </p>

        <div style={styles.heroBtns}>
          <a href="/signup" style={styles.ctaPrimary}>
            Get Started Free →
          </a>
          <a href="#features" style={styles.ctaSecondary}>
            See How It Works
          </a>
        </div>

        {/* Hero card */}
        <div style={styles.heroCard}>
          <div style={styles.heroCardHeader}>
            <span style={styles.heroCardDot} />
            <span style={styles.heroCardDot2} />
            <span style={styles.heroCardDot3} />
            <span style={styles.heroCardTitle}>NutriPlan — Recipe Imported!</span>
          </div>
          <div style={styles.heroCardBody}>
            <div style={styles.heroCardLeft}>
              <div style={styles.heroCardImg}>🍣</div>
              <div>
                <div style={styles.heroCardRecipeName}>Grilled Salmon Salad</div>
                <div style={styles.heroCardMeta}>4 servings · 20 min · Easy</div>
              </div>
            </div>
            <div style={styles.heroCardNutrition}>
              {[
                { label: "Calories", val: "420", color: "#4ade80" },
                { label: "Protein", val: "35g", color: "#34d399" },
                { label: "Carbs", val: "10g", color: "#6ee7b7" },
                { label: "Fat", val: "28g", color: "#a7f3d0" },
              ].map(({ label, val, color }) => (
                <div key={label} style={styles.nutriItem}>
                  <span style={{ ...styles.nutriVal, color }}>{val}</span>
                  <span style={styles.nutriLabel}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mini feature chips */}
        <div style={styles.chips}>
          {["🤖 AI Recipe Import", "📊 Nutrition Analysis", "📅 Meal Planning"].map((chip) => (
            <div key={chip} style={styles.chip}>{chip}</div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section
        id="stats"
        ref={registerRef("stats")}
        style={{
          ...styles.statsSection,
          opacity: visible.stats ? 1 : 0,
          transform: visible.stats ? "translateY(0)" : "translateY(40px)",
          transition: "all 0.7s ease",
        }}
      >
        {STATS.map(({ number, label }) => (
          <div key={label} style={styles.statItem}>
            <div style={styles.statNumber}>{number}</div>
            <div style={styles.statLabel}>{label}</div>
          </div>
        ))}
      </section>

      {/* FEATURES */}
      <section id="features" style={styles.section}>
        <div
          ref={registerRef("featHead")}
          style={{
            ...styles.sectionHead,
            opacity: visible.featHead ? 1 : 0,
            transform: visible.featHead ? "translateY(0)" : "translateY(30px)",
            transition: "all 0.6s ease",
          }}
        >
          <div style={styles.sectionBadge}>Features</div>
          <h2 style={styles.sectionTitle}>Everything You Need to<br /><span style={styles.heroAccent}>Eat Smarter</span></h2>
          <p style={styles.sectionSub}>
            NutriPlan combines AI, nutrition science, and beautiful design to help you make better food choices.
          </p>
        </div>

        <div style={styles.featuresGrid}>
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              ref={registerRef(`feat${i}`)}
              style={{
                ...styles.featureCard,
                opacity: visible[`feat${i}`] ? 1 : 0,
                transform: visible[`feat${i}`] ? "translateY(0)" : "translateY(40px)",
                transition: `all 0.6s ease ${i * 0.1}s`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px) scale(1.02)";
                e.currentTarget.style.borderColor = f.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
              }}
            >
              <div style={{ ...styles.featureIcon, background: `${f.color}18` }}>
                {f.icon}
              </div>
              <h3 style={styles.featureTitle}>{f.title}</h3>
              <p style={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="about" style={styles.section}>
        <div
          ref={registerRef("howHead")}
          style={{
            ...styles.sectionHead,
            opacity: visible.howHead ? 1 : 0,
            transform: visible.howHead ? "translateY(0)" : "translateY(30px)",
            transition: "all 0.6s ease",
          }}
        >
          <div style={styles.sectionBadge}>How It Works</div>
          <h2 style={styles.sectionTitle}>From Recipe to<br /><span style={styles.heroAccent}>Nutrition Facts</span> in Seconds</h2>
        </div>

        <div style={styles.stepsGrid}>
          {HOW_IT_WORKS.map((item, i) => (
            <div
              key={item.step}
              ref={registerRef(`step${i}`)}
              style={{
                ...styles.stepCard,
                opacity: visible[`step${i}`] ? 1 : 0,
                transform: visible[`step${i}`] ? "translateX(0)" : "translateX(-30px)",
                transition: `all 0.6s ease ${i * 0.15}s`,
              }}
            >
              <div style={styles.stepNumber}>{item.step}</div>
              <div>
                <h3 style={styles.stepTitle}>{item.title}</h3>
                <p style={styles.stepDesc}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* EXTENSION HIGHLIGHT */}
      <section
        ref={registerRef("ext")}
        style={{
          ...styles.extSection,
          opacity: visible.ext ? 1 : 0,
          transform: visible.ext ? "translateY(0)" : "translateY(40px)",
          transition: "all 0.7s ease",
        }}
      >
        <div style={styles.extContent}>
          <div style={styles.sectionBadge}>Chrome Extension</div>
          <h2 style={styles.sectionTitle}>Import Recipes<br /><span style={styles.heroAccent}>While You Browse</span></h2>
          <p style={styles.sectionSub}>
            Install the NutriPlan Chrome extension and save recipes from AllRecipes, Food Network, NYTimes Cooking, and 50+ other sites with a single click.
          </p>
          <a href="/signup" style={styles.ctaPrimary}>Get the Extension →</a>
        </div>
        <div style={styles.extMockup}>
          <div style={styles.extPopup}>
            <div style={styles.extPopupHeader}>
              <span style={styles.logoLeaf}>🌿</span>
              <span style={{ ...styles.logoText, fontSize: 14 }}>NutriPlan</span>
            </div>
            <div style={styles.extPopupBody}>
              <div style={styles.extDetected}>🤖 Recipe detected!</div>
              <div style={styles.extRecipeName}>Chicken Tikka Masala</div>
              <div style={styles.extIngredients}>
                <div>• 1 lb boneless chicken thighs</div>
                <div>• 1 cup yogurt</div>
                <div>• 1 cup heavy cream</div>
                <div style={{ color: "#4ade80", fontSize: 12, marginTop: 4 }}>15 ingredients extracted</div>
              </div>
              <div style={styles.extMeta}>🍽 4 servings &nbsp; ⏱ 60 min</div>
              <button style={styles.extImportBtn}>Import Recipe</button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section
        ref={registerRef("cta")}
        style={{
          ...styles.ctaSection,
          opacity: visible.cta ? 1 : 0,
          transform: visible.cta ? "translateY(0)" : "translateY(40px)",
          transition: "all 0.7s ease",
        }}
      >
        <h2 style={styles.ctaTitle}>Ready to Eat Smarter?</h2>
        <p style={styles.ctaSub}>Join NutriPlan and start tracking your nutrition today — completely free.</p>
        <a href="/signup" style={styles.ctaPrimary}>Start for Free →</a>
      </section>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <div style={styles.footerLogo}>
          <span style={styles.logoLeaf}>🌿</span>
          <span style={styles.logoText}>NutriPlan</span>
        </div>
        <p style={styles.footerText}>AI-Powered Nutrition Analysis · Built for CSE327</p>
        <p style={styles.footerText}>© 2025 NutriPlan · Group 2</p>
      </footer>
    </div>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────

const styles = {
  root: {
    minHeight: "100vh",
    background: "#0a0f0a",
    color: "#e8f5e8",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    overflowX: "hidden",
    position: "relative",
  },

  // Background blobs
  blob1: {
    position: "fixed", top: "-200px", left: "-200px",
    width: 600, height: 600,
    background: "radial-gradient(circle, rgba(74,222,128,0.12) 0%, transparent 70%)",
    borderRadius: "50%", pointerEvents: "none", zIndex: 0,
  },
  blob2: {
    position: "fixed", top: "40%", right: "-200px",
    width: 500, height: 500,
    background: "radial-gradient(circle, rgba(52,211,153,0.08) 0%, transparent 70%)",
    borderRadius: "50%", pointerEvents: "none", zIndex: 0,
  },
  blob3: {
    position: "fixed", bottom: "-100px", left: "30%",
    width: 400, height: 400,
    background: "radial-gradient(circle, rgba(110,231,183,0.06) 0%, transparent 70%)",
    borderRadius: "50%", pointerEvents: "none", zIndex: 0,
  },

  // NAVBAR
  nav: {
    position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
    padding: "0 24px",
    transition: "all 0.3s ease",
  },
  navScrolled: {
    background: "rgba(10,15,10,0.85)",
    backdropFilter: "blur(20px)",
    borderBottom: "1px solid rgba(74,222,128,0.1)",
  },
  navInner: {
    maxWidth: 1200, margin: "0 auto",
    display: "flex", alignItems: "center",
    justifyContent: "space-between",
    height: 70, gap: 24,
  },
  logo: { display: "flex", alignItems: "center", gap: 8, textDecoration: "none" },
  logoLeaf: { fontSize: 22 },
  logoText: {
    fontSize: 20, fontWeight: 700, color: "#4ade80",
    letterSpacing: "-0.5px",
  },
  navLinks: { display: "flex", gap: 32, flex: 1, justifyContent: "center" },
  navLink: {
    color: "rgba(232,245,232,0.7)", textDecoration: "none",
    fontSize: 15, fontWeight: 500,
    transition: "color 0.2s",
  },
  navActions: { display: "flex", gap: 12, alignItems: "center" },
  loginBtn: {
    color: "rgba(232,245,232,0.8)", textDecoration: "none",
    fontSize: 15, fontWeight: 500, padding: "8px 18px",
    borderRadius: 8, border: "1px solid rgba(74,222,128,0.2)",
    transition: "all 0.2s",
  },
  signupBtn: {
    background: "#4ade80", color: "#0a0f0a", textDecoration: "none",
    fontSize: 15, fontWeight: 700, padding: "8px 20px",
    borderRadius: 8, transition: "all 0.2s",
  },
  menuBtn: {
    display: "none", background: "none", border: "none",
    color: "#e8f5e8", fontSize: 22, cursor: "pointer",
  },
  mobileMenu: {
    background: "rgba(10,15,10,0.95)", backdropFilter: "blur(20px)",
    padding: "16px 24px", display: "flex", flexDirection: "column", gap: 16,
    borderTop: "1px solid rgba(74,222,128,0.1)",
  },
  mobileLink: {
    color: "rgba(232,245,232,0.8)", textDecoration: "none",
    fontSize: 16, fontWeight: 500,
  },

  // HERO
  hero: {
    position: "relative", zIndex: 1,
    minHeight: "100vh",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    padding: "120px 24px 80px",
    textAlign: "center",
  },
  heroBadge: {
    display: "inline-flex", alignItems: "center", gap: 8,
    background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.25)",
    color: "#4ade80", padding: "6px 16px", borderRadius: 100,
    fontSize: 13, fontWeight: 600, marginBottom: 28, letterSpacing: "0.5px",
  },
  badgeDot: {
    width: 6, height: 6, borderRadius: "50%",
    background: "#4ade80",
    boxShadow: "0 0 6px #4ade80",
    display: "inline-block",
    animation: "pulse 2s infinite",
  },
  heroTitle: {
    fontSize: "clamp(48px, 8vw, 88px)",
    fontWeight: 800, lineHeight: 1.05,
    letterSpacing: "-2px", margin: "0 0 24px",
    color: "#e8f5e8",
  },
  heroAccent: {
    background: "linear-gradient(135deg, #4ade80, #34d399)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
  },
  heroSub: {
    fontSize: "clamp(16px, 2vw, 20px)",
    color: "rgba(232,245,232,0.6)", maxWidth: 560,
    lineHeight: 1.6, marginBottom: 40,
  },
  heroBtns: { display: "flex", gap: 16, marginBottom: 60, flexWrap: "wrap", justifyContent: "center" },
  ctaPrimary: {
    background: "linear-gradient(135deg, #4ade80, #22c55e)",
    color: "#0a0f0a", textDecoration: "none",
    fontSize: 16, fontWeight: 700, padding: "14px 32px",
    borderRadius: 12, transition: "all 0.2s",
    boxShadow: "0 4px 24px rgba(74,222,128,0.35)",
    display: "inline-block",
  },
  ctaSecondary: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#e8f5e8", textDecoration: "none",
    fontSize: 16, fontWeight: 600, padding: "14px 32px",
    borderRadius: 12, transition: "all 0.2s",
    display: "inline-block",
  },

  // Hero card
  heroCard: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(74,222,128,0.15)",
    borderRadius: 16, padding: "20px 24px",
    maxWidth: 560, width: "100%",
    backdropFilter: "blur(20px)",
    marginBottom: 32,
  },
  heroCardHeader: {
    display: "flex", alignItems: "center", gap: 8,
    marginBottom: 16, paddingBottom: 12,
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  heroCardDot: { width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" },
  heroCardDot2: { width: 10, height: 10, borderRadius: "50%", background: "#febc2e" },
  heroCardDot3: { width: 10, height: 10, borderRadius: "50%", background: "#28c840" },
  heroCardTitle: { fontSize: 13, color: "rgba(232,245,232,0.5)", marginLeft: 4 },
  heroCardBody: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 },
  heroCardLeft: { display: "flex", alignItems: "center", gap: 14 },
  heroCardImg: {
    fontSize: 36, width: 56, height: 56,
    background: "rgba(74,222,128,0.1)", borderRadius: 12,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  heroCardRecipeName: { fontSize: 16, fontWeight: 700, color: "#e8f5e8" },
  heroCardMeta: { fontSize: 13, color: "rgba(232,245,232,0.5)", marginTop: 4 },
  heroCardNutrition: { display: "flex", gap: 20 },
  nutriItem: { display: "flex", flexDirection: "column", alignItems: "center", gap: 2 },
  nutriVal: { fontSize: 18, fontWeight: 800 },
  nutriLabel: { fontSize: 11, color: "rgba(232,245,232,0.4)", textTransform: "uppercase", letterSpacing: "0.5px" },

  chips: { display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" },
  chip: {
    background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.15)",
    color: "rgba(232,245,232,0.7)", padding: "8px 16px",
    borderRadius: 100, fontSize: 13, fontWeight: 500,
  },

  // STATS
  statsSection: {
    position: "relative", zIndex: 1,
    display: "flex", justifyContent: "center",
    gap: 60, flexWrap: "wrap",
    padding: "60px 24px",
    borderTop: "1px solid rgba(74,222,128,0.08)",
    borderBottom: "1px solid rgba(74,222,128,0.08)",
    background: "rgba(74,222,128,0.02)",
  },
  statItem: { textAlign: "center" },
  statNumber: {
    fontSize: 48, fontWeight: 800, color: "#4ade80",
    letterSpacing: "-1px", lineHeight: 1,
  },
  statLabel: { fontSize: 14, color: "rgba(232,245,232,0.5)", marginTop: 6 },

  // SECTIONS
  section: {
    position: "relative", zIndex: 1,
    maxWidth: 1200, margin: "0 auto",
    padding: "100px 24px",
  },
  sectionHead: { textAlign: "center", marginBottom: 64 },
  sectionBadge: {
    display: "inline-block",
    background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)",
    color: "#4ade80", padding: "4px 14px", borderRadius: 100,
    fontSize: 12, fontWeight: 600, letterSpacing: "1px",
    textTransform: "uppercase", marginBottom: 16,
  },
  sectionTitle: {
    fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 800,
    lineHeight: 1.1, letterSpacing: "-1px", margin: "0 0 16px",
  },
  sectionSub: {
    fontSize: 17, color: "rgba(232,245,232,0.55)",
    maxWidth: 520, margin: "0 auto", lineHeight: 1.6,
  },

  // FEATURES GRID
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: 24,
  },
  featureCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 16, padding: "28px 24px",
    transition: "all 0.3s ease",
    cursor: "default",
  },
  featureIcon: {
    fontSize: 28, width: 56, height: 56,
    borderRadius: 12, display: "flex",
    alignItems: "center", justifyContent: "center",
    marginBottom: 16,
  },
  featureTitle: { fontSize: 18, fontWeight: 700, marginBottom: 8, color: "#e8f5e8" },
  featureDesc: { fontSize: 14, color: "rgba(232,245,232,0.5)", lineHeight: 1.6 },

  // HOW IT WORKS
  stepsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 24,
  },
  stepCard: {
    display: "flex", alignItems: "flex-start", gap: 20,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(74,222,128,0.1)",
    borderRadius: 16, padding: "24px",
  },
  stepNumber: {
    fontSize: 36, fontWeight: 900, color: "rgba(74,222,128,0.2)",
    lineHeight: 1, flexShrink: 0, fontVariantNumeric: "tabular-nums",
  },
  stepTitle: { fontSize: 17, fontWeight: 700, marginBottom: 8, color: "#e8f5e8" },
  stepDesc: { fontSize: 14, color: "rgba(232,245,232,0.5)", lineHeight: 1.6 },

  // EXTENSION SECTION
  extSection: {
    position: "relative", zIndex: 1,
    maxWidth: 1200, margin: "0 auto",
    padding: "100px 24px",
    display: "flex", alignItems: "center",
    gap: 80, flexWrap: "wrap",
    justifyContent: "center",
  },
  extContent: { flex: 1, minWidth: 280, maxWidth: 480 },
  extMockup: { flex: 1, minWidth: 260, display: "flex", justifyContent: "center" },
  extPopup: {
    background: "rgba(15,22,15,0.95)",
    border: "1px solid rgba(74,222,128,0.2)",
    borderRadius: 16, width: 280,
    boxShadow: "0 24px 80px rgba(0,0,0,0.5), 0 0 40px rgba(74,222,128,0.1)",
    overflow: "hidden",
  },
  extPopupHeader: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "12px 16px",
    borderBottom: "1px solid rgba(74,222,128,0.1)",
    background: "rgba(74,222,128,0.05)",
  },
  extPopupBody: { padding: 16 },
  extDetected: { fontSize: 13, color: "#4ade80", fontWeight: 600, marginBottom: 8 },
  extRecipeName: { fontSize: 16, fontWeight: 700, color: "#e8f5e8", marginBottom: 10 },
  extIngredients: { fontSize: 13, color: "rgba(232,245,232,0.5)", lineHeight: 1.8, marginBottom: 12 },
  extMeta: { fontSize: 13, color: "rgba(232,245,232,0.4)", marginBottom: 16 },
  extImportBtn: {
    width: "100%", background: "linear-gradient(135deg, #4ade80, #22c55e)",
    color: "#0a0f0a", border: "none", borderRadius: 8,
    padding: "10px", fontSize: 14, fontWeight: 700, cursor: "pointer",
  },

  // CTA SECTION
  ctaSection: {
    position: "relative", zIndex: 1,
    textAlign: "center",
    padding: "100px 24px",
    background: "linear-gradient(180deg, transparent, rgba(74,222,128,0.04))",
    borderTop: "1px solid rgba(74,222,128,0.08)",
  },
  ctaTitle: {
    fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 800,
    letterSpacing: "-1.5px", marginBottom: 16,
  },
  ctaSub: {
    fontSize: 18, color: "rgba(232,245,232,0.55)",
    marginBottom: 40, maxWidth: 480, margin: "0 auto 40px",
  },

  // FOOTER
  footer: {
    position: "relative", zIndex: 1,
    textAlign: "center", padding: "40px 24px",
    borderTop: "1px solid rgba(255,255,255,0.05)",
  },
  footerLogo: { display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 12 },
  footerText: { fontSize: 13, color: "rgba(232,245,232,0.3)", margin: "4px 0" },
};
