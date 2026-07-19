import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema.ts";

type Database = ReturnType<typeof drizzle<typeof schema>>;

let db: Database | null = null;
let pool: pg.Pool | null = null;

export function getDb(): Database | null {
  if (process.env.MOCK_DB === "true") {
    const testDatabase = {
      insert: () => ({ values: async () => undefined }),
    };
    // The test adapter intentionally implements only the insert chain used by the route.
    return testDatabase as unknown as Database;
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
