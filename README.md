# NestJS API with Prisma

A production-ready NestJS API with TypeScript, Prisma, PostgreSQL, and Vitest.

## Quick Start

### Prerequisites
- Node.js 20+
- Docker (for PostgreSQL)
- pnpm

### Setup (3 minutes)

```bash
# 1. Start PostgreSQL with Docker
pnpm db:docker:up

# 2. Copy environment config
cp .env.example .env

# 3. Create database schema
pnpm db:migrate:dev --name init

# 4. Seed sample data
pnpm db:seed

# 5. Start development server
pnpm dev
```

API runs at `http://localhost:3000`

## Testing API

### Get all users
```bash
curl http://localhost:3000/users
```

### Create user
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  }'
```

### Get all products
```bash
curl http://localhost:3000/products
```

### Create product
```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop",
    "description": "High-performance laptop",
    "price": "1299.99",
    "stock": 15,
    "sku": "LAPTOP-001"
  }'
```

## API Endpoints

### Users
- `POST /users` - Create user
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Products
- `POST /products` - Create product
- `GET /products` - Get all products
- `GET /products/:id` - Get product by ID
- `PATCH /products/:id` - Update product
- `DELETE /products/:id` - Delete product

### Favorites/Wishlist
- `POST /users/:userId/favorites` - Add product to favorites
- `GET /users/:userId/favorites` - Get all favorites
- `GET /users/:userId/favorites/:productId` - Get specific favorite
- `PATCH /users/:userId/favorites/:productId` - Update favorite notes
- `DELETE /users/:userId/favorites/:productId` - Remove from favorites

### Health Check
- `GET /` - Welcome message
- `GET /status` - API status

## Development Commands

```bash
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Run production build
pnpm test             # Run tests (watch mode)
pnpm test:run         # Run tests once
pnpm test:ui          # Run tests with UI
```

## Database Commands

```bash
pnpm db:docker:up        # Start PostgreSQL + pgAdmin
pnpm db:docker:down      # Stop PostgreSQL
pnpm db:docker:logs      # View logs
pnpm db:migrate:dev      # Create migrations
pnpm db:migrate          # Apply migrations
pnpm db:seed            # Seed database
pnpm prisma:studio      # Open visual database browser
```

## Database Access

### pgAdmin (Web UI)
- URL: `http://localhost:5050`
- Email: `admin@example.com`
- Password: `admin`

### Prisma Studio (Visual Explorer)
```bash
pnpm prisma:studio
```

## Database Schema

### Users Table
- `id` - UUID (primary key)
- `name` - User full name
- `email` - Unique email address
- `phone` - Optional phone number
- `isActive` - Account status (default: true)
- `createdAt` - Auto-generated timestamp
- `updatedAt` - Auto-updated timestamp

### Products Table
- `id` - UUID (primary key)
- `name` - Product name
- `description` - Optional description
- `price` - Decimal price (10,2)
- `stock` - Available quantity (default: 0)
- `sku` - Unique stock keeping unit
- `isActive` - Product status (default: true)
- `createdAt` - Auto-generated timestamp
- `updatedAt` - Auto-updated timestamp

## Adding New Features

### Create new table

1. Update `prisma/schema.prisma`:
```prisma
model Order {
  id        String   @id @default(uuid())
  userId    String
  total     Decimal  @db.Decimal(10, 2)
  createdAt DateTime @default(now())

  @@map("orders")
}
```

2. Create migration:
```bash
pnpm db:migrate:dev --name AddOrdersTable
```

3. Regenerate Prisma types:
```bash
pnpm prisma:generate
```

### Add new module

```bash
mkdir -p src/modules/orders/{controllers,services,dtos}
```

Create service, controller, DTO, and module files following the existing pattern.

## Environment Variables

Create `.env` file (copy from `.env.example`):

```env
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nestjs_api"
API_PORT=3000
```

## Tech Stack

- **Framework**: NestJS 11
- **Language**: TypeScript 5
- **Database**: PostgreSQL 16
- **ORM**: Prisma 7
- **Testing**: Vitest
- **Package Manager**: pnpm
- **Node**: 20+

## Project Structure

```
src/
├── modules/
│   ├── users/          # User management
│   │   ├── controllers/
│   │   ├── services/
│   │   └── dtos/
│   └── products/       # Product management
│       ├── controllers/
│       ├── services/
│       └── dtos/
├── common/
│   └── prisma.service.ts    # Prisma connection
├── app.module.ts       # Root module
├── app.controller.ts
├── app.service.ts
└── main.ts

prisma/
├── schema.prisma       # Database schema
├── migrations/         # Migration history
└── seed.js            # Database seeding
```

## Testing

```bash
pnpm test              # Watch mode
pnpm test:run          # Single run
pnpm test:ui           # Dashboard
```

## Production Deployment

### Build
```bash
pnpm build
```

### Environment Setup
Set these environment variables on your server:
```
DATABASE_URL=postgresql://user:password@db-host:5432/dbname
NODE_ENV=production
```

### Run
```bash
pnpm start
```

## Troubleshooting

### Database connection refused
```bash
pnpm db:docker:up
```

### Database doesn't exist
```bash
pnpm db:migrate:dev --name init
```

### Prisma client out of sync
```bash
pnpm prisma:generate
```

## Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## License

ISC
