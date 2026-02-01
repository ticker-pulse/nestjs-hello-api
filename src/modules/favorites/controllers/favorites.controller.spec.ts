import 'reflect-metadata';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { describe, it, expect, beforeEach } from 'vitest';
import { FavoritesController } from './favorites.controller';
import {
  createMockFavoritesService,
  type MockedFavoritesService,
} from '@/test/mocks/favorites.service.mock';

describe('FavoritesController', () => {
  let controller: FavoritesController;
  let service: MockedFavoritesService;

  const mockUserId = 'user-1';
  const mockProductId = 'product-1';
  const mockProduct = { id: mockProductId, name: 'Test Product', price: 99.99 };
  const mockFavorite = {
    id: 'fav-1',
    userId: mockUserId,
    productId: mockProductId,
    notes: null,
    createdAt: new Date(),
    product: mockProduct,
  };

  beforeEach(async () => {
    service = createMockFavoritesService();

    // Manually create controller with mock service
    controller = new FavoritesController(service as any);
  });

  describe('POST /users/:userId/favorites', () => {
    it('should add a favorite and return 201', async () => {
      service.addFavorite.mockResolvedValue(mockFavorite);

      const result = await controller.addFavorite(mockUserId, {
        productId: mockProductId,
        notes: 'Test note',
      });

      expect(result).toEqual(mockFavorite);
    });

    it('should throw ConflictException for duplicate favorites', async () => {
      service.addFavorite.mockRejectedValue(
        new ConflictException('Product is already in favorites'),
      );

      await expect(
        controller.addFavorite(mockUserId, { productId: mockProductId }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException for invalid user', async () => {
      service.addFavorite.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(
        controller.addFavorite('invalid-user', { productId: mockProductId }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for invalid product', async () => {
      service.addFavorite.mockRejectedValue(
        new NotFoundException('Product not found'),
      );

      await expect(
        controller.addFavorite(mockUserId, { productId: 'invalid-product' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('GET /users/:userId/favorites', () => {
    it('should return all user favorites', async () => {
      service.getUserFavorites.mockResolvedValue([mockFavorite]);

      const result = await controller.getUserFavorites(mockUserId);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockFavorite);
    });

    it('should throw NotFoundException for invalid user', async () => {
      service.getUserFavorites.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(
        controller.getUserFavorites('invalid-user'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('GET /users/:userId/favorites/:productId', () => {
    it('should return a specific favorite', async () => {
      service.getFavorite.mockResolvedValue(mockFavorite);

      const result = await controller.getFavorite(mockUserId, mockProductId);

      expect(result).toEqual(mockFavorite);
    });

    it('should throw NotFoundException when favorite not found', async () => {
      service.getFavorite.mockRejectedValue(
        new NotFoundException('Favorite not found'),
      );

      await expect(
        controller.getFavorite(mockUserId, 'invalid-product'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('PATCH /users/:userId/favorites/:productId', () => {
    it('should update favorite notes', async () => {
      const updatedFavorite = { ...mockFavorite, notes: 'Updated note' };
      service.updateFavorite.mockResolvedValue(updatedFavorite);

      const result = await controller.updateFavorite(mockUserId, mockProductId, {
        notes: 'Updated note',
      });

      expect(result.notes).toBe('Updated note');
    });

    it('should throw NotFoundException when favorite not found', async () => {
      service.updateFavorite.mockRejectedValue(
        new NotFoundException('Favorite not found'),
      );

      await expect(
        controller.updateFavorite(mockUserId, 'invalid-product', {
          notes: 'Updated',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('DELETE /users/:userId/favorites/:productId', () => {
    it('should remove a favorite and return 204', async () => {
      service.removeFavorite.mockResolvedValue(undefined);

      await controller.removeFavorite(mockUserId, mockProductId);

      expect(service.removeFavorite).toHaveBeenCalledWith(
        mockUserId,
        mockProductId,
      );
    });

    it('should throw NotFoundException when favorite not found', async () => {
      service.removeFavorite.mockRejectedValue(
        new NotFoundException('Favorite not found'),
      );

      await expect(
        controller.removeFavorite(mockUserId, 'invalid-product'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
