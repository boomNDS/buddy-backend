import { bearer } from "@elysiajs/bearer";
import { swagger } from "@elysiajs/swagger";
import { logger } from "@tqman/nice-logger";
import { Elysia, t } from "elysia";
import { helmet } from "elysia-helmet";
import { config } from "./config.ts";
import dayjs from "dayjs";

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
  .get(
    "/healthz",
    () => ({
      status: "ok",
      // ISO 8601 timestamp
      timestamp: dayjs().toISOString(),
      // human-friendly formatted time
      time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    }),
    {
      response: t.Object({
        status: t.String(),
        timestamp: t.String(),
        time: t.String(),
      }),
    },
  )
  .get("/", "Hello World");
