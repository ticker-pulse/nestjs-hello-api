import { PrismaClient } from '@prisma/client';

export const testPrisma = new PrismaClient();

export async function setupTestDatabase() {
  try {
    // Verify connection
    await testPrisma.$queryRaw`SELECT 1`;
  } catch (error) {
    console.error('Failed to connect to test database:', error);
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
