import {
  boolean,
  index,
  pgTable,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { baseTimestamps } from "./base";
import { users } from "./auth/users";

export const notifications = pgTable(
  "notifications",
  {
    ...baseTimestamps,
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    type: varchar("type", { length: 50 }).notNull(), // order_update, new_review, message, etc.
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message").notNull(),
    isRead: boolean("is_read").default(false),
    relatedId: uuid("related_id"), // Order ID, Review ID, etc.
    relatedType: varchar("related_type", { length: 50 }), // order, review, message
  },
  (table) => [
    index("notifications_user_idx").on(table.userId),
    index("notifications_read_idx").on(table.isRead),
    index("notifications_type_idx").on(table.type),
  ]
);
