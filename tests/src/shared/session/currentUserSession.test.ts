/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  saveCurrentAccount,
  getCurrentAccount,
  clearCurrentAccount,
} from '../../../../src/shared/session/currentUserSession';
import { Account } from '../../../../src/domain/entities/Account';

describe('currentUserSession', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  const sampleAccount = new Account(
    1,
    'john_doe',
    'John Doe',
    'student',
    '123456789',
    1
  );

  it('should save account to localStorage', () => {
    saveCurrentAccount(sampleAccount);
    const stored = localStorage.getItem('classsign.currentAccount');
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored!)).toEqual({
      id: 1,
      username: 'john_doe',
      name: 'John Doe',
      role: 'student',
      id_card: '123456789',
      status: 1,
    });
  });

  it('should retrieve saved account from localStorage', () => {
    saveCurrentAccount(sampleAccount);
    const retrieved = getCurrentAccount();
    expect(retrieved).not.toBeNull();
    expect(retrieved).toBeInstanceOf(Account);
    expect(retrieved?.id).toBe(1);
    expect(retrieved?.username).toBe('john_doe');
    expect(retrieved?.name).toBe('John Doe');
    expect(retrieved?.role).toBe('student');
    expect(retrieved?.id_card).toBe('123456789');
    expect(retrieved?.status).toBe(1);
  });

  it('should return null if no account in localStorage', () => {
    const retrieved = getCurrentAccount();
    expect(retrieved).toBeNull();
  });

  it('should clear account from localStorage', () => {
    saveCurrentAccount(sampleAccount);
    clearCurrentAccount();
    const stored = localStorage.getItem('classsign.currentAccount');
    expect(stored).toBeNull();
  });

  it('should clear and return null if localStorage item is invalid JSON', () => {
    localStorage.setItem('classsign.currentAccount', '{invalid json}');
    const retrieved = getCurrentAccount();
    expect(retrieved).toBeNull();
    expect(localStorage.getItem('classsign.currentAccount')).toBeNull();
  });
});
