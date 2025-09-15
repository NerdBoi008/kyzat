import { index, pgTable, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { baseTimestamps } from "./base";
import { products, productVariants } from "./products";
import { users } from "./auth/users";

// Saved items table
export const savedItems = pgTable(
  "saved_items",
  {
    ...baseTimestamps,
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    productId: uuid("product_id")
      .references(() => products.id)
      .notNull(),
    variantId: uuid("variant_id").references(() => productVariants.id), // Add this field
  },
  (table) => [
    index("saved_items_user_idx").on(table.userId),
    index("saved_items_product_idx").on(table.productId),
    uniqueIndex("saved_items_unique").on(
      table.userId,
      table.productId,
      table.variantId
    ),
  ]
);
