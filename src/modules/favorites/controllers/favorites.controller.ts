import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FavoritesService } from '../services/favorites.service';
import { AddFavoriteDto } from '../dtos/add-favorite.dto';
import { UpdateFavoriteDto } from '../dtos/update-favorite.dto';

@Controller('users/:userId/favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async addFavorite(
    @Param('userId') userId: string,
    @Body() dto: AddFavoriteDto,
  ) {
    return this.favoritesService.addFavorite(userId, dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getUserFavorites(@Param('userId') userId: string) {
    return this.favoritesService.getUserFavorites(userId);
  }

  @Get(':productId')
  @HttpCode(HttpStatus.OK)
  async getFavorite(
    @Param('userId') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.favoritesService.getFavorite(userId, productId);
  }

  @Patch(':productId')
  @HttpCode(HttpStatus.OK)
  async updateFavorite(
    @Param('userId') userId: string,
    @Param('productId') productId: string,
    @Body() dto: UpdateFavoriteDto,
  ) {
    return this.favoritesService.updateFavorite(userId, productId, dto);
  }

  @Delete(':productId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeFavorite(
    @Param('userId') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.favoritesService.removeFavorite(userId, productId);
  }
}
