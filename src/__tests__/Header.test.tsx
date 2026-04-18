import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from '../components/Header';

describe('Header', () => {
  const defaultProps = {
    isLocalHost: false,
    buildNumber: 0,
    weekStartDay: 'Monday' as const,
    currentWeekStart: '2024-01-01',
    showSettings: false,
    showRecipeBook: false,
    showPantryManager: false,
    showShoppingList: false,
    shoppingList: [],
    shoppingListCount: 0,
    onToggleSettings: () => {},
    onToggleRecipeBook: () => {},
    onTogglePantryManager: () => {},
    onToggleShoppingList: () => {},
    onNavigateWeek: () => {},
  };

  it('should render app title', () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByText('MyMealPlan')).toBeInTheDocument();
  });

  it('should render settings button', () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByTitle('Settings')).toBeInTheDocument();
  });

  it('should render recipe book button', () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByText('Recipe Book')).toBeInTheDocument();
  });

  it('should render pantry button', () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByText('Pantry')).toBeInTheDocument();
  });

  it('should render shopping list button', () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByText('Shopping List')).toBeInTheDocument();
  });

  it('should render utensils icon', () => {
    render(<Header {...defaultProps} />);
    expect(document.querySelector('.rounded-lg')).toBeInTheDocument();
  });

  it('should show red styling when isLocalHost is true', () => {
    render(<Header {...defaultProps} isLocalHost={true} buildNumber={123} />);
    expect(screen.getByRole('banner')).toHaveClass('bg-red-600');
  });

  it('should show build number when isLocalHost is true and buildNumber > 0', () => {
    render(<Header {...defaultProps} isLocalHost={true} buildNumber={123} />);
    expect(screen.getByText('Build #123')).toBeInTheDocument();
  });

  it('should not show build number when isLocalHost is false', () => {
    render(<Header {...defaultProps} isLocalHost={false} buildNumber={123} />);
    expect(screen.queryByText(/Build/)).not.toBeInTheDocument();
  });

  it('should not show build number when buildNumber is 0', () => {
    render(<Header {...defaultProps} isLocalHost={true} buildNumber={0} />);
    expect(screen.queryByText(/Build/)).not.toBeInTheDocument();
  });

  it('should show shopping list badge when items exist', () => {
    render(<Header {...defaultProps} shoppingList={[{ name: 'Milk', amount: '1' }]} shoppingListCount={1} />);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should call onToggleSettings when settings button clicked', () => {
    const onToggleSettings = vi.fn();
    render(<Header {...defaultProps} onToggleSettings={onToggleSettings} />);
    screen.getByTitle('Settings').click();
    expect(onToggleSettings).toHaveBeenCalled();
  });

  it('should call onToggleRecipeBook when recipe book button clicked', () => {
    const onToggleRecipeBook = vi.fn();
    render(<Header {...defaultProps} onToggleRecipeBook={onToggleRecipeBook} />);
    screen.getByText('Recipe Book').click();
    expect(onToggleRecipeBook).toHaveBeenCalled();
  });

  it('should call onTogglePantryManager when pantry button clicked', () => {
    const onTogglePantryManager = vi.fn();
    render(<Header {...defaultProps} onTogglePantryManager={onTogglePantryManager} />);
    screen.getByText('Pantry').click();
    expect(onTogglePantryManager).toHaveBeenCalled();
  });

  it('should call onToggleShoppingList when shopping list button clicked', () => {
    const onToggleShoppingList = vi.fn();
    render(<Header {...defaultProps} onToggleShoppingList={onToggleShoppingList} />);
    screen.getByText('Shopping List').click();
    expect(onToggleShoppingList).toHaveBeenCalled();
  });
});