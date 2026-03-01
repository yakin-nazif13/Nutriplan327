import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const USER = { name: "Yakin", avatar: "Y" };

const STATS = [
  { icon: "📚", label: "Total Recipes", value: 24, sub: "+3 this week", color: "#4ade80" },
  { icon: "❤️", label: "Favorites", value: 12, sub: "50% of library", color: "#f87171" },
  { icon: "🔥", label: "Avg Calories", value: "520", sub: "per meal", color: "#fb923c" },
  { icon: "🎯", label: "Goal Progress", value: "78%", sub: "Daily target", color: "#34d399" },
];

const RECENT_RECIPES = [
  { id: 1, name: "Grilled Salmon Salad", emoji: "🐟", calories: 420, protein: "38g", time: "20 min", tag: "Low-Carb" },
  { id: 2, name: "Greek Chicken Bowl", emoji: "🫙", calories: 450, protein: "36g", time: "25 min", tag: "Gluten-Free" },
  { id: 3, name: "Strawberry Spinach Salad", emoji: "🍓", calories: 320, protein: "15g", time: "15 min", tag: "Vegan" },
  { id: 4, name: "Honey Garlic Shrimp", emoji: "🍤", calories: 350, protein: "28g", time: "15 min", tag: "Gluten-Free" },
];

const CALORIE_DATA = [
  { day: "Mon", calories: 1850 },
  { day: "Tue", calories: 2100 },
  { day: "Wed", calories: 1760 },
  { day: "Thu", calories: 2200 },
  { day: "Fri", calories: 1950 },
  { day: "Sat", calories: 2400 },
  { day: "Sun", calories: 1800 },
];

const MEAL_PLAN = [
  { meal: "Breakfast", name: "Berry Smoothie Bowl", emoji: "🫐", calories: 350, time: "8:00 AM" },
  { meal: "Lunch", name: "Grilled Salmon Salad", emoji: "🐟", calories: 420, time: "12:30 PM" },
  { meal: "Snack", name: "Avocado Toast", emoji: "🥑", calories: 280, time: "3:30 PM" },
  { meal: "Dinner", name: "Greek Chicken Bowl", emoji: "🫙", calories: 450, time: "7:00 PM" },
];

const DIETARY_PREFS = [
  { label: "Vegetarian", icon: "🥬", active: false },
  { label: "Gluten-Free", icon: "🌾", active: true },
  { label: "Low-Carb", icon: "📉", active: true },
  { label: "Vegan", icon: "🌱", active: false },
];

const QUICK_ACTIONS = [
  { icon: "➕", label: "Add Recipe", color: "#4ade80", path: "/recipes/new" },
  { icon: "🔗", label: "Import URL", color: "#34d399", path: "/recipes" },
  { icon: "🧮", label: "Meal Calculator", color: "#6ee7b7", path: "/calculator" },
  { icon: "📊", label: "View Library", color: "#a7f3d0", path: "/recipes" },
];

const DAILY_GOAL = 2000;
const todayCalories = MEAL_PLAN.reduce((sum, m) => sum + m.calories, 0);
const goalPct = Math.round((todayCalories / DAILY_GOAL) * 100);

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState(DIETARY_PREFS);
  const [notifications, setNotifications] = useState(true);
  const [greeting] = useState(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  });

  const togglePref = (i) => {
    setPrefs((prev) =>
      prev.map((p, idx) => (idx === i ? { ...p, active: !p.active } : p))
    );
  };

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
          <button
            style={styles.notifBtn}
            onClick={() => setNotifications(!notifications)}
          >
            {notifications ? "🔔" : "🔕"}
          </button>
          <div style={styles.avatar}>{USER.avatar}</div>
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
                  onClick={() => togglePref(i)}
                >
                  <div style={{ ...styles.toggleThumb, ...(p.active ? styles.toggleThumbOn : {}) }} />
                </div>
              </div>
            ))}
          </div>

          <div style={styles.sidebarSection}>
            <p style={styles.sidebarHeading}>Quick Actions</p>
            {QUICK_ACTIONS.map((a) => (
              <button
                key={a.label}
                style={styles.quickAction}
                onClick={() => navigate(a.path)}
              >
                <span style={{ ...styles.quickIcon, background: `${a.color}18`, color: a.color }}>
                  {a.icon}
                </span>
                <span style={styles.quickLabel}>{a.label}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* MAIN */}
        <main style={styles.main}>
          {/* GREETING */}
          <div style={styles.greetingRow}>
            <div>
              <h1 style={styles.greeting}>
                {greeting}, <span style={styles.greetingName}>{USER.name}!</span> 👋
              </h1>
              <p style={styles.greetingSub}>
                Here's your nutrition overview for today.
              </p>
            </div>
            <div style={styles.dateBadge}>
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </div>
          </div>

          {/* STAT CARDS */}
          <div style={styles.statsGrid}>
            {STATS.map((s, i) => (
              <StatCard key={s.label} stat={s} delay={i * 0.08} />
            ))}
          </div>

          {/* DAILY GOAL BAR */}
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
                <div
                  style={{
                    ...styles.goalBarFill,
                    width: `${Math.min(goalPct, 100)}%`,
                    background: goalPct > 90
                      ? "linear-gradient(90deg, #fb923c, #ef4444)"
                      : "linear-gradient(90deg, #4ade80, #22c55e)",
                  }}
                />
              </div>
              <div style={styles.goalPct}>{goalPct}%</div>
            </div>
            <div style={styles.goalRemaining}>
              {DAILY_GOAL - todayCalories > 0
                ? `${DAILY_GOAL - todayCalories} kcal remaining`
                : "Goal reached! 🎉"}
            </div>
          </div>

          {/* MIDDLE ROW */}
          <div style={styles.midRow}>
            {/* CALORIE CHART */}
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
                    contentStyle={{
                      background: "#111a11", border: "1px solid rgba(74,222,128,0.2)",
                      borderRadius: 8, color: "#e8f5e8", fontSize: 13,
                    }}
                    formatter={(v) => [`${v} kcal`, "Calories"]}
                  />
                  <Line
                    type="monotone" dataKey="calories"
                    stroke="#4ade80" strokeWidth={2.5}
                    dot={{ fill: "#4ade80", r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: "#4ade80" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* TODAY'S MEALS */}
            <div style={styles.mealsCard}>
              <div style={styles.cardHeader}>
                <h2 style={styles.cardTitle}>🗓 Today's Meals</h2>
                <span style={styles.cardSub}>{todayCalories} kcal total</span>
              </div>
              {MEAL_PLAN.map((meal) => (
                <div key={meal.meal} style={styles.mealRow}>
                  <div style={styles.mealEmoji}>{meal.emoji}</div>
                  <div style={styles.mealInfo}>
                    <div style={styles.mealName}>{meal.name}</div>
                    <div style={styles.mealMeta}>{meal.meal} · {meal.time}</div>
                  </div>
                  <div style={styles.mealCal}>{meal.calories} kcal</div>
                </div>
              ))}
            </div>
          </div>

          {/* RECENT RECIPES */}
          <div style={styles.recentSection}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.cardTitle}>🕐 Recent Recipes</h2>
              <button style={styles.viewAllBtn} onClick={() => navigate("/recipes")}>
                View All →
              </button>
            </div>
            <div style={styles.recentGrid}>
              {RECENT_RECIPES.map((r) => (
                <div
                  key={r.id}
                  style={styles.recentCard}
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
                  <div style={styles.recentEmoji}>{r.emoji}</div>
                  <div style={styles.recentInfo}>
                    <div style={styles.recentName}>{r.name}</div>
                    <div style={styles.recentMeta}>
                      <span>⏱ {r.time}</span>
                      <span>🔥 {r.calories} kcal</span>
                      <span style={styles.recentTag}>{r.tag}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ stat, delay }) {
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
      <div style={styles.statValue} >{stat.value}</div>
      <div style={styles.statLabel}>{stat.label}</div>
      <div style={{ ...styles.statSub, color: stat.color }}>{stat.sub}</div>
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
    display: "flex", alignItems: "center",
    padding: "0 24px", height: 64, gap: 24,
  },
  logo: { display: "flex", alignItems: "center", gap: 8, textDecoration: "none", flexShrink: 0 },
  logoText: { fontSize: 18, fontWeight: 700, color: "#4ade80" },
  topNav: { display: "flex", gap: 4, flex: 1, justifyContent: "center" },
  topNavBtn: {
    background: "none", border: "none", color: "rgba(232,245,232,0.55)",
    fontSize: 14, fontWeight: 500, cursor: "pointer", padding: "8px 14px",
    borderRadius: 8, transition: "all 0.2s",
  },
  topbarRight: { display: "flex", alignItems: "center", gap: 12, flexShrink: 0 },
  notifBtn: {
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8, width: 36, height: 36, fontSize: 16,
    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
  },
  avatar: {
    width: 36, height: 36, borderRadius: "50%",
    background: "linear-gradient(135deg, #4ade80, #22c55e)",
    color: "#0a0f0a", display: "flex", alignItems: "center",
    justifyContent: "center", fontWeight: 800, fontSize: 15,
  },

  // LAYOUT
  layout: {
    display: "flex", maxWidth: 1300, margin: "0 auto",
    padding: "0 16px", position: "relative", zIndex: 1,
  },

  // SIDEBAR
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

  // PREFS
  prefRow: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "8px 6px", borderRadius: 8, marginBottom: 4,
  },
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

  // QUICK ACTIONS
  quickAction: {
    width: "100%", display: "flex", alignItems: "center", gap: 10,
    background: "none", border: "none", cursor: "pointer",
    padding: "8px 6px", borderRadius: 8, marginBottom: 4,
    transition: "background 0.2s",
  },
  quickIcon: {
    width: 30, height: 30, borderRadius: 8,
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15,
  },
  quickLabel: { fontSize: 13, color: "rgba(232,245,232,0.6)", fontWeight: 500 },

  // MAIN
  main: { flex: 1, padding: "28px 0 60px 20px" },

  // GREETING
  greetingRow: {
    display: "flex", alignItems: "flex-start",
    justifyContent: "space-between", flexWrap: "wrap",
    gap: 12, marginBottom: 28,
  },
  greeting: {
    fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 800,
    letterSpacing: "-0.5px", margin: 0,
  },
  greetingName: { color: "#4ade80" },
  greetingSub: { fontSize: 14, color: "rgba(232,245,232,0.4)", margin: "6px 0 0" },
  dateBadge: {
    background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.15)",
    color: "rgba(232,245,232,0.5)", padding: "6px 14px",
    borderRadius: 100, fontSize: 13,
  },

  // STATS
  statsGrid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: 16, marginBottom: 20,
  },
  statCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 14, padding: "18px 16px",
    transition: "all 0.25s ease", cursor: "default",
  },
  statIcon: { fontSize: 22, width: 44, height: 44, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  statValue: { fontSize: 30, fontWeight: 900, color: "#e8f5e8", letterSpacing: "-1px", lineHeight: 1 },
  statLabel: { fontSize: 13, color: "rgba(232,245,232,0.45)", margin: "6px 0 4px" },
  statSub: { fontSize: 12, fontWeight: 600 },

  // GOAL BAR
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
  goalBarBg: {
    flex: 1, height: 10, background: "rgba(255,255,255,0.07)",
    borderRadius: 100, overflow: "hidden",
  },
  goalBarFill: { height: "100%", borderRadius: 100, transition: "width 0.5s ease" },
  goalPct: { fontSize: 16, fontWeight: 800, color: "#4ade80", minWidth: 40, textAlign: "right" },
  goalRemaining: { fontSize: 13, color: "rgba(232,245,232,0.35)", width: "100%", marginTop: -8 },

  // MID ROW
  midRow: {
    display: "grid", gridTemplateColumns: "1fr 300px",
    gap: 20, marginBottom: 20,
  },
  chartCard: {
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 14, padding: "20px",
  },
  mealsCard: {
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 14, padding: "20px",
  },
  cardHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16,
  },
  cardTitle: { fontSize: 16, fontWeight: 700, color: "#e8f5e8", margin: 0 },
  cardSub: { fontSize: 12, color: "rgba(232,245,232,0.35)" },

  // MEAL ROWS
  mealRow: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  mealEmoji: { fontSize: 24, width: 36, textAlign: "center" },
  mealInfo: { flex: 1 },
  mealName: { fontSize: 13, fontWeight: 600, color: "#e8f5e8" },
  mealMeta: { fontSize: 12, color: "rgba(232,245,232,0.35)", marginTop: 2 },
  mealCal: { fontSize: 13, fontWeight: 700, color: "#4ade80" },

  // RECENT RECIPES
  recentSection: {},
  sectionHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16,
  },
  viewAllBtn: {
    background: "none", border: "none", color: "#4ade80",
    fontSize: 13, fontWeight: 600, cursor: "pointer",
  },
  recentGrid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16,
  },
  recentCard: {
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 12, padding: "16px", cursor: "pointer", transition: "all 0.25s ease",
    display: "flex", alignItems: "center", gap: 14,
  },
  recentEmoji: { fontSize: 32, flexShrink: 0 },
  recentInfo: { flex: 1, minWidth: 0 },
  recentName: {
    fontSize: 14, fontWeight: 700, color: "#e8f5e8",
    marginBottom: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
  },
  recentMeta: { display: "flex", gap: 8, flexWrap: "wrap", fontSize: 12, color: "rgba(232,245,232,0.4)" },
  recentTag: {
    background: "rgba(74,222,128,0.1)", color: "#4ade80",
    padding: "1px 8px", borderRadius: 100, fontSize: 11, fontWeight: 600,
  },
};
