import { IsOptional, IsString, IsInt, Min, Max, IsArray, IsNumber, IsObject, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

class AgeRangeDto {
  @IsInt()
  @Min(14)
  @Max(99)
  min: number;

  @IsInt()
  @Min(14)
  @Max(99)
  max: number;
}

class PreferencesDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => AgeRangeDto)
  ageRange?: AgeRangeDto;

  @IsOptional()
  @IsString()
  gender?: 'male' | 'female' | 'both';

  @IsOptional()
  @IsNumber()
  maxDistanceKm?: number;

  @IsOptional()
  @IsString()
  showMe?: 'male' | 'female' | 'both';

  @IsOptional()
  @IsBoolean()
  interestsPriority?: boolean;

  @IsOptional()
  @IsBoolean()
  showMyAge?: boolean;

  @IsOptional()
  @IsBoolean()
  showMyDistance?: boolean;

  @IsOptional()
  @IsString()
  lookingFor?: string;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(14)
  @Max(100)
  age?: number;

  @IsOptional()
  @IsString()
  gender?: string;

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

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => PreferencesDto)
  preferences?: PreferencesDto;
}

