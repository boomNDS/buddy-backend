import { config } from "./config.ts";
import { app } from "./server.ts";
const signals = ["SIGINT", "SIGTERM"];
import pc from "picocolors";

const formatter = new Intl.DateTimeFormat("en-US", {
	month: "numeric",
	day: "numeric",
	year: "numeric",
	hour: "numeric",
	minute: "2-digit",
	second: "2-digit",
	hour12: true,
});

for (const signal of signals) {
	process.on(signal, async () => {
		console.log(`Received ${signal}. Initiating graceful shutdown...`);
		await app.stop();
		process.exit(0);
	});
}

process.on("uncaughtException", (error) => {
	console.error(error);
});

process.on("unhandledRejection", (error) => {
	console.error(error);
});

app.listen(3001, () =>
	console.log(
		`[${pc.gray(formatter.format(Date.now()))}] 🦊 Server started at ${app.server?.url.origin}`,
	),
);
