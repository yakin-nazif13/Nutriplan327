import { useState } from "react";
import { useNavigate } from "react-router-dom";

// ─── MOCK INGREDIENT DATABASE ─────────────────────────────────────────────────
const INGREDIENT_DB = [
  { id: 1, name: "Chicken Breast", emoji: "🍗", per100g: { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sodium: 74 } },
  { id: 2, name: "Brown Rice", emoji: "🍚", per100g: { calories: 216, protein: 5, carbs: 45, fat: 1.8, fiber: 3.5, sodium: 10 } },
  { id: 3, name: "Avocado", emoji: "🥑", per100g: { calories: 160, protein: 2, carbs: 9, fat: 15, fiber: 7, sodium: 7 } },
  { id: 4, name: "Olive Oil", emoji: "🫙", per100g: { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0, sodium: 2 } },
  { id: 5, name: "Broccoli", emoji: "🥦", per100g: { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6, sodium: 33 } },
  { id: 6, name: "Salmon", emoji: "🐟", per100g: { calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0, sodium: 59 } },
  { id: 7, name: "Egg", emoji: "🥚", per100g: { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, sodium: 124 } },
  { id: 8, name: "Greek Yogurt", emoji: "🥛", per100g: { calories: 59, protein: 10, carbs: 3.6, fat: 0.4, fiber: 0, sodium: 36 } },
  { id: 9, name: "Spinach", emoji: "🥬", per100g: { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, sodium: 79 } },
  { id: 10, name: "Sweet Potato", emoji: "🍠", per100g: { calories: 86, protein: 1.6, carbs: 20, fat: 0.1, fiber: 3, sodium: 55 } },
  { id: 11, name: "Almonds", emoji: "🌰", per100g: { calories: 579, protein: 21, carbs: 22, fat: 50, fiber: 12.5, sodium: 1 } },
  { id: 12, name: "Banana", emoji: "🍌", per100g: { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, sodium: 1 } },
  { id: 13, name: "Oats", emoji: "🌾", per100g: { calories: 389, protein: 17, carbs: 66, fat: 7, fiber: 10.6, sodium: 2 } },
  { id: 14, name: "Tuna", emoji: "🐠", per100g: { calories: 132, protein: 28, carbs: 0, fat: 1.3, fiber: 0, sodium: 450 } },
  { id: 15, name: "Cherry Tomatoes", emoji: "🍅", per100g: { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, sodium: 5 } },
  { id: 16, name: "Feta Cheese", emoji: "🧀", per100g: { calories: 264, protein: 14, carbs: 4, fat: 21, fiber: 0, sodium: 1116 } },
  { id: 17, name: "Lentils", emoji: "🫘", per100g: { calories: 116, protein: 9, carbs: 20, fat: 0.4, fiber: 8, sodium: 238 } },
  { id: 18, name: "Quinoa", emoji: "🌿", per100g: { calories: 120, protein: 4.4, carbs: 21, fat: 1.9, fiber: 2.8, sodium: 7 } },
];

const UNITS = ["g", "kg", "oz", "lb", "cup", "tbsp", "tsp", "piece"];

const UNIT_TO_GRAMS = {
  g: 1, kg: 1000, oz: 28.35, lb: 453.6,
  cup: 240, tbsp: 15, tsp: 5, piece: 100,
};

const SAVED_MEALS = [
  { name: "Post-Workout Meal", calories: 520, items: 3 },
  { name: "Light Lunch", calories: 380, items: 4 },
  { name: "High Protein Breakfast", calories: 450, items: 5 },
];

export default function MealCalculator() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [ingredients, setIngredients] = useState([
    { ...INGREDIENT_DB[0], amount: 200, unit: "g", id: Date.now() },
    { ...INGREDIENT_DB[1], amount: 1, unit: "cup", id: Date.now() + 1 },
    { ...INGREDIENT_DB[2], amount: 0.5, unit: "piece", id: Date.now() + 2 },
  ]);
  const [mealName, setMealName] = useState("My Custom Meal");
  const [saved, setSaved] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const filteredDB = INGREDIENT_DB.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()) &&
    !ingredients.find((ing) => ing.name === i.name)
  );

  const addIngredient = (ing) => {
    setIngredients((prev) => [...prev, { ...ing, amount: 100, unit: "g", id: Date.now() }]);
    setSearch("");
    setShowSearch(false);
  };

  const removeIngredient = (id) => {
    setIngredients((prev) => prev.filter((i) => i.id !== id));
  };

  const updateIngredient = (id, field, value) => {
    setIngredients((prev) =>
      prev.map((i) => (i.id === id ? { ...i, [field]: value } : i))
    );
  };

  // Calculate totals
  const totals = ingredients.reduce(
    (acc, ing) => {
      const grams = (parseFloat(ing.amount) || 0) * (UNIT_TO_GRAMS[ing.unit] || 1);
      const factor = grams / 100;
      return {
        calories: acc.calories + (ing.per100g.calories * factor),
        protein: acc.protein + (ing.per100g.protein * factor),
        carbs: acc.carbs + (ing.per100g.carbs * factor),
        fat: acc.fat + (ing.per100g.fat * factor),
        fiber: acc.fiber + (ing.per100g.fiber * factor),
        sodium: acc.sodium + (ing.per100g.sodium * factor),
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0 }
  );

  const macroTotal = totals.protein + totals.carbs + totals.fat;
  const macros = [
    { label: "Protein", val: totals.protein, color: "#4ade80", pct: macroTotal ? Math.round((totals.protein / macroTotal) * 100) : 0 },
    { label: "Carbs", val: totals.carbs, color: "#34d399", pct: macroTotal ? Math.round((totals.carbs / macroTotal) * 100) : 0 },
    { label: "Fat", val: totals.fat, color: "#6ee7b7", pct: macroTotal ? Math.round((totals.fat / macroTotal) * 100) : 0 },
  ];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div style={styles.root}>
      <div style={styles.blob1} />
      <div style={styles.blob2} />

      {/* TOPBAR */}
      <header style={styles.topbar}>
        <button style={styles.backBtn} onClick={() => navigate("/dashboard")}>
          ← Back
        </button>
        <a href="/" style={styles.logo}>
          <span>🌿</span>
          <span style={styles.logoText}>NutriPlan</span>
        </a>
        <div style={styles.topbarRight}>
          <button style={styles.navBtn} onClick={() => navigate("/recipes")}>Recipes</button>
          <button style={styles.navBtn} onClick={() => navigate("/dashboard")}>Dashboard</button>
          <div style={styles.avatar}>Y</div>
        </div>
      </header>

      <div style={styles.container}>
        {/* PAGE TITLE */}
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.pageTitle}>🧮 Meal Calculator</h1>
            <p style={styles.pageSub}>Build a custom meal and see real-time nutrition values</p>
          </div>
          {/* Saved meals */}
          <div style={styles.savedMeals}>
            <span style={styles.savedLabel}>Saved Meals:</span>
            {SAVED_MEALS.map((m) => (
              <button key={m.name} style={styles.savedPill}>
                {m.name} · {m.calories} kcal
              </button>
            ))}
          </div>
        </div>

        {/* MAIN SPLIT */}
        <div style={styles.splitLayout}>

          {/* LEFT — INGREDIENT INPUT */}
          <div style={styles.leftPanel}>
            {/* Meal name */}
            <div style={styles.mealNameRow}>
              <input
                style={styles.mealNameInput}
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                placeholder="Name your meal..."
              />
            </div>

            {/* Search to add */}
            <div style={styles.searchSection}>
              <button
                style={styles.addIngBtn}
                onClick={() => setShowSearch(!showSearch)}
              >
                + Add Ingredient
              </button>

              {showSearch && (
                <div style={styles.searchDropdown}>
                  <input
                    style={styles.searchInput}
                    placeholder="Search ingredients..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    autoFocus
                  />
                  <div style={styles.searchResults}>
                    {filteredDB.length === 0 ? (
                      <div style={styles.noResults}>No ingredients found</div>
                    ) : (
                      filteredDB.slice(0, 8).map((ing) => (
                        <button
                          key={ing.id}
                          style={styles.searchResultItem}
                          onClick={() => addIngredient(ing)}
                        >
                          <span style={styles.resultEmoji}>{ing.emoji}</span>
                          <span style={styles.resultName}>{ing.name}</span>
                          <span style={styles.resultCal}>{ing.per100g.calories} kcal/100g</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Ingredient list */}
            <div style={styles.ingredientList}>
              {ingredients.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🥗</div>
                  <p style={{ color: "rgba(232,245,232,0.4)" }}>Add ingredients to get started</p>
                </div>
              ) : (
                ingredients.map((ing) => (
                  <IngredientRow
                    key={ing.id}
                    ing={ing}
                    onUpdate={updateIngredient}
                    onRemove={removeIngredient}
                  />
                ))
              )}
            </div>

            {/* Totals row */}
            {ingredients.length > 0 && (
              <div style={styles.totalsRow}>
                <span style={styles.totalsLabel}>Total Ingredients: {ingredients.length}</span>
                <span style={styles.totalsLabel}>
                  ~{Math.round(ingredients.reduce((a, i) => a + (parseFloat(i.amount) || 0) * (UNIT_TO_GRAMS[i.unit] || 1), 0))}g
                </span>
              </div>
            )}
          </div>

          {/* RIGHT — NUTRITION SUMMARY */}
          <div style={styles.rightPanel}>
            <div style={styles.nutritionCard}>
              <h2 style={styles.nutritionTitle}>📊 Nutrition Summary</h2>

              {/* Big calorie display */}
              <div style={styles.calorieDisplay}>
                <div style={styles.calorieNumber}>
                  {Math.round(totals.calories)}
                </div>
                <div style={styles.calorieUnit}>calories</div>
              </div>

              {/* Macro rings */}
              <div style={styles.macroRings}>
                {macros.map((m) => (
                  <div key={m.label} style={styles.macroRing}>
                    <svg width="72" height="72" viewBox="0 0 72 72">
                      <circle cx="36" cy="36" r="28" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
                      <circle
                        cx="36" cy="36" r="28" fill="none"
                        stroke={m.color} strokeWidth="7"
                        strokeDasharray={`${2 * Math.PI * 28}`}
                        strokeDashoffset={`${2 * Math.PI * 28 * (1 - m.pct / 100)}`}
                        strokeLinecap="round"
                        transform="rotate(-90 36 36)"
                        style={{ transition: "stroke-dashoffset 0.5s ease" }}
                      />
                      <text x="36" y="36" textAnchor="middle" dominantBaseline="middle"
                        fill={m.color} fontSize="13" fontWeight="800">{m.pct}%</text>
                    </svg>
                    <div style={styles.macroRingLabel}>{m.label}</div>
                    <div style={{ ...styles.macroRingVal, color: m.color }}>
                      {Math.round(m.val)}g
                    </div>
                  </div>
                ))}
              </div>

              {/* Detailed breakdown */}
              <div style={styles.breakdown}>
                <div style={styles.breakdownTitle}>Full Breakdown</div>
                {[
                  { label: "Protein", val: `${Math.round(totals.protein)}g`, color: "#4ade80" },
                  { label: "Carbohydrates", val: `${Math.round(totals.carbs)}g`, color: "#34d399" },
                  { label: "Fat", val: `${Math.round(totals.fat)}g`, color: "#6ee7b7" },
                  { label: "Fiber", val: `${Math.round(totals.fiber)}g`, color: "rgba(232,245,232,0.6)" },
                  { label: "Sodium", val: `${Math.round(totals.sodium)}mg`, color: "rgba(232,245,232,0.6)" },
                ].map(({ label, val, color }) => (
                  <div key={label} style={styles.breakdownRow}>
                    <span style={styles.breakdownLabel}>{label}</span>
                    <div style={styles.breakdownBar}>
                      <div style={styles.breakdownBarBg}>
                        <div style={{
                          ...styles.breakdownBarFill,
                          width: `${Math.min((parseFloat(val) / (label === "Sodium" ? 2300 : label === "Fat" ? 65 : label === "Fiber" ? 25 : 200)) * 100, 100)}%`,
                          background: color,
                        }} />
                      </div>
                    </div>
                    <span style={{ ...styles.breakdownVal, color }}>{val}</span>
                  </div>
                ))}
              </div>

              {/* Daily value reference */}
              <div style={styles.dvNote}>* Based on a 2,000 kcal daily diet</div>

              {/* Action buttons */}
              <div style={styles.actionBtns}>
                <button
                  style={{ ...styles.saveBtn, ...(saved ? styles.saveBtnSuccess : {}) }}
                  onClick={handleSave}
                >
                  {saved ? "✅ Meal Saved!" : "💾 Save Meal"}
                </button>
                <button style={styles.exportBtn}>
                  📄 Export PDF
                </button>
              </div>
            </div>

            {/* Tips card */}
            <div style={styles.tipsCard}>
              <div style={styles.tipsTitle}>💡 Nutrition Tips</div>
              {totals.protein < 20 && (
                <div style={styles.tip}>⚠️ Consider adding a protein source like chicken or eggs.</div>
              )}
              {totals.sodium > 1500 && (
                <div style={styles.tip}>🧂 High sodium detected. Try reducing salty ingredients.</div>
              )}
              {totals.fiber < 5 && (
                <div style={styles.tip}>🌿 Add vegetables or legumes to increase fiber intake.</div>
              )}
              {totals.calories > 0 && totals.protein >= 20 && totals.sodium <= 1500 && totals.fiber >= 5 && (
                <div style={{ ...styles.tip, color: "#4ade80" }}>✅ Great balance of nutrients!</div>
              )}
              {totals.calories === 0 && (
                <div style={styles.tip}>Add ingredients to see personalized tips.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── INGREDIENT ROW ───────────────────────────────────────────────────────────
function IngredientRow({ ing, onUpdate, onRemove }) {
  const [hovered, setHovered] = useState(false);
  const grams = (parseFloat(ing.amount) || 0) * (UNIT_TO_GRAMS[ing.unit] || 1);
  const cals = Math.round(ing.per100g.calories * grams / 100);

  return (
    <div
      style={{
        ...styles.ingRow,
        background: hovered ? "rgba(74,222,128,0.05)" : "rgba(255,255,255,0.02)",
        borderColor: hovered ? "rgba(74,222,128,0.2)" : "rgba(255,255,255,0.07)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Emoji + Name */}
      <div style={styles.ingLeft}>
        <span style={styles.ingEmoji}>{ing.emoji}</span>
        <span style={styles.ingName}>{ing.name}</span>
      </div>

      {/* Amount input */}
      <input
        type="number"
        style={styles.amountInput}
        value={ing.amount}
        min="0"
        onChange={(e) => onUpdate(ing.id, "amount", e.target.value)}
      />

      {/* Unit selector */}
      <select
        style={styles.unitSelect}
        value={ing.unit}
        onChange={(e) => onUpdate(ing.id, "unit", e.target.value)}
      >
        {UNITS.map((u) => (
          <option key={u} value={u}>{u}</option>
        ))}
      </select>

      {/* Calories for this ingredient */}
      <span style={styles.ingCals}>{cals} kcal</span>

      {/* Remove */}
      <button
        style={styles.removeBtn}
        onClick={() => onRemove(ing.id)}
      >
        ✕
      </button>
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
  topbarRight: { display: "flex", alignItems: "center", gap: 12 },
  navBtn: {
    background: "none", border: "none", color: "rgba(232,245,232,0.5)",
    fontSize: 14, cursor: "pointer", padding: "6px 10px",
  },
  avatar: {
    width: 36, height: 36, borderRadius: "50%",
    background: "linear-gradient(135deg, #4ade80, #22c55e)",
    color: "#0a0f0a", display: "flex", alignItems: "center",
    justifyContent: "center", fontWeight: 800, fontSize: 15,
  },

  // CONTAINER
  container: {
    maxWidth: 1200, margin: "0 auto",
    padding: "32px 24px 80px", position: "relative", zIndex: 1,
  },

  // PAGE HEADER
  pageHeader: {
    display: "flex", alignItems: "flex-start",
    justifyContent: "space-between", flexWrap: "wrap",
    gap: 16, marginBottom: 32,
  },
  pageTitle: {
    fontSize: "clamp(24px, 3vw, 32px)", fontWeight: 800,
    letterSpacing: "-0.5px", margin: "0 0 6px", color: "#e8f5e8",
  },
  pageSub: { fontSize: 14, color: "rgba(232,245,232,0.4)", margin: 0 },
  savedMeals: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  savedLabel: { fontSize: 13, color: "rgba(232,245,232,0.35)" },
  savedPill: {
    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
    color: "rgba(232,245,232,0.5)", padding: "6px 12px",
    borderRadius: 100, fontSize: 12, cursor: "pointer",
  },

  // SPLIT LAYOUT
  splitLayout: {
    display: "grid", gridTemplateColumns: "1fr 360px",
    gap: 24, alignItems: "start",
  },

  // LEFT PANEL
  leftPanel: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 16, padding: "24px",
  },

  // Meal name
  mealNameRow: { marginBottom: 20 },
  mealNameInput: {
    width: "100%", background: "transparent",
    border: "none", borderBottom: "2px solid rgba(74,222,128,0.3)",
    color: "#e8f5e8", fontSize: 22, fontWeight: 800,
    outline: "none", padding: "4px 0", letterSpacing: "-0.5px",
    fontFamily: "inherit", boxSizing: "border-box",
  },

  // Search section
  searchSection: { marginBottom: 20, position: "relative" },
  addIngBtn: {
    background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.25)",
    color: "#4ade80", padding: "10px 20px", borderRadius: 10,
    fontSize: 14, fontWeight: 700, cursor: "pointer", width: "100%",
  },
  searchDropdown: {
    position: "absolute", top: "110%", left: 0, right: 0,
    background: "#111a11", border: "1px solid rgba(74,222,128,0.2)",
    borderRadius: 12, zIndex: 50, overflow: "hidden",
    boxShadow: "0 16px 40px rgba(0,0,0,0.4)",
  },
  searchInput: {
    width: "100%", background: "rgba(255,255,255,0.05)",
    border: "none", borderBottom: "1px solid rgba(255,255,255,0.08)",
    color: "#e8f5e8", fontSize: 14, padding: "12px 16px",
    outline: "none", fontFamily: "inherit", boxSizing: "border-box",
  },
  searchResults: { maxHeight: 280, overflowY: "auto" },
  noResults: { padding: "16px", fontSize: 13, color: "rgba(232,245,232,0.35)", textAlign: "center" },
  searchResultItem: {
    width: "100%", display: "flex", alignItems: "center", gap: 12,
    background: "none", border: "none", padding: "10px 16px",
    cursor: "pointer", transition: "background 0.15s", textAlign: "left",
  },
  resultEmoji: { fontSize: 20, width: 28 },
  resultName: { flex: 1, fontSize: 14, color: "#e8f5e8", fontWeight: 500 },
  resultCal: { fontSize: 12, color: "rgba(232,245,232,0.35)" },

  // Ingredient list
  ingredientList: { display: "flex", flexDirection: "column", gap: 8, minHeight: 100 },
  emptyState: { textAlign: "center", padding: "40px 0" },

  // Ingredient row
  ingRow: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "10px 12px", borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.07)",
    transition: "all 0.2s",
  },
  ingLeft: { display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 },
  ingEmoji: { fontSize: 20, flexShrink: 0 },
  ingName: {
    fontSize: 14, fontWeight: 600, color: "#e8f5e8",
    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
  },
  amountInput: {
    width: 64, background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 7, padding: "6px 8px",
    color: "#e8f5e8", fontSize: 14, fontWeight: 600,
    outline: "none", textAlign: "center", flexShrink: 0,
    fontFamily: "inherit",
  },
  unitSelect: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 7, padding: "6px 8px",
    color: "#e8f5e8", fontSize: 13, cursor: "pointer",
    outline: "none", flexShrink: 0,
    fontFamily: "inherit",
  },
  ingCals: {
    fontSize: 13, fontWeight: 700, color: "#4ade80",
    minWidth: 60, textAlign: "right", flexShrink: 0,
  },
  removeBtn: {
    background: "rgba(239,68,68,0.1)", border: "none",
    color: "rgba(239,68,68,0.6)", width: 26, height: 26,
    borderRadius: 6, cursor: "pointer", fontSize: 12,
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },

  totalsRow: {
    display: "flex", justifyContent: "space-between",
    marginTop: 16, paddingTop: 14,
    borderTop: "1px solid rgba(255,255,255,0.06)",
    fontSize: 13, color: "rgba(232,245,232,0.35)",
  },
  totalsLabel: {},

  // RIGHT PANEL
  rightPanel: { display: "flex", flexDirection: "column", gap: 16 },
  nutritionCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(74,222,128,0.15)",
    borderRadius: 16, padding: "24px",
  },
  nutritionTitle: { fontSize: 16, fontWeight: 700, color: "#e8f5e8", margin: "0 0 20px" },

  // Calorie display
  calorieDisplay: { textAlign: "center", marginBottom: 24 },
  calorieNumber: {
    fontSize: 64, fontWeight: 900, color: "#4ade80",
    letterSpacing: "-3px", lineHeight: 1,
    transition: "all 0.3s",
  },
  calorieUnit: { fontSize: 14, color: "rgba(232,245,232,0.4)", marginTop: 4 },

  // Macro rings
  macroRings: {
    display: "flex", justifyContent: "space-around",
    marginBottom: 24, paddingBottom: 20,
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  macroRing: { display: "flex", flexDirection: "column", alignItems: "center", gap: 4 },
  macroRingLabel: { fontSize: 12, color: "rgba(232,245,232,0.45)" },
  macroRingVal: { fontSize: 14, fontWeight: 800 },

  // Breakdown
  breakdown: { marginBottom: 16 },
  breakdownTitle: {
    fontSize: 12, fontWeight: 700, letterSpacing: "1px",
    textTransform: "uppercase", color: "rgba(232,245,232,0.3)",
    marginBottom: 14,
  },
  breakdownRow: {
    display: "flex", alignItems: "center", gap: 10, marginBottom: 10,
  },
  breakdownLabel: { fontSize: 13, color: "rgba(232,245,232,0.5)", width: 110, flexShrink: 0 },
  breakdownBar: { flex: 1 },
  breakdownBarBg: {
    height: 5, background: "rgba(255,255,255,0.06)",
    borderRadius: 100, overflow: "hidden",
  },
  breakdownBarFill: { height: "100%", borderRadius: 100, transition: "width 0.4s ease" },
  breakdownVal: { fontSize: 13, fontWeight: 700, width: 52, textAlign: "right", flexShrink: 0 },

  dvNote: { fontSize: 11, color: "rgba(232,245,232,0.2)", marginBottom: 20, textAlign: "center" },

  // Action buttons
  actionBtns: { display: "flex", gap: 10 },
  saveBtn: {
    flex: 1, background: "linear-gradient(135deg, #4ade80, #22c55e)",
    color: "#0a0f0a", border: "none", borderRadius: 10,
    padding: "12px", fontSize: 14, fontWeight: 700,
    cursor: "pointer", transition: "all 0.3s", fontFamily: "inherit",
  },
  saveBtnSuccess: { background: "linear-gradient(135deg, #22c55e, #16a34a)" },
  exportBtn: {
    flex: 1, background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "rgba(232,245,232,0.6)", borderRadius: 10,
    padding: "12px", fontSize: 14, fontWeight: 600,
    cursor: "pointer", fontFamily: "inherit",
  },

  // Tips card
  tipsCard: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 14, padding: "18px",
  },
  tipsTitle: { fontSize: 14, fontWeight: 700, color: "#e8f5e8", marginBottom: 12 },
  tip: { fontSize: 13, color: "rgba(232,245,232,0.5)", lineHeight: 1.5, marginBottom: 8 },
};
