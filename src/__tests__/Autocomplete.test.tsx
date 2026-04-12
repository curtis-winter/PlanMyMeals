import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Autocomplete } from '../components/ui/Autocomplete';

describe('Autocomplete', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render with placeholder', () => {
    const onChange = vi.fn();
    const onSelect = vi.fn();
    
    render(
      <Autocomplete
        value=""
        onChange={onChange}
        onSelect={onSelect}
        placeholder="Search items..."
      />
    );

    expect(screen.getByPlaceholderText('Search items...')).toBeInTheDocument();
  });

  it('should call onChange when input changes', () => {
    const onChange = vi.fn();
    const onSelect = vi.fn();
    
    render(
      <Autocomplete
        value=""
        onChange={onChange}
        onSelect={onSelect}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'app' } });

    expect(onChange).toHaveBeenCalledWith('app');
  });

  it('should have input with autocomplete off', () => {
    const onChange = vi.fn();
    const onSelect = vi.fn();
    
    render(
      <Autocomplete
        value=""
        onChange={onChange}
        onSelect={onSelect}
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('autocomplete', 'off');
  });

  it('should display value in input', () => {
    const onChange = vi.fn();
    const onSelect = vi.fn();
    
    render(
      <Autocomplete
        value="chicken"
        onChange={onChange}
        onSelect={onSelect}
      />
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('chicken');
  });

  it('should handle ArrowDown key', () => {
    const onChange = vi.fn();
    const onSelect = vi.fn();
    
    render(
      <Autocomplete
        value="test"
        onChange={onChange}
        onSelect={onSelect}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'ArrowDown', preventDefault: () => {} });
  });

  it('should handle ArrowUp key', () => {
    const onChange = vi.fn();
    const onSelect = vi.fn();
    
    render(
      <Autocomplete
        value="test"
        onChange={onChange}
        onSelect={onSelect}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'ArrowUp', preventDefault: () => {} });
  });

  it('should handle Escape key', () => {
    const onChange = vi.fn();
    const onSelect = vi.fn();
    
    render(
      <Autocomplete
        value="test"
        onChange={onChange}
        onSelect={onSelect}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Escape', preventDefault: () => {} });
  });
});