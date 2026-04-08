<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Meal Planner Application

A comprehensive meal planning application with AI-powered recipe suggestions and management capabilities.

## Features

- 📅 Weekly meal planning with drag-and-drop interface
- 🍽️ Recipe management with ingredients and directions
- 🥫 Pantry inventory tracking with automatic categorization
- 🤖 AI integration for recipe suggestions, import, and cleanup via Ollama
- 🛒 Shopping list generation
- 🏷️ Tagging and rating system for recipes
- 🐳 Docker deployment with persistent data

## Prerequisites

- Node.js (v18+ recommended)
- Docker and Docker Compose (for containerized deployment)
- Ollama service running locally or accessible via network

## Environment Configuration

No environment variables are required for Ollama configuration. The application uses default values that can be configured through the Settings modal in the UI.

If you need to change the default Ollama URL or model, you can do so through the application settings.

## Running Locally

### Development Mode

1. Install dependencies:
   ```bash
   npm install
   ```

2. Ensure Ollama is running:
   ```bash
   # Install Ollama if needed: https://ollama.com/download
   ollama serve &  # Start Ollama in background
   ollama pull qwen3.5:latest  # Pull the model (or your preferred model)
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The application will be available at http://localhost:3112

## Deployment

### Quick Deploy (Recommended)

Use the deploy script which handles database persistence and automatic build numbering:

```bash
./deploy.sh
```

### Manual Docker Deployment

1. Build and start containers:
   ```bash
   docker compose up -d --build
   ```

2. To stop and remove containers:
   ```bash
   docker compose down
   ```

3. To view logs:
   ```bash
   docker compose logs -f
   ```

## API Endpoints

All API endpoints are prefixed with `/api`:

### Meal Plans
- `GET /api/plan/:weekStart` - Get meal plan for a specific week
- `POST /api/plan` - Save meal plan for a day

### Recipes
- `GET /api/recipes` - Get all recipes
- `POST /api/recipes` - Save a recipe
- `DELETE /api/recipes/:id` - Delete a recipe

### Pantry
- `GET /api/pantry` - Get all pantry items
- `POST /api/pantry` - Add/update a pantry item
- `DELETE /api/pantry/:id` - Delete a pantry item

### AI Functions (Ollama Proxy)
- `POST /api/ai/test-connection` - Test Ollama connection
- `POST /api/ai/optimize-pantry` - Categorize pantry items
- `POST /api/ai/generate-ingredients` - Generate ingredients for a recipe
- `POST /api/ai/suggest-recipe` - Get recipe suggestions based on pantry items
- `POST /api/ai/import-recipe` - Import recipe from text/URL
- `POST /api/ai/cleanup-recipe` - Clean up and improve a recipe

### Settings
- `GET /api/settings` - Get all application settings
- `POST /api/settings` - Update application settings

## Database

The application uses SQLite for data storage:
- Stored in `data/meals.db` in the project directory

The database contains tables for:
- Meal plans
- Recipes
- Pantry items
- Application settings

## Troubleshooting

### Ollama Connection Issues
1. Verify Ollama is running: `ollama list`
2. Check that the specified model is available: `ollama pull <model-name>`
3. Test connection: `curl http://localhost:11434/api/tags`
4. If needed, update the Ollama URL or model through the application Settings

### Database Issues
- The application automatically creates tables on startup
- Database migrations are handled in server.ts
- In Docker deployments, data persists in the mounted volume

### Build Number
- The application displays a build number in the header during local development
- The ./deploy.sh script automatically increments this for each deployment

## Development Commands

- `npm run dev` - Start development server
- `npm run lint` - Type checking only

## License

ISC License