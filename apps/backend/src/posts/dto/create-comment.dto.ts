import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsOptional()
  @MaxLength(80)
  nickname?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  content!: string;
}
