import { IsString, IsNumber, IsOptional, IsDecimal } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  price!: string;

  @Type(() => Number)
  @IsNumber()
  stock!: number;

  @IsString()
  sku!: string;
}
