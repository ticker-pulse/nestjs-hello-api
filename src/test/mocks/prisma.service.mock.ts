import { vi } from 'vitest';
import type { MockedFunction } from 'vitest';

export interface MockedPrismaClient {
  user: {
    findUnique: MockedFunction<any>;
    findMany: MockedFunction<any>;
    create: MockedFunction<any>;
    update: MockedFunction<any>;
    delete: MockedFunction<any>;
  };
  product: {
    findUnique: MockedFunction<any>;
    findMany: MockedFunction<any>;
    create: MockedFunction<any>;
    update: MockedFunction<any>;
    delete: MockedFunction<any>;
  };
  userFavorite: {
    findUnique: MockedFunction<any>;
    findMany: MockedFunction<any>;
    create: MockedFunction<any>;
    update: MockedFunction<any>;
    delete: MockedFunction<any>;
  };
}

export function createMockPrismaService(): MockedPrismaClient {
  return {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    product: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    userFavorite: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };
}