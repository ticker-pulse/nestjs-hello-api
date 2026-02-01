import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';

/**
 * Test database client.
 * Uses TEST_DATABASE_URL if set, otherwise falls back to DATABASE_URL.
 */
export const testPrisma = new PrismaClient({
  datasourceUrl: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
});

/**
 * Validates that we're connecting to a test database.
 * Prevents accidental operations against production.
 */
function validateTestDatabase(): void {
  const dbUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL || '';

  // Safety check: ensure we're not running against production
  if (dbUrl.includes('production') || dbUrl.includes('prod.')) {
    throw new Error(
      'SAFETY: Refusing to run tests against what appears to be a production database. ' +
      'Set TEST_DATABASE_URL to a dedicated test database.',
    );
  }
}

export async function setupTestDatabase(): Promise<void> {
  validateTestDatabase();

  try {
    // Verify connection
    await testPrisma.$queryRaw`SELECT 1`;

    // Run migrations using the test database URL
    // eslint-disable-next-line no-console
    console.log('Running database migrations...');
    const env = {
      ...process.env,
      DATABASE_URL: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
    };
    execSync('pnpm prisma migrate deploy', { stdio: 'inherit', env });
  } catch (error) {
    console.error('Failed to setup test database:', error);
    throw error;
  }
}

export async function teardownTestDatabase(): Promise<void> {
  await testPrisma.$disconnect();
}

export async function resetTestDatabase(): Promise<void> {
  // Delete all data in order of foreign key dependencies
  await testPrisma.userFavorite.deleteMany();
  await testPrisma.user.deleteMany();
  await testPrisma.product.deleteMany();
}
