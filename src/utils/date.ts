import { DayOfWeek, DAYS_OF_WEEK } from '../types';

export function getDayFromOffset(weekStart: string, dayIndex: number): Date {
  const date = new Date(weekStart + 'T00:00:00');
  date.setDate(date.getDate() + dayIndex);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function getWeekEnd(weekStart: string): Date {
  const date = new Date(weekStart + 'T00:00:00');
  date.setDate(date.getDate() + 6);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function getOrderedDays(startDay: DayOfWeek): DayOfWeek[] {
  const startIndex = DAYS_OF_WEEK.indexOf(startDay);
  if (startIndex === -1) return DAYS_OF_WEEK;
  return [...DAYS_OF_WEEK.slice(startIndex), ...DAYS_OF_WEEK.slice(0, startIndex)];
}

export function getDayIndexFromDate(date: Date, weekStart: DayOfWeek): number {
  const startIndex = DAYS_OF_WEEK.indexOf(weekStart);
  const currentDayIndex = (date.getDay() + 6) % 7;
  return (currentDayIndex - startIndex + 7) % 7;
}

export function formatDateShort(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatDateFull(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();
}

export function isDateInRange(date: Date, start: Date, end: Date): boolean {
  return date >= start && date <= end;
}