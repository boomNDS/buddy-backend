import { bearer } from "@elysiajs/bearer";
import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { config } from "./config.ts";

export const app = new Elysia()
	.use(swagger())
	.use(bearer())
	.get("/", "Hello World");
