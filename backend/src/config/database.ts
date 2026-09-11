import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

/**
 * PostgreSQL connection pool configuration.
 *
 * Reads DATABASE_URL from environment variables.
 * In development, falls back to localhost defaults to ease initial setup.
 */
const poolConfig: PoolConfig = {
  connectionString: process.env.DATABASE_URL,
  // Connection pool limits
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
};

const pool = new Pool(poolConfig);

// Log pool errors globally so they don't crash the process silently
pool.on('error', (err) => {
  console.error('[Database] Unexpected pool error:', err.message);
});

/**
 * Execute a parameterized SQL query.
 *
 * @param text - SQL query string with $1, $2, ... placeholders
 * @param params - Parameter values
 * @returns Query result
 *
 * @example
 * const result = await query('SELECT * FROM users WHERE email = $1', ['admin@erp.com']);
 */
export const query = (text: string, params?: unknown[]) => {
  return pool.query(text, params);
};

/**
 * Get a client from the pool for transaction support.
 *
 * Usage:
 * ```ts
 * const client = await getClient();
 * try {
 *   await client.query('BEGIN');
 *   // ... multiple queries ...
 *   await client.query('COMMIT');
 * } catch (err) {
 *   await client.query('ROLLBACK');
 *   throw err;
 * } finally {
 *   client.release();
 * }
 * ```
 */
export const getClient = () => {
  return pool.connect();
};

/**
 * Test the database connection.
 * Returns true if the connection succeeds, false otherwise.
 */
export const testConnection = async (): Promise<boolean> => {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('[Database] Connected successfully at:', result.rows[0].now);
    return true;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Database] Connection failed:', message);
    return false;
  }
};

export default pool;
