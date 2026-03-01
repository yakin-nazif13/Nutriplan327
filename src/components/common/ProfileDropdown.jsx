import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut, updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";

export default function ProfileDropdown() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [newName, setNewName] = useState(user?.displayName || "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
        setEditMode(false);
        setError("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSave = async () => {
    if (!newName.trim()) { setError("Name cannot be empty."); return; }
    setLoading(true);
    setError("");
    try {
      // Update Firebase Auth
      await updateProfile(auth.currentUser, { displayName: newName.trim() });
      // Update Firestore
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { name: newName.trim() });
      setSuccess(true);
      setTimeout(() => { setSuccess(false); setEditMode(false); }, 1500);
    } catch (err) {
      setError("Failed to update name. Try again.");
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const displayName = user?.displayName || user?.email?.split("@")[0] || "User";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div style={styles.wrapper} ref={dropdownRef}>
      {/* Avatar button */}
      <button style={styles.avatarBtn} onClick={() => { setOpen(!open); setEditMode(false); }}>
        <div style={styles.avatarInitial}>{initial}</div>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={styles.dropdown}>
          {!editMode ? (
            <>
              {/* Profile info */}
              <div style={styles.profileHeader}>
                <div style={styles.profileAvatarLg}>
                  <span style={styles.profileInitial}>{initial}</span>
                </div>
                <div style={styles.profileInfo}>
                  <div style={styles.profileName}>{displayName}</div>
                  <div style={styles.profileEmail}>{user?.email}</div>
                </div>
              </div>

              <div style={styles.divider} />

              <button style={styles.menuItem} onClick={() => setEditMode(true)}>
                <span>✏️</span> Edit Username
              </button>
              <button style={styles.menuItem} onClick={() => { navigate("/dashboard"); setOpen(false); }}>
                <span>📊</span> Dashboard
              </button>
              <button style={styles.menuItem} onClick={() => { navigate("/recipes"); setOpen(false); }}>
                <span>📚</span> My Recipes
              </button>

              <div style={styles.divider} />

              <button style={{ ...styles.menuItem, ...styles.logoutItem }} onClick={handleLogout}>
                <span>🚪</span> Sign Out
              </button>
            </>
          ) : (
            <>
              {/* Edit username */}
              <div style={styles.editHeader}>
                <button style={styles.backBtn} onClick={() => { setEditMode(false); setError(""); }}>←</button>
                <span style={styles.editTitle}>Change Username</span>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Display Name</label>
                <input
                  style={styles.input}
                  value={newName}
                  onChange={(e) => { setNewName(e.target.value); setError(""); }}
                  placeholder="Your name"
                  onKeyDown={(e) => e.key === "Enter" && handleSave()}
                  autoFocus
                />
              </div>

              {error && <div style={styles.errorBox}>{error}</div>}
              {success && <div style={styles.successBox}>✅ Username updated!</div>}

              <button
                style={{ ...styles.saveBtn, opacity: loading ? 0.7 : 1 }}
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: { position: "relative" },

  avatarBtn: {
    width: 36, height: 36, borderRadius: "50%",
    border: "2px solid rgba(74,222,128,0.4)",
    padding: 0, cursor: "pointer", overflow: "hidden",
    background: "linear-gradient(135deg, #4ade80, #22c55e)",
  },
  avatarInitial: {
    width: "100%", height: "100%", display: "flex",
    alignItems: "center", justifyContent: "center",
    color: "#0a0f0a", fontWeight: 800, fontSize: 15,
  },

  dropdown: {
    position: "absolute", top: "calc(100% + 10px)", right: 0,
    width: 250, background: "#111a11",
    border: "1px solid rgba(74,222,128,0.2)",
    borderRadius: 14, padding: "8px",
    boxShadow: "0 16px 48px rgba(0,0,0,0.5)", zIndex: 200,
  },

  profileHeader: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "10px 8px 14px",
  },
  profileAvatarLg: {
    width: 44, height: 44, borderRadius: "50%",
    background: "linear-gradient(135deg, #4ade80, #22c55e)",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  profileInitial: { color: "#0a0f0a", fontWeight: 800, fontSize: 18 },
  profileInfo: { flex: 1, minWidth: 0 },
  profileName: {
    fontSize: 15, fontWeight: 700, color: "#e8f5e8",
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  profileEmail: {
    fontSize: 12, color: "rgba(232,245,232,0.35)", marginTop: 2,
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },

  divider: { height: 1, background: "rgba(255,255,255,0.06)", margin: "4px 0" },

  menuItem: {
    width: "100%", display: "flex", alignItems: "center", gap: 10,
    background: "none", border: "none", color: "rgba(232,245,232,0.7)",
    padding: "10px", borderRadius: 8, fontSize: 14,
    fontWeight: 500, cursor: "pointer", textAlign: "left",
    fontFamily: "inherit",
  },
  logoutItem: { color: "#f87171" },

  editHeader: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "8px 8px 14px",
  },
  backBtn: {
    background: "rgba(255,255,255,0.06)", border: "none",
    color: "#e8f5e8", width: 28, height: 28, borderRadius: 6,
    cursor: "pointer", fontSize: 16, display: "flex",
    alignItems: "center", justifyContent: "center",
  },
  editTitle: { fontSize: 15, fontWeight: 700, color: "#e8f5e8" },

  inputGroup: { padding: "0 4px", marginBottom: 12 },
  label: {
    fontSize: 12, fontWeight: 600,
    color: "rgba(232,245,232,0.5)", display: "block", marginBottom: 6,
  },
  input: {
    width: "100%", background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8, padding: "9px 12px",
    color: "#e8f5e8", fontSize: 14, outline: "none",
    boxSizing: "border-box", fontFamily: "inherit",
  },

  errorBox: {
    background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
    color: "#f87171", borderRadius: 6, padding: "8px 10px",
    fontSize: 12, marginBottom: 10,
  },
  successBox: {
    background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)",
    color: "#4ade80", borderRadius: 6, padding: "8px 10px",
    fontSize: 12, marginBottom: 10,
  },

  saveBtn: {
    width: "100%", background: "linear-gradient(135deg, #4ade80, #22c55e)",
    color: "#0a0f0a", border: "none", borderRadius: 8,
    padding: "10px", fontSize: 14, fontWeight: 700,
    cursor: "pointer", fontFamily: "inherit",
  },
};
