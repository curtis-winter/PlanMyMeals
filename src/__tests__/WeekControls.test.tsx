import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WeekControls } from '../components/WeekControls';

describe('WeekControls', () => {
  const defaultProps = {
    currentWeekStart: '2024-01-01',
    weekStartDay: 'Monday' as const,
    onNavigateWeek: vi.fn(),
    onSuggestRecipe: vi.fn(),
    isSuggestingRecipe: false,
  };

  it('should render week date', () => {
    render(<WeekControls {...defaultProps} />);
    expect(screen.getByText(/January/)).toBeInTheDocument();
  });

  it('should render week label', () => {
    render(<WeekControls {...defaultProps} />);
    const labels = screen.getAllByText(/Week/);
    expect(labels.length).toBeGreaterThan(0);
  });

  it('should render suggest recipe button', () => {
    render(<WeekControls {...defaultProps} />);
    expect(screen.getByText('Suggest a Recipe')).toBeInTheDocument();
  });

  it('should call onNavigateWeek with -1 when left button clicked', () => {
    const onNavigateWeek = vi.fn();
    render(<WeekControls {...defaultProps} onNavigateWeek={onNavigateWeek} />);
    
    const buttons = screen.getAllByRole('button');
    buttons[0].click();
    
    expect(onNavigateWeek).toHaveBeenCalledWith(-1);
  });

  it('should call onNavigateWeek with 1 when right button clicked', () => {
    const onNavigateWeek = vi.fn();
    render(<WeekControls {...defaultProps} onNavigateWeek={onNavigateWeek} />);
    
    const buttons = screen.getAllByRole('button');
    buttons[1].click();
    
    expect(onNavigateWeek).toHaveBeenCalledWith(1);
  });

  it('should call onSuggestRecipe when suggest button clicked', () => {
    const onSuggestRecipe = vi.fn();
    render(<WeekControls {...defaultProps} onSuggestRecipe={onSuggestRecipe} />);
    screen.getByText('Suggest a Recipe').click();
    
    expect(onSuggestRecipe).toHaveBeenCalled();
  });

  it('should show loading spinner when isSuggestingRecipe is true', () => {
    render(<WeekControls {...defaultProps} isSuggestingRecipe={true} />);
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should disable button when isSuggestingRecipe is true', () => {
    render(<WeekControls {...defaultProps} isSuggestingRecipe={true} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons[2]).toBeDisabled();
  });

  it('should render navigation chevrons', () => {
    render(<WeekControls {...defaultProps} />);
    expect(screen.getAllByRole('button').length).toBe(3);
  });
});