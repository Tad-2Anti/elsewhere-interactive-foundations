import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema.ts";

let db: ReturnType<typeof drizzle<typeof schema>> | null = null;
let pool: pg.Pool | null = null;

export function getDb() {
  if (process.env.NODE_ENV === "test" || process.env.MOCK_DB === "true") {
    return {
      insert: () => ({
        values: async () => Promise.resolve(),
      }),
    } as any;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return null;
  }

  if (!db) {
    pool = new pg.Pool({
      connectionString,
      ssl: connectionString.includes("neon.tech") || connectionString.includes("vercel-storage.com")
        ? { rejectUnauthorized: false }
        : undefined,
    });
    db = drizzle(pool, { schema });
  }

  return db;
}
