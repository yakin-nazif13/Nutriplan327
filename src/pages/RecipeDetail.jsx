import { useState } from "react";
import { useNavigate } from "react-router-dom";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const RECIPE = {
  id: 1,
  name: "Grilled Salmon Salad",
  emoji: "🐟",
  difficulty: "Easy",
  servings: 2,
  prepTime: "10 min",
  cookTime: "10 min",
  tag: "Low-Carb",
  description:
    "A light and refreshing salad packed with omega-3 rich salmon, fresh greens, and a zesty lemon dressing. Perfect for a healthy lunch or dinner.",
  ingredients: [
    { amount: "2", unit: "fillets (6 oz each)", name: "Salmon fillets" },
    { amount: "1", unit: "tbsp", name: "Olive oil" },
    { amount: "2", unit: "cups", name: "Mixed salad greens" },
    { amount: "1/2", unit: "", name: "Avocado, diced" },
    { amount: "1/2", unit: "cup", name: "Cherry tomatoes, halved" },
    { amount: "1/4", unit: "cup", name: "Cucumber, diced" },
    { amount: "1", unit: "tbsp", name: "Lemon juice" },
    { amount: "2", unit: "tbsp", name: "Feta cheese, crumbled" },
    { amount: "1", unit: "tsp", name: "Garlic powder" },
    { amount: "1", unit: "tsp", name: "Paprika" },
    { amount: "", unit: "to taste", name: "Salt and pepper" },
  ],
  steps: [
    {
      num: 1,
      title: "Season the Salmon",
      desc: "Brush the salmon fillets with olive oil and season with salt, pepper, garlic powder, and paprika on both sides.",
    },
    {
      num: 2,
      title: "Heat the Grill Pan",
      desc: "Heat a grill pan or skillet over medium-high heat. Make sure it's hot before adding the salmon.",
    },
    {
      num: 3,
      title: "Cook the Salmon",
      desc: "Cook the salmon fillets for 3–4 minutes per side, or until the salmon is cooked through and has a golden-brown crust.",
    },
    {
      num: 4,
      title: "Prepare the Salad Base",
      desc: "In a large bowl, combine the mixed salad greens, diced avocado, cherry tomatoes, cucumber, and crumbled feta cheese.",
    },
    {
      num: 5,
      title: "Assemble & Serve",
      desc: "Top the salad with the grilled salmon fillets. Drizzle with lemon juice, toss gently to combine, and serve immediately.",
    },
  ],
  nutrition: {
    calories: 420,
    protein: 35,
    carbs: 10,
    fat: 28,
    fiber: 5,
    sodium: 380,
    sugar: 3,
    cholesterol: 85,
  },
};

const SIMILAR = [
  { id: 2, name: "Tuna Niçoise Salad", emoji: "🥗", calories: 380, time: "20 min" },
  { id: 3, name: "Shrimp Caesar Salad", emoji: "🍤", calories: 320, time: "15 min" },
  { id: 4, name: "Baked Cod with Veggies", emoji: "🐠", calories: 310, time: "30 min" },
];

export default function RecipeDetail() {
  const navigate = useNavigate();
  const [checkedIngredients, setCheckedIngredients] = useState([]);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [servings, setServings] = useState(RECIPE.servings);
  const [activeTab, setActiveTab] = useState("ingredients");
  const [copied, setCopied] = useState(false);

  const toggleIngredient = (i) => {
    setCheckedIngredients((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    );
  };

  const toggleStep = (i) => {
    setCompletedSteps((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    );
  };

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scale = servings / RECIPE.servings;
  const nutrition = Object.fromEntries(
    Object.entries(RECIPE.nutrition).map(([k, v]) => [k, Math.round(v * scale)])
  );

  const macroTotal = nutrition.protein + nutrition.carbs + nutrition.fat;
  const macros = [
    { label: "Protein", val: nutrition.protein, color: "#4ade80", pct: Math.round((nutrition.protein / macroTotal) * 100) },
    { label: "Carbs", val: nutrition.carbs, color: "#34d399", pct: Math.round((nutrition.carbs / macroTotal) * 100) },
    { label: "Fat", val: nutrition.fat, color: "#6ee7b7", pct: Math.round((nutrition.fat / macroTotal) * 100) },
  ];

  return (
    <div style={styles.root}>
      <div style={styles.blob1} />
      <div style={styles.blob2} />

      {/* TOPBAR */}
      <header style={styles.topbar}>
        <button style={styles.backBtn} onClick={() => navigate("/recipes")}>
          ← Back
        </button>
        <a href="/" style={styles.logo}>
          <span>🌿</span>
          <span style={styles.logoText}>NutriPlan</span>
        </a>
        <div style={styles.topbarActions}>
          <button
            style={{ ...styles.actionBtn, color: isFavorite ? "#f87171" : "rgba(232,245,232,0.5)" }}
            onClick={() => setIsFavorite(!isFavorite)}
          >
            {isFavorite ? "❤️" : "🤍"} {isFavorite ? "Saved" : "Save"}
          </button>
          <button style={styles.actionBtn} onClick={handleCopy}>
            {copied ? "✅ Copied!" : "🔗 Share"}
          </button>
          <button style={styles.editBtn}>✏️ Edit</button>
        </div>
      </header>

      <div style={styles.container}>
        {/* HERO */}
        <div style={styles.hero}>
          <div style={styles.heroEmoji}>{RECIPE.emoji}</div>
          <div style={styles.heroOverlay}>
            <div style={styles.heroBadgeRow}>
              <span style={styles.tagBadge}>{RECIPE.tag}</span>
              <span style={styles.diffBadge}>⭐ {RECIPE.difficulty}</span>
            </div>
            <h1 style={styles.heroTitle}>{RECIPE.name}</h1>
            <p style={styles.heroDesc}>{RECIPE.description}</p>
            <div style={styles.heroMeta}>
              {[
                { icon: "👥", label: "Servings", val: servings },
                { icon: "⏱", label: "Prep", val: RECIPE.prepTime },
                { icon: "🔥", label: "Cook", val: RECIPE.cookTime },
                { icon: "📊", label: "Level", val: RECIPE.difficulty },
              ].map(({ icon, label, val }) => (
                <div key={label} style={styles.metaChip}>
                  <span style={styles.metaIcon}>{icon}</span>
                  <div>
                    <div style={styles.metaLabel}>{label}</div>
                    <div style={styles.metaVal}>{val}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SERVINGS ADJUSTER */}
        <div style={styles.servingsBar}>
          <span style={styles.servingsLabel}>Adjust Servings:</span>
          <div style={styles.servingsControls}>
            <button
              style={styles.servBtn}
              onClick={() => setServings(Math.max(1, servings - 1))}
            >−</button>
            <span style={styles.servNum}>{servings}</span>
            <button
              style={styles.servBtn}
              onClick={() => setServings(servings + 1)}
            >+</button>
          </div>
          <span style={styles.servingsNote}>Nutrition values update automatically</span>
        </div>

        {/* MAIN CONTENT */}
        <div style={styles.content}>
          {/* LEFT COLUMN */}
          <div style={styles.leftCol}>
            {/* Mobile tabs */}
            <div style={styles.mobileTabs}>
              {["ingredients", "instructions"].map((tab) => (
                <button
                  key={tab}
                  style={{
                    ...styles.mobileTab,
                    ...(activeTab === tab ? styles.mobileTabActive : {}),
                  }}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* INGREDIENTS */}
            <div style={{ ...styles.panel, ...(activeTab !== "ingredients" ? styles.hiddenMobile : {}) }}>
              <div style={styles.panelHeader}>
                <h2 style={styles.panelTitle}>🧺 Ingredients</h2>
                <span style={styles.panelCount}>{RECIPE.ingredients.length} items</span>
              </div>
              <div style={styles.ingredientList}>
                {RECIPE.ingredients.map((ing, i) => {
                  const checked = checkedIngredients.includes(i);
                  return (
                    <div
                      key={i}
                      style={{
                        ...styles.ingredientRow,
                        opacity: checked ? 0.4 : 1,
                      }}
                      onClick={() => toggleIngredient(i)}
                    >
                      <div style={{ ...styles.checkbox, ...(checked ? styles.checkboxChecked : {}) }}>
                        {checked && "✓"}
                      </div>
                      <span style={styles.ingredientName}>
                        <strong style={{ color: "#4ade80" }}>
                          {ing.amount} {ing.unit}
                        </strong>{" "}
                        {ing.name}
                      </span>
                    </div>
                  );
                })}
              </div>
              <button
                style={styles.clearCheckBtn}
                onClick={() => setCheckedIngredients([])}
              >
                Clear Checklist
              </button>
            </div>

            {/* INSTRUCTIONS */}
            <div style={{ ...styles.panel, marginTop: 20, ...(activeTab !== "instructions" ? styles.hiddenMobile : {}) }}>
              <div style={styles.panelHeader}>
                <h2 style={styles.panelTitle}>📋 Instructions</h2>
                <span style={styles.panelCount}>{RECIPE.steps.length} steps</span>
              </div>
              <div style={styles.stepsList}>
                {RECIPE.steps.map((step, i) => {
                  const done = completedSteps.includes(i);
                  return (
                    <div
                      key={i}
                      style={{ ...styles.stepRow, opacity: done ? 0.45 : 1 }}
                      onClick={() => toggleStep(i)}
                    >
                      <div style={{ ...styles.stepNum, ...(done ? styles.stepNumDone : {}) }}>
                        {done ? "✓" : step.num}
                      </div>
                      <div style={styles.stepContent}>
                        <div style={styles.stepTitle}>{step.title}</div>
                        <div style={styles.stepDesc}>{step.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN — NUTRITION */}
          <div style={styles.rightCol}>
            <div style={styles.panel}>
              <div style={styles.panelHeader}>
                <h2 style={styles.panelTitle}>📊 Nutrition Facts</h2>
                <span style={styles.panelCount}>Per serving</span>
              </div>

              {/* Calories */}
              <div style={styles.calorieBox}>
                <div style={styles.calorieNum}>{nutrition.calories}</div>
                <div style={styles.calorieLabel}>Calories</div>
              </div>

              {/* Macro bars */}
              <div style={styles.macroList}>
                {macros.map((m) => (
                  <div key={m.label} style={styles.macroRow}>
                    <div style={styles.macroTop}>
                      <span style={styles.macroLabel}>{m.label}</span>
                      <span style={{ ...styles.macroVal, color: m.color }}>
                        {m.val}g <span style={styles.macroPct}>({m.pct}%)</span>
                      </span>
                    </div>
                    <div style={styles.barBg}>
                      <div style={{ ...styles.barFill, width: `${m.pct}%`, background: m.color }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Other nutrients */}
              <div style={styles.nutriGrid}>
                {[
                  { label: "Fiber", val: `${nutrition.fiber}g` },
                  { label: "Sodium", val: `${nutrition.sodium}mg` },
                  { label: "Sugar", val: `${nutrition.sugar}g` },
                  { label: "Cholesterol", val: `${nutrition.cholesterol}mg` },
                ].map(({ label, val }) => (
                  <div key={label} style={styles.nutriRow}>
                    <span style={styles.nutriLabel}>{label}</span>
                    <span style={styles.nutriVal}>{val}</span>
                  </div>
                ))}
              </div>

              <div style={styles.nutriNote}>
                * Values scaled to {servings} serving{servings !== 1 ? "s" : ""}
              </div>
            </div>

            {/* ADD TO MEAL PLAN */}
            <div style={{ ...styles.panel, marginTop: 20 }}>
              <h2 style={styles.panelTitle}>🗓 Add to Meal Plan</h2>
              <p style={styles.mealPlanSub}>Save this recipe to your weekly meal plan.</p>
              <button style={styles.mealPlanBtn}>Add to Today's Plan</button>
              <button style={styles.calcBtn} onClick={() => navigate("/calculator")}>
                Open in Meal Calculator →
              </button>
            </div>
          </div>
        </div>

        {/* SIMILAR RECIPES */}
        <div style={styles.similarSection}>
          <h2 style={styles.similarTitle}>You Might Also Like</h2>
          <div style={styles.similarGrid}>
            {SIMILAR.map((r) => (
              <div key={r.id} style={styles.similarCard} onClick={() => navigate(`/recipes/${r.id}`)}>
                <div style={styles.similarEmoji}>{r.emoji}</div>
                <div style={styles.similarName}>{r.name}</div>
                <div style={styles.similarMeta}>{r.calories} kcal · {r.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = {
  root: {
    minHeight: "100vh", background: "#0a0f0a",
    color: "#e8f5e8", fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    overflowX: "hidden", position: "relative",
  },
  blob1: {
    position: "fixed", top: "-150px", left: "-150px", width: 400, height: 400,
    background: "radial-gradient(circle, rgba(74,222,128,0.1) 0%, transparent 70%)",
    borderRadius: "50%", pointerEvents: "none", zIndex: 0,
  },
  blob2: {
    position: "fixed", bottom: "-100px", right: "-100px", width: 350, height: 350,
    background: "radial-gradient(circle, rgba(52,211,153,0.07) 0%, transparent 70%)",
    borderRadius: "50%", pointerEvents: "none", zIndex: 0,
  },

  // TOPBAR
  topbar: {
    position: "sticky", top: 0, zIndex: 100,
    background: "rgba(10,15,10,0.9)", backdropFilter: "blur(20px)",
    borderBottom: "1px solid rgba(74,222,128,0.1)",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 24px", height: 64, gap: 16,
  },
  backBtn: {
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
    color: "rgba(232,245,232,0.7)", padding: "7px 14px",
    borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer",
  },
  logo: { display: "flex", alignItems: "center", gap: 8, textDecoration: "none" },
  logoText: { fontSize: 18, fontWeight: 700, color: "#4ade80" },
  topbarActions: { display: "flex", alignItems: "center", gap: 10 },
  actionBtn: {
    background: "none", border: "1px solid rgba(255,255,255,0.1)",
    padding: "7px 14px", borderRadius: 8,
    fontSize: 13, fontWeight: 600, cursor: "pointer",
  },
  editBtn: {
    background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.25)",
    color: "#4ade80", padding: "7px 14px",
    borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
  },

  container: {
    maxWidth: 1100, margin: "0 auto",
    padding: "32px 24px 80px", position: "relative", zIndex: 1,
  },

  // HERO
  hero: {
    borderRadius: 20, overflow: "hidden", marginBottom: 20,
    background: "rgba(74,222,128,0.06)",
    border: "1px solid rgba(74,222,128,0.12)",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    minHeight: 260, position: "relative",
    padding: "40px 32px",
  },
  heroEmoji: { fontSize: 80, marginBottom: 16 },
  heroOverlay: { textAlign: "center", maxWidth: 600 },
  heroBadgeRow: { display: "flex", gap: 10, justifyContent: "center", marginBottom: 12 },
  tagBadge: {
    background: "rgba(74,222,128,0.15)", border: "1px solid rgba(74,222,128,0.3)",
    color: "#4ade80", padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 700,
  },
  diffBadge: {
    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
    color: "rgba(232,245,232,0.6)", padding: "4px 12px", borderRadius: 100, fontSize: 12,
  },
  heroTitle: {
    fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 800,
    letterSpacing: "-1px", margin: "0 0 10px", color: "#e8f5e8",
  },
  heroDesc: {
    fontSize: 15, color: "rgba(232,245,232,0.5)",
    lineHeight: 1.6, margin: "0 0 24px",
  },
  heroMeta: { display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" },
  metaChip: {
    display: "flex", alignItems: "center", gap: 10,
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10, padding: "10px 14px",
  },
  metaIcon: { fontSize: 18 },
  metaLabel: { fontSize: 11, color: "rgba(232,245,232,0.4)", textTransform: "uppercase", letterSpacing: "0.5px" },
  metaVal: { fontSize: 14, fontWeight: 700, color: "#e8f5e8" },

  // SERVINGS BAR
  servingsBar: {
    display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
    background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.12)",
    borderRadius: 12, padding: "12px 20px", marginBottom: 28,
  },
  servingsLabel: { fontSize: 14, fontWeight: 600, color: "rgba(232,245,232,0.6)" },
  servingsControls: { display: "flex", alignItems: "center", gap: 12 },
  servBtn: {
    width: 30, height: 30, borderRadius: "50%",
    background: "rgba(74,222,128,0.15)", border: "1px solid rgba(74,222,128,0.3)",
    color: "#4ade80", fontSize: 18, fontWeight: 700,
    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
  },
  servNum: { fontSize: 20, fontWeight: 800, color: "#4ade80", minWidth: 24, textAlign: "center" },
  servingsNote: { fontSize: 12, color: "rgba(232,245,232,0.3)", marginLeft: "auto" },

  // CONTENT LAYOUT
  content: {
    display: "grid",
    gridTemplateColumns: "1fr 340px",
    gap: 24, alignItems: "start",
  },
  leftCol: {},
  rightCol: {},

  // MOBILE TABS
  mobileTabs: {
    display: "none", marginBottom: 16,
    background: "rgba(255,255,255,0.04)",
    borderRadius: 10, padding: 4,
  },
  mobileTab: {
    flex: 1, padding: "9px 0", background: "none", border: "none",
    color: "rgba(232,245,232,0.45)", fontSize: 14, fontWeight: 600,
    cursor: "pointer", borderRadius: 8,
  },
  mobileTabActive: {
    background: "rgba(74,222,128,0.15)", color: "#4ade80",
  },
  hiddenMobile: {},

  // PANELS
  panel: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 16, padding: "22px",
  },
  panelHeader: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    marginBottom: 18,
  },
  panelTitle: { fontSize: 17, fontWeight: 700, color: "#e8f5e8", margin: 0 },
  panelCount: { fontSize: 12, color: "rgba(232,245,232,0.35)" },

  // INGREDIENTS
  ingredientList: { display: "flex", flexDirection: "column", gap: 4 },
  ingredientRow: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "9px 10px", borderRadius: 8, cursor: "pointer",
    transition: "background 0.15s",
  },
  checkbox: {
    width: 20, height: 20, borderRadius: 6,
    border: "2px solid rgba(255,255,255,0.15)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 12, color: "#0a0f0a", flexShrink: 0,
    transition: "all 0.2s",
  },
  checkboxChecked: {
    background: "#4ade80", borderColor: "#4ade80",
  },
  ingredientName: { fontSize: 14, color: "rgba(232,245,232,0.75)", lineHeight: 1.4 },
  clearCheckBtn: {
    marginTop: 16, background: "none",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "rgba(232,245,232,0.35)", padding: "7px 14px",
    borderRadius: 8, fontSize: 13, cursor: "pointer", width: "100%",
  },

  // STEPS
  stepsList: { display: "flex", flexDirection: "column", gap: 12 },
  stepRow: {
    display: "flex", gap: 14, cursor: "pointer",
    padding: "12px", borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.05)",
    transition: "all 0.2s",
  },
  stepNum: {
    width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
    background: "rgba(74,222,128,0.12)", border: "2px solid rgba(74,222,128,0.3)",
    color: "#4ade80", display: "flex", alignItems: "center",
    justifyContent: "center", fontSize: 13, fontWeight: 800,
  },
  stepNumDone: {
    background: "#4ade80", color: "#0a0f0a", borderColor: "#4ade80",
  },
  stepContent: {},
  stepTitle: { fontSize: 14, fontWeight: 700, color: "#e8f5e8", marginBottom: 4 },
  stepDesc: { fontSize: 13, color: "rgba(232,245,232,0.5)", lineHeight: 1.5 },

  // NUTRITION
  calorieBox: {
    textAlign: "center", padding: "20px 0",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    marginBottom: 18,
  },
  calorieNum: {
    fontSize: 52, fontWeight: 900, color: "#4ade80",
    letterSpacing: "-2px", lineHeight: 1,
  },
  calorieLabel: { fontSize: 13, color: "rgba(232,245,232,0.4)", marginTop: 4 },
  macroList: { display: "flex", flexDirection: "column", gap: 14, marginBottom: 18 },
  macroRow: {},
  macroTop: { display: "flex", justifyContent: "space-between", marginBottom: 6 },
  macroLabel: { fontSize: 13, color: "rgba(232,245,232,0.6)", fontWeight: 600 },
  macroVal: { fontSize: 13, fontWeight: 700 },
  macroPct: { color: "rgba(232,245,232,0.35)", fontWeight: 400 },
  barBg: {
    height: 6, background: "rgba(255,255,255,0.06)",
    borderRadius: 100, overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: 100, transition: "width 0.4s ease" },
  nutriGrid: {
    borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16,
    display: "flex", flexDirection: "column", gap: 10,
  },
  nutriRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  nutriLabel: { fontSize: 13, color: "rgba(232,245,232,0.45)" },
  nutriVal: { fontSize: 13, fontWeight: 700, color: "#e8f5e8" },
  nutriNote: { fontSize: 11, color: "rgba(232,245,232,0.2)", marginTop: 14, textAlign: "center" },

  // MEAL PLAN
  mealPlanSub: { fontSize: 13, color: "rgba(232,245,232,0.4)", margin: "6px 0 16px" },
  mealPlanBtn: {
    width: "100%", background: "linear-gradient(135deg, #4ade80, #22c55e)",
    color: "#0a0f0a", border: "none", borderRadius: 10,
    padding: "12px", fontSize: 14, fontWeight: 700, cursor: "pointer",
    marginBottom: 10, fontFamily: "inherit",
  },
  calcBtn: {
    width: "100%", background: "rgba(74,222,128,0.08)",
    border: "1px solid rgba(74,222,128,0.2)",
    color: "#4ade80", borderRadius: 10,
    padding: "12px", fontSize: 14, fontWeight: 600, cursor: "pointer",
    fontFamily: "inherit",
  },

  // SIMILAR
  similarSection: { marginTop: 40 },
  similarTitle: { fontSize: 20, fontWeight: 700, marginBottom: 16, color: "#e8f5e8" },
  similarGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 },
  similarCard: {
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 12, padding: "20px 16px", cursor: "pointer",
    transition: "all 0.2s", textAlign: "center",
  },
  similarEmoji: { fontSize: 36, marginBottom: 10 },
  similarName: { fontSize: 14, fontWeight: 700, color: "#e8f5e8", marginBottom: 6 },
  similarMeta: { fontSize: 12, color: "rgba(232,245,232,0.4)" },
};
