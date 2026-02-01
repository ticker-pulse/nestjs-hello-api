import { vi, type MockedFunction } from 'vitest';
import type { UsersService } from '@/modules/users/services/users.service';

export type MockedUsersService = {
  [K in keyof UsersService]: MockedFunction<UsersService[K]>;
};

export function createMockUsersService(): MockedUsersService {
  return {
    create: vi.fn(),
    findAll: vi.fn(),
    findOne: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  } as MockedUsersService;
}