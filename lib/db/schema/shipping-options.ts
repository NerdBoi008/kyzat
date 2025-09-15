import {
  boolean,
  decimal,
  index,
  pgTable,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// Shipping options table
export const shippingOptions = pgTable(
  "shipping_options",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    isActive: boolean("is_active").default(true),
    duration: varchar("duration", { length: 100 }),
  },
  (table) => [index("shipping_active_idx").on(table.isActive)]
);

export type ShippingOption = typeof shippingOptions.$inferSelect;
export type ShippingOptionInsert = typeof shippingOptions.$inferInsert;