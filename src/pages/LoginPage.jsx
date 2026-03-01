import { useState } from "react";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div style={styles.root}>
      {/* Background blobs */}
      <div style={styles.blob1} />
      <div style={styles.blob2} />

      {/* Logo */}
      <a href="/" style={styles.logo}>
        <span style={{ fontSize: 22 }}>🌿</span>
        <span style={styles.logoText}>NutriPlan</span>
      </a>

      {/* Card */}
      <div style={styles.card}>

        {/* Forgot Password View */}
        {forgotPassword ? (
          <>
            <div style={styles.iconCircle}>🔑</div>
            <h2 style={styles.title}>Reset Password</h2>
            <p style={styles.subtitle}>
              Enter your email and we'll send you a reset link.
            </p>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                style={styles.input}
                value={form.email}
                onChange={handleChange}
              />
            </div>
            <button style={styles.primaryBtn}>Send Reset Link</button>
            <button
              style={styles.backLink}
              onClick={() => setForgotPassword(false)}
            >
              ← Back to Login
            </button>
          </>
        ) : (
          <>
            {/* Toggle tabs */}
            <div style={styles.tabs}>
              <button
                style={{ ...styles.tab, ...(isLogin ? styles.tabActive : {}) }}
                onClick={() => setIsLogin(true)}
              >
                Login
              </button>
              <button
                style={{ ...styles.tab, ...(!isLogin ? styles.tabActive : {}) }}
                onClick={() => setIsLogin(false)}
              >
                Sign Up
              </button>
            </div>

            <h2 style={styles.title}>
              {isLogin ? "Welcome Back!" : "Create Account"}
            </h2>
            <p style={styles.subtitle}>
              {isLogin
                ? "Sign in to access your recipe library and meal plans."
                : "Join NutriPlan and start tracking your nutrition today."}
            </p>

            {/* Google Button */}
            <button style={styles.googleBtn}>
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
                <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div style={styles.divider}>
              <div style={styles.dividerLine} />
              <span style={styles.dividerText}>or</span>
              <div style={styles.dividerLine} />
            </div>

            {/* Name field (signup only) */}
            {!isLogin && (
              <div style={styles.inputGroup}>
                <label style={styles.label}>Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Your name"
                  style={styles.input}
                  value={form.name}
                  onChange={handleChange}
                />
              </div>
            )}

            {/* Email */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                style={styles.input}
                value={form.email}
                onChange={handleChange}
              />
            </div>

            {/* Password */}
            <div style={styles.inputGroup}>
              <div style={styles.labelRow}>
                <label style={styles.label}>Password</label>
                {isLogin && (
                  <button
                    style={styles.forgotBtn}
                    onClick={() => setForgotPassword(true)}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div style={styles.passwordWrapper}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder={isLogin ? "Your password" : "Create a password"}
                  style={{ ...styles.input, paddingRight: 48 }}
                  value={form.password}
                  onChange={handleChange}
                />
                <button
                  style={styles.eyeBtn}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              {!isLogin && (
                <p style={styles.hint}>Must be at least 8 characters.</p>
              )}
            </div>

            {/* Submit */}
            <button style={styles.primaryBtn}>
              {isLogin ? "Login →" : "Create Account →"}
            </button>

            {/* Toggle link */}
            <p style={styles.toggleText}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                style={styles.toggleLink}
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? "Sign Up" : "Login"}
              </button>
            </p>
          </>
        )}
      </div>

      {/* Footer note */}
      <p style={styles.footerNote}>
        By continuing, you agree to NutriPlan's Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const styles = {
  root: {
    minHeight: "100vh",
    background: "#0a0f0a",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 24px",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  blob1: {
    position: "fixed", top: "-200px", left: "-150px",
    width: 500, height: 500,
    background: "radial-gradient(circle, rgba(74,222,128,0.13) 0%, transparent 70%)",
    borderRadius: "50%", pointerEvents: "none",
  },
  blob2: {
    position: "fixed", bottom: "-150px", right: "-150px",
    width: 450, height: 450,
    background: "radial-gradient(circle, rgba(52,211,153,0.09) 0%, transparent 70%)",
    borderRadius: "50%", pointerEvents: "none",
  },

  logo: {
    display: "flex", alignItems: "center", gap: 8,
    textDecoration: "none", marginBottom: 36, zIndex: 1,
  },
  logoText: {
    fontSize: 22, fontWeight: 700, color: "#4ade80", letterSpacing: "-0.5px",
  },

  card: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(74,222,128,0.15)",
    borderRadius: 20,
    padding: "40px 36px",
    width: "100%",
    maxWidth: 420,
    backdropFilter: "blur(20px)",
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 0,
  },

  iconCircle: {
    fontSize: 32, textAlign: "center", marginBottom: 16,
  },

  // Tabs
  tabs: {
    display: "flex",
    background: "rgba(255,255,255,0.04)",
    borderRadius: 10, padding: 4,
    marginBottom: 28,
  },
  tab: {
    flex: 1, padding: "9px 0",
    background: "none", border: "none",
    color: "rgba(232,245,232,0.45)",
    fontSize: 15, fontWeight: 600, cursor: "pointer",
    borderRadius: 8, transition: "all 0.2s",
  },
  tabActive: {
    background: "rgba(74,222,128,0.15)",
    color: "#4ade80",
  },

  title: {
    fontSize: 26, fontWeight: 800,
    color: "#e8f5e8", margin: "0 0 8px",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    fontSize: 14, color: "rgba(232,245,232,0.45)",
    margin: "0 0 24px", lineHeight: 1.5,
  },

  // Google
  googleBtn: {
    width: "100%",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#e8f5e8", borderRadius: 10,
    padding: "12px", fontSize: 15, fontWeight: 600,
    cursor: "pointer", marginBottom: 20,
    transition: "all 0.2s",
  },

  // Divider
  divider: {
    display: "flex", alignItems: "center", gap: 12, marginBottom: 20,
  },
  dividerLine: {
    flex: 1, height: 1, background: "rgba(255,255,255,0.08)",
  },
  dividerText: {
    fontSize: 13, color: "rgba(232,245,232,0.3)",
  },

  // Inputs
  inputGroup: {
    display: "flex", flexDirection: "column", gap: 6, marginBottom: 16,
  },
  labelRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
  },
  label: {
    fontSize: 13, fontWeight: 600,
    color: "rgba(232,245,232,0.6)", letterSpacing: "0.2px",
  },
  input: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10, padding: "12px 14px",
    color: "#e8f5e8", fontSize: 15,
    outline: "none", width: "100%",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
    fontFamily: "inherit",
  },
  passwordWrapper: {
    position: "relative",
  },
  eyeBtn: {
    position: "absolute", right: 12, top: "50%",
    transform: "translateY(-50%)",
    background: "none", border: "none",
    cursor: "pointer", fontSize: 16, padding: 0,
  },
  hint: {
    fontSize: 12, color: "rgba(232,245,232,0.3)", margin: "4px 0 0",
  },
  forgotBtn: {
    background: "none", border: "none",
    color: "#4ade80", fontSize: 13, fontWeight: 600,
    cursor: "pointer", padding: 0,
  },

  // Primary button
  primaryBtn: {
    width: "100%",
    background: "linear-gradient(135deg, #4ade80, #22c55e)",
    color: "#0a0f0a", border: "none",
    borderRadius: 10, padding: "13px",
    fontSize: 16, fontWeight: 700,
    cursor: "pointer", marginTop: 8,
    marginBottom: 20,
    transition: "opacity 0.2s",
    fontFamily: "inherit",
  },

  toggleText: {
    textAlign: "center", fontSize: 14,
    color: "rgba(232,245,232,0.45)", margin: 0,
  },
  toggleLink: {
    background: "none", border: "none",
    color: "#4ade80", fontWeight: 700,
    fontSize: 14, cursor: "pointer", padding: 0,
  },

  backLink: {
    background: "none", border: "none",
    color: "#4ade80", fontSize: 14, fontWeight: 600,
    cursor: "pointer", padding: 0, marginTop: 8,
    textAlign: "center",
  },

  footerNote: {
    marginTop: 24, fontSize: 12,
    color: "rgba(232,245,232,0.2)",
    textAlign: "center", maxWidth: 360,
    lineHeight: 1.5, zIndex: 1,
  },
};
