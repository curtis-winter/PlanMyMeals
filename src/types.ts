export interface Ingredient {
  id: string;
  name: string;
  amount: string;
  preparation?: string;
  isAvailable: boolean;
}

export interface PantryItem {
  id: number;
  name: string;
  category: string;
}

export interface RecipeInstance {
  id: string;
  recipeId?: number; // Reference to recipe book ID for save/updating
  name: string;
  ingredients: Ingredient[];
  directions: string[];
  tags?: string[];
  rating?: number;
  yield?: string;
  isExpanded: boolean;
  isIngredientsExpanded: boolean;
  isDirectionsExpanded: boolean;
}

export interface Meal {
  recipes: RecipeInstance[];
  instructions?: Task[];
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export interface Recipe {
  id?: number;
  name: string;
  ingredients: Ingredient[];
  directions: string[];
  rating: number;
  tags?: string[];
  yield?: string;
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface WeeklyPlan {
  [key: string]: Meal;
}

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

export function getWeekStart(date: Date, startDay: DayOfWeek = 'Monday'): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const targetDayIndex = DAYS_OF_WEEK.indexOf(startDay);
  
  // getDay() returns 0 for Sunday, 1 for Monday, etc.
  // We need to map this to our DAYS_OF_WEEK index.
  const currentDayIndex = (d.getDay() + 6) % 7; // 0=Mon, 1=Tue, ..., 6=Sun
  
  let diff = currentDayIndex - targetDayIndex;
  if (diff < 0) diff += 7;
  
  d.setDate(d.getDate() - diff);
  return d.toISOString().split('T')[0];
}

export interface MealPlanRow {
  week_start: string;
  day: DayOfWeek;
  recipes: string;
  instructions: string;
}

export interface RecipeRow {
  id: number;
  name: string;
  ingredients: string;
  directions: string;
  rating: number;
  tags: string;
  yield: string;
}

export interface PantryRow {
  id: number;
  name: string;
  category: string;
}

export interface CleanupRecipeResponse {
  name: string;
  yield?: string;
  ingredients: Array<{ name: string; amount: string; preparation?: string }>;
  directions: string[];
}

export interface ImportRecipeResponse {
  name: string;
  yield?: string;
  tags?: string[];
  ingredients: Array<{ name: string; amount: string; preparation?: string }>;
  directions: string[];
}

export interface GeneratedIngredient {
  name: string;
  amount: string;
  preparation?: string;
}

export interface OllamaModel {
  name: string;
}

export interface OllamaModelsResponse {
  models: OllamaModel[];
}
