import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '../roles.enum';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  role?: UserRole;
}
