import {
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  varchar,
} from "drizzle-orm/pg-core";
import { baseTimestamps } from "./base";

// Job positions table
export const jobPositions = pgTable(
  "job_positions",
  {
    ...baseTimestamps,
    title: varchar("title", { length: 255 }).notNull(),
    department: varchar("department", { length: 255 }).notNull(),
    type: varchar("type", { length: 100 }).notNull(), // full-time, part-time, contract, etc.
    location: varchar("location", { length: 255 }).notNull(),
    experience: varchar("experience", { length: 255 }).notNull(),
    description: text("description").notNull(),
    responsibilities: jsonb("responsibilities").$type<string[]>(),
    requirements: jsonb("requirements").$type<string[]>(),
    isActive: boolean("is_active").default(true),
  },
  (table) => [
    index("jobs_title_idx").on(table.title),
    index("jobs_department_idx").on(table.department),
    index("jobs_type_idx").on(table.type),
    index("jobs_location_idx").on(table.location),
    index("jobs_active_idx").on(table.isActive),
  ]
);

export type JobPosition = typeof jobPositions.$inferSelect;
export type JobPositionInsert = typeof jobPositions.$inferInsert;
