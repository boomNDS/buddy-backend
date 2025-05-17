import {
	date,
	integer,
	numeric,
	pgEnum,
	pgTable,
	serial,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

export const unitEnum = pgEnum("unit", ["oz", "ml", "g", "kg"]);

export const pets = pgTable("pets", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	sex: text("sex").notNull(),
	birthDate: date("birth_date").notNull(),
	breed: text("breed").notNull(),
	weight: integer("weight").notNull(),
	microchip: text("microchip").notNull(),
	color: text("color").notNull(),
	photoUrl: text("photo_url").notNull(),
});

export const diet = pgTable("diet", {
	id: serial("id").primaryKey(),
	petId: integer("pet_id")
		.notNull()
		.references(() => pets.id),
	brand: text("brand").notNull(),
	line: text("line").notNull(),
	amount: numeric("amount").notNull(),
	unit: unitEnum("unit").notNull(),
	schedule: text("schedule").notNull(),
});

export const medications = pgTable("medications", {
	id: serial("id").primaryKey(),
	petId: integer("pet_id")
		.notNull()
		.references(() => pets.id),
	name: text("name").notNull(),
	dosage: text("dosage").notNull(),
	frequency: text("frequency").notNull(),
});

export const vetClinics = pgTable("vet_clinics", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
});

export const vetVisits = pgTable("vet_visits", {
	id: serial("id").primaryKey(),
	petId: integer("pet_id")
		.notNull()
		.references(() => pets.id),
	clinicId: integer("clinic_id")
		.notNull()
		.references(() => vetClinics.id),
	date: date("date").notNull(),
	time: timestamp("time").notNull(),
	notes: text("notes"),
});
