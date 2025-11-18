import { IsString, IsNotEmpty } from 'class-validator';

export class SwipeDto {
  @IsString()
  @IsNotEmpty()
  targetId: string;

  @IsString()
  @IsNotEmpty()
  direction: 'like' | 'dislike' | 'superlike';
}

