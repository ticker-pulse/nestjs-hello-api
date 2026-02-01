import 'reflect-metadata';
import { NotFoundException } from '@nestjs/common';
import { describe, it, expect, beforeEach } from 'vitest';
import { ProductsController } from './products.controller';
import { ProductsService } from '../services/products.service';
import {
  createMockProductsService,
  type MockedProductsService,
} from '@/test/mocks/products.service.mock';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: MockedProductsService;

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
    service = createMockProductsService();

    // Create controller with type-safe mock
    controller = new ProductsController(service as unknown as ProductsService);
  });

  describe('POST /products', () => {
    it('should create a product and return 201', async () => {
      service.create.mockResolvedValue(mockProduct);

      const result = await controller.create({
        name: 'Test Product',
        price: '99.99',
        stock: 10,
        sku: 'TEST-SKU-001',
      });

      expect(result).toEqual(mockProduct);
    });

    it('should create a product with description', async () => {
      service.create.mockResolvedValue(mockProduct);

      await controller.create({
        name: 'Test Product',
        description: 'Test Description',
        price: '99.99',
        stock: 10,
        sku: 'TEST-SKU-001',
      });

      expect(service.create).toHaveBeenCalled();
    });
  });

  describe('GET /products', () => {
    it('should return all products', async () => {
      service.findAll.mockResolvedValue([mockProduct]);

      const result = await controller.findAll();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockProduct);
    });
  });

  describe('GET /products/:id', () => {
    it('should return a product by id', async () => {
      service.findOne.mockResolvedValue(mockProduct);

      const result = await controller.findOne('product-1');

      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException when product not found', async () => {
      service.findOne.mockRejectedValue(
        new NotFoundException('Product not found'),
      );

      await expect(controller.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('PATCH /products/:id', () => {
    it('should update a product', async () => {
      const updatedProduct = { ...mockProduct, name: 'Updated Product' };
      service.update.mockResolvedValue(updatedProduct);

      const result = await controller.update('product-1', {
        name: 'Updated Product',
      });

      expect(result.name).toBe('Updated Product');
    });

    it('should throw NotFoundException when product not found', async () => {
      service.update.mockRejectedValue(
        new NotFoundException('Product not found'),
      );

      await expect(
        controller.update('invalid-id', { name: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('DELETE /products/:id', () => {
    it('should delete a product and return 204', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove('product-1');

      expect(service.remove).toHaveBeenCalledWith('product-1');
    });

    it('should throw NotFoundException when product not found', async () => {
      service.remove.mockRejectedValue(
        new NotFoundException('Product not found'),
      );

      await expect(controller.remove('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
