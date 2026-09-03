import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 90000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Response interceptor — normalize errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// ── Verify ──────────────────────────────────────────────
export const verifyQuestion = (question) =>
  api.post('/verify', { question });

export const getVerifications = (params = {}) =>
  api.get('/verifications', { params });

export const getVerificationById = (id) =>
  api.get(`/verifications/${id}`);

export const deleteVerification = (id) =>
  api.delete(`/verifications/${id}`);

// ── Analytics ───────────────────────────────────────────
export const getAnalytics = () =>
  api.get('/analytics');

// ── Sources ─────────────────────────────────────────────
export const getSources = (params = {}) =>
  api.get('/sources', { params });

export const createSource = (data) =>
  api.post('/sources', data);

export const updateSource = (id, data) =>
  api.put(`/sources/${id}`, data);

export const deleteSource = (id) =>
  api.delete(`/sources/${id}`);


// ── Settings ────────────────────────────────────────────
export const getSettings = () =>
  api.get('/settings');

export const updateSettings = (payload) =>
  api.put('/settings', payload);

export const toggleAgent = (provider, enabled) =>
  api.put(`/settings/agents/${provider}`, { enabled });

// ── News & Wikipedia ────────────────────────────────────
export const getLiveNews = (category = 'all', limit = 20) =>
  api.get('/news', { params: { category, limit } });

export const searchNews = (q, limit = 15) =>
  api.get('/news/search', { params: { q, limit } });

export const searchWikipedia = (q, limit = 5) =>
  api.get('/news/wikipedia', { params: { q, limit } });

export const getGrounding = (q) =>
  api.get('/news/grounding', { params: { q } });

// ── Health ──────────────────────────────────────────────
export const getHealth = () =>
  api.get('/health');

export default api;
