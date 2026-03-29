import { IsString, IsNotEmpty } from 'class-validator';

export class RenameLocationDto {
  @IsString()
  @IsNotEmpty()
  newName!: string;
}
