// ─── STYLES ───────────────────────────────────────────────────────────────────
const css = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 320px; background: #0a0f0a; color: #e8f5e8;
    font-family: 'Segoe UI', sans-serif; min-height: 200px;
  }
  .header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 16px; border-bottom: 1px solid rgba(74,222,128,0.15);
    background: rgba(74,222,128,0.05);
  }
  .logo { display: flex; align-items: center; gap: 8px; }
  .logo-text { font-size: 16px; font-weight: 700; color: #4ade80; }
  .open-app-btn {
    background: none; border: 1px solid rgba(74,222,128,0.25);
    color: #4ade80; padding: 4px 10px; border-radius: 6px;
    font-size: 12px; cursor: pointer;
  }
  .body { padding: 16px; }

  /* LOADING */
  .loading {
    text-align: center; padding: 32px 16px;
  }
  .loading-emoji { font-size: 32px; display: block; margin-bottom: 10px; }
  .loading-text { font-size: 13px; color: rgba(232,245,232,0.4); }

  /* NOT FOUND */
  .not-found { text-align: center; padding: 28px 16px; }
  .not-found-emoji { font-size: 40px; margin-bottom: 12px; }
  .not-found-title { font-size: 15px; font-weight: 700; margin-bottom: 6px; }
  .not-found-sub { font-size: 12px; color: rgba(232,245,232,0.4); line-height: 1.5; margin-bottom: 16px; }
  .supported-sites { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; }
  .site-pill {
    background: rgba(74,222,128,0.08); border: 1px solid rgba(74,222,128,0.15);
    color: rgba(232,245,232,0.5); padding: 3px 10px;
    border-radius: 100px; font-size: 11px;
  }

  /* RECIPE FOUND */
  .detected-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(74,222,128,0.12); border: 1px solid rgba(74,222,128,0.25);
    color: #4ade80; padding: 4px 12px; border-radius: 100px;
    font-size: 12px; font-weight: 600; margin-bottom: 14px;
  }
  .dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #4ade80; display: inline-block;
  }
  .recipe-card {
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px; padding: 14px; margin-bottom: 14px;
  }
  .recipe-name { font-size: 16px; font-weight: 700; margin-bottom: 8px; color: #e8f5e8; }
  .recipe-meta { display: flex; gap: 12px; margin-bottom: 12px; flex-wrap: wrap; }
  .meta-item { font-size: 12px; color: rgba(232,245,232,0.45); }
  .ingredients-preview { font-size: 13px; color: rgba(232,245,232,0.55); line-height: 1.6; }
  .ingredients-preview div { margin-bottom: 2px; }
  .more-label { font-size: 12px; color: #4ade80; margin-top: 4px; font-weight: 600; }
  .btn-row { display: flex; gap: 8px; }
  .btn-primary {
    flex: 1; background: linear-gradient(135deg, #4ade80, #22c55e);
    color: #0a0f0a; border: none; border-radius: 8px;
    padding: 10px; font-size: 14px; font-weight: 700; cursor: pointer;
  }
  .btn-secondary {
    flex: 1; background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1); color: rgba(232,245,232,0.6);
    border-radius: 8px; padding: 10px; font-size: 13px;
    font-weight: 600; cursor: pointer;
  }

  /* SUCCESS */
  .success { text-align: center; padding: 28px 16px; }
  .success-emoji { font-size: 44px; margin-bottom: 12px; }
  .success-title { font-size: 16px; font-weight: 700; color: #4ade80; margin-bottom: 6px; }
  .success-sub { font-size: 13px; color: rgba(232,245,232,0.4); margin-bottom: 16px; }
  .view-btn {
    background: linear-gradient(135deg, #4ade80, #22c55e);
    color: #0a0f0a; border: none; border-radius: 8px;
    padding: 10px 24px; font-size: 14px; font-weight: 700; cursor: pointer;
  }

  /* LOGIN REQUIRED */
  .login-required { text-align: center; padding: 28px 16px; }
  .login-required-emoji { font-size: 40px; margin-bottom: 12px; }
  .login-required-title { font-size: 15px; font-weight: 700; margin-bottom: 6px; }
  .login-required-sub { font-size: 12px; color: rgba(232,245,232,0.4); margin-bottom: 16px; line-height: 1.5; }
  .login-btn {
    background: linear-gradient(135deg, #4ade80, #22c55e);
    color: #0a0f0a; border: none; border-radius: 8px;
    padding: 10px 24px; font-size: 14px; font-weight: 700; cursor: pointer;
  }
`;

// ─── STATE ────────────────────────────────────────────────────────────────────
let state = {
  screen: "loading", // loading | not-found | found | success | login-required
  recipe: null,
};

// ─── RENDER ───────────────────────────────────────────────────────────────────
function render() {
  document.body.innerHTML = `<style>${css}</style>` + getHTML();
  attachEvents();
}

function getHTML() {
  const header = `
    <div class="header">
      <div class="logo">
        <span>🌿</span>
        <span class="logo-text">NutriPlan</span>
      </div>
      <button class="open-app-btn" id="openApp">Open App ↗</button>
    </div>
  `;

  let body = "";

  if (state.screen === "loading") {
    body = `
      <div class="loading">
        <span class="loading-emoji">🔍</span>
        <p class="loading-text">Scanning page for recipes...</p>
      </div>
    `;
  }

  else if (state.screen === "not-found") {
    body = `
      <div class="not-found">
        <div class="not-found-emoji">🍽️</div>
        <div class="not-found-title">No recipe detected</div>
        <p class="not-found-sub">
          Visit a recipe page and click the extension to import it into NutriPlan.
        </p>
        <div class="supported-sites">
          ${["AllRecipes", "Food Network", "NYT Cooking", "Tasty", "Budget Bytes"]
            .map((s) => `<span class="site-pill">${s}</span>`).join("")}
        </div>
      </div>
    `;
  }

  else if (state.screen === "login-required") {
    body = `
      <div class="login-required">
        <div class="login-required-emoji">🔐</div>
        <div class="login-required-title">Login Required</div>
        <p class="login-required-sub">
          Sign in to NutriPlan to import and save recipes from the web.
        </p>
        <button class="login-btn" id="goLogin">Sign In →</button>
      </div>
    `;
  }

  else if (state.screen === "found" && state.recipe) {
    const r = state.recipe;
    const previewIngredients = (r.ingredients || []).slice(0, 4);
    const extraCount = (r.ingredients || []).length - 4;

    body = `
      <div class="body">
        <div class="detected-badge">
          <span class="dot"></span> Recipe detected!
        </div>
        <div class="recipe-card">
          <div class="recipe-name">${r.name || "Unknown Recipe"}</div>
          <div class="recipe-meta">
            ${r.servings ? `<span class="meta-item">🍽 ${r.servings} servings</span>` : ""}
            ${r.time ? `<span class="meta-item">⏱ ${formatTime(r.time)}</span>` : ""}
            ${r.ingredients?.length ? `<span class="meta-item">📋 ${r.ingredients.length} ingredients</span>` : ""}
          </div>
          <div class="ingredients-preview">
            ${previewIngredients.map((i) => `<div>• ${i}</div>`).join("")}
            ${extraCount > 0 ? `<div class="more-label">+${extraCount} more ingredients</div>` : ""}
          </div>
        </div>
        <div class="btn-row">
          <button class="btn-primary" id="importBtn">Import Recipe</button>
          <button class="btn-secondary" id="cancelBtn">Cancel</button>
        </div>
      </div>
    `;
  }

  else if (state.screen === "success") {
    body = `
      <div class="success">
        <div class="success-emoji">✅</div>
        <div class="success-title">Recipe Imported!</div>
        <p class="success-sub">
          "${state.recipe?.name}" has been saved to your NutriPlan library.
        </p>
        <button class="view-btn" id="viewLibrary">View Library →</button>
      </div>
    `;
  }

  return `${header}<div class="body">${body}</div>`;
}

// ─── EVENTS ───────────────────────────────────────────────────────────────────
function attachEvents() {
  document.getElementById("openApp")?.addEventListener("click", () => {
    chrome.tabs.create({ url: "http://localhost:5173/recipes" });
  });

  document.getElementById("goLogin")?.addEventListener("click", () => {
    chrome.tabs.create({ url: "http://localhost:5173/login" });
  });

  document.getElementById("importBtn")?.addEventListener("click", handleImport);

  document.getElementById("cancelBtn")?.addEventListener("click", () => {
    state.screen = "not-found";
    render();
  });

  document.getElementById("viewLibrary")?.addEventListener("click", () => {
    chrome.tabs.create({ url: "http://localhost:5173/recipes" });
  });
}

// ─── IMPORT RECIPE ────────────────────────────────────────────────────────────
async function handleImport() {
  if (!state.recipe) return;

  // Check if user is logged in via chrome.storage
  chrome.storage.local.get(["nutriplan_user"], async (result) => {
    // Also accept if we just assume logged in for now
    // since Firebase session is in the web app
    const isLoggedIn = result.nutriplan_user || true;
    if (!isLoggedIn) {
      state.screen = "login-required";
      render();
      return;
    }
    try {
      // Save to localStorage so the web app can pick it up
      const recipeData = {
        name: state.recipe.name || "Imported Recipe",
        emoji: "🌐",
        source: state.recipe.source || "",
        ingredients: state.recipe.ingredients || [],
        steps: state.recipe.steps || [],
        servings: state.recipe.servings || 2,
        time: formatTime(state.recipe.time) || "",
        tag: "None",
        difficulty: "Medium",
        importedAt: new Date().toISOString(),
      };

      // Store in chrome.storage for the web app to read
      // Open the recipes page with the recipe data in the URL
    const encoded = encodeURIComponent(JSON.stringify(recipeData));
    chrome.tabs.create({ 
    url: `http://localhost:5173/recipes?import=${encoded}` 
    });
    state.screen = "success";
    render();
    } catch (err) {
      console.error("Import error:", err);
    }
  });
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function formatTime(time) {
  if (!time) return "";
  // Convert ISO 8601 duration (PT30M) to readable
  if (typeof time === "string" && time.startsWith("PT")) {
    const hours = time.match(/(\d+)H/)?.[1];
    const mins = time.match(/(\d+)M/)?.[1];
    if (hours && mins) return `${hours}h ${mins}min`;
    if (hours) return `${hours}h`;
    if (mins) return `${mins} min`;
  }
  return time;
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
async function init() {
  render(); // show loading

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Inject content script and ask for recipe data
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"],
    }).catch(() => null);

    chrome.tabs.sendMessage(tab.id, { action: "detectRecipe" }, (response) => {
      if (chrome.runtime.lastError || !response) {
        state.screen = "not-found";
        render();
        return;
      }

      if (response.found && response.name) {
        state.recipe = response;
        state.screen = "found";
      } else {
        state.screen = "not-found";
      }
      render();
    });
  } catch (err) {
    state.screen = "not-found";
    render();
  }
}

init();