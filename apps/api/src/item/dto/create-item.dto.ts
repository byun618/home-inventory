import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
} from 'class-validator';

export class CreateItemDto {
  @IsString()
  @IsOptional()
  emoji?: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  space!: string;

  @IsString()
  @IsOptional()
  zone?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  details?: string[];
}
