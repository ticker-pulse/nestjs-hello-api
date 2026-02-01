import { vi } from 'vitest';
import type { MockedFunction } from 'vitest';
import type { ProductsService } from '@/modules/products/services/products.service';

export type MockedProductsService = {
  [K in keyof ProductsService]: MockedFunction<ProductsService[K]>;
};

export function createMockProductsService(): MockedProductsService {
  return {
    create: vi.fn(),
    findAll: vi.fn(),
    findOne: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };
}