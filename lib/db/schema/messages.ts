import {
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core";
import { baseTimestamps } from "./base";
import { conversations } from "./conversations";
import { users } from "./auth/users";

export const messages = pgTable(
  "messages",
  {
    ...baseTimestamps,
    conversationId: uuid("conversation_id")
      .references(() => conversations.id)
      .notNull(),
    senderId: uuid("sender_id")
      .references(() => users.id)
      .notNull(),
    message: text("message").notNull(),
    isRead: boolean("is_read").default(false),
    attachments: jsonb("attachments").$type<string[]>(),
  },
  (table) => [
    index("messages_conversation_idx").on(table.conversationId),
    index("messages_sender_idx").on(table.senderId),
    index("messages_read_idx").on(table.isRead),
  ]
);
