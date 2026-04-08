import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ShoppingListModal } from '../components/ShoppingListModal';

Object.defineProperty(navigator, 'clipboard', {
  value: { writeText: vi.fn().mockResolvedValue(undefined) },
  writable: true,
});

const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  get length() { return 0; },
  key: vi.fn(),
};
Object.defineProperty(global, 'localStorage', { value: mockLocalStorage, writable: true });

const mockShoppingList: [string, string[]][] = [
  ['tomato', ['2']],
  ['onion', ['1']],
  ['chicken', ['1 lb']],
  ['milk', ['1 gallon']],
];

describe('ShoppingListModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    mockLocalStorage.setItem.mockClear();
  });

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    shoppingList: mockShoppingList,
    onMarkAsAvailable: vi.fn(),
  };

  it('should render empty state when no items', () => {
    render(<ShoppingListModal {...defaultProps} shoppingList={[]} />);
    expect(screen.getByText(/pantry is full/i)).toBeInTheDocument();
  });

  it('should render shopping list items', () => {
    render(<ShoppingListModal {...defaultProps} />);
    expect(screen.getByText(/tomato/i)).toBeInTheDocument();
    expect(screen.getByText(/onion/i)).toBeInTheDocument();
  });

  it('should filter items based on search', () => {
    render(<ShoppingListModal {...defaultProps} />);
    
    const searchInput = screen.getByPlaceholderText(/search list/i);
    fireEvent.change(searchInput, { target: { value: 'tomato' } });
    
    expect(screen.getByText(/tomato/i)).toBeInTheDocument();
    expect(screen.queryByText(/onion/i)).not.toBeInTheDocument();
  });

  it('should call onClose when Got it button is clicked', () => {
    const onClose = vi.fn();
    render(<ShoppingListModal {...defaultProps} onClose={onClose} />);
    
    const gotItButton = screen.getByText(/got it/i);
    fireEvent.click(gotItButton);
    
    expect(onClose).toHaveBeenCalled();
  });

  it('should show copy button', () => {
    render(<ShoppingListModal {...defaultProps} />);
    expect(screen.getByText(/copy to clipboard/i)).toBeInTheDocument();
  });

  it('should group items by category', () => {
    render(<ShoppingListModal {...defaultProps} />);
    expect(screen.getByText(/produce/i)).toBeInTheDocument();
    expect(screen.getByText(/meat & seafood/i)).toBeInTheDocument();
  });
});