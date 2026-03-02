import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import ProfileDropdown from "../components/common/ProfileDropdown";
import { updateDoc } from "firebase/firestore";
import { uploadRecipePhoto } from "../hooks/usePhotoUpload";

export default function RecipeDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState([]);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [servings, setServings] = useState(2);
  const [copied, setCopied] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState(false);
  const [newPhotoFile, setNewPhotoFile] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // ── Fetch recipe from Firestore ───────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    const fetchRecipe = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "recipes", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() };
          setRecipe(data);
          setIsFavorite(data.favorite || false);
          setServings(data.servings || 2);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error("Error fetching recipe:", err);
        setNotFound(true);
      }
      setLoading(false);
    };
    fetchRecipe();
  }, [id]);

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
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Loading screen ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <div style={{ fontSize: 48 }}>🌿</div>
        <p style={{ color: "rgba(232,245,232,0.4)", fontSize: 16 }}>
          Loading recipe...
        </p>
      </div>
    );
  }

  // ── Not found screen ──────────────────────────────────────────────────────
  if (notFound || !recipe) {
    return (
      <div style={styles.loadingScreen}>
        <div style={{ fontSize: 48 }}>🍽️</div>
        <p style={{ color: "rgba(232,245,232,0.4)", fontSize: 16, margin: "12px 0" }}>
          Recipe not found
        </p>
        <button style={styles.backToLibBtn} onClick={() => navigate("/recipes")}>
          ← Back to Library
        </button>
      </div>
    );
  }

  // ── Nutrition scaling ─────────────────────────────────────────────────────
  const baseServings = recipe.servings || 2;
  const scale = servings / baseServings;
  const nutrition = recipe.nutrition || {};
  const calories = Math.round((nutrition.calories || 0) * scale);

  // Parse nutrition values for display
  const parseNum = (val) => parseFloat(String(val).replace(/[^\d.]/g, "")) || 0;
  const protein = Math.round(parseNum(nutrition.protein) * scale);
  const carbs = Math.round(parseNum(nutrition.carbs) * scale);
  const fat = Math.round(parseNum(nutrition.fat) * scale);
  const fiber = Math.round(parseNum(nutrition.fiber) * scale);
  const sodium = Math.round(parseNum(nutrition.sodium) * scale);

  const macroTotal = protein + carbs + fat || 1;
  const macros = [
    { label: "Protein", val: protein, color: "#4ade80", pct: Math.round((protein / macroTotal) * 100) },
    { label: "Carbs", val: carbs, color: "#34d399", pct: Math.round((carbs / macroTotal) * 100) },
    { label: "Fat", val: fat, color: "#6ee7b7", pct: Math.round((fat / macroTotal) * 100) },
  ];

  // ── Parse ingredients and steps ───────────────────────────────────────────
  const ingredients = Array.isArray(recipe.ingredients)
    ? recipe.ingredients
    : typeof recipe.ingredients === "string"
    ? recipe.ingredients.split("\n").filter(Boolean)
    : [];

  const steps = Array.isArray(recipe.steps)
    ? recipe.steps
    : typeof recipe.steps === "string"
    ? recipe.steps.split("\n").filter(Boolean)
    : [];

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
          <ProfileDropdown />
        </div>
      </header>

      <div style={styles.container}>
        {/* HERO */}
        <div style={styles.hero}>
          <div style={styles.heroEmoji} onClick={() => setEditingPhoto(true)} title="Click to change photo">
  {recipe.photoURL && !editingPhoto ? (
    <img src={recipe.photoURL} alt={recipe.name} style={styles.heroPhoto} />
  ) : (
    <span>{recipe.emoji || "🍽️"}</span>
  )}
  <div style={styles.photoEditHint}>📷 Change photo</div>
</div>

{editingPhoto && (
  <div style={styles.photoEditBar}>
    <input type="file" accept="image/*" id="heroPhoto" style={{ display: "none" }}
      onChange={async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadingPhoto(true);
        try {
          const url = await uploadRecipePhoto(file, recipe.id, user.uid);
          await updateDoc(doc(db, "recipes", recipe.id), { photoURL: url });
          setRecipe((prev) => ({ ...prev, photoURL: url }));
          setEditingPhoto(false);
        } catch (err) {
          console.error(err);
        }
        setUploadingPhoto(false);
      }}
    />
    <label htmlFor="heroPhoto" style={styles.photoEditBtn}>
      {uploadingPhoto ? "Uploading..." : "📷 Choose Photo"}
    </label>
    <button style={styles.photoEditCancel} onClick={() => setEditingPhoto(false)}>Cancel</button>
  </div>
)}
          <div style={styles.heroOverlay}>
            <div style={styles.heroBadgeRow}>
              {recipe.tag && recipe.tag !== "None" && (
                <span style={styles.tagBadge}>{recipe.tag}</span>
              )}
              {recipe.difficulty && (
                <span style={styles.diffBadge}>⭐ {recipe.difficulty}</span>
              )}
              {recipe.source && (
                <a href={recipe.source} target="_blank" rel="noreferrer" style={styles.sourceBadge}>
                  🌐 View Original
                </a>
              )}
            </div>
            <h1 style={styles.heroTitle}>{recipe.name}</h1>
            {recipe.description && (
              <p style={styles.heroDesc}>{recipe.description}</p>
            )}
            <div style={styles.heroMeta}>
              {[
                { icon: "👥", label: "Servings", val: servings },
                recipe.prepTime && { icon: "⏱", label: "Prep", val: recipe.prepTime },
                recipe.cookTime && { icon: "🔥", label: "Cook", val: recipe.cookTime },
                recipe.time && !recipe.cookTime && { icon: "⏱", label: "Time", val: recipe.time },
                recipe.difficulty && { icon: "📊", label: "Level", val: recipe.difficulty },
              ].filter(Boolean).map(({ icon, label, val }) => (
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
            <button style={styles.servBtn} onClick={() => setServings(Math.max(1, servings - 1))}>−</button>
            <span style={styles.servNum}>{servings}</span>
            <button style={styles.servBtn} onClick={() => setServings(servings + 1)}>+</button>
          </div>
          <span style={styles.servingsNote}>Nutrition values update automatically</span>
        </div>

        {/* MAIN CONTENT */}
        <div style={styles.content}>
          {/* LEFT — INGREDIENTS + STEPS */}
          <div style={styles.leftCol}>
            {/* INGREDIENTS */}
            <div style={styles.panel}>
              <div style={styles.panelHeader}>
                <h2 style={styles.panelTitle}>🧺 Ingredients</h2>
                <span style={styles.panelCount}>{ingredients.length} items</span>
              </div>

              {ingredients.length === 0 ? (
                <p style={styles.emptyMsg}>No ingredients listed for this recipe.</p>
              ) : (
                <div style={styles.ingredientList}>
                  {ingredients.map((ing, i) => {
                    const checked = checkedIngredients.includes(i);
                    const ingText = typeof ing === "object" ? ing.text || ing.name || JSON.stringify(ing) : ing;
                    return (
                      <div
                        key={i}
                        style={{ ...styles.ingredientRow, opacity: checked ? 0.4 : 1 }}
                        onClick={() => toggleIngredient(i)}
                      >
                        <div style={{ ...styles.checkbox, ...(checked ? styles.checkboxChecked : {}) }}>
                          {checked && "✓"}
                        </div>
                        <span style={styles.ingredientName}>{ingText}</span>
                      </div>
                    );
                  })}
                </div>
              )}
              <button style={styles.clearCheckBtn} onClick={() => setCheckedIngredients([])}>
                Clear Checklist
              </button>
            </div>

            {/* INSTRUCTIONS */}
            {steps.length > 0 && (
              <div style={{ ...styles.panel, marginTop: 20 }}>
                <div style={styles.panelHeader}>
                  <h2 style={styles.panelTitle}>📋 Instructions</h2>
                  <span style={styles.panelCount}>{steps.length} steps</span>
                </div>
                <div style={styles.stepsList}>
                  {steps.map((step, i) => {
                    const done = completedSteps.includes(i);
                    const stepText = typeof step === "object" ? step.text || step.desc || JSON.stringify(step) : step;
                    return (
                      <div
                        key={i}
                        style={{ ...styles.stepRow, opacity: done ? 0.45 : 1 }}
                        onClick={() => toggleStep(i)}
                      >
                        <div style={{ ...styles.stepNum, ...(done ? styles.stepNumDone : {}) }}>
                          {done ? "✓" : i + 1}
                        </div>
                        <div style={styles.stepContent}>
                          <div style={styles.stepDesc}>{stepText}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — NUTRITION */}
          <div style={styles.rightCol}>
            <div style={styles.panel}>
              <div style={styles.panelHeader}>
                <h2 style={styles.panelTitle}>📊 Nutrition Facts</h2>
                <span style={styles.panelCount}>Per serving</span>
              </div>

              <div style={styles.calorieBox}>
                <div style={styles.calorieNum}>{calories || "—"}</div>
                <div style={styles.calorieLabel}>Calories</div>
              </div>

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

              {(fiber > 0 || sodium > 0) && (
                <div style={styles.nutriGrid}>
                  {fiber > 0 && (
                    <div style={styles.nutriRow}>
                      <span style={styles.nutriLabel}>Fiber</span>
                      <span style={styles.nutriVal}>{fiber}g</span>
                    </div>
                  )}
                  {sodium > 0 && (
                    <div style={styles.nutriRow}>
                      <span style={styles.nutriLabel}>Sodium</span>
                      <span style={styles.nutriVal}>{sodium}mg</span>
                    </div>
                  )}
                </div>
              )}

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
  loadingScreen: {
    minHeight: "100vh", background: "#0a0f0a",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", gap: 16,
  },
  backToLibBtn: {
    background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.25)",
    color: "#4ade80", padding: "10px 20px", borderRadius: 8,
    fontSize: 14, fontWeight: 600, cursor: "pointer",
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
  container: {
    maxWidth: 1100, margin: "0 auto",
    padding: "32px 24px 80px", position: "relative", zIndex: 1,
  },
  hero: {
    borderRadius: 20, overflow: "hidden", marginBottom: 20,
    background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.12)",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    minHeight: 240, padding: "40px 32px",
  },
  heroEmoji: { fontSize: 80, marginBottom: 16 },
  heroOverlay: { textAlign: "center", maxWidth: 600 },
  heroBadgeRow: { display: "flex", gap: 10, justifyContent: "center", marginBottom: 12, flexWrap: "wrap" },
  tagBadge: {
    background: "rgba(74,222,128,0.15)", border: "1px solid rgba(74,222,128,0.3)",
    color: "#4ade80", padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 700,
  },
  diffBadge: {
    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
    color: "rgba(232,245,232,0.6)", padding: "4px 12px", borderRadius: 100, fontSize: 12,
  },
  sourceBadge: {
    background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)",
    color: "#4ade80", padding: "4px 12px", borderRadius: 100,
    fontSize: 12, textDecoration: "none",
  },
  heroTitle: {
    fontSize: "clamp(24px, 4vw, 42px)", fontWeight: 800,
    letterSpacing: "-1px", margin: "0 0 10px", color: "#e8f5e8",
  },
  heroDesc: { fontSize: 15, color: "rgba(232,245,232,0.5)", lineHeight: 1.6, margin: "0 0 24px" },
  heroMeta: { display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" },
  metaChip: {
    display: "flex", alignItems: "center", gap: 10,
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10, padding: "10px 14px",
  },
  metaIcon: { fontSize: 18 },
  metaLabel: { fontSize: 11, color: "rgba(232,245,232,0.4)", textTransform: "uppercase", letterSpacing: "0.5px" },
  metaVal: { fontSize: 14, fontWeight: 700, color: "#e8f5e8" },
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
  content: { display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" },
  leftCol: {},
  rightCol: {},
  panel: {
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 16, padding: "22px",
  },
  panelHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
  panelTitle: { fontSize: 17, fontWeight: 700, color: "#e8f5e8", margin: 0 },
  panelCount: { fontSize: 12, color: "rgba(232,245,232,0.35)" },
  emptyMsg: { fontSize: 14, color: "rgba(232,245,232,0.35)", textAlign: "center", padding: "20px 0" },
  ingredientList: { display: "flex", flexDirection: "column", gap: 4 },
  ingredientRow: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "9px 10px", borderRadius: 8, cursor: "pointer",
  },
  checkbox: {
    width: 20, height: 20, borderRadius: 6,
    border: "2px solid rgba(255,255,255,0.15)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 12, color: "#0a0f0a", flexShrink: 0,
  },
  checkboxChecked: { background: "#4ade80", borderColor: "#4ade80" },
  ingredientName: { fontSize: 14, color: "rgba(232,245,232,0.75)", lineHeight: 1.4 },
  clearCheckBtn: {
    marginTop: 16, background: "none", border: "1px solid rgba(255,255,255,0.08)",
    color: "rgba(232,245,232,0.35)", padding: "7px 14px",
    borderRadius: 8, fontSize: 13, cursor: "pointer", width: "100%",
  },
  stepsList: { display: "flex", flexDirection: "column", gap: 12 },
  stepRow: {
    display: "flex", gap: 14, cursor: "pointer",
    padding: "12px", borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.05)",
  },
  stepNum: {
    width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
    background: "rgba(74,222,128,0.12)", border: "2px solid rgba(74,222,128,0.3)",
    color: "#4ade80", display: "flex", alignItems: "center",
    justifyContent: "center", fontSize: 13, fontWeight: 800,
  },
  stepNumDone: { background: "#4ade80", color: "#0a0f0a", borderColor: "#4ade80" },
  stepContent: {},
  stepDesc: { fontSize: 13, color: "rgba(232,245,232,0.6)", lineHeight: 1.5 },
  calorieBox: { textAlign: "center", padding: "20px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 18 },
  calorieNum: { fontSize: 52, fontWeight: 900, color: "#4ade80", letterSpacing: "-2px", lineHeight: 1 },
  calorieLabel: { fontSize: 13, color: "rgba(232,245,232,0.4)", marginTop: 4 },
  macroList: { display: "flex", flexDirection: "column", gap: 14, marginBottom: 18 },
  macroRow: {},
  macroTop: { display: "flex", justifyContent: "space-between", marginBottom: 6 },
  macroLabel: { fontSize: 13, color: "rgba(232,245,232,0.6)", fontWeight: 600 },
  macroVal: { fontSize: 13, fontWeight: 700 },
  macroPct: { color: "rgba(232,245,232,0.35)", fontWeight: 400 },
  barBg: { height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 100, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 100, transition: "width 0.4s ease" },
  nutriGrid: { borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16, display: "flex", flexDirection: "column", gap: 10 },
  nutriRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  nutriLabel: { fontSize: 13, color: "rgba(232,245,232,0.45)" },
  nutriVal: { fontSize: 13, fontWeight: 700, color: "#e8f5e8" },
  nutriNote: { fontSize: 11, color: "rgba(232,245,232,0.2)", marginTop: 14, textAlign: "center" },
  mealPlanSub: { fontSize: 13, color: "rgba(232,245,232,0.4)", margin: "6px 0 16px" },
  mealPlanBtn: {
    width: "100%", background: "linear-gradient(135deg, #4ade80, #22c55e)",
    color: "#0a0f0a", border: "none", borderRadius: 10,
    padding: "12px", fontSize: 14, fontWeight: 700, cursor: "pointer",
    marginBottom: 10, fontFamily: "inherit",
  },
  calcBtn: {
    width: "100%", background: "rgba(74,222,128,0.08)",
    border: "1px solid rgba(74,222,128,0.2)", color: "#4ade80",
    borderRadius: 10, padding: "12px", fontSize: 14,
    fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
  },
  heroPhoto: { width: 120, height: 120, borderRadius: 16, objectFit: "cover" },
photoEditHint: {
  fontSize: 11, color: "rgba(232,245,232,0.3)", marginTop: 6,
  cursor: "pointer",
},
photoEditBar: {
  display: "flex", gap: 10, alignItems: "center",
  marginTop: 12, justifyContent: "center",
},
photoEditBtn: {
  background: "rgba(74,222,128,0.15)", border: "1px solid rgba(74,222,128,0.3)",
  color: "#4ade80", padding: "8px 18px", borderRadius: 8,
  fontSize: 13, fontWeight: 600, cursor: "pointer",
},
photoEditCancel: {
  background: "none", border: "1px solid rgba(255,255,255,0.1)",
  color: "rgba(232,245,232,0.4)", padding: "8px 14px",
  borderRadius: 8, fontSize: 13, cursor: "pointer",
},
};
