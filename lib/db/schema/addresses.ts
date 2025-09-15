import { boolean, index, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { baseTimestamps } from "./base";
import { users } from "./auth/users";

export const addresses = pgTable(
  "addresses",
  {
    ...baseTimestamps,
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    label: varchar("label", { length: 100 }), // e.g., "Home", "Work", "Studio"
    name: varchar("name", { length: 255 }).notNull(), // Full name for delivery
    phone: varchar("phone", { length: 20 }).notNull(),
    street: varchar("street", { length: 255 }).notNull(),
    apartment: varchar("apartment", { length: 100 }), // Apartment, suite, etc.
    city: varchar("city", { length: 100 }).notNull(),
    state: varchar("state", { length: 100 }).notNull(),
    zipCode: varchar("zip_code", { length: 20 }).notNull(),
    country: varchar("country", { length: 100 }).notNull(),
    isDefault: boolean("is_default").default(false),
    type: varchar("type", { length: 50 }).default("shipping"), // shipping, billing, both
  },
  (table) => [
    index("addresses_user_idx").on(table.userId),
    index("addresses_default_idx").on(table.userId, table.isDefault),
    index("addresses_city_idx").on(table.city),
    index("addresses_zipcode_idx").on(table.zipCode),
  ]
);
