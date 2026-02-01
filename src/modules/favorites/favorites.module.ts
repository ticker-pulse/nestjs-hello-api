import { Module } from '@nestjs/common';
import { FavoritesController } from './controllers/favorites.controller';
import { FavoritesService } from './services/favorites.service';
import { PrismaService } from '@/common/prisma.service';

@Module({
  controllers: [FavoritesController],
  providers: [FavoritesService, PrismaService],
  exports: [FavoritesService],
})
export class FavoritesModule {}
