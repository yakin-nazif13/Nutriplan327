import { useState } from "react";
import { useNavigate } from "react-router-dom";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const RECIPES = [
  { id: 1, name: "Grilled Salmon Salad", calories: 420, protein: "35g", carbs: "10g", time: "20 min", tag: "Low-Carb", emoji: "🐟", difficulty: "Easy", servings: 2, favorite: true, collection: "all" },
  { id: 2, name: "Chicken & Broccoli Stir Fry", calories: 350, protein: "30g", carbs: "22g", time: "25 min", tag: "Gluten-Free", emoji: "🥦", difficulty: "Medium", servings: 3, favorite: false, collection: "all" },
  { id: 3, name: "Avocado Toast with Eggs", calories: 280, protein: "12g", carbs: "30g", time: "10 min", tag: "Vegan", emoji: "🥑", difficulty: "Easy", servings: 1, favorite: true, collection: "favorites" },
  { id: 4, name: "Quinoa Stuffed Bell Peppers", calories: 330, protein: "11g", carbs: "45g", time: "30 min", tag: "Vegan", emoji: "🫑", difficulty: "Medium", servings: 4, favorite: false, collection: "all" },
  { id: 5, name: "Honey Garlic Shrimp", calories: 320, protein: "28g", carbs: "18g", time: "15 min", tag: "Gluten-Free", emoji: "🍤", difficulty: "Easy", servings: 2, favorite: false, collection: "mine" },
  { id: 6, name: "Caprese Salad", calories: 240, protein: "6g", carbs: "8g", time: "15 min", tag: "Vegan", emoji: "🍅", difficulty: "Easy", servings: 2, favorite: true, collection: "favorites" },
  { id: 7, name: "Greek Chicken Bowl", calories: 450, protein: "38g", carbs: "32g", time: "25 min", tag: "Gluten-Free", emoji: "🫙", difficulty: "Medium", servings: 2, favorite: false, collection: "all" },
  { id: 8, name: "Berry Smoothie Bowl", calories: 350, protein: "8g", carbs: "60g", time: "10 min", tag: "Vegan", emoji: "🫐", difficulty: "Easy", servings: 1, favorite: true, collection: "favorites" },
  { id: 9, name: "Beef Tacos", calories: 520, protein: "32g", carbs: "40g", time: "20 min", tag: "None", emoji: "🌮", difficulty: "Easy", servings: 4, favorite: false, collection: "mine" },
  { id: 10, name: "Lentil Soup", calories: 290, protein: "18g", carbs: "42g", time: "35 min", tag: "Vegan", emoji: "🥣", difficulty: "Easy", servings: 4, favorite: false, collection: "all" },
  { id: 11, name: "Baked Cod with Veggies", calories: 310, protein: "34g", carbs: "14g", time: "30 min", tag: "Low-Carb", emoji: "🐠", difficulty: "Medium", servings: 2, favorite: false, collection: "mine" },
  { id: 12, name: "Strawberry Spinach Salad", calories: 200, protein: "5g", carbs: "22g", time: "10 min", tag: "Vegan", emoji: "🍓", difficulty: "Easy", servings: 2, favorite: true, collection: "favorites" },
];

const DIETARY_FILTERS = ["All", "Vegan", "Gluten-Free", "Low-Carb"];
const COLLECTIONS = [
  { key: "all", label: "All Recipes", icon: "📚" },
  { key: "favorites", label: "Favorites", icon: "❤️" },
  { key: "mine", label: "My Recipes", icon: "👨‍🍳" },
];

export default function RecipeLibrary() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [dietary, setDietary] = useState("All");
  const [collection, setCollection] = useState("all");
  const [favorites, setFavorites] = useState(
    RECIPES.filter((r) => r.favorite).map((r) => r.id)
  );
  const [importOpen, setImportOpen] = useState(false);
  const [importUrl, setImportUrl] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const filtered = RECIPES.filter((r) => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase());
    const matchDiet = dietary === "All" || r.tag === dietary;
    const matchCollection =
      collection === "all"
        ? true
        : collection === "favorites"
        ? favorites.includes(r.id)
        : r.collection === "mine";
    return matchSearch && matchDiet && matchCollection;
  });

  return (
    <div style={styles.root}>
      {/* Background blobs */}
      <div style={styles.blob1} />
      <div style={styles.blob2} />

      {/* TOPBAR */}
      <header style={styles.topbar}>
        <a href="/" style={styles.logo}>
          <span style={{ fontSize: 20 }}>🌿</span>
          <span style={styles.logoText}>NutriPlan</span>
        </a>
        <div style={styles.topbarRight}>
          <button style={styles.importBtn} onClick={() => setImportOpen(true)}>
            + Import from URL
          </button>
          <button style={styles.addBtn} onClick={() => navigate("/recipes/new")}>
            Add Recipe
          </button>
          <div style={styles.avatar}>Y</div>
        </div>
        {/* Mobile sidebar toggle */}
        <button style={styles.menuToggle} onClick={() => setSidebarOpen(!sidebarOpen)}>
          ☰
        </button>
      </header>

      <div style={styles.layout}>
        {/* SIDEBAR */}
        <aside style={{ ...styles.sidebar, ...(sidebarOpen ? styles.sidebarOpen : {}) }}>
          <div style={styles.sidebarSection}>
            <p style={styles.sidebarHeading}>Collections</p>
            {COLLECTIONS.map((c) => (
              <button
                key={c.key}
                style={{
                  ...styles.sidebarItem,
                  ...(collection === c.key ? styles.sidebarItemActive : {}),
                }}
                onClick={() => { setCollection(c.key); setSidebarOpen(false); }}
              >
                <span>{c.icon}</span>
                <span>{c.label}</span>
              </button>
            ))}
          </div>

          <div style={styles.sidebarSection}>
            <p style={styles.sidebarHeading}>Dietary Filters</p>
            {DIETARY_FILTERS.filter((d) => d !== "All").map((d) => (
              <button
                key={d}
                style={{
                  ...styles.sidebarItem,
                  ...(dietary === d ? styles.sidebarItemActive : {}),
                }}
                onClick={() => { setDietary(dietary === d ? "All" : d); setSidebarOpen(false); }}
              >
                <span>{d === "Vegan" ? "🌱" : d === "Gluten-Free" ? "🌾" : "📉"}</span>
                <span>{d}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main style={styles.main}>
          {/* Search bar */}
          <div style={styles.searchRow}>
            <div style={styles.searchWrapper}>
              <span style={styles.searchIcon}>🔍</span>
              <input
                style={styles.searchInput}
                placeholder="Search recipes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button style={styles.clearBtn} onClick={() => setSearch("")}>✕</button>
              )}
            </div>
            {/* Mobile filter pills */}
            <div style={styles.mobilePills}>
              {DIETARY_FILTERS.map((d) => (
                <button
                  key={d}
                  style={{
                    ...styles.pill,
                    ...(dietary === d ? styles.pillActive : {}),
                  }}
                  onClick={() => setDietary(d)}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Results count */}
          <p style={styles.resultsCount}>
            {filtered.length} recipe{filtered.length !== 1 ? "s" : ""} found
          </p>

          {/* Recipe Grid */}
          {filtered.length === 0 ? (
            <div style={styles.empty}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🍽️</div>
              <p style={{ color: "rgba(232,245,232,0.4)", fontSize: 16 }}>No recipes found</p>
              <p style={{ color: "rgba(232,245,232,0.25)", fontSize: 14 }}>Try adjusting your filters</p>
            </div>
          ) : (
            <div style={styles.grid}>
              {filtered.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  isFavorite={favorites.includes(recipe.id)}
                  onToggleFavorite={() => toggleFavorite(recipe.id)}
                  onClick={() => navigate(`/recipes/${recipe.id}`)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* IMPORT MODAL */}
      {importOpen && (
        <div style={styles.modalOverlay} onClick={() => setImportOpen(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={{ fontSize: 32 }}>🤖</div>
              <div>
                <h3 style={styles.modalTitle}>Import Recipe from URL</h3>
                <p style={styles.modalSub}>Paste any recipe URL and AI will extract it</p>
              </div>
              <button style={styles.closeBtn} onClick={() => setImportOpen(false)}>✕</button>
            </div>
            <input
              style={styles.modalInput}
              placeholder="https://www.allrecipes.com/recipe/..."
              value={importUrl}
              onChange={(e) => setImportUrl(e.target.value)}
            />
            <div style={styles.modalSites}>
              {["AllRecipes", "Food Network", "NYT Cooking", "Tasty"].map((s) => (
                <span key={s} style={styles.sitePill}>{s}</span>
              ))}
            </div>
            <button style={styles.importModalBtn}>
              Import Recipe →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── RECIPE CARD ──────────────────────────────────────────────────────────────
function RecipeCard({ recipe, isFavorite, onToggleFavorite, onClick }) {
  const [hovered, setHovered] = useState(false);

  const tagColors = {
    "Vegan": "#4ade80",
    "Gluten-Free": "#34d399",
    "Low-Carb": "#6ee7b7",
  };

  return (
    <div
      style={{
        ...styles.card,
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        borderColor: hovered ? "rgba(74,222,128,0.3)" : "rgba(255,255,255,0.06)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      {/* Image area */}
      <div style={styles.cardImg}>
        <span style={styles.cardEmoji}>{recipe.emoji}</span>
        {/* Favorite button */}
        <button
          style={styles.favBtn}
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
        >
          {isFavorite ? "❤️" : "🤍"}
        </button>
        {/* Tag badge */}
        {recipe.tag !== "None" && (
          <span style={{ ...styles.tagBadge, background: `${tagColors[recipe.tag]}22`, color: tagColors[recipe.tag], borderColor: `${tagColors[recipe.tag]}44` }}>
            {recipe.tag}
          </span>
        )}
      </div>

      {/* Card body */}
      <div style={styles.cardBody}>
        <h3 style={styles.cardTitle}>{recipe.name}</h3>
        <div style={styles.cardMeta}>
          <span style={styles.metaItem}>🍽 {recipe.servings} servings</span>
          <span style={styles.metaItem}>⏱ {recipe.time}</span>
          <span style={styles.metaItem}>📊 {recipe.difficulty}</span>
        </div>
        <div style={styles.cardNutrition}>
          <div style={styles.nutriChip}>
            <span style={styles.nutriVal}>{recipe.calories}</span>
            <span style={styles.nutriLabel}>kcal</span>
          </div>
          <div style={styles.nutriChip}>
            <span style={{ ...styles.nutriVal, color: "#4ade80" }}>{recipe.protein}</span>
            <span style={styles.nutriLabel}>protein</span>
          </div>
          <div style={styles.nutriChip}>
            <span style={{ ...styles.nutriVal, color: "#34d399" }}>{recipe.carbs}</span>
            <span style={styles.nutriLabel}>carbs</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = {
  root: {
    minHeight: "100vh",
    background: "#0a0f0a",
    color: "#e8f5e8",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    overflowX: "hidden",
    position: "relative",
  },
  blob1: {
    position: "fixed", top: "-150px", left: "-150px",
    width: 400, height: 400,
    background: "radial-gradient(circle, rgba(74,222,128,0.1) 0%, transparent 70%)",
    borderRadius: "50%", pointerEvents: "none", zIndex: 0,
  },
  blob2: {
    position: "fixed", bottom: "-100px", right: "-100px",
    width: 350, height: 350,
    background: "radial-gradient(circle, rgba(52,211,153,0.07) 0%, transparent 70%)",
    borderRadius: "50%", pointerEvents: "none", zIndex: 0,
  },

  // TOPBAR
  topbar: {
    position: "sticky", top: 0, zIndex: 100,
    background: "rgba(10,15,10,0.9)", backdropFilter: "blur(20px)",
    borderBottom: "1px solid rgba(74,222,128,0.1)",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 24px", height: 64,
  },
  logo: { display: "flex", alignItems: "center", gap: 8, textDecoration: "none" },
  logoText: { fontSize: 18, fontWeight: 700, color: "#4ade80" },
  topbarRight: { display: "flex", alignItems: "center", gap: 12 },
  importBtn: {
    background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.25)",
    color: "#4ade80", padding: "8px 16px", borderRadius: 8,
    fontSize: 14, fontWeight: 600, cursor: "pointer",
  },
  addBtn: {
    background: "linear-gradient(135deg, #4ade80, #22c55e)",
    color: "#0a0f0a", border: "none", padding: "8px 18px",
    borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer",
  },
  avatar: {
    width: 36, height: 36, borderRadius: "50%",
    background: "linear-gradient(135deg, #4ade80, #22c55e)",
    color: "#0a0f0a", display: "flex", alignItems: "center",
    justifyContent: "center", fontWeight: 800, fontSize: 15,
  },
  menuToggle: {
    display: "none", background: "none", border: "none",
    color: "#e8f5e8", fontSize: 22, cursor: "pointer",
  },

  // LAYOUT
  layout: {
    display: "flex", position: "relative", zIndex: 1,
    maxWidth: 1300, margin: "0 auto", padding: "0 16px",
  },

  // SIDEBAR
  sidebar: {
    width: 220, flexShrink: 0,
    padding: "28px 0 28px 8px",
    position: "sticky", top: 64,
    height: "calc(100vh - 64px)",
    overflowY: "auto",
  },
  sidebarOpen: { display: "flex" },
  sidebarSection: { marginBottom: 32 },
  sidebarHeading: {
    fontSize: 11, fontWeight: 700, letterSpacing: "1px",
    textTransform: "uppercase", color: "rgba(232,245,232,0.3)",
    marginBottom: 10, paddingLeft: 12,
  },
  sidebarItem: {
    width: "100%", display: "flex", alignItems: "center", gap: 10,
    background: "none", border: "none", color: "rgba(232,245,232,0.55)",
    padding: "9px 12px", borderRadius: 8, fontSize: 14, fontWeight: 500,
    cursor: "pointer", textAlign: "left", transition: "all 0.2s",
  },
  sidebarItemActive: {
    background: "rgba(74,222,128,0.12)", color: "#4ade80",
    fontWeight: 700,
  },

  // MAIN
  main: { flex: 1, padding: "28px 16px 60px" },

  // SEARCH
  searchRow: { marginBottom: 20 },
  searchWrapper: {
    position: "relative", display: "flex", alignItems: "center",
    marginBottom: 12,
  },
  searchIcon: {
    position: "absolute", left: 14, fontSize: 16, pointerEvents: "none",
  },
  searchInput: {
    width: "100%", background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10, padding: "12px 42px",
    color: "#e8f5e8", fontSize: 15, outline: "none",
    fontFamily: "inherit", boxSizing: "border-box",
  },
  clearBtn: {
    position: "absolute", right: 12,
    background: "none", border: "none",
    color: "rgba(232,245,232,0.4)", cursor: "pointer", fontSize: 14,
  },
  mobilePills: { display: "flex", gap: 8, flexWrap: "wrap" },
  pill: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "rgba(232,245,232,0.5)", padding: "6px 14px",
    borderRadius: 100, fontSize: 13, fontWeight: 500, cursor: "pointer",
  },
  pillActive: {
    background: "rgba(74,222,128,0.12)",
    border: "1px solid rgba(74,222,128,0.3)",
    color: "#4ade80",
  },

  resultsCount: {
    fontSize: 13, color: "rgba(232,245,232,0.3)",
    marginBottom: 20,
  },

  // GRID
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
    gap: 20,
  },
  empty: {
    textAlign: "center", padding: "80px 24px",
  },

  // CARD
  card: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 14, overflow: "hidden",
    cursor: "pointer", transition: "all 0.25s ease",
  },
  cardImg: {
    height: 140, background: "rgba(74,222,128,0.06)",
    display: "flex", alignItems: "center", justifyContent: "center",
    position: "relative",
  },
  cardEmoji: { fontSize: 52 },
  favBtn: {
    position: "absolute", top: 10, right: 10,
    background: "rgba(10,15,10,0.6)", border: "none",
    borderRadius: "50%", width: 32, height: 32,
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", fontSize: 16,
  },
  tagBadge: {
    position: "absolute", top: 10, left: 10,
    border: "1px solid", borderRadius: 100,
    padding: "2px 10px", fontSize: 11, fontWeight: 700,
  },
  cardBody: { padding: "14px 16px 16px" },
  cardTitle: {
    fontSize: 15, fontWeight: 700, color: "#e8f5e8",
    margin: "0 0 10px", lineHeight: 1.3,
  },
  cardMeta: {
    display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12,
  },
  metaItem: { fontSize: 12, color: "rgba(232,245,232,0.4)" },
  cardNutrition: {
    display: "flex", gap: 8, borderTop: "1px solid rgba(255,255,255,0.06)",
    paddingTop: 12,
  },
  nutriChip: {
    flex: 1, display: "flex", flexDirection: "column",
    alignItems: "center", gap: 2,
  },
  nutriVal: { fontSize: 15, fontWeight: 800, color: "#e8f5e8" },
  nutriLabel: { fontSize: 10, color: "rgba(232,245,232,0.35)", textTransform: "uppercase" },

  // MODAL
  modalOverlay: {
    position: "fixed", inset: 0, zIndex: 200,
    background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: 24,
  },
  modal: {
    background: "#111a11", border: "1px solid rgba(74,222,128,0.2)",
    borderRadius: 16, padding: "28px", width: "100%", maxWidth: 440,
  },
  modalHeader: {
    display: "flex", alignItems: "center", gap: 14, marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: 700, color: "#e8f5e8", margin: 0 },
  modalSub: { fontSize: 13, color: "rgba(232,245,232,0.4)", margin: "4px 0 0" },
  closeBtn: {
    marginLeft: "auto", background: "none", border: "none",
    color: "rgba(232,245,232,0.4)", fontSize: 18, cursor: "pointer",
  },
  modalInput: {
    width: "100%", background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10, padding: "12px 14px",
    color: "#e8f5e8", fontSize: 14, outline: "none",
    fontFamily: "inherit", boxSizing: "border-box", marginBottom: 14,
  },
  modalSites: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 },
  sitePill: {
    background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.15)",
    color: "rgba(232,245,232,0.5)", padding: "4px 12px",
    borderRadius: 100, fontSize: 12,
  },
  importModalBtn: {
    width: "100%", background: "linear-gradient(135deg, #4ade80, #22c55e)",
    color: "#0a0f0a", border: "none", borderRadius: 10,
    padding: "13px", fontSize: 15, fontWeight: 700, cursor: "pointer",
    fontFamily: "inherit",
  },
};
