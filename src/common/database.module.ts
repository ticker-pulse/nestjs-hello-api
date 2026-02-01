import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Global database module providing PrismaService to all modules.
 *
 * The @Global() decorator makes PrismaService available application-wide
 * without needing to import DatabaseModule in each feature module.
 *
 * Only import this module once in AppModule - feature modules automatically
 * have access to PrismaService through dependency injection.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}
