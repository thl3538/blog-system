import { request } from '../lib/http';
import type { AuthResponse, LoginPayload, RegisterPayload } from '../types/auth';

export const authApi = {
  login(payload: LoginPayload) {
    return request<AuthResponse>({
      url: '/auth/login',
      method: 'POST',
      data: payload,
    });
  },

  register(payload: RegisterPayload) {
    return request<AuthResponse>({
      url: '/auth/register',
      method: 'POST',
      data: payload,
    });
  },

  me() {
    return request<AuthResponse['user']>({
      url: '/auth/me',
      method: 'GET',
    });
  },
};
