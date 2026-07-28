const configuredUrl = import.meta.env.VITE_API_URL || '/api/';

export const API_URL = configuredUrl.endsWith('/') ? configuredUrl : `${configuredUrl}/`;

export function authHeaders(extra = {}) {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}
