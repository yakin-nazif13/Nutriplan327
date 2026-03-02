import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs, doc, getDoc, addDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import ProfileDropdown from "../components/common/ProfileDropdown";
import { uploadRecipePhoto } from "../hooks/usePhotoUpload";

const CALORIE_DATA = [
  { day: "Mon", calories: 1850 },
  { day: "Tue", calories: 2100 },
  { day: "Wed", calories: 1760 },
  { day: "Thu", calories: 2200 },
  { day: "Fri", calories: 1950 },
  { day: "Sat", calories: 2400 },
  { day: "Sun", calories: 1800 },
];

const DAILY_GOAL = 2000;

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [userProfile, setUserProfile] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [importUrl, setImportUrl] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [newRecipe, setNewRecipe] = useState({
    name: "", emoji: "🍽️", time: "", difficulty: "Easy",
    servings: 2, tag: "None", calories: "", protein: "", carbs: "", fat: "",
  });
  const [prefs, setPrefs] = useState([
    { label: "Vegetarian", icon: "🥬", key: "vegetarian", active: false },
    { label: "Gluten-Free", icon: "🌾", key: "glutenFree", active: false },
    { label: "Low-Carb", icon: "📉", key: "lowCarb", active: false },
    { label: "Vegan", icon: "🌱", key: "vegan", active: false },
  ]);

  const [greeting] = useState(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  });

  const QUICK_ACTIONS = [
    { icon: "➕", label: "Add Recipe", color: "#4ade80", onClick: () => setAddOpen(true) },
    { icon: "🔗", label: "Import URL", color: "#34d399", onClick: () => setImportOpen(true) },
    { icon: "🧮", label: "Meal Calculator", color: "#6ee7b7", onClick: () => navigate("/calculator") },
    { icon: "📚", label: "View Library", color: "#a7f3d0", onClick: () => navigate("/recipes") },
  ];

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserProfile(data);
          if (data.preferences) {
            setPrefs((prev) =>
              prev.map((p) => ({ ...p, active: data.preferences[p.key] || false }))
            );
          }
        }
        const recipesRef = collection(db, "recipes");
        const q = query(recipesRef, where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const recipesData = querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setRecipes(recipesData);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const handleAddRecipe = async () => {
    if (!newRecipe.name.trim()) return;
    setSaving(true);
    try {
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
      let photoURL = null;
      if (photoFile) {
        photoURL = await uploadRecipePhoto(photoFile, docRef.id, user.uid);
        await updateDoc(doc(db, "recipes", docRef.id), { photoURL });
      }
      setRecipes((prev) => [...prev, {
        id: docRef.id, ...newRecipe, favorite: false, photoURL,
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

  const totalRecipes = recipes.length;
  const favorites = recipes.filter((r) => r.favorite).length;
  const avgCalories = recipes.length > 0
    ? Math.round(recipes.reduce((sum, r) => sum + (r.nutrition?.calories || 0), 0) / recipes.length)
    : 0;
  const recentRecipes = recipes.slice(0, 4);
  const todayCalories = 1500;
  const goalPct = Math.round((todayCalories / DAILY_GOAL) * 100);

  const STATS = [
    { icon: "📚", label: "Total Recipes", value: totalRecipes, sub: "in your library", color: "#4ade80" },
    { icon: "❤️", label: "Favorites", value: favorites, sub: "saved recipes", color: "#f87171" },
    { icon: "🔥", label: "Avg Calories", value: avgCalories || "—", sub: "per recipe", color: "#fb923c" },
    { icon: "🎯", label: "Goal Progress", value: `${goalPct}%`, sub: "daily target", color: "#34d399" },
  ];

  const displayName = userProfile?.name || user?.displayName || user?.email?.split("@")[0] || "User";

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <div style={{ fontSize: 48 }}>🌿</div>
        <p style={styles.loadingText}>Loading your dashboard...</p>
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
          <span>🌿</span>
          <span style={styles.logoText}>NutriPlan</span>
        </a>
        <nav style={styles.topNav}>
          {[
            { label: "Dashboard", path: "/dashboard" },
            { label: "Recipes", path: "/recipes" },
            { label: "Calculator", path: "/calculator" },
          ].map((n) => (
            <button key={n.label} style={styles.topNavBtn} onClick={() => navigate(n.path)}>
              {n.label}
            </button>
          ))}
        </nav>
        <div style={styles.topbarRight}>
          <ProfileDropdown />
        </div>
      </header>

      <div style={styles.layout}>
        {/* SIDEBAR */}
        <aside style={styles.sidebar}>
          <div style={styles.sidebarSection}>
            <p style={styles.sidebarHeading}>Dietary Preferences</p>
            {prefs.map((p, i) => (
              <div key={p.label} style={styles.prefRow}>
                <span style={styles.prefIcon}>{p.icon}</span>
                <span style={styles.prefLabel}>{p.label}</span>
                <div
                  style={{ ...styles.toggle, ...(p.active ? styles.toggleOn : {}) }}
                  onClick={() => setPrefs((prev) =>
                    prev.map((item, idx) => idx === i ? { ...item, active: !item.active } : item)
                  )}
                >
                  <div style={{ ...styles.toggleThumb, ...(p.active ? styles.toggleThumbOn : {}) }} />
                </div>
              </div>
            ))}
          </div>

          <div style={styles.sidebarSection}>
            <p style={styles.sidebarHeading}>Quick Actions</p>
            {QUICK_ACTIONS.map((a) => (
              <button key={a.label} style={styles.quickAction} onClick={a.onClick}>
                <span style={{ ...styles.quickIcon, background: `${a.color}18`, color: a.color }}>
                  {a.icon}
                </span>
                <span style={styles.quickLabel}>{a.label}</span>
              </button>
            ))}
          </div>

          <div style={styles.userCard}>
            <div style={styles.userAvatar}>{displayName.charAt(0).toUpperCase()}</div>
            <div>
              <div style={styles.userName}>{displayName}</div>
              <div style={styles.userEmail}>{user?.email}</div>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main style={styles.main}>
          <div style={styles.greetingRow}>
            <div>
              <h1 style={styles.greeting}>
                {greeting}, <span style={styles.greetingName}>{displayName}!</span> 👋
              </h1>
              <p style={styles.greetingSub}>Here's your nutrition overview for today.</p>
            </div>
            <div style={styles.dateBadge}>
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </div>
          </div>

          <div style={styles.statsGrid}>
            {STATS.map((s) => <StatCard key={s.label} stat={s} />)}
          </div>

          <div style={styles.goalCard}>
            <div style={styles.goalLeft}>
              <div style={styles.goalTitle}>🎯 Today's Calorie Goal</div>
              <div style={styles.goalSub}>
                <span style={styles.goalCurrent}>{todayCalories}</span>
                <span style={styles.goalOf}> / {DAILY_GOAL} kcal</span>
              </div>
            </div>
            <div style={styles.goalRight}>
              <div style={styles.goalBarBg}>
                <div style={{
                  ...styles.goalBarFill,
                  width: `${Math.min(goalPct, 100)}%`,
                  background: goalPct > 90
                    ? "linear-gradient(90deg, #fb923c, #ef4444)"
                    : "linear-gradient(90deg, #4ade80, #22c55e)",
                }} />
              </div>
              <div style={styles.goalPct}>{goalPct}%</div>
            </div>
            <div style={styles.goalRemaining}>
              {DAILY_GOAL - todayCalories > 0 ? `${DAILY_GOAL - todayCalories} kcal remaining` : "Goal reached! 🎉"}
            </div>
          </div>

          <div style={styles.midRow}>
            <div style={styles.chartCard}>
              <div style={styles.cardHeader}>
                <h2 style={styles.cardTitle}>📈 Weekly Calories</h2>
                <span style={styles.cardSub}>Last 7 days</span>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={CALORIE_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" tick={{ fill: "rgba(232,245,232,0.35)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "rgba(232,245,232,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "#111a11", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 8, color: "#e8f5e8", fontSize: 13 }}
                    formatter={(v) => [`${v} kcal`, "Calories"]}
                  />
                  <Line type="monotone" dataKey="calories" stroke="#4ade80" strokeWidth={2.5}
                    dot={{ fill: "#4ade80", r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: "#4ade80" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div style={styles.mealsCard}>
              <div style={styles.cardHeader}>
                <h2 style={styles.cardTitle}>📊 Library Summary</h2>
                <span style={styles.cardSub}>{totalRecipes} recipes</span>
              </div>
              {totalRecipes === 0 ? (
                <div style={styles.emptyState}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>🍽️</div>
                  <p style={{ color: "rgba(232,245,232,0.4)", fontSize: 14, margin: 0 }}>No recipes yet</p>
                  <button style={styles.addFirstBtn} onClick={() => setAddOpen(true)}>
                    Add your first recipe →
                  </button>
                </div>
              ) : (
                <>
                  {[
                    { label: "Total Recipes", val: totalRecipes, color: "#4ade80" },
                    { label: "Favorites", val: favorites, color: "#f87171" },
                    { label: "Avg Calories", val: avgCalories ? `${avgCalories} kcal` : "—", color: "#fb923c" },
                  ].map(({ label, val, color }) => (
                    <div key={label} style={styles.summaryRow}>
                      <span style={styles.summaryLabel}>{label}</span>
                      <span style={{ ...styles.summaryVal, color }}>{val}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          <div style={styles.recentSection}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.cardTitle}>🕐 Recent Recipes</h2>
              <button style={styles.viewAllBtn} onClick={() => navigate("/recipes")}>View All →</button>
            </div>
            {recentRecipes.length === 0 ? (
              <div style={styles.emptyRecipes}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>👨‍🍳</div>
                <p style={{ color: "rgba(232,245,232,0.4)", fontSize: 15, margin: "0 0 16px" }}>
                  Your recipe library is empty
                </p>
                <button style={styles.ctaBtn} onClick={() => setAddOpen(true)}>
                  Add Your First Recipe →
                </button>
              </div>
            ) : (
              <div style={styles.recentGrid}>
                {recentRecipes.map((r) => (
                  <div
                    key={r.id} style={styles.recentCard}
                    onClick={() => navigate(`/recipes/${r.id}`)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.borderColor = "rgba(74,222,128,0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                    }}
                  >
                    {r.photoURL ? (
                      <img src={r.photoURL} alt={r.name} style={styles.recentPhoto} />
                    ) : (
                      <div style={styles.recentEmoji}>{r.emoji || "🍽️"}</div>
                    )}
                    <div style={styles.recentInfo}>
                      <div style={styles.recentName}>{r.name}</div>
                      <div style={styles.recentMeta}>
                        {r.time && <span>⏱ {r.time}</span>}
                        <span>🔥 {r.nutrition?.calories || r.calories || "—"} kcal</span>
                        {r.tag && r.tag !== "None" && (
                          <span style={styles.recentTag}>{r.tag}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
              {[
                { label: "Recipe Name *", key: "name", placeholder: "e.g. Grilled Chicken" },
                { label: "Emoji Icon", key: "emoji", placeholder: "🍽️" },
                { label: "Cook Time", key: "time", placeholder: "e.g. 20 min" },
                { label: "Calories (kcal)", key: "calories", placeholder: "e.g. 420", type: "number" },
                { label: "Protein", key: "protein", placeholder: "e.g. 35g" },
                { label: "Carbs", key: "carbs", placeholder: "e.g. 10g" },
                { label: "Fat", key: "fat", placeholder: "e.g. 28g" },
              ].map(({ label, key, placeholder, type }) => (
                <div key={key} style={styles.formGroup}>
                  <label style={styles.formLabel}>{label}</label>
                  <input
                    style={styles.formInput} type={type || "text"} placeholder={placeholder}
                    value={newRecipe[key]}
                    onChange={(e) => setNewRecipe({ ...newRecipe, [key]: e.target.value })}
                  />
                </div>
              ))}
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Difficulty</label>
                <select style={styles.formInput} value={newRecipe.difficulty}
                  onChange={(e) => setNewRecipe({ ...newRecipe, difficulty: e.target.value })}>
                  {["Easy", "Medium", "Hard"].map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Dietary Tag</label>
                <select style={styles.formInput} value={newRecipe.tag}
                  onChange={(e) => setNewRecipe({ ...newRecipe, tag: e.target.value })}>
                  {["None", "Vegan", "Gluten-Free", "Low-Carb"].map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <button style={{ ...styles.submitBtn, opacity: saving ? 0.7 : 1 }}
              onClick={handleAddRecipe} disabled={saving}>
              {saving ? "Saving..." : "Save Recipe →"}
            </button>
          </div>
        </div>
      )}

      {/* IMPORT URL MODAL */}
      {importOpen && (
        <div style={styles.modalOverlay} onClick={() => setImportOpen(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={{ fontSize: 32 }}>🤖</div>
              <div>
                <h3 style={styles.modalTitle}>Import from URL</h3>
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
            <button style={{ ...styles.submitBtn, opacity: 0.5, cursor: "not-allowed" }}>
              Coming in Phase 4 (AI Integration)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ stat }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        ...styles.statCard,
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        borderColor: hovered ? `${stat.color}44` : "rgba(255,255,255,0.06)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ ...styles.statIcon, background: `${stat.color}15` }}>{stat.icon}</div>
      <div style={styles.statValue}>{stat.value}</div>
      <div style={styles.statLabel}>{stat.label}</div>
      <div style={{ ...styles.statSub, color: stat.color }}>{stat.sub}</div>
    </div>
  );
}

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
  loadingText: { color: "rgba(232,245,232,0.4)", fontSize: 16 },
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
    display: "flex", alignItems: "center",
    padding: "0 24px", height: 64, gap: 24,
  },
  logo: { display: "flex", alignItems: "center", gap: 8, textDecoration: "none", flexShrink: 0 },
  logoText: { fontSize: 18, fontWeight: 700, color: "#4ade80" },
  topNav: { display: "flex", gap: 4, flex: 1, justifyContent: "center" },
  topNavBtn: {
    background: "none", border: "none", color: "rgba(232,245,232,0.55)",
    fontSize: 14, fontWeight: 500, cursor: "pointer", padding: "8px 14px", borderRadius: 8,
  },
  topbarRight: { display: "flex", alignItems: "center", gap: 12, flexShrink: 0 },
  layout: {
    display: "flex", maxWidth: 1300, margin: "0 auto",
    padding: "0 16px", position: "relative", zIndex: 1,
  },
  sidebar: {
    width: 220, flexShrink: 0, padding: "28px 8px 28px 0",
    position: "sticky", top: 64, height: "calc(100vh - 64px)", overflowY: "auto",
  },
  sidebarSection: { marginBottom: 32 },
  sidebarHeading: {
    fontSize: 11, fontWeight: 700, letterSpacing: "1px",
    textTransform: "uppercase", color: "rgba(232,245,232,0.3)",
    marginBottom: 12, paddingLeft: 4,
  },
  prefRow: { display: "flex", alignItems: "center", gap: 10, padding: "8px 6px", borderRadius: 8, marginBottom: 4 },
  prefIcon: { fontSize: 16 },
  prefLabel: { fontSize: 14, color: "rgba(232,245,232,0.6)", flex: 1 },
  toggle: {
    width: 38, height: 22, borderRadius: 100,
    background: "rgba(255,255,255,0.1)", cursor: "pointer",
    position: "relative", transition: "background 0.2s", flexShrink: 0,
  },
  toggleOn: { background: "#4ade80" },
  toggleThumb: {
    position: "absolute", top: 3, left: 3,
    width: 16, height: 16, borderRadius: "50%",
    background: "rgba(255,255,255,0.5)", transition: "all 0.2s",
  },
  toggleThumbOn: { left: 19, background: "#0a0f0a" },
  quickAction: {
    width: "100%", display: "flex", alignItems: "center", gap: 10,
    background: "none", border: "none", cursor: "pointer",
    padding: "8px 6px", borderRadius: 8, marginBottom: 4,
  },
  quickIcon: {
    width: 30, height: 30, borderRadius: 8,
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15,
  },
  quickLabel: { fontSize: 13, color: "rgba(232,245,232,0.6)", fontWeight: 500 },
  userCard: {
    display: "flex", alignItems: "center", gap: 10,
    background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.12)",
    borderRadius: 10, padding: "12px", marginTop: 16,
  },
  userAvatar: {
    width: 32, height: 32, borderRadius: "50%",
    background: "linear-gradient(135deg, #4ade80, #22c55e)",
    color: "#0a0f0a", display: "flex", alignItems: "center",
    justifyContent: "center", fontWeight: 800, fontSize: 13, flexShrink: 0,
  },
  userName: { fontSize: 13, fontWeight: 700, color: "#e8f5e8" },
  userEmail: { fontSize: 11, color: "rgba(232,245,232,0.35)", marginTop: 2, wordBreak: "break-all" },
  main: { flex: 1, padding: "28px 0 60px 20px" },
  greetingRow: {
    display: "flex", alignItems: "flex-start",
    justifyContent: "space-between", flexWrap: "wrap",
    gap: 12, marginBottom: 28,
  },
  greeting: { fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 800, letterSpacing: "-0.5px", margin: 0 },
  greetingName: { color: "#4ade80" },
  greetingSub: { fontSize: 14, color: "rgba(232,245,232,0.4)", margin: "6px 0 0" },
  dateBadge: {
    background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.15)",
    color: "rgba(232,245,232,0.5)", padding: "6px 14px", borderRadius: 100, fontSize: 13,
  },
  statsGrid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: 16, marginBottom: 20,
  },
  statCard: {
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 14, padding: "18px 16px", transition: "all 0.25s ease", cursor: "default",
  },
  statIcon: { fontSize: 22, width: 44, height: 44, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  statValue: { fontSize: 30, fontWeight: 900, color: "#e8f5e8", letterSpacing: "-1px", lineHeight: 1 },
  statLabel: { fontSize: 13, color: "rgba(232,245,232,0.45)", margin: "6px 0 4px" },
  statSub: { fontSize: 12, fontWeight: 600 },
  goalCard: {
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 14, padding: "18px 22px", marginBottom: 20,
    display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap",
  },
  goalLeft: { minWidth: 140 },
  goalTitle: { fontSize: 14, fontWeight: 600, color: "rgba(232,245,232,0.6)", marginBottom: 4 },
  goalSub: { display: "flex", alignItems: "baseline", gap: 2 },
  goalCurrent: { fontSize: 28, fontWeight: 900, color: "#4ade80", letterSpacing: "-1px" },
  goalOf: { fontSize: 14, color: "rgba(232,245,232,0.35)" },
  goalRight: { flex: 1, minWidth: 180, display: "flex", alignItems: "center", gap: 12 },
  goalBarBg: { flex: 1, height: 10, background: "rgba(255,255,255,0.07)", borderRadius: 100, overflow: "hidden" },
  goalBarFill: { height: "100%", borderRadius: 100, transition: "width 0.5s ease" },
  goalPct: { fontSize: 16, fontWeight: 800, color: "#4ade80", minWidth: 40, textAlign: "right" },
  goalRemaining: { fontSize: 13, color: "rgba(232,245,232,0.35)", width: "100%", marginTop: -8 },
  midRow: { display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, marginBottom: 20 },
  chartCard: {
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 14, padding: "20px",
  },
  mealsCard: {
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 14, padding: "20px",
  },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: 700, color: "#e8f5e8", margin: 0 },
  cardSub: { fontSize: 12, color: "rgba(232,245,232,0.35)" },
  emptyState: { textAlign: "center", padding: "20px 0" },
  addFirstBtn: {
    background: "none", border: "none", color: "#4ade80",
    fontSize: 13, fontWeight: 600, cursor: "pointer", marginTop: 10,
  },
  summaryRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  summaryLabel: { fontSize: 13, color: "rgba(232,245,232,0.5)" },
  summaryVal: { fontSize: 15, fontWeight: 800 },
  recentSection: {},
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  viewAllBtn: { background: "none", border: "none", color: "#4ade80", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  emptyRecipes: {
    textAlign: "center", padding: "48px 24px",
    background: "rgba(255,255,255,0.02)", borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.06)",
  },
  ctaBtn: {
    background: "linear-gradient(135deg, #4ade80, #22c55e)",
    color: "#0a0f0a", border: "none", borderRadius: 10,
    padding: "12px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer",
  },
  recentGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 },
  recentCard: {
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 12, padding: "16px", cursor: "pointer", transition: "all 0.25s ease",
    display: "flex", alignItems: "center", gap: 14,
  },
  recentPhoto: { width: 48, height: 48, borderRadius: 8, objectFit: "cover", flexShrink: 0 },
  recentEmoji: { fontSize: 32, flexShrink: 0 },
  recentInfo: { flex: 1, minWidth: 0 },
  recentName: {
    fontSize: 14, fontWeight: 700, color: "#e8f5e8", marginBottom: 6,
    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
  },
  recentMeta: { display: "flex", gap: 8, flexWrap: "wrap", fontSize: 12, color: "rgba(232,245,232,0.4)" },
  recentTag: {
    background: "rgba(74,222,128,0.1)", color: "#4ade80",
    padding: "1px 8px", borderRadius: 100, fontSize: 11, fontWeight: 600,
  },
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
  submitBtn: {
    width: "100%", background: "linear-gradient(135deg, #4ade80, #22c55e)",
    color: "#0a0f0a", border: "none", borderRadius: 10,
    padding: "13px", fontSize: 15, fontWeight: 700,
    cursor: "pointer", fontFamily: "inherit",
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
};

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
