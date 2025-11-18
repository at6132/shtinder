import { IsOptional, IsString, IsInt, Min, Max, IsArray, IsNumber, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AgeRangeDto {
  @IsInt()
  @Min(18)
  @Max(99)
  min: number;

  @IsInt()
  @Min(18)
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
  @IsString()
  interestsPriority?: boolean;

  @IsOptional()
  @IsString()
  showMyAge?: boolean;

  @IsOptional()
  @IsString()
  showMyDistance?: boolean;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(18)
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

