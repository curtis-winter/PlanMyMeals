# Meal Planner AGENTS Guide

## Development Commands
- `npm run dev` - Start development server (runs tsx server.ts)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run clean` - Remove dist directory
- `npm run lint` - Type checking only (tsc --noEmit)

## Git Repository
- **Remote URL**: https://github.com/curtis-winter/PlanMyMeals
- **Behavior**: Changes are NOT merged automatically - requires explicit instruction from user

## Key Architecture Notes
- Server file `server.ts` combines Express API with Vite middleware
- Database: SQLite via better-sqlite3 (meals.db)
- AI integration: Ollama (local LLM) via custom API endpoints
- Environment: Requires OLLAMA_URL and OLLAMA_MODEL in .env
- Frontend: React + TailwindCSS served via Vite

## File Conventions
- Source code in `/src` directory
- Vite config: `vite.config.ts` with React and Tailwind plugins
- TypeScript config: `tsconfig.json`
- Database initialization occurs in server startup

## Important Gotchas
- Ollama service must be running separately (default: http://localhost:11434)
- API endpoints under `/api/*` for meals, recipes, pantry, and AI functions
- Vite handles frontend serving in dev, Express serves static files in prod
- Database migrations are handled inline in server.ts startup