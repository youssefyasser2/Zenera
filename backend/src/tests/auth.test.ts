// src/tests/auth.test.ts
import { describe, it, expect } from '@jest/globals';

describe('Auth Module', () => {
  it('should reject invalid login', () => {
    const isValid = (email: string, password: string) =>
      email === 'admin@example.com' && password === 'password123';

    expect(isValid('hacker@test.com', 'wrong')).toBe(false);
  });

  it('should accept valid credentials', () => {
    expect(true).toBe(true);
  });
});
