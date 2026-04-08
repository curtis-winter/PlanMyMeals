import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RecipeInstanceCard } from '../components/RecipeInstanceCard';
import { DayOfWeek, RecipeInstance } from '../types';

const createMockRecipe = (overrides: Partial<RecipeInstance> = {}): RecipeInstance => ({
  id: 'test-id',
  name: 'Test Recipe',
  ingredients: [
    { id: 'ing-1', name: 'tomato', amount: '2', isAvailable: false },
  ],
  directions: ['Step 1', 'Step 2'],
  isExpanded: true,
  isIngredientsExpanded: true,
  isDirectionsExpanded: true,
  ...overrides,
});

describe('RecipeInstanceCard', () => {
  const defaultProps = {
    day: 'Monday' as DayOfWeek,
    recipe: createMockRecipe(),
    recipeIndex: 0,
    updateRecipe: vi.fn(),
    removeRecipe: vi.fn(),
    addIngredient: vi.fn(),
    updateIngredient: vi.fn(),
    removeIngredient: vi.fn(),
    handleIngredientKeyDown: vi.fn(),
    addDirection: vi.fn(),
    updateDirection: vi.fn(),
    removeDirection: vi.fn(),
    onCook: vi.fn(),
    pantryNames: new Set<string>(),
  };

  it('should render recipe name', () => {
    render(<RecipeInstanceCard {...defaultProps} />);
    expect(screen.getByDisplayValue(/test recipe/i)).toBeInTheDocument();
  });

  it('should display yield when present', () => {
    render(<RecipeInstanceCard {...defaultProps} recipe={{ ...defaultProps.recipe, yield: '4 servings' }} />);
    expect(screen.getByText(/yield: 4 servings/i)).toBeInTheDocument();
  });

  it('should render ingredients input', () => {
    render(<RecipeInstanceCard {...defaultProps} />);
    expect(screen.getByDisplayValue('2')).toBeInTheDocument();
    expect(screen.getByDisplayValue('tomato')).toBeInTheDocument();
  });

  it('should render add item button', () => {
    render(<RecipeInstanceCard {...defaultProps} />);
    expect(screen.getAllByText(/add item/i).length).toBeGreaterThan(0);
  });

  it('should render add step button', () => {
    render(<RecipeInstanceCard {...defaultProps} />);
    expect(screen.getAllByText(/add step/i).length).toBeGreaterThan(0);
  });
});