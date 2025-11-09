import { IsString, IsOptional, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร' })
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  preferences?: any;
}
