import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateId } from '../utils/id';

describe('generateId', () => {
  it('should generate a string', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('should generate unique IDs', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 100; i++) {
      ids.add(generateId());
    }
    expect(ids.size).toBe(100);
  });

  it('should use crypto.randomUUID when available', () => {
    const mockUuid = 'test-uuid-1234';
    const mockRandomUUID = vi.fn(() => mockUuid);
    
    Object.defineProperty(globalThis, 'crypto', {
      value: { randomUUID: mockRandomUUID },
      writable: true,
    });

    const id = generateId();
    expect(id).toBe(mockUuid);
    expect(mockRandomUUID).toHaveBeenCalled();
  });

  it('should fallback to Math.random when crypto.randomUUID not available', () => {
    const originalCrypto = globalThis.crypto;
    Object.defineProperty(globalThis, 'crypto', {
      value: undefined,
      writable: true,
    });

    const id = generateId();
    expect(id).toBeDefined();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);

    Object.defineProperty(globalThis, 'crypto', {
      value: originalCrypto,
      writable: true,
    });
  });
});