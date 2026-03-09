import axios, { AxiosError } from 'axios';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';
const TOKEN_STORAGE_KEY = 'blog-system-token';

export class HttpClientError extends Error {
  status?: number;
  code?: string;

  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = 'HttpClientError';
    this.status = status;
    this.code = code;
  }
}

export const HTTP_ERROR_CODES = {
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const;

export const isServiceUnavailableError = (error: unknown) =>
  error instanceof HttpClientError &&
  (error.code === HTTP_ERROR_CODES.SERVICE_UNAVAILABLE ||
    error.status === 502 ||
    error.status === 503 ||
    error.status === 504);

const createHttpClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE,
    timeout: 10000,
  });

  instance.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
      const token = window.localStorage.getItem(TOKEN_STORAGE_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      const status = error.response?.status;
      const data = error.response?.data as
        | { message?: string; error?: { message?: string; code?: string } }
        | undefined;

      if (!error.response) {
        return Promise.reject(
          new HttpClientError(
            '服务暂不可用，请确认后端服务已启动后重试',
            undefined,
            HTTP_ERROR_CODES.SERVICE_UNAVAILABLE,
          ),
        );
      }

      const message =
        data?.error?.message ?? data?.message ?? error.message ?? '请求失败';
      const code = data?.error?.code;

      return Promise.reject(new HttpClientError(message, status, code));
    },
  );

  return instance;
};

export const http = createHttpClient();

export const request = async <T = unknown>(config: AxiosRequestConfig) => {
  const response = await http.request<T>(config);
  return response.data;
};
