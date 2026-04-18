import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ShoppingListModal } from '../components/ShoppingListModal';

vi.mock('../components/ui/Autocomplete', () => ({
  Autocomplete: () => <div data-testid="autocomplete" />
}));

describe('ShoppingListModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    shoppingList: [] as [string, string[]][],
    customItems: [] as { id: string; name: string }[],
    isLocalHost: false,
    onMarkAsAvailable: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with title when open', () => {
    render(<ShoppingListModal {...defaultProps} />);
    expect(screen.getByText('Shopping List')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<ShoppingListModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Shopping List')).not.toBeInTheDocument();
  });

  it('should show autocomplete input', () => {
    render(<ShoppingListModal {...defaultProps} onAddItem={vi.fn()} />);
    expect(screen.getByTestId('autocomplete')).toBeInTheDocument();
  });

  it('should accept isLocalHost prop', () => {
    render(<ShoppingListModal {...defaultProps} isLocalHost={true} />);
    expect(screen.getByText('Shopping List')).toBeInTheDocument();
  });

  it('should render custom items when provided', () => {
    const customItems = [{ id: '1', name: 'Milk' }];
    render(<ShoppingListModal {...defaultProps} customItems={customItems} />);
    expect(screen.getByText('Milk')).toBeInTheDocument();
  });

  it('should render shopping list sections when provided', () => {
    const shoppingList: [string, string[]][] = [['Dairy', ['Milk']]];
    render(<ShoppingListModal {...defaultProps} shoppingList={shoppingList} />);
    expect(screen.getByText('Dairy')).toBeInTheDocument();
  });

  it('should show external link button', () => {
    render(<ShoppingListModal {...defaultProps} />);
    expect(screen.getByRole('link', { name: /open full page/i })).toBeInTheDocument();
  });
});