import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection, query, where, getDocs,
  addDoc, deleteDoc, doc, updateDoc, serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import ProfileDropdown from "../components/common/ProfileDropdown";
import { uploadRecipePhoto } from "../hooks/usePhotoUpload";

// ─── DIETARY FILTERS & COLLECTIONS ───────────────────────────────────────────
const DIETARY_FILTERS = ["All", "Vegan", "Gluten-Free", "Low-Carb"];
const COLLECTIONS = [
  { key: "all", label: "All Recipes", icon: "📚" },
  { key: "favorites", label: "Favorites", icon: "❤️" },
  { key: "mine", label: "My Recipes", icon: "👨‍🍳" },
];

// ─── SAMPLE RECIPES TO SEED FOR NEW USERS ────────────────────────────────────
const SAMPLE_RECIPES = [
  {
    name: "Grilled Salmon Salad", emoji: "🐟", calories: 420,
    protein: "35g", carbs: "10g", fat: "28g", time: "20 min",
    tag: "Low-Carb", difficulty: "Easy", servings: 2, collection: "all",
  },
  {
    name: "Chicken & Broccoli Stir Fry", emoji: "🥦", calories: 350,
    protein: "30g", carbs: "22g", fat: "12g", time: "25 min",
    tag: "Gluten-Free", difficulty: "Medium", servings: 3, collection: "all",
  },
  {
    name: "Avocado Toast with Eggs", emoji: "🥑", calories: 280,
    protein: "12g", carbs: "30g", fat: "14g", time: "10 min",
    tag: "Vegan", difficulty: "Easy", servings: 1, collection: "all",
  },
  {
    name: "Greek Chicken Bowl", emoji: "🫙", calories: 450,
    protein: "38g", carbs: "32g", fat: "16g", time: "25 min",
    tag: "Gluten-Free", difficulty: "Medium", servings: 2, collection: "all",
  },
];

export default function RecipeLibrary() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dietary, setDietary] = useState("All");
  const [collection_, setCollection] = useState("all");
  const [importOpen, setImportOpen] = useState(false);
  const [importUrl, setImportUrl] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newRecipe, setNewRecipe] = useState({
    name: "", emoji: "🍽️", time: "", difficulty: "Easy",
    servings: 2, tag: "None", calories: "", protein: "", carbs: "", fat: "",
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  // ── Fetch recipes from Firestore ──────────────────────────────────────────
useEffect(() => {
  if (!user) return;
  fetchRecipes();
}, [user]);

// ── Read imported recipe from URL params ──────────────────────────────────
useEffect(() => {
  if (!user) return;
  const params = new URLSearchParams(window.location.search);
  const importData = params.get("import");
  if (!importData) return;

  const saveImport = async () => {
    try {
      const recipe = JSON.parse(decodeURIComponent(importData));
      const docRef = await addDoc(collection(db, "recipes"), {
        ...recipe,
        userId: user.uid,
        favorite: false,
        nutrition: { calories: 0, protein: "—", carbs: "—", fat: "—" },
        createdAt: serverTimestamp(),
      });
      setRecipes((prev) => [...prev, {
        id: docRef.id, ...recipe, favorite: false
      }]);
      // Clean the URL without refreshing
      window.history.replaceState({}, "", "/recipes");
    } catch (err) {
      console.error("Import error:", err);
    }
  };

  saveImport();
}, [user]);

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "recipes"), where("userId", "==", user.uid));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // Seed sample recipes for new users
      if (data.length === 0) {
        await seedSampleRecipes();
        return;
      }
      setRecipes(data);
    } catch (err) {
      console.error("Error fetching recipes:", err);
    }
    setLoading(false);
  };

  // ── Seed sample recipes for brand new users ───────────────────────────────
  const seedSampleRecipes = async () => {
    try {
      const promises = SAMPLE_RECIPES.map((r) =>
        addDoc(collection(db, "recipes"), {
          ...r, userId: user.uid,
          favorite: false,
          nutrition: { calories: r.calories, protein: r.protein, carbs: r.carbs, fat: r.fat },
          createdAt: serverTimestamp(),
        })
      );
      await Promise.all(promises);
      await fetchRecipes();
    } catch (err) {
      console.error("Error seeding recipes:", err);
      setLoading(false);
    }
  };

  // ── Toggle favorite ───────────────────────────────────────────────────────
  const toggleFavorite = async (id, currentVal) => {
    try {
      await updateDoc(doc(db, "recipes", id), { favorite: !currentVal });
      setRecipes((prev) =>
        prev.map((r) => r.id === id ? { ...r, favorite: !currentVal } : r)
      );
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  // ── Delete recipe ─────────────────────────────────────────────────────────
  const deleteRecipe = async (id) => {
    if (!window.confirm("Delete this recipe?")) return;
    try {
      await deleteDoc(doc(db, "recipes", id));
      setRecipes((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Error deleting recipe:", err);
    }
  };

  // ── Add new recipe ────────────────────────────────────────────────────────
  const handleAddRecipe = async () => {
  if (!newRecipe.name.trim()) return;
  setSaving(true);
  try {
    // First create the doc to get an ID
    const docRef = await addDoc(collection(db, "recipes"), {
      ...newRecipe,
      userId: user.uid,
      favorite: false,
      photoURL: null,
      nutrition: {
        calories: Number(newRecipe.calories) || 0,
        protein: newRecipe.protein || "0g",
        carbs: newRecipe.carbs || "0g",
        fat: newRecipe.fat || "0g",
      },
      createdAt: serverTimestamp(),
    });

    // Upload photo if selected
    let photoURL = null;
    if (photoFile) {
      photoURL = await uploadRecipePhoto(photoFile, docRef.id, user.uid);
      await updateDoc(doc(db, "recipes", docRef.id), { photoURL });
    }

    setRecipes((prev) => [...prev, {
      id: docRef.id, ...newRecipe,
      favorite: false, photoURL,
      nutrition: { calories: Number(newRecipe.calories) || 0 },
    }]);
    setAddOpen(false);
    setPhotoFile(null);
    setPhotoPreview(null);
    setNewRecipe({ name: "", emoji: "🍽️", time: "", difficulty: "Easy", servings: 2, tag: "None", calories: "", protein: "", carbs: "", fat: "" });
  } catch (err) {
    console.error("Error adding recipe:", err);
  }
  setSaving(false);
};
  // ── Filter recipes ────────────────────────────────────────────────────────
  const filtered = recipes.filter((r) => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase());
    const matchDiet = dietary === "All" || r.tag === dietary;
    const matchCollection =
      collection_ === "all" ? true :
      collection_ === "favorites" ? r.favorite :
      r.collection === "mine";
    return matchSearch && matchDiet && matchCollection;
  });

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <div style={{ fontSize: 48 }}>🌿</div>
        <p style={{ color: "rgba(232,245,232,0.4)", fontSize: 16 }}>Loading your recipes...</p>
      </div>
    );
  }

  return (
    <div style={styles.root}>
      <div style={styles.blob1} />
      <div style={styles.blob2} />

      {/* TOPBAR */}
      <header style={styles.topbar}>
        <a href="/" style={styles.logo}>
          <span style={{ fontSize: 20 }}>🌿</span>
          <span style={styles.logoText}>NutriPlan</span>
        </a>
        <div style={styles.topbarRight}>
  <button style={styles.navLink} onClick={() => navigate("/dashboard")}>Dashboard</button>
  <button style={styles.navLink} onClick={() => navigate("/calculator")}>Calculator</button>
  <button style={styles.importBtn} onClick={() => setImportOpen(true)}>
    + Import from URL
  </button>
  <button style={styles.addBtn} onClick={() => setAddOpen(true)}>
    Add Recipe
  </button>
  <ProfileDropdown />
</div>
        <button style={styles.menuToggle} onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
      </header>

      <div style={styles.layout}>
        {/* SIDEBAR */}
        <aside style={{ ...styles.sidebar, ...(sidebarOpen ? styles.sidebarOpen : {}) }}>
          <div style={styles.sidebarSection}>
            <p style={styles.sidebarHeading}>Collections</p>
            {COLLECTIONS.map((c) => (
              <button
                key={c.key}
                style={{ ...styles.sidebarItem, ...(collection_ === c.key ? styles.sidebarItemActive : {}) }}
                onClick={() => { setCollection(c.key); setSidebarOpen(false); }}
              >
                <span>{c.icon}</span><span>{c.label}</span>
              </button>
            ))}
          </div>
          <div style={styles.sidebarSection}>
            <p style={styles.sidebarHeading}>Dietary Filters</p>
            {DIETARY_FILTERS.filter((d) => d !== "All").map((d) => (
              <button
                key={d}
                style={{ ...styles.sidebarItem, ...(dietary === d ? styles.sidebarItemActive : {}) }}
                onClick={() => { setDietary(dietary === d ? "All" : d); setSidebarOpen(false); }}
              >
                <span>{d === "Vegan" ? "🌱" : d === "Gluten-Free" ? "🌾" : "📉"}</span>
                <span>{d}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* MAIN */}
        <main style={styles.main}>
          {/* Search */}
          <div style={styles.searchRow}>
            <div style={styles.searchWrapper}>
              <span style={styles.searchIcon}>🔍</span>
              <input
                style={styles.searchInput}
                placeholder="Search recipes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && <button style={styles.clearBtn} onClick={() => setSearch("")}>✕</button>}
            </div>
            <div style={styles.mobilePills}>
              {DIETARY_FILTERS.map((d) => (
                <button
                  key={d}
                  style={{ ...styles.pill, ...(dietary === d ? styles.pillActive : {}) }}
                  onClick={() => setDietary(d)}
                >{d}</button>
              ))}
            </div>
          </div>

          <p style={styles.resultsCount}>{filtered.length} recipe{filtered.length !== 1 ? "s" : ""} found</p>

          {/* Grid */}
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
                  onToggleFavorite={() => toggleFavorite(recipe.id, recipe.favorite)}
                  onDelete={() => deleteRecipe(recipe.id)}
                  onClick={() => navigate(`/recipes/${recipe.id}`)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* ADD RECIPE MODAL */}
      {addOpen && (
        <div style={styles.modalOverlay} onClick={() => setAddOpen(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>➕ Add New Recipe</h3>
              <button style={styles.closeBtn} onClick={() => setAddOpen(false)}>✕</button>
            </div>

            {/* Photo upload */}
<div style={photoStyles.uploadArea}>
  <input
    type="file" accept="image/*" id="recipePhoto"
    style={{ display: "none" }}
    onChange={(e) => {
      const file = e.target.files[0];
      if (!file) return;
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }}
  />
  <label htmlFor="recipePhoto" style={photoStyles.uploadLabel}>
    {photoPreview ? (
      <img src={photoPreview} alt="preview" style={photoStyles.preview} />
    ) : (
      <div style={photoStyles.placeholder}>
        <span style={{ fontSize: 32 }}>📷</span>
        <span style={photoStyles.placeholderText}>Add a photo (optional)</span>
        <span style={photoStyles.placeholderSub}>JPG, PNG up to 5MB</span>
      </div>
    )}
  </label>
  {photoPreview && (
    <button style={photoStyles.removePhoto} onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}>
      ✕ Remove photo
    </button>
  )}
</div>

            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Recipe Name *</label>
                <input style={styles.formInput} placeholder="e.g. Grilled Chicken"
                  value={newRecipe.name}
                  onChange={(e) => setNewRecipe({ ...newRecipe, name: e.target.value })} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Emoji Icon</label>
                <input style={styles.formInput} placeholder="🍽️" maxLength={2}
                  value={newRecipe.emoji}
                  onChange={(e) => setNewRecipe({ ...newRecipe, emoji: e.target.value })} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Cook Time</label>
                <input style={styles.formInput} placeholder="e.g. 20 min"
                  value={newRecipe.time}
                  onChange={(e) => setNewRecipe({ ...newRecipe, time: e.target.value })} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Difficulty</label>
                <select style={styles.formInput}
                  value={newRecipe.difficulty}
                  onChange={(e) => setNewRecipe({ ...newRecipe, difficulty: e.target.value })}>
                  {["Easy", "Medium", "Hard"].map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Dietary Tag</label>
                <select style={styles.formInput}
                  value={newRecipe.tag}
                  onChange={(e) => setNewRecipe({ ...newRecipe, tag: e.target.value })}>
                  {["None", "Vegan", "Gluten-Free", "Low-Carb"].map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Servings</label>
                <input style={styles.formInput} type="number" min={1}
                  value={newRecipe.servings}
                  onChange={(e) => setNewRecipe({ ...newRecipe, servings: Number(e.target.value) })} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Calories (kcal)</label>
                <input style={styles.formInput} type="number" placeholder="e.g. 420"
                  value={newRecipe.calories}
                  onChange={(e) => setNewRecipe({ ...newRecipe, calories: e.target.value })} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Protein</label>
                <input style={styles.formInput} placeholder="e.g. 35g"
                  value={newRecipe.protein}
                  onChange={(e) => setNewRecipe({ ...newRecipe, protein: e.target.value })} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Carbs</label>
                <input style={styles.formInput} placeholder="e.g. 10g"
                  value={newRecipe.carbs}
                  onChange={(e) => setNewRecipe({ ...newRecipe, carbs: e.target.value })} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Fat</label>
                <input style={styles.formInput} placeholder="e.g. 28g"
                  value={newRecipe.fat}
                  onChange={(e) => setNewRecipe({ ...newRecipe, fat: e.target.value })} />
              </div>
            </div>

            <button
              style={{ ...styles.importModalBtn, opacity: saving ? 0.7 : 1 }}
              onClick={handleAddRecipe}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Recipe →"}
            </button>
          </div>
        </div>
      )}

      {/* IMPORT MODAL */}
      {importOpen && (
        <div style={styles.modalOverlay} onClick={() => setImportOpen(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={{ fontSize: 32 }}>🤖</div>
              <div>
                <h3 style={styles.modalTitle}>Import Recipe from URL</h3>
                <p style={styles.modalSub}>AI import coming in Phase 4</p>
              </div>
              <button style={styles.closeBtn} onClick={() => setImportOpen(false)}>✕</button>
            </div>
            <input style={styles.modalInput} placeholder="https://www.allrecipes.com/recipe/..."
              value={importUrl} onChange={(e) => setImportUrl(e.target.value)} />
            <div style={styles.modalSites}>
              {["AllRecipes", "Food Network", "NYT Cooking", "Tasty"].map((s) => (
                <span key={s} style={styles.sitePill}>{s}</span>
              ))}
            </div>
            <button style={{ ...styles.importModalBtn, opacity: 0.5, cursor: "not-allowed" }}>
              Coming in Phase 4 (AI Integration)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── RECIPE CARD ──────────────────────────────────────────────────────────────
function RecipeCard({ recipe, onToggleFavorite, onDelete, onClick }) {
  const [hovered, setHovered] = useState(false);
  const tagColors = {
    "Vegan": "#4ade80", "Gluten-Free": "#34d399", "Low-Carb": "#6ee7b7",
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
      <div style={styles.cardImg}>
  {recipe.photoURL ? (
    <img src={recipe.photoURL} alt={recipe.name} style={styles.cardPhoto} />
  ) : (
    <span style={styles.cardEmoji}>{recipe.emoji || "🍽️"}</span>
  )}
        <button style={styles.favBtn} onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}>
          {recipe.favorite ? "❤️" : "🤍"}
        </button>
        {recipe.tag && recipe.tag !== "None" && (
          <span style={{ ...styles.tagBadge, background: `${tagColors[recipe.tag]}22`, color: tagColors[recipe.tag], borderColor: `${tagColors[recipe.tag]}44` }}>
            {recipe.tag}
          </span>
        )}
        <button style={styles.deleteBtn} onClick={(e) => { e.stopPropagation(); onDelete(); }}>🗑️</button>
      </div>
      <div style={styles.cardBody}>
        <h3 style={styles.cardTitle}>{recipe.name}</h3>
        <div style={styles.cardMeta}>
          <span style={styles.metaItem}>🍽 {recipe.servings} servings</span>
          {recipe.time && <span style={styles.metaItem}>⏱ {recipe.time}</span>}
          {recipe.difficulty && <span style={styles.metaItem}>📊 {recipe.difficulty}</span>}
        </div>
        <div style={styles.cardNutrition}>
          <div style={styles.nutriChip}>
            <span style={styles.nutriVal}>{recipe.calories || recipe.nutrition?.calories || "—"}</span>
            <span style={styles.nutriLabel}>kcal</span>
          </div>
          <div style={styles.nutriChip}>
            <span style={{ ...styles.nutriVal, color: "#4ade80" }}>{recipe.protein || recipe.nutrition?.protein || "—"}</span>
            <span style={styles.nutriLabel}>protein</span>
          </div>
          <div style={styles.nutriChip}>
            <span style={{ ...styles.nutriVal, color: "#34d399" }}>{recipe.carbs || recipe.nutrition?.carbs || "—"}</span>
            <span style={styles.nutriLabel}>carbs</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = {
  navLink: {
  background: "none", border: "none",
  color: "rgba(232,245,232,0.55)", fontSize: 14,
  fontWeight: 500, cursor: "pointer", padding: "8px 12px",
},
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
  menuToggle: {
    display: "none", background: "none", border: "none",
    color: "#e8f5e8", fontSize: 22, cursor: "pointer",
  },
  layout: {
    display: "flex", position: "relative", zIndex: 1,
    maxWidth: 1300, margin: "0 auto", padding: "0 16px",
  },
  sidebar: {
    width: 220, flexShrink: 0, padding: "28px 0 28px 8px",
    position: "sticky", top: 64,
    height: "calc(100vh - 64px)", overflowY: "auto",
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
  sidebarItemActive: { background: "rgba(74,222,128,0.12)", color: "#4ade80", fontWeight: 700 },
  main: { flex: 1, padding: "28px 16px 60px" },
  searchRow: { marginBottom: 20 },
  searchWrapper: { position: "relative", display: "flex", alignItems: "center", marginBottom: 12 },
  searchIcon: { position: "absolute", left: 14, fontSize: 16, pointerEvents: "none" },
  searchInput: {
    width: "100%", background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
    padding: "12px 42px", color: "#e8f5e8", fontSize: 15,
    outline: "none", fontFamily: "inherit", boxSizing: "border-box",
  },
  clearBtn: {
    position: "absolute", right: 12, background: "none", border: "none",
    color: "rgba(232,245,232,0.4)", cursor: "pointer", fontSize: 14,
  },
  mobilePills: { display: "flex", gap: 8, flexWrap: "wrap" },
  pill: {
    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
    color: "rgba(232,245,232,0.5)", padding: "6px 14px",
    borderRadius: 100, fontSize: 13, fontWeight: 500, cursor: "pointer",
  },
  pillActive: {
    background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.3)", color: "#4ade80",
  },
  resultsCount: { fontSize: 13, color: "rgba(232,245,232,0.3)", marginBottom: 20 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 20 },
  empty: { textAlign: "center", padding: "80px 24px" },
  card: {
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 14, overflow: "hidden", cursor: "pointer", transition: "all 0.25s ease",
  },
  cardImg: {
    height: 140, background: "rgba(74,222,128,0.06)",
    display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
  },
  cardEmoji: { fontSize: 52 },
  favBtn: {
    position: "absolute", top: 10, right: 10,
    background: "rgba(10,15,10,0.6)", border: "none", borderRadius: "50%",
    width: 32, height: 32, display: "flex", alignItems: "center",
    justifyContent: "center", cursor: "pointer", fontSize: 16,
  },
  deleteBtn: {
    position: "absolute", bottom: 10, right: 10,
    background: "rgba(10,15,10,0.6)", border: "none", borderRadius: "50%",
    width: 32, height: 32, display: "flex", alignItems: "center",
    justifyContent: "center", cursor: "pointer", fontSize: 14,
  },
  tagBadge: {
    position: "absolute", top: 10, left: 10,
    border: "1px solid", borderRadius: 100,
    padding: "2px 10px", fontSize: 11, fontWeight: 700,
  },
  cardBody: { padding: "14px 16px 16px" },
  cardTitle: { fontSize: 15, fontWeight: 700, color: "#e8f5e8", margin: "0 0 10px", lineHeight: 1.3 },
  cardMeta: { display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 },
  metaItem: { fontSize: 12, color: "rgba(232,245,232,0.4)" },
  cardNutrition: {
    display: "flex", gap: 8,
    borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 12,
  },
  nutriChip: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 },
  nutriVal: { fontSize: 15, fontWeight: 800, color: "#e8f5e8" },
  nutriLabel: { fontSize: 10, color: "rgba(232,245,232,0.35)", textTransform: "uppercase" },
  modalOverlay: {
    position: "fixed", inset: 0, zIndex: 200,
    background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
    display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
  },
  modal: {
    background: "#111a11", border: "1px solid rgba(74,222,128,0.2)",
    borderRadius: 16, padding: "28px", width: "100%", maxWidth: 500,
    maxHeight: "90vh", overflowY: "auto",
  },
  modalHeader: { display: "flex", alignItems: "center", gap: 14, marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 700, color: "#e8f5e8", margin: 0 },
  modalSub: { fontSize: 13, color: "rgba(232,245,232,0.4)", margin: "4px 0 0" },
  closeBtn: {
    marginLeft: "auto", background: "none", border: "none",
    color: "rgba(232,245,232,0.4)", fontSize: 18, cursor: "pointer",
  },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 },
  formGroup: { display: "flex", flexDirection: "column", gap: 6 },
  formLabel: { fontSize: 12, fontWeight: 600, color: "rgba(232,245,232,0.5)" },
  formInput: {
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8, padding: "9px 12px", color: "#e8f5e8",
    fontSize: 14, outline: "none", fontFamily: "inherit",
  },
  modalInput: {
    width: "100%", background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
    padding: "12px 14px", color: "#e8f5e8", fontSize: 14,
    outline: "none", fontFamily: "inherit", boxSizing: "border-box", marginBottom: 14,
  },
  modalSites: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 },
  sitePill: {
    background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.15)",
    color: "rgba(232,245,232,0.5)", padding: "4px 12px", borderRadius: 100, fontSize: 12,
  },
  importModalBtn: {
    width: "100%", background: "linear-gradient(135deg, #4ade80, #22c55e)",
    color: "#0a0f0a", border: "none", borderRadius: 10,
    padding: "13px", fontSize: 15, fontWeight: 700,
    cursor: "pointer", fontFamily: "inherit",
  },
  cardPhoto: { width: "100%", height: "100%", objectFit: "cover" },
};

//outside styles
  const photoStyles = {
  uploadArea: { marginBottom: 20 },
  uploadLabel: {
    display: "block", cursor: "pointer",
    borderRadius: 12, overflow: "hidden",
    border: "2px dashed rgba(74,222,128,0.25)",
    transition: "border-color 0.2s",
  },
  preview: { width: "100%", height: 180, objectFit: "cover", display: "block" },
  placeholder: {
    height: 140, display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", gap: 8,
    background: "rgba(74,222,128,0.04)",
  },
  placeholderText: { fontSize: 14, color: "rgba(232,245,232,0.5)", fontWeight: 600 },
  placeholderSub: { fontSize: 12, color: "rgba(232,245,232,0.25)" },
  removePhoto: {
    background: "none", border: "none", color: "#f87171",
    fontSize: 13, cursor: "pointer", marginTop: 8, padding: 0,
  },
};