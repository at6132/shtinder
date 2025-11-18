import { IsString, IsNotEmpty } from 'class-validator';

export class CreateReportDto {
  @IsString()
  @IsNotEmpty()
  targetId: string;

  @IsString()
  @IsNotEmpty()
  reason: string;
}

