# Quick Start Guide

## Setup (One-time)

```bash
# 1. Install dependencies
pnpm install

# 2. Start PostgreSQL with Docker
pnpm db:docker:up

# 3. Create environment config
cp .env.example .env

# 4. Run database migrations
pnpm db:migrate:dev

# 5. Seed sample data
pnpm db:seed
```

## Development

```bash
# Start dev server
pnpm dev

# Run tests (watch mode)
pnpm test

# Run all tests once
pnpm test:run

# Run tests with coverage
pnpm test:cov

# Run tests with UI
pnpm test:ui

# Open database browser
pnpm prisma:studio
```

## Testing the Favorites API

```bash
# 1. Create a user
USER_ID=$(curl -s -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com"}' | jq -r '.id')

# 2. Create a product
PRODUCT_ID=$(curl -s -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Laptop","price":"999.99","stock":5,"sku":"LAPTOP-001"}' | jq -r '.id')

# 3. Add to favorites
curl -X POST http://localhost:3000/users/$USER_ID/favorites \
  -H "Content-Type: application/json" \
  -d "{\"productId\":\"$PRODUCT_ID\",\"notes\":\"Want to buy\"}"

# 4. View all favorites
curl http://localhost:3000/users/$USER_ID/favorites

# 5. Update favorite notes
curl -X PATCH http://localhost:3000/users/$USER_ID/favorites/$PRODUCT_ID \
  -H "Content-Type: application/json" \
  -d '{"notes":"Still interested"}'

# 6. Remove from favorites
curl -X DELETE http://localhost:3000/users/$USER_ID/favorites/$PRODUCT_ID
```

## Production Build

```bash
pnpm build
pnpm start
```

## Key Files

- **Database**: `prisma/schema.prisma`
- **API Routes**: `src/app.module.ts`
- **Favorites Module**: `src/modules/favorites/`
- **Tests**: `src/modules/**/*.spec.ts`, `src/test/e2e/`
- **Documentation**: `IMPLEMENTATION_SUMMARY.md`, `TESTING_GUIDELINES.md`

## Important Notes

- ✅ All scripts use `pnpm` (never use `npm`)
- ✅ All tests use properly typed mocks (no `any` types)
- ✅ See `TESTING_GUIDELINES.md` for testing best practices
- ✅ Database constraints prevent duplicate favorites
- ✅ Cascade deletes clean up favorites when user/product is deleted
