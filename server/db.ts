import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Optimized connection configuration for Render deployment
const connectionConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL_ENABLED === 'true' ? { rejectUnauthorized: false } : false,
  
  // Render-optimized settings
  connectionTimeoutMillis: 5000,    // Longer timeout for Render
  idleTimeoutMillis: 30000,         // Stable idle time
  query_timeout: 10000,             // Sufficient for complex queries
  statement_timeout: 15000,         // Safe timeout for large operations
  
  // Connection pool optimized for Render free tier
  max: 3,                          // Conservative max connections
  min: 0,                          // No idle connections for cost efficiency
  acquireTimeoutMillis: 5000,      // Longer acquire timeout
  createTimeoutMillis: 5000,       // Stable creation time
  destroyTimeoutMillis: 2000,      // Proper cleanup
  reapIntervalMillis: 1000,        // Regular cleanup
  createRetryIntervalMillis: 200,  // Reasonable retry interval
  
  // Render-specific optimizations
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
};

export const pool = new Pool(connectionConfig);
export const db = drizzle(pool, { schema });

// Test connection on startup
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Graceful shutdown handlers
process.on('SIGINT', async () => {
  console.log('Received SIGINT, closing database connections...');
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, closing database connections...');
  await pool.end();
  process.exit(0);
});