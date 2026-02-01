import { IsUUID, IsOptional, IsString } from 'class-validator';

export class AddFavoriteDto {
  @IsUUID()
  productId!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
