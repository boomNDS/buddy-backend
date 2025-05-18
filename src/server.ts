import { bearer } from "@elysiajs/bearer";
import { swagger } from "@elysiajs/swagger";
import { logger } from "@tqman/nice-logger";
import { Elysia } from "elysia";
import { helmet } from "elysia-helmet";
import { config } from "./config.ts";

export const app = new Elysia()
  .use(helmet())
  .use(
    logger({
      mode: "live",
      withBanner: true,
      withTimestamp: true,
    }),
  )
  .use(swagger())
  .use(bearer())
  .get("/", "Hello World");
