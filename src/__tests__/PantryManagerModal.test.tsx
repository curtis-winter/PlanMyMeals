import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PantryManagerModal } from '../components/PantryManagerModal';
import { PantryItem } from '../types';

vi.mock('../components/ui/Autocomplete', () => ({
  Autocomplete: () => <div data-testid="autocomplete" />
}));

describe('PantryManagerModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    pantryItems: [] as PantryItem[],
    savePantryItem: vi.fn().mockResolvedValue(undefined),
    removePantryItem: vi.fn().mockResolvedValue(undefined),
    isLocalHost: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with title when open', () => {
    render(<PantryManagerModal {...defaultProps} />);
    expect(screen.getByText('Pantry Inventory')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<PantryManagerModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Pantry Inventory')).not.toBeInTheDocument();
  });

  it('should render search input', () => {
    render(<PantryManagerModal {...defaultProps} />);
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it('should show autocomplete', () => {
    render(<PantryManagerModal {...defaultProps} />);
    expect(screen.getByTestId('autocomplete')).toBeInTheDocument();
  });

  it('should render pantry items when provided', () => {
    const pantryItems: PantryItem[] = [{ id: 1, name: 'Salt', category: 'Spices' }];
    render(<PantryManagerModal {...defaultProps} pantryItems={pantryItems} />);
    expect(screen.getByText('Salt')).toBeInTheDocument();
  });

  it('should accept isLocalHost prop', () => {
    render(<PantryManagerModal {...defaultProps} isLocalHost={true} />);
    expect(screen.getByText('Pantry Inventory')).toBeInTheDocument();
  });
});