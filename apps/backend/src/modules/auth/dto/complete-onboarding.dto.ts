import { IsString, IsOptional, IsInt, Min, Max, IsObject } from 'class-validator';

export class CompleteOnboardingDto {
  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsString()
  name: string;

  @IsInt()
  @Min(14)
  @Max(100)
  age: number;

  @IsString()
  gender: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsInt()
  @Min(100)
  @Max(250)
  height?: number;

  @IsOptional()
  @IsObject()
  preferences?: any;
}

