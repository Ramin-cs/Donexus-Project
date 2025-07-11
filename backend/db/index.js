import { PrismaClient } from '@prisma/client';

/**
 * Database service module
 * Provides Prisma client instance and query helpers
 */

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

/**
 * Graceful shutdown handler
 */
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

/**
 * Query helper function for custom queries
 * @param {string} query - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} Query results
 */
export async function query(query, params = []) {
  try {
    const result = await prisma.$queryRawUnsafe(query, ...params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw new Error('Database query failed');
  }
}

/**
 * Health check for database connection
 * @returns {Promise<boolean>} Connection status
 */
export async function healthCheck() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

export { prisma };
