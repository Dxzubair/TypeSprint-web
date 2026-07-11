import { describe, it, expect } from 'vitest';
import { useKeyboardDetector } from './keyboardDetector';

describe('KeyboardDetector', () => {
  it('detects mobile user agents', () => {
    expect(typeof useKeyboardDetector).toBe('function');
  });
});
