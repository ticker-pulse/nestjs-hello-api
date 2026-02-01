import { Product, User, UserFavorite } from '@prisma/client';
import { testPrisma } from '../setup';

let userCounter = 0;
let productCounter = 0;

type FavoriteWithProduct = UserFavorite & { product: Product };

export async function createTestUser(overrides?: { name?: string; email?: string; phone?: string }): Promise<User> {
  userCounter++;
  return testPrisma.user.create({
    data: {
      name: overrides?.name || `Test User ${userCounter}`,
      email: overrides?.email || `user${userCounter}@test.com`,
      phone: overrides?.phone,
    },
  });
}

export async function createTestProduct(
  overrides?: {
    name?: string;
    description?: string;
    price?: string;
    stock?: number;
    sku?: string;
  },
): Promise<Product> {
  productCounter++;
  return testPrisma.product.create({
    data: {
      name: overrides?.name || `Test Product ${productCounter}`,
      description: overrides?.description,
      price: overrides?.price || '99.99',
      stock: overrides?.stock ?? 10,
      sku: overrides?.sku || `SKU-${productCounter}`,
    },
  });
}

export async function createTestFavorite(
  userId: string,
  productId: string,
  overrides?: { notes?: string },
): Promise<FavoriteWithProduct> {
  return testPrisma.userFavorite.create({
    data: {
      userId,
      productId,
      notes: overrides?.notes,
    },
    include: {
      product: true,
    },
  });
}
