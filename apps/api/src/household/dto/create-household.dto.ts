import { IsOptional, IsString } from 'class-validator';

export class CreateHouseholdDto {
  @IsString()
  @IsOptional()
  name?: string;
}
