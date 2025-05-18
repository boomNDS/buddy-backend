import { SQL } from "bun";
import { drizzle } from "drizzle-orm/bun-sql";
import { config } from "../config.ts";
import * as schema from "./schema.ts";

export const sql = new SQL(config.DATABASE_URL);

export const db = drizzle({
	client: sql,
	casing: "snake_case",
	schema,
});
