import { vi, type MockedFunction } from 'vitest';
import type { PrismaService } from '@/common/prisma.service';

/**
 * Type-safe mock for PrismaService delegate methods.
 * Each delegate (user, product, userFavorite) has its CRUD methods mocked.
 */
type MockDelegate = {
  findUnique: MockedFunction<(...args: any[]) => Promise<any>>;
  findMany: MockedFunction<(...args: any[]) => Promise<any[]>>;
  create: MockedFunction<(...args: any[]) => Promise<any>>;
  update: MockedFunction<(...args: any[]) => Promise<any>>;
  delete: MockedFunction<(...args: any[]) => Promise<any>>;
  deleteMany: MockedFunction<(...args: any[]) => Promise<any>>;
};

/**
 * Mocked PrismaService interface for unit testing.
 * Provides type-safe mocks for all Prisma delegates used in the application.
 */
export interface MockedPrismaClient {
  user: MockDelegate;
  product: MockDelegate;
  userFavorite: MockDelegate;
  $transaction: MockedFunction<(fn: (tx: any) => Promise<any>) => Promise<any>>;
}

/**
 * Creates a type-safe mock of PrismaService for unit testing.
 * Use this instead of mocking PrismaService directly to ensure
 * tests remain type-safe and catch interface changes.
 *
 * @example
 * ```typescript
 * const mockPrisma = createMockPrismaService();
 * mockPrisma.user.findUnique.mockResolvedValue({ id: '1', name: 'Test' });
 * const service = new UsersService(mockPrisma as unknown as PrismaService);
 * ```
 */
export function createMockPrismaService(): MockedPrismaClient {
  const createMockDelegate = (): MockDelegate => ({
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
  });

  return {
    user: createMockDelegate(),
    product: createMockDelegate(),
    userFavorite: createMockDelegate(),
    $transaction: vi.fn((fn) => fn({
      user: createMockDelegate(),
      product: createMockDelegate(),
      userFavorite: createMockDelegate(),
    })),
  };
}