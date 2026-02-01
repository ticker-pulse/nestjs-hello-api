import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

export const testPrisma = new PrismaClient();

export async function setupTestDatabase() {
  try {
    // Verify connection
    await testPrisma.$queryRaw`SELECT 1`;

    // Run migrations
    console.log('Running database migrations...');
    execSync('pnpm prisma migrate deploy', { stdio: 'inherit' });
  } catch (error) {
    console.error('Failed to setup test database:', error);
    throw error;
  }
}

export async function teardownTestDatabase() {
  await testPrisma.$disconnect();
}

export async function resetTestDatabase() {
  // Delete all data in order of foreign key dependencies
  await testPrisma.userFavorite.deleteMany();
  await testPrisma.user.deleteMany();
  await testPrisma.product.deleteMany();
}
