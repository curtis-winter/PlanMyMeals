import { describe, it, expect } from 'vitest';
import { getWeekStart, DAYS_OF_WEEK, DayOfWeek } from '../types';

describe('getWeekStart', () => {
  const createDate = (year: number, month: number, day: number) => {
    return new Date(year, month - 1, day);
  };

  it('should return Monday as start when startDay is Monday', () => {
    const wednesday = createDate(2024, 1, 3); // Jan 3, 2024 is Wednesday
    const result = getWeekStart(wednesday, 'Monday');
    expect(result).toBe('2024-01-01');
  });

  it('should return correct week start for different days', () => {
    const saturday = createDate(2024, 1, 6); // Jan 6, 2024 is Saturday
    const result = getWeekStart(saturday, 'Monday');
    expect(result).toBe('2024-01-01');
  });

  it('should handle Sunday as start day', () => {
    const wednesday = createDate(2024, 1, 3);
    const result = getWeekStart(wednesday, 'Sunday');
    expect(result).toBe('2023-12-31');
  });

  it('should handle Saturday as start day', () => {
    const tuesday = createDate(2024, 1, 2);
    const result = getWeekStart(tuesday, 'Saturday');
    expect(result).toBe('2023-12-30');
  });

  it('should return same day when date is already start day', () => {
    const monday = createDate(2024, 1, 1); // Jan 1, 2024 is Monday
    const result = getWeekStart(monday, 'Monday');
    expect(result).toBe('2024-01-01');
  });

  it('should handle different start days correctly', () => {
    const thursday = createDate(2024, 1, 4); // Thursday
    
    expect(getWeekStart(thursday, 'Monday')).toBe('2024-01-01');
    expect(getWeekStart(thursday, 'Tuesday')).toBe('2024-01-02');
    expect(getWeekStart(thursday, 'Wednesday')).toBe('2024-01-03');
    expect(getWeekStart(thursday, 'Thursday')).toBe('2024-01-04');
    expect(getWeekStart(thursday, 'Friday')).toBe('2023-12-29');
    expect(getWeekStart(thursday, 'Saturday')).toBe('2023-12-30');
    expect(getWeekStart(thursday, 'Sunday')).toBe('2023-12-31');
  });

  it('should return date in ISO format (YYYY-MM-DD)', () => {
    const date = createDate(2024, 6, 15);
    const result = getWeekStart(date, 'Monday');
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('should default to Monday as start day', () => {
    const wednesday = createDate(2024, 1, 3);
    const result = getWeekStart(wednesday);
    expect(result).toBe('2024-01-01');
  });
});

describe('DAYS_OF_WEEK', () => {
  it('should contain all 7 days', () => {
    expect(DAYS_OF_WEEK).toHaveLength(7);
  });

  it('should start with Monday', () => {
    expect(DAYS_OF_WEEK[0]).toBe('Monday');
  });

  it('should end with Sunday', () => {
    expect(DAYS_OF_WEEK[6]).toBe('Sunday');
  });
});