import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ToastContainer } from '../components/ui/Toast';
import type { Toast } from '../hooks/useToast';

describe('ToastContainer', () => {
  it('should render success toast', () => {
    const toasts: Toast[] = [
      { id: '1', message: 'Success!', type: 'success' }
    ];
    render(<ToastContainer toasts={toasts} onRemove={() => {}} />);
    
    expect(screen.getByText('Success!')).toBeInTheDocument();
  });

  it('should render error toast', () => {
    const toasts: Toast[] = [
      { id: '1', message: 'Error!', type: 'error' }
    ];
    render(<ToastContainer toasts={toasts} onRemove={() => {}} />);
    
    expect(screen.getByText('Error!')).toBeInTheDocument();
  });

  it('should render info toast', () => {
    const toasts: Toast[] = [
      { id: '1', message: 'Info message', type: 'info' }
    ];
    render(<ToastContainer toasts={toasts} onRemove={() => {}} />);
    
    expect(screen.getByText('Info message')).toBeInTheDocument();
  });

  it('should render multiple toasts', () => {
    const toasts: Toast[] = [
      { id: '1', message: 'First', type: 'success' },
      { id: '2', message: 'Second', type: 'error' },
      { id: '3', message: 'Third', type: 'info' }
    ];
    render(<ToastContainer toasts={toasts} onRemove={() => {}} />);
    
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
    expect(screen.getByText('Third')).toBeInTheDocument();
  });

  it('should call onRemove with correct id when X button clicked', () => {
    const onRemove = vi.fn();
    const toasts: Toast[] = [
      { id: 'toast-123', message: 'Test', type: 'info' }
    ];
    render(<ToastContainer toasts={toasts} onRemove={onRemove} />);
    
    const button = screen.getByRole('button');
    button.click();
    
    expect(onRemove).toHaveBeenCalledWith('toast-123');
  });

  it('should handle empty toasts array gracefully', () => {
    const { container } = render(<ToastContainer toasts={[]} onRemove={() => {}} />);
    expect(container.querySelector('.fixed.bottom-4')).toBeInTheDocument();
  });
});