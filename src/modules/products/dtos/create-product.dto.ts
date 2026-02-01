import { Type } from 'class-transformer';
import { IsString, IsNumber, IsOptional, Matches } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @Matches(/^\d+(\.\d{1,2})?$/, {
    message: 'price must be a valid decimal number (e.g., "99.99")',
  })
  price!: string;

  @Type(() => Number)
  @IsNumber()
  stock!: number;

  @IsString()
  sku!: string;
}
