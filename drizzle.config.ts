import type { Config } from "drizzle-kit";

const DATABASE_URL = process.env.DATABASE_URL;

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  casing: "snake_case",
  ...(DATABASE_URL && {
    // only add dbCredentials if URL exists
    dbCredentials: { url: DATABASE_URL },
  }),
} satisfies Config;
