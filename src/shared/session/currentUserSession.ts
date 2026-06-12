import { Account } from '../../domain/entities/Account';

const STORAGE_KEY = 'classsign.currentAccount';

export function saveCurrentAccount(account: Account) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
}

export function getCurrentAccount(): Account | null {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    return new Account(
      parsed.id,
      parsed.username,
      parsed.name,
      parsed.role,
      parsed.id_card,
      parsed.status
    );
  } catch (_err) {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function clearCurrentAccount() {
  window.localStorage.removeItem(STORAGE_KEY);
}
