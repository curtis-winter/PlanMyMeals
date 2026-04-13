import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, "data");
const dbPath = path.join(dataDir, "meals.db");

console.log("Checking database at:", dbPath);
console.log("Database exists:", existsSync(dbPath));

try {
  const db = new Database(dbPath);
  
  // Check if settings table exists
  const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='settings'").get();
  console.log("Settings table exists:", !!tableExists);
  
  if (tableExists) {
    // Get all settings
    const settings = db.prepare("SELECT * FROM settings").all();
    console.log("All settings:", settings);
    
    // Get specific Ollama settings
    const ollamaUrl = db.prepare("SELECT value FROM settings WHERE key = 'ollama_url'").get();
    const ollamaModel = db.prepare("SELECT value FROM settings WHERE key = 'ollama_model'").get();
    
    console.log("Ollama URL setting:", ollamaUrl);
    console.log("Ollama Model setting:", ollamaModel);
  }
  
  db.close();
} catch (error) {
  console.error("Error accessing database:", error.message);
}