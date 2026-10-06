import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

// Penyedia terkelola (Neon, Supabase, Vercel Postgres) mewajibkan SSL,
// sedangkan PostgreSQL lokal tidak memakainya.
const lokal = /localhost|127\.0\.0\.1/.test(databaseUrl);

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl,
    ssl: lokal ? undefined : { rejectUnauthorized: false },
    max: lokal ? 10 : 5,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);
