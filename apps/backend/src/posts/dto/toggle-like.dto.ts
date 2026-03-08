import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ToggleLikeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  visitorId!: string;
}
