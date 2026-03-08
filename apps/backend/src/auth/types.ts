import { UserRole } from './roles.enum';

export type JwtPayload = {
  sub: number;
  email: string;
  role: UserRole;
};
