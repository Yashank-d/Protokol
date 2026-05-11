import { pgTable, text, boolean, timestamp, real, serial } from "drizzle-orm/pg-core";

// ── Habits ──
export const habitsLog = pgTable("habits_log", {
  id: text("id").primaryKey(), // YYYY-MM-DD
  water: boolean("water").default(false).notNull(),
  phone_morn: boolean("phone_morn").default(false).notNull(),
  gym: boolean("gym").default(false).notNull(),
  photo: boolean("photo").default(false).notNull(),
  rice: boolean("rice").default(false).notNull(),
  phone_eve: boolean("phone_eve").default(false).notNull(),
  journal: boolean("journal").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ── Weight ──
export const weightLog = pgTable("weight_log", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  value: real("value").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Photography / Work ──
export const workLog = pgTable("work_log", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  type: text("type").notNull(), // 'Shoot completed' | 'Client pitched' | 'Instagram posted' | 'Income received'
  note: text("note").notNull(),
  amount: real("amount").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Weekly Reviews ──
export const reviewLog = pgTable("review_log", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  well: text("well").default("").notNull(),
  broke: text("broke").default("").notNull(),
  goal: text("goal").default("").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
