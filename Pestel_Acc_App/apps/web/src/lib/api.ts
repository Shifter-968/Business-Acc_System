import axios from 'axios';
// ─── Cookie helpers ───────────────────────────────────────────────────────────
// Middleware can't read localStorage (server-only), so we also write a thin
// auth_session cookie as a presence flag for route protection.
// The cookie max-age matches the refresh-token lifetime (7 days).
export function setAuthSession() {
  document.cookie = `auth_session=1; path=/; max-age=${7 * 24 * 3600}; SameSite=Lax`;
}
export function clearAuthSession() {
  document.cookie = `auth_session=; path=/; max-age=0; SameSite=Lax`;
}

export function getCurrentUserRole(): string | null {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('accessToken');
  if (!token) return null;

  try {
    const payloadBase64Url = token.split('.')[1];
    if (!payloadBase64Url) return null;
    const payloadBase64 = payloadBase64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = payloadBase64.padEnd(payloadBase64.length + ((4 - (payloadBase64.length % 4)) % 4), '=');
    const payload = JSON.parse(atob(padded));
    return typeof payload.role === 'string' ? payload.role : null;
  } catch {
    return null;
  }
}

// Sign out: clear tokens + cookie + call API (best-effort)
export async function signOut() {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) await api.post('/auth/logout', { refreshToken });
  } catch { /* ignore — we always clear locally */ }
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  clearAuthSession();
  window.location.href = '/login';
}


function resolveApiBase() {
  const fallback =
    typeof window !== 'undefined'
      ? `${window.location.protocol}//${window.location.hostname}:3001/api/v1`
      : 'http://localhost:3001/api/v1';

  const configured = process.env.NEXT_PUBLIC_API_URL;
  if (!configured || typeof window === 'undefined') return configured ?? fallback;

  try {
    const parsed = new URL(configured);
    const appHost = window.location.hostname;
    const isConfiguredLocal = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
    const isAppLocal = appHost === 'localhost' || appHost === '127.0.0.1';

    // If the app is opened from another device, localhost would point to that device.
    if (isConfiguredLocal && !isAppLocal) {
      parsed.hostname = appHost;
      return parsed.toString().replace(/\/$/, '');
    }

    return configured;
  } catch {
    return fallback;
  }
}

const API_BASE = resolveApiBase();

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');
        const { data } = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

// ─── Resource helpers ─────────────────────────────────────────────────────────

export const clientsApi = {
  list: (search?: string) => api.get('/clients', { params: { search } }),
  get: (id: string) => api.get(`/clients/${id}`),
  create: (data: unknown) => api.post('/clients', data),
  update: (id: string, data: unknown) => api.patch(`/clients/${id}`, data),
  balance: (id: string) => api.get(`/clients/${id}/balance`),
};

export const invoicesApi = {
  list: (params?: Record<string, string>) => api.get('/invoices', { params }),
  get: (id: string) => api.get(`/invoices/${id}`),
  create: (data: unknown) => api.post('/invoices', data),
  update: (id: string, data: unknown) => api.patch(`/invoices/${id}`, data),
  send: (id: string) => api.post(`/invoices/${id}/send`),
  void: (id: string) => api.post(`/invoices/${id}/void`),
  pdf: (id: string) => api.get(`/invoices/${id}/pdf`, { responseType: 'blob' }),
};

export const quotesApi = {
  list: (params?: Record<string, string>) => api.get('/quotes', { params }),
  get: (id: string) => api.get(`/quotes/${id}`),
  create: (data: unknown) => api.post('/quotes', data),
  update: (id: string, data: unknown) => api.patch(`/quotes/${id}`, data),
  convert: (id: string) => api.post(`/quotes/${id}/convert`),
  send: (id: string) => api.post(`/quotes/${id}/send`),
};

export const expensesApi = {
  list: () => api.get('/expenses'),
  get: (id: string) => api.get(`/expenses/${id}`),
  create: (data: unknown) => api.post('/expenses', data),
  update: (id: string, data: unknown) => api.patch(`/expenses/${id}`, data),
  remove: (id: string) => api.delete(`/expenses/${id}`),
};

export const reportsApi = {
  profitLoss: (from: string, to: string) => api.get('/reports/profit-loss', { params: { from, to } }),
  balanceSheet: (date: string) => api.get('/reports/balance-sheet', { params: { date } }),
  agedDebtors: () => api.get('/reports/aged-debtors'),
  exportXlsx: (type: string, params: Record<string, string>) =>
    api.get(`/reports/${type}/export`, { params: { ...params, format: 'xlsx' }, responseType: 'blob' }),
  exportPdf: (type: string, params: Record<string, string>) =>
    api.get(`/reports/${type}/export`, { params: { ...params, format: 'pdf' }, responseType: 'blob' }),
};

export const vatApi = {
  summary: (from: string, to: string) => api.get('/vat/period', { params: { from, to } }),
  transactions: () => api.get('/vat/transactions'),
};

export const usersApi = {
  list: () => api.get('/users'),
  listPending: () => api.get('/users/pending'),
  approve: (id: string, role?: string) => api.patch(`/users/${id}/approve`, role ? { role } : {}),
};
