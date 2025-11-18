import { IsEmail, IsString, MinLength, IsOptional, IsInt, Min, Max, IsArray } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  name: string;

  @IsInt()
  @Min(18)
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
  @IsArray()
  @IsString({ each: true })
  interests?: string[];
}

