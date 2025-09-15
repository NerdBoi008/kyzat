import {
  index,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { baseTimestamps } from "../base";

export const verificationTokens = pgTable(
  "verificationTokens",
  {
    ...baseTimestamps,
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)]
);
