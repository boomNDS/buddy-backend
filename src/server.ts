import { bearer } from "@elysiajs/bearer";
import { swagger } from "@elysiajs/swagger";
import { logger } from "@tqman/nice-logger";
import dayjs from "dayjs";
import { eq } from "drizzle-orm";
import { type Context, Elysia, type Static, t } from "elysia";
import { helmet } from "elysia-helmet";
import { db } from "./db/index.ts";
import { diet, medications, vetClinics, vetVisits } from "./db/schema.ts";

const vetVisitSchema = t.Object({
	petId: t.Number(),
	clinicId: t.Number(),
	date: t.String({ format: "date" }),
	time: t.String({ format: "date-time" }),
	notes: t.String(),
});

type VetVisitInput = Static<typeof vetVisitSchema>;

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
			timestamp: dayjs().toISOString(),
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
	.group("/dashboard", (app) =>
		app.get(
			"",
			async ({ status }: Context) => {
				const pet = await db.query.pets.findFirst({
					where: (pets, { eq }) => eq(pets.id, 1),
				});

				if (!pet) {
					return status(404, "Pet not found");
				}

				const [petDiet, petMeds, visits, clinics] = await Promise.all([
					db.select().from(diet).where(eq(diet.petId, pet.id)),
					db.select().from(medications).where(eq(medications.petId, pet.id)),
					db.select().from(vetVisits).where(eq(vetVisits.petId, pet.id)),
					db.select().from(vetClinics),
				]);

				const visitsWithClinic = visits.map((v) => ({
					...v,
					clinicName:
						clinics.find((c) => c.id === v.clinicId)?.name ?? "Unknown",
				}));

				return {
					pet,
					diet: petDiet,
					medications: petMeds,
					visits: visitsWithClinic,
				};
			},
			{ detail: { tags: ["App"] } },
		),
	)
	.group("/clinics", (app) =>
		app.get(
			"",
			async ({ query }: Context) => {
				const { limit = 10, offset = 0, search } = query;

				const clinics = await db.query.vetClinics.findMany({
					where: search
						? (vetClinics, { ilike }) => ilike(vetClinics.name, `%${search}%`)
						: undefined,
					limit: +limit,
					offset: +offset,
					orderBy: (vetClinics, { asc }) => asc(vetClinics.id),
				});

				return clinics;
			},
			{
				query: t.Object({
					limit: t.Optional(t.Number({ minimum: 1 })),
					offset: t.Optional(t.Number({ minimum: 0 })),
					search: t.Optional(t.String()),
				}),
				detail: { tags: ["Clinics"] },
			},
		),
	)
	.group("/vet-visits", (app) =>
		app
			.get(
				"",
				async ({ status }: Context) => {
					const pet = await db.query.pets.findFirst({
						where: (pets, { eq }) => eq(pets.id, 1),
					});

					if (!pet) {
						return status(404, "Pet not found");
					}

					const [visits, clinics] = await Promise.all([
						db.select().from(vetVisits).where(eq(vetVisits.petId, pet.id)),
						db.select().from(vetClinics),
					]);

					const visitsWithClinic = visits.map((v) => ({
						...v,
						clinicName:
							clinics.find((c) => c.id === v.clinicId)?.name ?? "Unknown",
					}));

					return [...visitsWithClinic];
				},
				{
					detail: {
						tags: ["Vet Visits"],
					},
				},
			)
			.post(
				"",
				async ({
					body: { petId, clinicId, date, time, notes },
					status,
				}: Context<{ body: VetVisitInput }>) => {
					const pet = await db.query.pets.findFirst({
						where: (pets, { eq }) => eq(pets.id, petId),
					});

					if (!pet) {
						return status(404, "Pet not found");
					}

					const clinic = await db.query.vetClinics.findFirst({
						where: (vetClinics, { eq }) => eq(vetClinics.id, clinicId),
					});

					if (!clinic) {
						return status(404, "Clinic not found");
					}

					const visitDateTime = new Date(
						`${date}T${new Date(time).toISOString().split("T")[1]}`,
					);

					const insertedVisit = await db
						.insert(vetVisits)
						.values({
							petId,
							clinicId,
							date,
							time: visitDateTime,
							notes,
						})
						.returning();

					return insertedVisit[0];
				},
				{
					body: vetVisitSchema,
					detail: {
						tags: ["Vet Visits"],
					},
				},
			),
	);
