import { boolean, index, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { baseTimestamps } from "./base";
import { creators } from "./creators";
import { users } from "./auth/users";

export const conversations = pgTable(
  "conversations",
  {
    ...baseTimestamps,
    creatorId: uuid("creator_id")
      .references(() => creators.id)
      .notNull(),
    customerId: uuid("customer_id")
      .references(() => users.id)
      .notNull(),
    lastMessageAt: timestamp("last_message_at").defaultNow(),
    isActive: boolean("is_active").default(true),
  },
  (table) => [
    index("conversations_creator_idx").on(table.creatorId),
    index("conversations_customer_idx").on(table.customerId),
    index("unique_conversation").on(table.creatorId, table.customerId),
  ]
);
