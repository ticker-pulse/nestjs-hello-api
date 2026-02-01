# Testing Guidelines - Avoid `any` Type

## ❌ DO NOT USE `any` in Tests

Using `any` type in tests defeats TypeScript's type safety and makes tests fragile and unmaintainable.

### Bad Example:
```typescript
let service: any;  // ❌ NO TYPE SAFETY

beforeEach(async () => {
  service = {
    create: vi.fn(),
    findAll: vi.fn(),
  };
});

// No IDE autocomplete, typos not caught at compile time
service.creat.mockResolvedValue(data);  // Bug not caught!
```

---

## ✅ DO USE Proper Typed Mocks

### Pattern 1: Using Mock Factory (Recommended)

**Create a dedicated mock factory file:**
```typescript
// src/test/mocks/users.service.mock.ts
import { vi } from 'vitest';
import type { MockedFunction } from 'vitest';
import type { UsersService } from '@/modules/users/services/users.service';

// Mapped type that makes all service methods mocked
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
  };
}
```

**Use in tests:**
```typescript
// src/modules/users/services/users.service.spec.ts
import { createMockUsersService, type MockedUsersService } from '@/test/mocks/users.service.mock';

describe('UsersService', () => {
  let service: UsersService;
  let mockPrismaService: MockedPrismaClient;  // ✅ Proper type

  beforeEach(async () => {
    mockPrismaService = createMockPrismaService();  // ✅ Factory function

    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get(UsersService);
  });

  it('should create a user', async () => {
    mockPrismaService.user.create.mockResolvedValue(mockUser);  // ✅ Full type support

    const result = await service.create({ name: 'Test', email: 'test@example.com' });

    expect(result).toEqual(mockUser);
    expect(mockPrismaService.user.create).toHaveBeenCalled();  // ✅ IDE knows this exists
  });
});
```

### Pattern 2: Inline Typed Mock (For Simple Cases)

```typescript
// Only if the type is simple and used once
const mockService: Partial<UsersService> = {
  create: vi.fn(),
  findAll: vi.fn(),
};
```

---

## Benefits of Proper Typing

| Aspect | `any` ❌ | Typed ✅ |
|--------|---------|----------|
| IDE Autocomplete | None | Full autocomplete |
| Catch Typos | At runtime | At compile time |
| Refactoring | Manual everywhere | Automatic with rename |
| Code Review | Hard to verify | Easy to verify correctness |
| Maintenance | Fragile | Maintainable |
| Documentation | Unclear | Self-documenting |

---

## Mapping Type Pattern

The most powerful pattern is using mapped types to ensure all methods are properly mocked:

```typescript
// This ensures every method of the service is mocked correctly
export type MockedFavoritesService = {
  [K in keyof FavoritesService]: MockedFunction<FavoritesService[K]>;
};
```

This means:
- If `FavoritesService` is updated with new methods, TypeScript will complain in the mock factory
- All methods are guaranteed to be properly mocked
- IDE knows exactly what's available

---

## Checklist for Writing Tests

- [ ] Use mock factory functions from `src/test/mocks/`
- [ ] Import the `Mocked*Service` type from the mock factory
- [ ] Declare service variable with the mocked type (not `any`)
- [ ] Use `vi.fn()` for all mocked functions
- [ ] Use `mockResolvedValue()` or `mockRejectedValue()` for return values
- [ ] Verify IDE autocomplete works (if not, type is wrong)
- [ ] Never use `as any` or `any` type in tests

---

## Current Mock Factories

These mock factories already exist and should be used:

- `src/test/mocks/prisma.service.mock.ts` - For PrismaService
- `src/test/mocks/users.service.mock.ts` - For UsersService
- `src/test/mocks/products.service.mock.ts` - For ProductsService
- `src/test/mocks/favorites.service.mock.ts` - For FavoritesService

For new services, follow the same pattern to create a new mock factory.

---

## References

- Vitest Types: https://vitest.dev/api/
- TypeScript Mapped Types: https://www.typescriptlang.org/docs/handbook/2/mapped-types.html
- Testing Best Practices: https://angular.io/guide/testing
