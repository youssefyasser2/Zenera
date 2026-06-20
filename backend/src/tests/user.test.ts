// src/tests/user.test.ts
import { describe, it, expect } from '@jest/globals';

describe('User Tests', () => {
  it('should pass a simple test', () => {
    expect(true).toBe(true);
  });

  it('should have a user object with email', () => {
    const user = { email: 'test@example.com', name: 'Test User' };
    expect(user.email).toBeDefined();
    expect(typeof user.email).toBe('string');
  });
});
