import {
  IsString,
  IsOptional,
  IsArray,
  IsInt,
  Min,
} from 'class-validator';

export class UpdateItemDto {
  @IsString()
  @IsOptional()
  emoji?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  quantity?: number;

  @IsString()
  @IsOptional()
  space?: string;

  @IsString()
  @IsOptional()
  zone?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  details?: string[];
}
