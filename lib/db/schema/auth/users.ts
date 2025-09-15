import {
  boolean,
  index,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { products } from "../products";
import { baseTimestamps } from "../base";

export const roleEnum = pgEnum("user_role", [
  "customer",
  "creator",
  "admin",
  "editor",
  "moderator",
]);

export const creatorStatusEnum = pgEnum("creator_status", [
  "not-applied",
  "pending",
  "approved",
  "rejected",
]);

// Users table
export const users = pgTable(
  "users",
  {
    ...baseTimestamps,
    role: roleEnum("role").notNull().default("customer"), // customer, creator, admin, editor, moderator
    creatorStatus: creatorStatusEnum("creator_status").default("not-applied"), // "not-applied" | "pending" | "approved" | "rejected"
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).unique().notNull(),
    bio: text("bio"),
    location: varchar("location", { length: 255 }),
    website: text("website"),
    phone: varchar("phone", { length: 20 }),
    socialLinks: jsonb("social_links").$type<{
      twitter?: string;
      instagram?: string;
      facebook?: string;
      linkedin?: string;
      whatsapp?: string;
      [key: string]: string | undefined;
    }>(),
    preferences: jsonb("preferences")
      .$type<{
        newsletter: boolean;
        notifications: boolean;
        darkMode: boolean;
        [key: string]: boolean | undefined;
      }>()
      .default({ newsletter: false, notifications: false, darkMode: false }),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    password: varchar("password", { length: 255 }),
  },
  (table) => [
    index("users_email_idx").on(table.email),
    index("users_role_idx").on(table.role),
    index("users_creator_status_idx").on(table.creatorStatus),
  ],
);

// User favorites table
export const userFavorites = pgTable(
  "user_favorites",
  {
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    productId: uuid("product_id")
      .references(() => products.id)
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.productId] })],
);

export type User = typeof users.$inferSelect;