import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import Database from "better-sqlite3";
import cors from "cors";
import axios from "axios";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const db = new Database(path.join(dataDir, "meals.db"));

// Load common grocery items into memory
let commonGroceryItems: string[] = [];
const commonItemsPath = path.join(__dirname, "common-grocery-items.txt");
console.log('[init] loading common items from:', commonItemsPath, 'exists:', fs.existsSync(commonItemsPath));
if (fs.existsSync(commonItemsPath)) {
  const content = fs.readFileSync(commonItemsPath, 'utf-8');
  console.log('[init] file content length:', content.length);
  commonGroceryItems = content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'));
  console.log('[init] loaded common items:', commonGroceryItems.length, 'items:', commonGroceryItems.slice(0, 10));
}

/**
 * Helper function to get Ollama configuration from settings
 * @returns {{url: string, model: string}} Ollama configuration with url and model
 */
function getOllamaConfig() {
  const urlRow = db.prepare("SELECT value FROM settings WHERE key = 'ollama_url'").get() as {value?: string} | undefined;
  const modelRow = db.prepare("SELECT value FROM settings WHERE key = 'ollama_model'").get() as {value?: string} | undefined;
  
  return {
    url: urlRow?.value || "http://localhost:11434",
    model: modelRow?.value || "llama3"
  };
}

/**
 * Helper function to get specific Ollama timeout from settings
 * @param {string} key - The settings key for the timeout
 * @param {number} defaultValue - Default timeout value in milliseconds
 * @returns {number} Timeout value in milliseconds
 */
function getOllamaTimeout(key: string, defaultValue: number): number {
  const row = db.prepare("SELECT value FROM settings WHERE key = ?").get(key) as {value?: string} | undefined;
  return row && row.value !== undefined ? parseInt(row.value) : defaultValue;
}

// Initialize DB
db.exec(`
  CREATE TABLE IF NOT EXISTS meal_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    week_start TEXT NOT NULL,
    day TEXT NOT NULL,
    recipes TEXT,
    UNIQUE(week_start, day)
  );

  CREATE TABLE IF NOT EXISTS recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
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

  CREATE TABLE IF NOT EXISTS shopping_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    category TEXT
  );
`);

// Migration: Add columns if they don't exist (for older DBs)
try {
  db.exec("ALTER TABLE meal_plans ADD COLUMN recipes TEXT;");
} catch (e) {
  // Column likely already exists
}

try {
  db.exec("ALTER TABLE meal_plans ADD COLUMN instructions TEXT;");
} catch (e) {
  // Column likely already exists
}

try {
  db.exec("ALTER TABLE recipes ADD COLUMN directions TEXT;");
} catch (e) {
  // Column likely already exists
}

try {
  db.exec("ALTER TABLE shopping_history ADD COLUMN category TEXT;");
} catch (e) {
  // Column may not exist yet or already exists
}

try {
  db.exec("ALTER TABLE recipes ADD COLUMN tags TEXT;");
} catch (e) {
  // Column likely already exists
}

// Migrate existing data
try {
  db.exec(`
    UPDATE meal_plans SET recipes = '[]' WHERE recipes IS NULL OR recipes = '';
  `);
} catch (e) {
  // Ignore migration errors
}

// Sync pantry items to shopping history on startup
try {
  const pantryItems = db.prepare("SELECT name, category FROM pantry").all() as { name: string; category: string }[];
  for (const item of pantryItems) {
    db.prepare("INSERT OR IGNORE INTO shopping_history (name, category) VALUES (?, ?)").run(item.name, item.category);
  }
  console.log(`Synced ${pantryItems.length} pantry items to shopping history`);
} catch (e) {
  console.log("Shopping history sync skipped (table may not exist yet)");
}



// Helper to categorize items for validation
function categorizeForInit(name: string): string {
  const lowerName = name.toLowerCase();
  const sections: Record<string, string[]> = {
    'Produce': ['apple', 'banana', 'orange', 'lettuce', 'spinach', 'carrot', 'onion', 'garlic', 'potato', 'tomato', 'cucumber', 'pepper', 'broccoli', 'cabbage', 'herb', 'cilantro', 'parsley', 'basil', 'ginger', 'lemon', 'lime', 'berry', 'strawberry', 'blueberry', 'raspberry', 'grape', 'avocado', 'mushroom'],
    'Meat & Seafood': ['chicken', 'beef', 'pork', 'steak', 'ground', 'turkey', 'fish', 'salmon', 'shrimp', 'tuna', 'bacon', 'sausage', 'ham', 'lamb'],
    'Dairy & Eggs': ['milk', 'egg', 'cheese', 'butter', 'yogurt', 'cream', 'sour cream', 'cottage cheese', 'parmesan', 'cheddar', 'mozzarella'],
    'Bakery': ['bread', 'bun', 'tortilla', 'bagel', 'muffin', 'pastry', 'pita'],
    'Pantry & Grains': ['rice', 'pasta', 'flour', 'sugar', 'oil', 'vinegar', 'honey', 'syrup', 'cereal', 'oat', 'bean', 'lentil', 'nut', 'seed', 'cracker', 'chip', 'snack', 'quinoa', 'couscous'],
    'Canned & Jarred': ['canned', 'soup', 'sauce', 'salsa', 'pickle', 'olive', 'peanut butter', 'jam', 'jelly', 'broth', 'stock'],
    'Frozen': ['frozen', 'ice cream', 'pizza'],
    'Beverages': ['water', 'juice', 'soda', 'coffee', 'tea', 'beer', 'wine'],
    'Spices & Baking': ['salt', 'pepper', 'spice', 'cinnamon', 'vanilla', 'baking powder', 'baking soda', 'yeast', 'cocoa']
  };
  for (const [section, keywords] of Object.entries(sections)) {
    if (keywords.some(keyword => lowerName.includes(keyword))) {
      return section;
    }
  }
  return 'Other';
}


function initializeDatabase() {
  const pantryItems = db.prepare("SELECT id, name, category FROM pantry").all() as any[];
  for (const item of pantryItems) {
    if (!item.category || item.category === 'General') {
      const newCategory = categorizeForInit(item.name);
      db.prepare("UPDATE pantry SET category = ? WHERE id = ?").run(newCategory, item.id);
    }
  }
}

async function startServer() {
  initializeDatabase();

  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3112;

  // Helper to categorize items (same as frontend getSection)
function getSection(itemName: string): string {
  const lowerName = itemName.toLowerCase();
  const sections: Record<string, string[]> = {
    'Produce': ['apple', 'banana', 'orange', 'lettuce', 'spinach', 'carrot', 'onion', 'garlic', 'potato', 'tomato', 'cucumber', 'pepper', 'broccoli', 'cabbage', 'herb', 'cilantro', 'parsley', 'basil', 'ginger', 'lemon', 'lime', 'berry', 'strawberry', 'blueberry', 'raspberry', 'grape', 'avocado', 'mushroom'],
    'Meat & Seafood': ['chicken', 'beef', 'pork', 'steak', 'ground', 'turkey', 'fish', 'salmon', 'shrimp', 'tuna', 'bacon', 'sausage', 'ham', 'lamb'],
    'Dairy & Eggs': ['milk', 'egg', 'cheese', 'butter', 'yogurt', 'cream', 'sour cream', 'cottage cheese', 'parmesan', 'cheddar', 'mozzarella'],
    'Bakery': ['bread', 'bun', 'tortilla', 'bagel', 'muffin', 'pastry', 'pita'],
    'Pantry & Grains': ['rice', 'pasta', 'flour', 'sugar', 'oil', 'vinegar', 'honey', 'syrup', 'cereal', 'oat', 'bean', 'lentil', 'nut', 'seed', 'cracker', 'chip', 'snack', 'quinoa', 'couscous'],
    'Canned & Jarred': ['canned', 'soup', 'sauce', 'salsa', 'pickle', 'olive', 'peanut butter', 'jam', 'jelly', 'broth', 'stock'],
    'Frozen': ['frozen', 'ice cream', 'pizza'],
    'Beverages': ['water', 'juice', 'soda', 'coffee', 'tea', 'beer', 'wine'],
    'Spices & Baking': ['salt', 'pepper', 'spice', 'cinnamon', 'vanilla', 'baking powder', 'baking soda', 'yeast', 'cocoa']
  };
  for (const [section, keywords] of Object.entries(sections)) {
    if (keywords.some(keyword => lowerName.includes(keyword))) {
      return section;
    }
  }
  return 'Other';
}

app.use(cors());
  app.use(express.json());

  // Build number API
  app.get("/api/build-number", (req, res) => {
    try {
      const buildNumberPath = path.join(__dirname, "build-number.json");
      if (fs.existsSync(buildNumberPath)) {
        const data = JSON.parse(fs.readFileSync(buildNumberPath, "utf-8"));
        res.json(data);
      } else {
        res.json({ buildNumber: 0 });
      }
    } catch (err) {
      res.json({ buildNumber: 0 });
    }
  });

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
    const { ollama_url, ollama_model, import_prompt, suggest_prompt, suggest_options, ollama_timeout_suggest, ollama_timeout_import, ollama_timeout_ingredients, cleanup_prompt, ollama_timeout_cleanup, ollama_timeout_pantry, week_start_day } = req.body;
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
    if (ollama_timeout_pantry) stmt.run("ollama_timeout_pantry", String(ollama_timeout_pantry));
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
    try {
      console.log("POST /api/recipes body:", req.body);
      const { id, name, ingredients, directions, rating, tags } = req.body;
      
      if (!name) {
        res.status(400).json({ error: "Recipe name is required" });
        return;
      }
      
      // Ensure arrays are actually arrays
      const safeIngredients = Array.isArray(ingredients) ? ingredients : [];
      const safeDirections = Array.isArray(directions) ? directions : [];
      const safeTags = Array.isArray(tags) ? tags : [];
      
      // Check by ID first if provided
      if (id) {
        const existing = db.prepare("SELECT id FROM recipes WHERE id = ?").get(id) as any;
        if (existing) {
          db.prepare(`
            UPDATE recipes SET name = ?, ingredients = ?, directions = ?, rating = ?, tags = ?
            WHERE id = ?
          `).run(name, JSON.stringify(safeIngredients), JSON.stringify(safeDirections), rating || 0, JSON.stringify(safeTags), id);
          res.json({ success: true });
          return;
        }
      }
      
      // Check by name
      const existing = db.prepare("SELECT id FROM recipes WHERE LOWER(name) = LOWER(?)").get(name) as any;
      if (existing) {
        db.prepare(`
          UPDATE recipes SET name = ?, ingredients = ?, directions = ?, rating = ?, tags = ?
          WHERE id = ?
        `).run(name, JSON.stringify(safeIngredients), JSON.stringify(safeDirections), rating || 0, JSON.stringify(safeTags), existing.id);
        res.json({ success: true });
        return;
      }
      
      const stmt = db.prepare(`
        INSERT INTO recipes (name, ingredients, directions, rating, tags)
        VALUES (?, ?, ?, ?, ?)
      `);
      const result = stmt.run(name, JSON.stringify(safeIngredients), JSON.stringify(safeDirections), rating || 0, JSON.stringify(safeTags));
      // Get the new recipe ID
      const newId = result.lastInsertRowid;
      res.json({ success: true, id: newId });
    } catch (err: any) {
      console.error("Error saving recipe:", err);
      console.error("Error stack:", err.stack);
      res.status(500).json({ error: err.message || "Failed to save recipe" });
    }
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

  app.get("/api/pantry/search", (req, res) => {
    const query = (req.query.q as string || '').toLowerCase();
    console.log('[search] query:', query, 'length:', query.length);
    if (!query || query.length < 1) {
      console.log('[search] returning empty, query too short');
      return res.json([]);
    }

    try {
      // Get pantry items
      const pantryItems = db.prepare(
        "SELECT name, category FROM pantry WHERE LOWER(name) LIKE ? LIMIT 10"
      ).all(`%${query}%`) as { name: string; category: string }[];
      console.log('[search] pantryItems:', pantryItems.length);

      // Get shopping history
      const historyItems = db.prepare(
        "SELECT name, category FROM shopping_history WHERE LOWER(name) LIKE ? LIMIT 10"
      ).all(`%${query}%`) as { name: string; category: string }[];
      console.log('[search] historyItems:', historyItems.length);

      // Get common grocery items that match
      const commonMatches = commonGroceryItems
        .filter(item => item.toLowerCase().includes(query))
        .slice(0, 10)
        .map(name => ({ name, category: '' }));
      console.log('[search] commonMatches:', commonMatches.length);
      console.log('[search] commonGroceryItems loaded:', commonGroceryItems.length, 'first few:', commonGroceryItems.slice(0, 5));

    // Combine and deduplicate
    const seen = new Set<string>();
    const combined: { name: string; category?: string }[] = [];

    for (const item of pantryItems) {
      const key = item.name.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        combined.push({ name: item.name, category: item.category });
      }
    }

    for (const item of historyItems) {
      const key = item.name.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        combined.push({ name: item.name, category: item.category });
      }
    }

    for (const item of commonMatches) {
      const key = item.name.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        combined.push(item);
      }
    }

      res.json(combined.slice(0, 10));
    } catch (err) {
      console.error('[search] error:', err);
      res.status(500).json({ error: 'Search failed' });
    }
  });

  app.post("/api/pantry", (req, res) => {
    const { name, category } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });
    const capitalized = name.trim().charAt(0).toUpperCase() + name.trim().slice(1);
    const detectedCategory = category ? category : getSection(capitalized);
    const stmt = db.prepare(`
      INSERT INTO pantry (name, category)
      VALUES (?, ?)
      ON CONFLICT(name) DO UPDATE SET
        category = excluded.category
    `);
    stmt.run(capitalized, detectedCategory);

    // Also add to shopping history
    db.prepare("INSERT OR IGNORE INTO shopping_history (name, category) VALUES (?, ?)").run(capitalized, detectedCategory);

    res.json({ success: true });
  });

  // Endpoint to add item directly to shopping history
  app.post("/api/shopping-history", (req, res) => {
    const { name, category } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });
    const capitalized = name.trim().charAt(0).toUpperCase() + name.trim().slice(1);
    const detectedCategory = category ? category : getSection(capitalized);
    db.prepare("INSERT OR IGNORE INTO shopping_history (name, category) VALUES (?, ?)").run(capitalized, detectedCategory);
    res.json({ success: true });
  });

  app.delete("/api/pantry/:id", (req, res) => {
    db.prepare("DELETE FROM pantry WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // AI Proxy for Ollama
   app.post("/api/ai/optimize-pantry", async (req, res) => {
     const { items } = req.body;
     if (!items || !Array.isArray(items)) {
       return res.status(400).json({ error: "Items array required" });
     }
     
     try {
       const { url: OLLAMA_URL, model: OLLAMA_MODEL } = getOllamaConfig();
       const TIMEOUT = getOllamaTimeout('ollama_timeout_pantry', 90000);
      
      const itemNames = items.map((i: any) => i.name).join(', ');
      const prompt = `Given these pantry items: ${itemNames}. Categorize each into one of: Produce, Meat & Seafood, Dairy & Eggs, Bakery, Pantry & Grains, Canned & Jarred, Frozen, Beverages, Spices & Baking, Other. 

Example output format:
[{"name": "Chicken", "category": "Meat & Seafood"}, {"name": "Milk", "category": "Dairy & Eggs"}]

Output ONLY valid JSON array, no other text.`;

      console.log("Calling Ollama for pantry optimize...");
      const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
        model: OLLAMA_MODEL,
        prompt,
        stream: false
      }, {
        timeout: TIMEOUT
      });
      
      console.log("Ollama response:", response.data);
      let responseText = response.data?.response || response.data;
      
      // Try to extract and parse JSON from response
      try {
        // Try direct parse first
        let suggestions = JSON.parse(responseText);
        res.json(suggestions);
      } catch {
        // Try to extract JSON from potential markdown
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const suggestions = JSON.parse(jsonMatch[0]);
          res.json(suggestions);
        } else {
          console.error("AI response not valid JSON:", responseText.substring(0, 200));
          res.status(500).json({ error: "Invalid response format from AI" });
        }
      }
    } catch (err: any) {
      console.error("Pantry optimization error:", err.message || err.toString());
      res.status(500).json({ error: err.message || err.toString() || "Failed to optimize pantry categories" });
    }
  });

  const INGREDIENTS_FORMAT = `\n\nOutput ONLY a JSON array of objects with "name", "amount", and "preparation" keys. Example: [{"name": "Chicken", "amount": "500g", "preparation": "cubed"}]. If an ingredient has no preparation method, use null for that field. No extra text.`;

  const RECIPE_OUTPUT_FORMAT = `Output ONLY a valid JSON object with "name", "yield" (string, e.g. "4 servings"), "ingredients" (array of {name, amount, preparation}), and "directions" (array of strings) keys. If an ingredient has no preparation method, use null for that field. No extra text.`;
  const RECIPES_OUTPUT_FORMAT = `Output ONLY a valid JSON array of objects. Each object MUST have:
- "name": (string)
- "yield": (string, e.g. "4 servings")
- "ingredients": (array of {name, amount, preparation})
- "directions": (array of strings)

Example output:
[
  {
    "name": "Recipe 1",
    "yield": "4 servings",
    "ingredients": [{"name": "Item", "amount": "1", "preparation": "chopped"}],
    "directions": ["Step 1"]
  },
  {
    "name": "Recipe 2",
    "yield": "2 servings",
    "ingredients": [{"name": "Item", "amount": "2", "preparation": null}],
    "directions": ["Step 1"]
  }
]

No extra text.`;

   app.post("/api/ai/generate-ingredients", async (req, res) => {
     const { recipeName, pantryContext } = req.body;
     try {
       const { url: OLLAMA_URL, model: OLLAMA_MODEL } = getOllamaConfig();
       const TIMEOUT = getOllamaTimeout('ollama_timeout_ingredients', 30000);

      let prompt = `List the ingredients for "${recipeName}" with their typical amounts.${INGREDIENTS_FORMAT}`;
      
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
       const { url: OLLAMA_URL, model: OLLAMA_MODEL } = getOllamaConfig();
       const TIMEOUT = getOllamaTimeout('ollama_timeout_suggest', 60000);
       
       const promptRow = db.prepare("SELECT value FROM settings WHERE key = 'suggest_prompt'").get() as {value?: string} | undefined;
       const count = parseInt(recipeCount) || 1;
       let finalPrompt = '';
       
       const uniqueConstraint = plannedRecipes && plannedRecipes.length > 0 
         ? `\n- DO NOT suggest recipes similar to these already planned: ${plannedRecipes.join(', ')}.`
         : "";

       if (count > 1) {
         const basePrompt = promptRow?.value || `Suggest ${count} unique and distinct recipes based on these ingredients I have: {{pantryContext}}. 

Dietary Preferences: {{dietaryOptions}}
Additional Instructions: {{additionalInstructions}}

Guidelines:
- Focus on simple recipes.
- Each recipe should be unique and distinct.{{uniqueConstraint}}
- You do not need to use all provided ingredients.
- Prioritize using the provided ingredients, but you can include common staples or other ingredients not listed if needed.
{{useDifferentProteins}}`;

         finalPrompt = basePrompt
           .replace(/\{\{pantryContext\}\}/g, pantryContext || "nothing specific")
           .replace(/\{\{dietaryOptions\}\}/g, dietaryOptions || "none")
           .replace(/\{\{additionalInstructions\}\}/g, additionalInstructions || "none")
           .replace(/\{\{uniqueConstraint\}\}/g, uniqueConstraint)
           .replace(/\{\{useDifferentProteins\}\}/g, useDifferentProteins ? "- Minimize the overlap in meat protein used in the recipes." : "")
           + "\n\n" + RECIPES_OUTPUT_FORMAT;
       } else {
         const basePrompt = promptRow?.value || `Suggest a recipe based on: {{pantryContext}}. 

Dietary Preferences: {{dietaryOptions}}
Additional Instructions: {{additionalInstructions}}{{uniqueConstraint}}`;

         finalPrompt = basePrompt
           .replace(/\{\{pantryContext\}\}/g, pantryContext || "nothing specific")
           .replace(/\{\{dietaryOptions\}\}/g, dietaryOptions || "none")
           .replace(/\{\{additionalInstructions\}\}/g, additionalInstructions || "none")
           .replace(/\{\{uniqueConstraint\}\}/g, uniqueConstraint)
           + "\n\n" + RECIPE_OUTPUT_FORMAT;
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
       
       const { url: OLLAMA_URL, model: OLLAMA_MODEL } = getOllamaConfig();
       const promptRow = db.prepare("SELECT value FROM settings WHERE key = 'import_prompt'").get() as {value?: string} | undefined;
       const timeoutRow = db.prepare("SELECT value FROM settings WHERE key = 'ollama_timeout_import'").get() as {value?: string} | undefined;
       
        const IMPORT_PROMPT = (promptRow?.value || 'Extract the recipe from the following content. Content: {{content}}') + "\n\n" + RECIPE_OUTPUT_FORMAT;
       const TIMEOUT = getOllamaTimeout('ollama_timeout_import', 45000);
      
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
        const { url: OLLAMA_URL, model: OLLAMA_MODEL } = getOllamaConfig();
        const promptRow = db.prepare("SELECT value FROM settings WHERE key = 'cleanup_prompt'").get() as {value?: string} | undefined;
        const timeoutRow = db.prepare("SELECT value FROM settings WHERE key = 'ollama_timeout_cleanup'").get() as {value?: string} | undefined;
        
        const CLEANUP_PROMPT = (promptRow?.value || 'Review and improve the following recipe. Recipe: {{content}}') + "\n\n" + RECIPE_OUTPUT_FORMAT;
        const TIMEOUT = getOllamaTimeout('ollama_timeout_cleanup', 45000);
       
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

  // Vite middleware serves the React app in both development and production
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
