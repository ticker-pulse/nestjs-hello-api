import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { describe, it, expect, beforeEach } from 'vitest';
import { FavoritesService } from './favorites.service';
import { PrismaService } from '@/common/prisma.service';
import {
  createMockPrismaService,
  type MockedPrismaClient,
} from '@/test/mocks/prisma.service.mock';

describe('FavoritesService', () => {
  let service: FavoritesService;
  let mockPrismaService: MockedPrismaClient;

  const mockUser = { id: 'user-1', name: 'Test User', email: 'test@example.com' };
  const mockProduct = { id: 'product-1', name: 'Test Product', price: 99.99 };
  const mockFavorite = {
    id: 'fav-1',
    userId: mockUser.id,
    productId: mockProduct.id,
    notes: null,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    mockPrismaService = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoritesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<FavoritesService>(FavoritesService);
  });

  describe('addFavorite', () => {
    it('should add a favorite successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.userFavorite.findUnique.mockResolvedValue(null);
      mockPrismaService.userFavorite.create.mockResolvedValue({
        ...mockFavorite,
        product: mockProduct,
      });

      const result = await service.addFavorite(mockUser.id, {
        productId: mockProduct.id,
        notes: 'Test note',
      });

      expect(result).toEqual({ ...mockFavorite, product: mockProduct });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.addFavorite('non-existent-user', {
          productId: mockProduct.id,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when product does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(
        service.addFavorite(mockUser.id, {
          productId: 'non-existent-product',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when favorite already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.userFavorite.findUnique.mockResolvedValue(mockFavorite);

      await expect(
        service.addFavorite(mockUser.id, {
          productId: mockProduct.id,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('getUserFavorites', () => {
    it('should return all favorites for a user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.userFavorite.findMany.mockResolvedValue([
        { ...mockFavorite, product: mockProduct },
      ]);

      const result = await service.getUserFavorites(mockUser.id);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ ...mockFavorite, product: mockProduct });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.getUserFavorites('non-existent-user'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getFavorite', () => {
    it('should return a specific favorite', async () => {
      mockPrismaService.userFavorite.findUnique.mockResolvedValue({
        ...mockFavorite,
        product: mockProduct,
      });

      const result = await service.getFavorite(mockUser.id, mockProduct.id);

      expect(result).toEqual({ ...mockFavorite, product: mockProduct });
    });

    it('should throw NotFoundException when favorite does not exist', async () => {
      mockPrismaService.userFavorite.findUnique.mockResolvedValue(null);

      await expect(
        service.getFavorite(mockUser.id, mockProduct.id),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateFavorite', () => {
    it('should update favorite notes', async () => {
      mockPrismaService.userFavorite.findUnique.mockResolvedValue(mockFavorite);
      mockPrismaService.userFavorite.update.mockResolvedValue({
        ...mockFavorite,
        notes: 'Updated note',
        product: mockProduct,
      });

      const result = await service.updateFavorite(mockUser.id, mockProduct.id, {
        notes: 'Updated note',
      });

      expect(result.notes).toBe('Updated note');
    });

    it('should throw NotFoundException when favorite does not exist', async () => {
      mockPrismaService.userFavorite.findUnique.mockResolvedValue(null);

      await expect(
        service.updateFavorite(mockUser.id, mockProduct.id, {
          notes: 'New note',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeFavorite', () => {
    it('should remove a favorite', async () => {
      mockPrismaService.userFavorite.findUnique.mockResolvedValue(mockFavorite);
      mockPrismaService.userFavorite.delete.mockResolvedValue(mockFavorite);

      await service.removeFavorite(mockUser.id, mockProduct.id);

      expect(mockPrismaService.userFavorite.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException when favorite does not exist', async () => {
      mockPrismaService.userFavorite.findUnique.mockResolvedValue(null);

      await expect(
        service.removeFavorite(mockUser.id, mockProduct.id),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
