// Runs on every webpage and detects recipes
function detectRecipe() {
  const data = {};

  // Try Schema.org structured data first (most reliable)
  const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
  for (const script of jsonLdScripts) {
    try {
      const json = JSON.parse(script.textContent);
      const recipe = json["@type"] === "Recipe" ? json
        : Array.isArray(json["@graph"])
          ? json["@graph"].find((i) => i["@type"] === "Recipe")
          : null;
      if (recipe) {
        data.name = recipe.name || "";
        data.description = recipe.description || "";
        data.servings = recipe.recipeYield || "";
        data.time = recipe.totalTime || recipe.cookTime || "";
        data.ingredients = Array.isArray(recipe.recipeIngredient)
          ? recipe.recipeIngredient : [];
        data.steps = Array.isArray(recipe.recipeInstructions)
          ? recipe.recipeInstructions.map((s) =>
              typeof s === "string" ? s : s.text || ""
            )
          : [];
        data.image = Array.isArray(recipe.image)
          ? recipe.image[0] : recipe.image?.url || recipe.image || "";
        data.source = window.location.href;
        data.found = true;
        return data;
      }
    } catch (e) {}
  }

  // Fallback: try to grab title at minimum
  data.name = document.title || "";
  data.source = window.location.href;
  data.found = false;
  return data;
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "detectRecipe") {
    sendResponse(detectRecipe());
  }
  return true;
});