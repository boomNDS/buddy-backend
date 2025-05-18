// migrate.ts
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import env from "env-var";

const connection = postgres(env.get("DATABASE_URL").required().asString(), {
  max: 1,
});
const db = drizzle(connection);

await migrate(db, { migrationsFolder: "./drizzle" });

await connection.end();
