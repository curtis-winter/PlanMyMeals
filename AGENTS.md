# Meal Planner AGENTS Guide

## Development Commands
- `npm run dev` - Start development server (runs tsx server.ts)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run clean` - Remove dist directory
- `npm run lint` - Type checking only (tsc --noEmit)
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage

## Requirements
- Node.js v20+ (use nvm to manage versions: `nvm use 20`)
- Ollama running locally (default: http://localhost:11434)

## Git Repository
- **Remote URL**: https://github.com/curtis-winter/PlanMyMeals
- **Behavior**: Changes are NOT pushed to remote automatically - requires explicit instruction from user

## Key Architecture Notes
- Server file `server.ts` combines Express API with Vite middleware
- Database: SQLite via better-sqlite3 (meals.db in data directory)
- AI integration: Ollama (local LLM) via custom API endpoints
- Environment: Ollama configuration is managed through application settings (no .env required)
- Frontend: React + TailwindCSS served via Vite

## File Conventions
- Source code in `/src` directory
- Vite config: `vite.config.ts` with React and Tailwind plugins
- TypeScript config: `tsconfig.json`
- Database initialization occurs in server startup

## Important Gotchas
- **Always use `./deploy.sh`** to deploy changes - this runs tests, increments the build number, and deploys via docker compose
- Ollama should be running (default: http://localhost:11434). Configure via app settings if using a different URL.
- API endpoints under `/api/*` for meals, recipes, pantry, and AI functions
- Vite handles frontend serving in dev, Express serves static files in prod
- Database migrations are handled inline in server.ts startup
- The "Scroll anchoring was disabled" warning in console is harmless - it's a browser optimization that doesn't affect functionality

## Code Style
- React components: functional components with hooks, TypeScript interfaces for props
- State management: custom hooks (useMealPlan, useRecipes, usePantry, useAI, useSettings)
- Styling: TailwindCSS utility classes, inline styles for dynamic values
- UI patterns: Modal components for workflows, Card components for list items

## Test Framework
- **Framework**: Vitest (configured in vitest.config.ts)
- **Location**: Tests in `src/__tests__/` directory
- **Patterns**: Component tests with React Testing Library, hook tests with @testing-library/react-hooks

## API Endpoints
- `/api/meals` - Meal plan CRUD operations
- `/api/recipes` - Recipe CRUD operations  
- `/api/pantry` - Pantry inventory management
- `/api/ai/*` - AI-powered features (suggestions, recipe generation)
- `/api/settings` - Application settings (Ollama URL, preferences)

## Environment
- Server port: 3112
- Database: SQLite at `data/meals.db`
- Ollama: configurable URL via Settings modal (default: http://localhost:11434)

## Troubleshooting
- **Ollama connection failed**: Check Ollama is running, verify URL in Settings modal
- **Database errors**: Ensure `data/` directory exists and is writable
- **Port 3112 in use**: Kill existing process or check docker container
- **Build failures**: Run `npm run lint` to check for type errors

## Docker Deployment
- Manual deploy: `docker compose up -d --build`
- Build image: `docker build -t mealplanner-app .`
- Run container: `docker run -d --name mealplanner -p 3112:3112 mealplanner-app`
- Stop container: `docker stop mealplanner`
- Remove container: `docker rm mealplanner`
- **IMPORTANT**: Use `./deploy.sh` or `docker compose up -d --build` for deployments to preserve data and settings.
- **Build Number**: The header turns red and shows build number on localhost. The `./deploy.sh` script auto-increments this and displays it during deployment.