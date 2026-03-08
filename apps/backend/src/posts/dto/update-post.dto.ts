import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePostDto {
  @IsString()
  @IsOptional()
  @MaxLength(120)
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(300)
  summary?: string;

  @IsString()
  @IsOptional()
  content?: string;
}
