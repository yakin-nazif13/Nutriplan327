import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, googleProvider, db } from "../firebase";

export default function LoginPage({ initialMode = "login" }) {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const getFriendlyError = (code) => {
    switch (code) {
      case "auth/user-not-found": return "No account found with this email.";
      case "auth/wrong-password": return "Incorrect password. Please try again.";
      case "auth/email-already-in-use": return "An account with this email already exists.";
      case "auth/weak-password": return "Password must be at least 6 characters.";
      case "auth/invalid-email": return "Please enter a valid email address.";
      case "auth/too-many-requests": return "Too many attempts. Please try again later.";
      case "auth/popup-closed-by-user": return "Google sign-in was cancelled.";
      case "auth/invalid-credential": return "Incorrect email or password.";
      default: return "Something went wrong. Please try again.";
    }
  };

  const createUserProfile = async (user, name = "") => {
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, {
      uid: user.uid,
      name: name || user.displayName || "User",
      email: user.email,
      createdAt: serverTimestamp(),
      preferences: { vegetarian: false, glutenFree: false, lowCarb: false, vegan: false },
      totalRecipes: 0,
      favorites: [],
    }, { merge: true });
  };

  const handleLogin = async () => {
    if (!form.email || !form.password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);
      navigate("/dashboard");
    } catch (err) { setError(getFriendlyError(err.code)); }
    setLoading(false);
  };

  const handleSignup = async () => {
    if (!form.name || !form.email || !form.password) { setError("Please fill in all fields."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await updateProfile(result.user, { displayName: form.name });
      await createUserProfile(result.user, form.name);
      navigate("/dashboard");
    } catch (err) { setError(getFriendlyError(err.code)); }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await createUserProfile(result.user);
      navigate("/dashboard");
    } catch (err) { setError(getFriendlyError(err.code)); }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!form.email) { setError("Please enter your email address."); return; }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, form.email);
      setSuccessMsg("Reset link sent! Check your email inbox.");
      setError("");
    } catch (err) { setError(getFriendlyError(err.code)); }
    setLoading(false);
  };

  const handleSubmit = () => isLogin ? handleLogin() : handleSignup();

  return (
    <div style={styles.root}>
      <div style={styles.blob1} />
      <div style={styles.blob2} />

      <a href="/" style={styles.logo}>
        <span style={{ fontSize: 22 }}>🌿</span>
        <span style={styles.logoText}>NutriPlan</span>
      </a>

      <div style={styles.card}>
        {forgotPassword ? (
          <>
            <div style={styles.iconCircle}>🔑</div>
            <h2 style={styles.title}>Reset Password</h2>
            <p style={styles.subtitle}>Enter your email and we'll send you a reset link.</p>
            {error && <div style={styles.errorBox}>{error}</div>}
            {successMsg && <div style={styles.successBox}>{successMsg}</div>}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <input type="email" name="email" placeholder="you@example.com"
                style={styles.input} value={form.email} onChange={handleChange} />
            </div>
            <button style={{ ...styles.primaryBtn, opacity: loading ? 0.7 : 1 }}
              onClick={handleForgotPassword} disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
            <button style={styles.backLink} onClick={() => { setForgotPassword(false); setError(""); setSuccessMsg(""); }}>
              ← Back to Login
            </button>
          </>
        ) : (
          <>
            <div style={styles.tabs}>
              <button style={{ ...styles.tab, ...(isLogin ? styles.tabActive : {}) }}
                onClick={() => { setIsLogin(true); setError(""); }}>Login</button>
              <button style={{ ...styles.tab, ...(!isLogin ? styles.tabActive : {}) }}
                onClick={() => { setIsLogin(false); setError(""); }}>Sign Up</button>
            </div>

            <h2 style={styles.title}>{isLogin ? "Welcome Back!" : "Create Account"}</h2>
            <p style={styles.subtitle}>
              {isLogin ? "Sign in to access your recipe library and meal plans."
                : "Join NutriPlan and start tracking your nutrition today."}
            </p>

            {error && <div style={styles.errorBox}>{error}</div>}

            <button style={styles.googleBtn} onClick={handleGoogle} disabled={loading}>
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
                <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
              </svg>
              {loading ? "Please wait..." : "Continue with Google"}
            </button>

            <div style={styles.divider}>
              <div style={styles.dividerLine} />
              <span style={styles.dividerText}>or</span>
              <div style={styles.dividerLine} />
            </div>

            {!isLogin && (
              <div style={styles.inputGroup}>
                <label style={styles.label}>Full Name</label>
                <input type="text" name="name" placeholder="Your name"
                  style={styles.input} value={form.name} onChange={handleChange} />
              </div>
            )}

            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <input type="email" name="email" placeholder="you@example.com"
                style={styles.input} value={form.email} onChange={handleChange} />
            </div>

            <div style={styles.inputGroup}>
              <div style={styles.labelRow}>
                <label style={styles.label}>Password</label>
                {isLogin && (
                  <button style={styles.forgotBtn}
                    onClick={() => { setForgotPassword(true); setError(""); }}>
                    Forgot password?
                  </button>
                )}
              </div>
              <div style={styles.passwordWrapper}>
                <input type={showPassword ? "text" : "password"} name="password"
                  placeholder={isLogin ? "Your password" : "Min. 6 characters"}
                  style={{ ...styles.input, paddingRight: 48 }}
                  value={form.password} onChange={handleChange}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
                <button style={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button style={{ ...styles.primaryBtn, opacity: loading ? 0.7 : 1 }}
              onClick={handleSubmit} disabled={loading}>
              {loading ? "Please wait..." : isLogin ? "Login →" : "Create Account →"}
            </button>

            <p style={styles.toggleText}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button style={styles.toggleLink}
                onClick={() => { setIsLogin(!isLogin); setError(""); }}>
                {isLogin ? "Sign Up" : "Login"}
              </button>
            </p>
          </>
        )}
      </div>

      <p style={styles.footerNote}>
        By continuing, you agree to NutriPlan's Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}

const styles = {
  root: {
    minHeight: "100vh", background: "#0a0f0a",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    padding: "40px 24px", position: "relative",
    overflow: "hidden", fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  blob1: {
    position: "fixed", top: "-200px", left: "-150px", width: 500, height: 500,
    background: "radial-gradient(circle, rgba(74,222,128,0.13) 0%, transparent 70%)",
    borderRadius: "50%", pointerEvents: "none",
  },
  blob2: {
    position: "fixed", bottom: "-150px", right: "-150px", width: 450, height: 450,
    background: "radial-gradient(circle, rgba(52,211,153,0.09) 0%, transparent 70%)",
    borderRadius: "50%", pointerEvents: "none",
  },
  logo: { display: "flex", alignItems: "center", gap: 8, textDecoration: "none", marginBottom: 36, zIndex: 1 },
  logoText: { fontSize: 22, fontWeight: 700, color: "#4ade80", letterSpacing: "-0.5px" },
  card: {
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(74,222,128,0.15)",
    borderRadius: 20, padding: "40px 36px", width: "100%", maxWidth: 420,
    backdropFilter: "blur(20px)", zIndex: 1, display: "flex", flexDirection: "column",
  },
  iconCircle: { fontSize: 32, textAlign: "center", marginBottom: 16 },
  tabs: {
    display: "flex", background: "rgba(255,255,255,0.04)",
    borderRadius: 10, padding: 4, marginBottom: 28,
  },
  tab: {
    flex: 1, padding: "9px 0", background: "none", border: "none",
    color: "rgba(232,245,232,0.45)", fontSize: 15, fontWeight: 600,
    cursor: "pointer", borderRadius: 8, transition: "all 0.2s",
  },
  tabActive: { background: "rgba(74,222,128,0.15)", color: "#4ade80" },
  title: { fontSize: 26, fontWeight: 800, color: "#e8f5e8", margin: "0 0 8px", letterSpacing: "-0.5px" },
  subtitle: { fontSize: 14, color: "rgba(232,245,232,0.45)", margin: "0 0 24px", lineHeight: 1.5 },
  errorBox: {
    background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
    color: "#f87171", borderRadius: 8, padding: "10px 14px",
    fontSize: 13, marginBottom: 16, lineHeight: 1.4,
  },
  successBox: {
    background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.25)",
    color: "#4ade80", borderRadius: 8, padding: "10px 14px",
    fontSize: 13, marginBottom: 16, lineHeight: 1.4,
  },
  googleBtn: {
    width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
    color: "#e8f5e8", borderRadius: 10, padding: "12px",
    fontSize: 15, fontWeight: 600, cursor: "pointer", marginBottom: 20,
  },
  divider: { display: "flex", alignItems: "center", gap: 12, marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, background: "rgba(255,255,255,0.08)" },
  dividerText: { fontSize: 13, color: "rgba(232,245,232,0.3)" },
  inputGroup: { display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 },
  labelRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  label: { fontSize: 13, fontWeight: 600, color: "rgba(232,245,232,0.6)", letterSpacing: "0.2px" },
  input: {
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10, padding: "12px 14px", color: "#e8f5e8",
    fontSize: 15, outline: "none", width: "100%",
    boxSizing: "border-box", fontFamily: "inherit",
  },
  passwordWrapper: { position: "relative" },
  eyeBtn: {
    position: "absolute", right: 12, top: "50%",
    transform: "translateY(-50%)", background: "none",
    border: "none", cursor: "pointer", fontSize: 16, padding: 0,
  },
  forgotBtn: {
    background: "none", border: "none", color: "#4ade80",
    fontSize: 13, fontWeight: 600, cursor: "pointer", padding: 0,
  },
  primaryBtn: {
    width: "100%", background: "linear-gradient(135deg, #4ade80, #22c55e)",
    color: "#0a0f0a", border: "none", borderRadius: 10,
    padding: "13px", fontSize: 16, fontWeight: 700,
    cursor: "pointer", marginTop: 8, marginBottom: 20,
    fontFamily: "inherit", transition: "opacity 0.2s",
  },
  toggleText: { textAlign: "center", fontSize: 14, color: "rgba(232,245,232,0.45)", margin: 0 },
  toggleLink: {
    background: "none", border: "none", color: "#4ade80",
    fontWeight: 700, fontSize: 14, cursor: "pointer", padding: 0,
  },
  backLink: {
    background: "none", border: "none", color: "#4ade80",
    fontSize: 14, fontWeight: 600, cursor: "pointer",
    padding: 0, marginTop: 8, textAlign: "center",
  },
  footerNote: {
    marginTop: 24, fontSize: 12, color: "rgba(232,245,232,0.2)",
    textAlign: "center", maxWidth: 360, lineHeight: 1.5, zIndex: 1,
  },
};
