import { timestamp, uuid } from "drizzle-orm/pg-core";

// Base timestamps for all tables
export const baseTimestamps = {
  id: uuid("id").defaultRandom().primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
};
