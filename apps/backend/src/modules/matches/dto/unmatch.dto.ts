import { IsString, IsNotEmpty } from 'class-validator';

export class UnmatchDto {
  @IsString()
  @IsNotEmpty()
  matchId: string;
}

