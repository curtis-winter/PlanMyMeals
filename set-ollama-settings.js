import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, "data");
const dbPath = path.join(dataDir, "meals.db");

console.log("Setting Ollama settings in database at:", dbPath);

try {
  const db = new Database(dbPath);
  
  // Insert Ollama settings
  const stmt = db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)");
  stmt.run("ollama_url", "http://localhost:11434");
  stmt.run("ollama_model", "qwen3-coder:480b-cloud");
  
  console.log("Settings updated successfully");
  
  // Verify the settings
  const ollamaUrl = db.prepare("SELECT value FROM settings WHERE key = 'ollama_url'").get();
  const ollamaModel = db.prepare("SELECT value FROM settings WHERE key = 'ollama_model'").get();
  
  console.log("Ollama URL setting:", ollamaUrl);
  console.log("Ollama Model setting:", ollamaModel);
  
  db.close();
} catch (error) {
  console.error("Error updating database:", error.message);
}