import { IsString, IsNotEmpty } from 'class-validator';

export class SwipeDto {
  @IsString()
  @IsNotEmpty()
  targetId: string;
}

