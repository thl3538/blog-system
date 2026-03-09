export type UserRole = 'ADMIN' | 'EDITOR' | 'AUTHOR';

export type AuthUser = {
  id: number;
  email: string;
  role: UserRole;
  name: string | null;
};

export type AuthResponse = {
  accessToken: string;
  user: AuthUser;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  name?: string;
};
