import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isLocalHost, capitalize } from '../utils/environment';

describe('environment utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isLocalHost', () => {
    it('should return true when hostname is localhost', () => {
      const mockLocation = { hostname: 'localhost' };
      vi.stubGlobal('window', { location: mockLocation });

      expect(isLocalHost()).toBe(true);

      vi.unstubAllGlobals();
    });

    it('should return false when hostname is not localhost', () => {
      const mockLocation = { hostname: '192.168.1.1' };
      vi.stubGlobal('window', { location: mockLocation });

      expect(isLocalHost()).toBe(false);

      vi.unstubAllGlobals();
    });

    it('should return false when window is undefined', () => {
      vi.stubGlobal('window', undefined);

      expect(isLocalHost()).toBe(false);

      vi.unstubAllGlobals();
    });

    it('should return false for production hostname', () => {
      const mockLocation = { hostname: 'planmymeals.example.com' };
      vi.stubGlobal('window', { location: mockLocation });

      expect(isLocalHost()).toBe(false);

      vi.unstubAllGlobals();
    });
  });

  describe('capitalize', () => {
    it('should capitalize first letter of a string', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('world')).toBe('World');
    });

    it('should trim whitespace before capitalizing', () => {
      expect(capitalize('  hello')).toBe('Hello');
      expect(capitalize('hello  ')).toBe('Hello');
      expect(capitalize('  hello  ')).toBe('Hello');
    });

    it('should handle single character strings', () => {
      expect(capitalize('a')).toBe('A');
    });

    it('should handle empty strings', () => {
      expect(capitalize('')).toBe('');
    });

    it('should handle strings that are already capitalized', () => {
      expect(capitalize('Hello')).toBe('Hello');
    });

    it('should handle strings with multiple words', () => {
      expect(capitalize('hello world')).toBe('Hello world');
    });
  });
});