import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import cors from "cors";
import axios from "axios";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("meals.db");

// Initialize DB
db.exec(`
  CREATE TABLE IF NOT EXISTS meal_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    week_start TEXT NOT NULL,
    day TEXT NOT NULL,
    recipes TEXT,
    UNIQUE(week_start, day)
  );

  -- Migration: Add recipes column if it doesn't exist (for older DBs)
  -- Since SQLite doesn't support IF NOT EXISTS for ADD COLUMN, we use a try-catch pattern in JS if needed,
  -- but for this environment, we can just try to add it and ignore the error if it exists.
`);

try {
  db.exec("ALTER TABLE meal_plans ADD COLUMN recipes TEXT;");
} catch (e) {}

try {
  db.exec("ALTER TABLE meal_plans ADD COLUMN instructions TEXT;");
} catch (e) {}

try {
  db.exec("ALTER TABLE recipes ADD COLUMN directions TEXT;");
} catch (e) {
  // Column likely already exists
}

try {
  db.exec("ALTER TABLE recipes ADD COLUMN tags TEXT;");
} catch (e) {
  // Column likely already exists
}

db.exec(`
  CREATE TABLE IF NOT EXISTS recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    ingredients TEXT,
    directions TEXT,
    rating INTEGER DEFAULT 0,
    tags TEXT
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS pantry (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    category TEXT
  );

  INSERT OR IGNORE INTO settings (key, value) VALUES ('ollama_url', 'http://localhost:11434');
  INSERT OR IGNORE INTO settings (key, value) VALUES ('ollama_model', 'llama3');
  INSERT OR IGNORE INTO settings (key, value) VALUES ('import_prompt', 'Extract the recipe from the following text or URL content. Output ONLY a JSON object with "name", "ingredients" (array of {name, amount}), and "directions" (array of strings) keys. No extra text.\n\nContent: {{content}}');
  INSERT OR IGNORE INTO settings (key, value) VALUES ('suggest_prompt', 'Suggest a simple and delicious recipe based on these ingredients I have: {{content}}. \n\nDietary Preferences: {{dietaryOptions}}\nAdditional Instructions: {{additionalInstructions}}\n\nGuidelines:\n- Focus on simple recipes.\n- You do not need to use all provided ingredients.\n- Prioritize using the provided ingredients, but you can include common staples or other ingredients not listed if needed.\n\nOutput ONLY a JSON object with "name", "ingredients" (array of {name, amount}), and "directions" (array of strings) keys. No extra text.');
  INSERT OR IGNORE INTO settings (key, value) VALUES ('suggest_options', 'FODMAP, Low Calorie, Vegetarian, Vegan, Gluten Free');
  INSERT OR IGNORE INTO settings (key, value) VALUES ('ollama_timeout_suggest', '60000');
  INSERT OR IGNORE INTO settings (key, value) VALUES ('ollama_timeout_import', '45000');
  INSERT OR IGNORE INTO settings (key, value) VALUES ('ollama_timeout_ingredients', '30000');
  INSERT OR IGNORE INTO settings (key, value) VALUES ('ollama_timeout_cleanup', '45000');
  INSERT OR IGNORE INTO settings (key, value) VALUES ('cleanup_prompt', 'Review and improve the following recipe. Fix any typos, improve the clarity of the directions, and ensure the ingredient amounts are consistent. Output ONLY a JSON object with "name", "ingredients" (array of {name, amount}), and "directions" (array of strings) keys. No extra text.\n\nRecipe: {{content}}');
  INSERT OR IGNORE INTO settings (key, value) VALUES ('week_start_day', 'Monday');
`);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3112;

  app.use(cors());
  app.use(express.json());

  // Settings API
  app.get("/api/settings", (req, res) => {
    const rows = db.prepare("SELECT * FROM settings").all();
    const settings = rows.reduce((acc: any, row: any) => {
      acc[row.key] = row.value;
      return acc;
    }, {});
    res.json(settings);
  });

  app.post("/api/settings", (req, res) => {
    const { ollama_url, ollama_model, import_prompt, suggest_prompt, suggest_options, ollama_timeout_suggest, ollama_timeout_import, ollama_timeout_ingredients, cleanup_prompt, ollama_timeout_cleanup, week_start_day } = req.body;
    const stmt = db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)");
    if (ollama_url) stmt.run("ollama_url", ollama_url);
    if (ollama_model) stmt.run("ollama_model", ollama_model);
    if (import_prompt) stmt.run("import_prompt", import_prompt);
    if (suggest_prompt) stmt.run("suggest_prompt", suggest_prompt);
    if (suggest_options) stmt.run("suggest_options", suggest_options);
    if (ollama_timeout_suggest) stmt.run("ollama_timeout_suggest", String(ollama_timeout_suggest));
    if (ollama_timeout_import) stmt.run("ollama_timeout_import", String(ollama_timeout_import));
    if (ollama_timeout_ingredients) stmt.run("ollama_timeout_ingredients", String(ollama_timeout_ingredients));
    if (cleanup_prompt) stmt.run("cleanup_prompt", cleanup_prompt);
    if (ollama_timeout_cleanup) stmt.run("ollama_timeout_cleanup", String(ollama_timeout_cleanup));
    if (week_start_day) stmt.run("week_start_day", week_start_day);
    res.json({ success: true });
  });

  app.get("/api/ai/test-connection", async (req, res) => {
    const url = db.prepare("SELECT value FROM settings WHERE key = 'ollama_url'").get() as any;
    try {
      const response = await axios.get(`${url.value}/api/tags`);
      res.json({ success: true, models: response.data.models });
    } catch (err) {
      console.error("Ollama connection test failed:", err);
      res.status(500).json({ error: "Could not connect to Ollama" });
    }
  });

  // API Routes
  
  // Get meal plan for a specific week
  app.get("/api/plan/:weekStart", (req, res) => {
    const { weekStart } = req.params;
    const rows = db.prepare("SELECT * FROM meal_plans WHERE week_start = ?").all(weekStart);
    res.json(rows);
  });

  // Save meal plan for a specific day
  app.post("/api/plan", (req, res) => {
    const { week_start, day, recipes, instructions } = req.body;
    const stmt = db.prepare(`
      INSERT INTO meal_plans (week_start, day, recipes, instructions)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(week_start, day) DO UPDATE SET
        recipes = excluded.recipes,
        instructions = excluded.instructions
    `);
    stmt.run(week_start, day, JSON.stringify(recipes), JSON.stringify(instructions || []));
    res.json({ success: true });
  });

  // Recipes API
  app.get("/api/recipes", (req, res) => {
    const rows = db.prepare("SELECT * FROM recipes").all();
    res.json(rows.map((r: any) => ({ 
      ...r, 
      ingredients: JSON.parse(r.ingredients || "[]"),
      directions: JSON.parse(r.directions || "[]"),
      tags: JSON.parse(r.tags || "[]")
    })));
  });

  app.post("/api/recipes", (req, res) => {
    const { name, ingredients, directions, rating, tags } = req.body;
    const stmt = db.prepare(`
      INSERT INTO recipes (name, ingredients, directions, rating, tags)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(name) DO UPDATE SET
        ingredients = excluded.ingredients,
        directions = excluded.directions,
        rating = excluded.rating,
        tags = excluded.tags
    `);
    stmt.run(name, JSON.stringify(ingredients), JSON.stringify(directions || []), rating || 0, JSON.stringify(tags || []));
    res.json({ success: true });
  });

  app.delete("/api/recipes/:id", (req, res) => {
    db.prepare("DELETE FROM recipes WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Pantry API
  app.get("/api/pantry", (req, res) => {
    const rows = db.prepare("SELECT * FROM pantry ORDER BY name ASC").all();
    res.json(rows);
  });

  app.post("/api/pantry", (req, res) => {
    const { name, category } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });
    const capitalized = name.trim().charAt(0).toUpperCase() + name.trim().slice(1);
    const stmt = db.prepare(`
      INSERT INTO pantry (name, category)
      VALUES (?, ?)
      ON CONFLICT(name) DO UPDATE SET
        category = excluded.category
    `);
    stmt.run(capitalized, category || "General");
    res.json({ success: true });
  });

  app.delete("/api/pantry/:id", (req, res) => {
    db.prepare("DELETE FROM pantry WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // AI Proxy for Ollama
  app.post("/api/ai/generate-ingredients", async (req, res) => {
    const { recipeName, pantryContext } = req.body;
    try {
      const urlRow = db.prepare("SELECT value FROM settings WHERE key = 'ollama_url'").get() as any;
      const modelRow = db.prepare("SELECT value FROM settings WHERE key = 'ollama_model'").get() as any;
      const timeoutRow = db.prepare("SELECT value FROM settings WHERE key = 'ollama_timeout_ingredients'").get() as any;
      
      const OLLAMA_URL = urlRow?.value || "http://localhost:11434";
      const OLLAMA_MODEL = modelRow?.value || "llama3";
      const TIMEOUT = parseInt(timeoutRow?.value) || 30000;

      let prompt = `List the ingredients for "${recipeName}" with their typical amounts. Output ONLY a JSON array of objects with "name" and "amount" keys. Example: [{"name": "Chicken", "amount": "500g"}]. No extra text.`;
      
      if (pantryContext) {
        prompt += `\n\nContext: The user currently has the following in their pantry/fridge/freezer: ${pantryContext}. Please prioritize suggesting ingredients they already have if they are relevant to the recipe.`;
      }
      
      const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
        model: OLLAMA_MODEL,
        prompt: prompt,
        stream: false,
        format: "json"
      }, {
        timeout: TIMEOUT
      });

      let responseText = response.data.response;
      if (responseText.includes("```")) {
        responseText = responseText.replace(/```json\n?|```/g, "").trim();
      }

      const result = JSON.parse(responseText);
      res.json(result);
    } catch (err) {
      console.error("Ollama error:", err);
      res.status(500).json({ error: "Failed to generate ingredients with Ollama" });
    }
  });

  app.post("/api/ai/suggest-recipe", async (req, res) => {
    const { pantryContext, additionalInstructions, dietaryOptions, recipeCount, useDifferentProteins, plannedRecipes } = req.body;
    try {
      const urlRow = db.prepare("SELECT value FROM settings WHERE key = 'ollama_url'").get() as any;
      const modelRow = db.prepare("SELECT value FROM settings WHERE key = 'ollama_model'").get() as any;
      const promptRow = db.prepare("SELECT value FROM settings WHERE key = 'suggest_prompt'").get() as any;
      const timeoutRow = db.prepare("SELECT value FROM settings WHERE key = 'ollama_timeout_suggest'").get() as any;
      
      const OLLAMA_URL = urlRow?.value || "http://localhost:11434";
      const OLLAMA_MODEL = modelRow?.value || "llama3";
      const TIMEOUT = parseInt(timeoutRow?.value) || 60000;
      
      const count = parseInt(recipeCount) || 1;
      let finalPrompt = '';
      
      const uniqueConstraint = plannedRecipes && plannedRecipes.length > 0 
        ? `\n- DO NOT suggest recipes similar to these already planned: ${plannedRecipes.join(', ')}.`
        : "";

      if (count > 1) {
        finalPrompt = `Suggest ${count} unique and distinct recipes based on these ingredients I have: ${pantryContext || "nothing specific"}. 

Dietary Preferences: ${dietaryOptions || "none"}
Additional Instructions: ${additionalInstructions || "none"}

Guidelines:
- Focus on simple recipes.
- Each recipe should be unique and distinct.${uniqueConstraint}
- You do not need to use all provided ingredients.
- Prioritize using the provided ingredients, but you can include common staples or other ingredients not listed if needed.
${useDifferentProteins ? "- Minimize the overlap in meat protein used in the recipes." : ""}

Output ONLY a valid JSON array of objects. Each object MUST have:
- "name": (string)
- "yield": (string, e.g. "4 servings")
- "ingredients": (array of {name, amount})
- "directions": (array of strings)

Example output:
[
  {
    "name": "Recipe 1",
    "yield": "4 servings",
    "ingredients": [{"name": "Item", "amount": "1"}],
    "directions": ["Step 1"]
  },
  {
    "name": "Recipe 2",
    "yield": "2 servings",
    "ingredients": [{"name": "Item", "amount": "2"}],
    "directions": ["Step 1"]
  }
]

No extra text.`;
      } else {
        finalPrompt = `Suggest a recipe based on: ${pantryContext || "nothing specific"}. 

Dietary Preferences: ${dietaryOptions || "none"}
Additional Instructions: ${additionalInstructions || "none"}${uniqueConstraint}

Output ONLY a valid JSON object with "name", "yield" (string, e.g. "4 servings"), "ingredients" (array of {name, amount}), and "directions" (array of strings) keys. No extra text.`;
      }
      
      const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
        model: OLLAMA_MODEL,
        prompt: finalPrompt,
        stream: false,
        format: "json"
      }, {
        timeout: TIMEOUT
      });

      let responseText = response.data.response;
      // Clean up markdown backticks if present
      if (responseText.includes("```")) {
        responseText = responseText.replace(/```json\n?|```/g, "").trim();
      }

      const result = JSON.parse(responseText);
      res.json(result);
    } catch (err) {
      console.error("Ollama error:", err);
      res.status(500).json({ error: "Failed to suggest recipe with Ollama" });
    }
  });
  
  app.post("/api/ai/import-recipe", async (req, res) => {
    const { url, text } = req.body;
    try {
      let content = text || "";
      if (url) {
        const response = await axios.get(url);
        // Simple HTML to text
        content = response.data.replace(/<[^>]*>?/gm, ' ').replace(/\s\s+/g, ' ');
      }
      
      const urlRow = db.prepare("SELECT value FROM settings WHERE key = 'ollama_url'").get() as any;
      const modelRow = db.prepare("SELECT value FROM settings WHERE key = 'ollama_model'").get() as any;
      const promptRow = db.prepare("SELECT value FROM settings WHERE key = 'import_prompt'").get() as any;
      const timeoutRow = db.prepare("SELECT value FROM settings WHERE key = 'ollama_timeout_import'").get() as any;
      
      const OLLAMA_URL = urlRow?.value || "http://localhost:11434";
      const OLLAMA_MODEL = modelRow?.value || "llama3";
      const IMPORT_PROMPT = promptRow?.value || 'Extract the recipe from the following content. Output ONLY a JSON object with "name", "yield" (string, e.g. "4 servings"), "ingredients" (array of {name, amount}), and "directions" (array of strings) keys. No extra text.\n\nContent: {{content}}';
      const TIMEOUT = parseInt(timeoutRow?.value) || 45000;
      
      const finalPrompt = IMPORT_PROMPT.replace("{{content}}", content);
      
      const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
        model: OLLAMA_MODEL,
        prompt: finalPrompt,
        stream: false,
        format: "json"
      }, {
        timeout: TIMEOUT
      });
      
      let responseText = response.data.response;
      if (responseText.includes("```")) {
        responseText = responseText.replace(/```json\n?|```/g, "").trim();
      }
      
      const result = JSON.parse(responseText);
      res.json(result);
    } catch (err) {
      console.error("Import error:", err);
      res.status(500).json({ error: "Failed to import recipe" });
    }
  });

  app.post("/api/ai/cleanup-recipe", async (req, res) => {
    const { recipe, additionalInstructions } = req.body;
    try {
      const urlRow = db.prepare("SELECT value FROM settings WHERE key = 'ollama_url'").get() as any;
      const modelRow = db.prepare("SELECT value FROM settings WHERE key = 'ollama_model'").get() as any;
      const promptRow = db.prepare("SELECT value FROM settings WHERE key = 'cleanup_prompt'").get() as any;
      const timeoutRow = db.prepare("SELECT value FROM settings WHERE key = 'ollama_timeout_cleanup'").get() as any;
      
      const OLLAMA_URL = urlRow?.value || "http://localhost:11434";
      const OLLAMA_MODEL = modelRow?.value || "llama3";
      const CLEANUP_PROMPT = promptRow?.value || 'Review and improve the following recipe. Output ONLY a JSON object with "name", "yield" (string, e.g. "4 servings"), "ingredients" (array of {name, amount}), and "directions" (array of strings) keys. No extra text.\n\nRecipe: {{content}}';
      const TIMEOUT = parseInt(timeoutRow?.value) || 45000;
      
      let finalPrompt = CLEANUP_PROMPT.replace("{{content}}", JSON.stringify(recipe));
      if (additionalInstructions) {
        finalPrompt += `\n\nAdditional Instructions: ${additionalInstructions}`;
      }
      
      const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
        model: OLLAMA_MODEL,
        prompt: finalPrompt,
        stream: false,
        format: "json"
      }, {
        timeout: TIMEOUT
      });
      
      let responseText = response.data.response;
      if (responseText.includes("```")) {
        responseText = responseText.replace(/```json\n?|```/g, "").trim();
      }
      
      const result = JSON.parse(responseText);
      res.json(result);
    } catch (err) {
      console.error("Cleanup error:", err);
      res.status(500).json({ error: "Failed to cleanup recipe" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
