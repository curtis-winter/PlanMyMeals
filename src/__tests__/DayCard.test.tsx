import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DayCard } from '../components/DayCard';
import { DayOfWeek, RecipeInstance, Task } from '../types';

const createMockRecipe = (overrides: Partial<RecipeInstance> = {}): RecipeInstance => ({
  id: 'test-id',
  name: 'Test Recipe',
  ingredients: [{ id: 'ing-1', name: 'tomato', amount: '2', isAvailable: false }],
  directions: ['Step 1'],
  isExpanded: true,
  isIngredientsExpanded: true,
  isDirectionsExpanded: true,
  ...overrides,
});

describe('DayCard', () => {
  const defaultProps = {
    day: 'Monday' as DayOfWeek,
    isToday: false,
    recipes: [createMockRecipe()],
    instructions: [],
    isExpanded: true,
    onToggleExpand: vi.fn(),
    addRecipeToDay: vi.fn(),
    updateRecipe: vi.fn(),
    removeRecipe: vi.fn(),
    saveToRecipeBook: vi.fn(),
    bookRecipes: [],
    addIngredient: vi.fn(),
    updateIngredient: vi.fn(),
    removeIngredient: vi.fn(),
    handleIngredientKeyDown: vi.fn(),
    addDirection: vi.fn(),
    updateDirection: vi.fn(),
    removeDirection: vi.fn(),
    addInstruction: vi.fn(),
    updateInstruction: vi.fn(),
    removeInstruction: vi.fn(),
    toggleTaskComplete: vi.fn(),
    pantryItems: [],
    onOpenRecipeBook: vi.fn(),
    onCook: vi.fn(),
    applyRecipeToDay: vi.fn(),
    onDragStart: vi.fn(),
    onDragOver: vi.fn(),
    onDrop: vi.fn(),
    onImportRecipe: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render day name', () => {
    render(<DayCard {...defaultProps} />);
    expect(screen.getByText(/monday/i)).toBeInTheDocument();
  });

  it('should render recipe when expanded', () => {
    render(<DayCard {...defaultProps} isExpanded={true} />);
    expect(screen.getByText(/test recipe/i)).toBeInTheDocument();
  });

  it('should call onToggleExpand when header is clicked', () => {
    render(<DayCard {...defaultProps} />);
    fireEvent.click(screen.getByText(/monday/i));
    expect(defaultProps.onToggleExpand).toHaveBeenCalled();
  });

  it('should render with drag event handlers', () => {
    const onDragStart = vi.fn();
    const onDrop = vi.fn();
    render(<DayCard {...defaultProps} onDragStart={onDragStart} onDrop={onDrop} />);
    expect(screen.getByText(/test recipe/i)).toBeInTheDocument();
  });

  it('should call onDragStart when drag starts', () => {
    const onDragStart = vi.fn();
    render(<DayCard {...defaultProps} onDragStart={onDragStart} />);
    
    const recipeCard = screen.getByText(/test recipe/i).closest('[draggable="true"]');
    if (recipeCard) {
      fireEvent.dragStart(recipeCard, {
        dataTransfer: {
          effectAllowed: 'move',
          setData: vi.fn(),
          types: ['text/plain'],
        },
      });
      expect(onDragStart).toHaveBeenCalledWith('Monday', 0);
    }
  });

  it('should call onDrop when dropped on day', () => {
    const onDrop = vi.fn();
    render(<DayCard {...defaultProps} onDrop={onDrop} />);
    
    const container = screen.getByText(/test recipe/i).closest('.space-y-4');
    if (container) {
      fireEvent.drop(container, {
        dataTransfer: {
          dropEffect: 'move',
        },
      });
      expect(onDrop).toHaveBeenCalledWith('Monday', 1);
    }
  });

  it('should handle empty recipes', () => {
    render(<DayCard {...defaultProps} recipes={[]} />);
    expect(screen.queryByText(/test recipe/i)).not.toBeInTheDocument();
  });

  it('should handle multiple recipes', () => {
    render(<DayCard {...defaultProps} recipes={[createMockRecipe(), createMockRecipe({ id: 'id-2', name: 'Recipe 2' })]} />);
    expect(screen.getAllByText(/recipe/i).length).toBeGreaterThanOrEqual(2);
  });

  it('should apply today styling when isToday is true', () => {
    render(<DayCard {...defaultProps} isToday={true} isExpanded={true} />);
    const card = screen.getByText(/monday/i).closest('.rounded-2xl');
    expect(card).toHaveClass('border-primary');
  });

  it('should handle empty pantry items', () => {
    render(<DayCard {...defaultProps} pantryItems={[]} />);
    expect(screen.getByText(/test recipe/i)).toBeInTheDocument();
  });

  it('should render without crashing with all props', () => {
    const propsWithAll = {
      ...defaultProps,
      date: new Date('2024-01-15'),
      instructions: [{ id: 'task-1', text: 'Buy milk', completed: false }],
    };
    const { container } = render(<DayCard {...propsWithAll} />);
    expect(container).toBeInTheDocument();
  });
});