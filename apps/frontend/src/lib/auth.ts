import { TOKEN_STORAGE_KEY } from './http';

export const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
};

export const hasAuthToken = () => Boolean(getAuthToken());

export const setAuthToken = (token: string) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
};

export const clearAuthToken = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
};
