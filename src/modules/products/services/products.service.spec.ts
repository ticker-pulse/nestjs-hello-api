import 'reflect-metadata';
import { NotFoundException } from '@nestjs/common';
import { describe, it, expect, beforeEach } from 'vitest';
import { ProductsService } from './products.service';
import { PrismaService } from '@/common/prisma.service';
import {
  createMockPrismaService,
  type MockedPrismaClient,
} from '@/test/mocks/prisma.service.mock';

describe('ProductsService', () => {
  let service: ProductsService;
  let mockPrismaService: MockedPrismaClient;

  const mockProduct = {
    id: 'product-1',
    name: 'Test Product',
    description: 'Test Description',
    price: '99.99',
    stock: 10,
    sku: 'TEST-SKU-001',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockPrismaService = createMockPrismaService();

    // Create service with type-safe mock
    service = new ProductsService(mockPrismaService as unknown as PrismaService);
  });

  describe('create', () => {
    it('should create a product', async () => {
      mockPrismaService.product.create.mockResolvedValue(mockProduct);

      const result = await service.create({
        name: 'Test Product',
        price: '99.99',
        stock: 10,
        sku: 'TEST-SKU-001',
      });

      expect(result).toEqual(mockProduct);
      expect(mockPrismaService.product.create).toHaveBeenCalled();
    });

    it('should create a product with description', async () => {
      mockPrismaService.product.create.mockResolvedValue(mockProduct);

      await service.create({
        name: 'Test Product',
        description: 'Test Description',
        price: '99.99',
        stock: 10,
        sku: 'TEST-SKU-001',
      });

      expect(mockPrismaService.product.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all products', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([mockProduct]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockProduct);
      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      const result = await service.findOne('product-1');

      expect(result).toEqual(mockProduct);
      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: 'product-1' },
      });
    });

    it('should throw NotFoundException when product does not exist', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const updatedProduct = { ...mockProduct, name: 'Updated Product' };
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.product.update.mockResolvedValue(updatedProduct);

      const result = await service.update('product-1', {
        name: 'Updated Product',
      });

      expect(result.name).toBe('Updated Product');
      expect(mockPrismaService.product.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException when product does not exist', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(
        service.update('non-existent', { name: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a product', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.product.delete.mockResolvedValue(mockProduct);

      await service.remove('product-1');

      expect(mockPrismaService.product.delete).toHaveBeenCalledWith({
        where: { id: 'product-1' },
      });
    });

    it('should throw NotFoundException when product does not exist', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
