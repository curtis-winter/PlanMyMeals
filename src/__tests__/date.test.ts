import { describe, it, expect } from 'vitest';
import {
  getDayFromOffset,
  getWeekEnd,
  getOrderedDays,
  getDayIndexFromDate,
  formatDateShort,
  formatDateFull,
  isSameDay,
  isDateInRange
} from '../utils/date';
import { DayOfWeek } from '../types';

describe('date utils', () => {
  describe('getDayFromOffset', () => {
    it('should return the week start date when dayIndex is 0', () => {
      const result = getDayFromOffset('2025-04-14', 0);
      expect(result.toISOString().startsWith('2025-04-14')).toBe(true);
    });

    it('should return the correct date for a given offset', () => {
      const result = getDayFromOffset('2025-04-14', 3);
      expect(result.getDate()).toBe(17);
    });

    it('should normalize time to midnight', () => {
      const result = getDayFromOffset('2025-04-14', 0);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });

    it('should handle negative offsets', () => {
      const result = getDayFromOffset('2025-04-14', -1);
      expect(result.getDate()).toBe(13);
    });

    it('should handle week boundaries', () => {
      const result = getDayFromOffset('2025-04-14', 6);
      expect(result.getDate()).toBe(20);
    });
  });

  describe('getWeekEnd', () => {
    it('should return the last day of the week (6 days after start)', () => {
      const result = getWeekEnd('2025-04-14');
      expect(result.getDate()).toBe(20);
    });

    it('should normalize time to midnight', () => {
      const result = getWeekEnd('2025-04-14');
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
    });
  });

  describe('getOrderedDays', () => {
    it('should return default order for unknown start day', () => {
      const result = getOrderedDays('Invalid' as DayOfWeek);
      expect(result).toEqual(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
    });

    it('should rotate days correctly when start day is Monday', () => {
      const result = getOrderedDays('Monday');
      expect(result).toEqual(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
    });

    it('should rotate days correctly when start day is Sunday', () => {
      const result = getOrderedDays('Sunday');
      expect(result).toEqual(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);
    });

    it('should rotate days correctly when start day is Thursday', () => {
      const result = getOrderedDays('Thursday');
      expect(result).toEqual(['Thursday', 'Friday', 'Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday']);
    });
  });

  describe('getDayIndexFromDate', () => {
    it('should return 0 for Monday when week starts on Monday', () => {
      const monday = new Date('2025-04-14T12:00:00');
      const result = getDayIndexFromDate(monday, 'Monday');
      expect(result).toBe(0);
    });

    it('should return correct index for Tuesday when week starts on Monday', () => {
      const tuesday = new Date('2025-04-15T12:00:00');
      const result = getDayIndexFromDate(tuesday, 'Monday');
      expect(result).toBe(1);
    });

    it('should return correct index for Sunday when week starts on Monday', () => {
      const sunday = new Date('2025-04-20T12:00:00');
      const result = getDayIndexFromDate(sunday, 'Monday');
      expect(result).toBe(6);
    });

    it('should handle week starting on Sunday', () => {
      const monday = new Date('2025-04-14T12:00:00');
      const result = getDayIndexFromDate(monday, 'Sunday');
      expect(result).toBe(1);
    });
  });

  describe('formatDateShort', () => {
    it('should format date with short month and numeric day', () => {
      const date = new Date('2025-04-14T12:00:00');
      const result = formatDateShort(date);
      expect(result).toMatch(/Apr/);
      expect(result).toMatch(/14/);
    });
  });

  describe('formatDateFull', () => {
    it('should format date with full weekday, month, and day', () => {
      const date = new Date('2025-04-14T12:00:00');
      const result = formatDateFull(date);
      expect(result).toMatch(/Monday/);
      expect(result).toMatch(/April/);
      expect(result).toMatch(/14/);
    });
  });

  describe('isSameDay', () => {
    it('should return true for same day', () => {
      const date1 = new Date('2025-04-14T10:00:00');
      const date2 = new Date('2025-04-14T22:00:00');
      expect(isSameDay(date1, date2)).toBe(true);
    });

    it('should return false for different days', () => {
      const date1 = new Date('2025-04-14T23:59:59');
      const date2 = new Date('2025-04-15T00:00:00');
      expect(isSameDay(date1, date2)).toBe(false);
    });

    it('should return false for different months', () => {
      const date1 = new Date('2025-04-14');
      const date2 = new Date('2025-05-14');
      expect(isSameDay(date1, date2)).toBe(false);
    });

    it('should return false for different years', () => {
      const date1 = new Date('2025-04-14');
      const date2 = new Date('2024-04-14');
      expect(isSameDay(date1, date2)).toBe(false);
    });
  });

  describe('isDateInRange', () => {
    it('should return true for date exactly at start', () => {
      const date = new Date('2025-04-14');
      const start = new Date('2025-04-14');
      const end = new Date('2025-04-20');
      expect(isDateInRange(date, start, end)).toBe(true);
    });

    it('should return true for date exactly at end', () => {
      const date = new Date('2025-04-20');
      const start = new Date('2025-04-14');
      const end = new Date('2025-04-20');
      expect(isDateInRange(date, start, end)).toBe(true);
    });

    it('should return true for date within range', () => {
      const date = new Date('2025-04-17');
      const start = new Date('2025-04-14');
      const end = new Date('2025-04-20');
      expect(isDateInRange(date, start, end)).toBe(true);
    });

    it('should return false for date before range', () => {
      const date = new Date('2025-04-13');
      const start = new Date('2025-04-14');
      const end = new Date('2025-04-20');
      expect(isDateInRange(date, start, end)).toBe(false);
    });

    it('should return false for date after range', () => {
      const date = new Date('2025-04-21');
      const start = new Date('2025-04-14');
      const end = new Date('2025-04-20');
      expect(isDateInRange(date, start, end)).toBe(false);
    });
  });
});