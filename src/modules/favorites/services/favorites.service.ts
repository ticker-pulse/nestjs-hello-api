import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Product, UserFavorite } from '@prisma/client';
import { AddFavoriteDto } from '../dtos/add-favorite.dto';
import { UpdateFavoriteDto } from '../dtos/update-favorite.dto';
import { PrismaService } from '@/common/prisma.service';

type FavoriteWithProduct = UserFavorite & { product: Product };

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Add a product to user's favorites.
   * Uses a transaction to prevent race conditions when checking for duplicates.
   */
  async addFavorite(userId: string, dto: AddFavoriteDto): Promise<FavoriteWithProduct> {
    return this.prisma.$transaction(async (tx) => {
      // Verify user exists
      const user = await tx.user.findUnique({
        where: { id: userId },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Verify product exists
      const product = await tx.product.findUnique({
        where: { id: dto.productId },
      });
      if (!product) {
        throw new NotFoundException('Product not found');
      }

      // Check if favorite already exists
      const existingFavorite = await tx.userFavorite.findUnique({
        where: {
          userId_productId: {
            userId,
            productId: dto.productId,
          },
        },
      });
      if (existingFavorite) {
        throw new ConflictException('Product is already in favorites');
      }

      return tx.userFavorite.create({
        data: {
          userId,
          productId: dto.productId,
          notes: dto.notes,
        },
        include: {
          product: true,
        },
      });
    });
  }

  async getUserFavorites(userId: string): Promise<FavoriteWithProduct[]> {
    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.userFavorite.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getFavorite(userId: string, productId: string): Promise<FavoriteWithProduct> {
    const favorite = await this.prisma.userFavorite.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      include: { product: true },
    });

    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }

    return favorite;
  }

  async updateFavorite(
    userId: string,
    productId: string,
    dto: UpdateFavoriteDto,
  ): Promise<FavoriteWithProduct> {
    // Verify favorite exists
    const favorite = await this.prisma.userFavorite.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }

    return this.prisma.userFavorite.update({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      data: {
        notes: dto.notes,
      },
      include: { product: true },
    });
  }

  async removeFavorite(userId: string, productId: string): Promise<void> {
    // Verify favorite exists
    const favorite = await this.prisma.userFavorite.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }

    await this.prisma.userFavorite.delete({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });
  }
}
