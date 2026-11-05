import axios from 'axios';

export const TOKEN_KEY = 'luma_token';
export const AUTH_UNAUTHORIZED_EVENT = 'luma:unauthorized';

const baseURL = import.meta.env.VITE_API_URL?.trim() || '/api/v1';

const api = axios.create({
  baseURL,
  timeout: 20_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
    }

    return Promise.reject(error);
  }
);

export function getApiError(error) {
  if (error?.code === 'ECONNABORTED') {
    return 'The request timed out. Please check your connection and try again.';
  }

  if (!error?.response) {
    return 'Unable to reach the server. Make sure the API is running and try again.';
  }

  return (
    error.response.data?.message ||
    `The request failed (${error.response.status}). Please try again.`
  );
}

export function getFieldErrors(error) {
  const details = error?.response?.data?.errors;

  if (!Array.isArray(details)) {
    return {};
  }

  return details.reduce((accumulator, detail) => {
    if (detail?.field) {
      accumulator[detail.field] = detail.message;
    }
    return accumulator;
  }, {});
}

export default api;
