import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma.service';
import { AddFavoriteDto } from '../dtos/add-favorite.dto';
import { UpdateFavoriteDto } from '../dtos/update-favorite.dto';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async addFavorite(userId: string, dto: AddFavoriteDto) {
    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify product exists
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check if favorite already exists
    const existingFavorite = await this.prisma.userFavorite.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: dto.productId,
        },
      },
    });
    if (existingFavorite) {
      throw new ConflictException(
        'Product is already in favorites',
      );
    }

    return this.prisma.userFavorite.create({
      data: {
        userId,
        productId: dto.productId,
        notes: dto.notes,
      },
      include: {
        product: true,
      },
    });
  }

  async getUserFavorites(userId: string) {
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

  async getFavorite(userId: string, productId: string) {
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
  ) {
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

  async removeFavorite(userId: string, productId: string) {
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
