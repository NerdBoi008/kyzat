import { index, integer, pgTable, uuid } from "drizzle-orm/pg-core";
import { baseTimestamps } from "./base";
import { products, productVariants } from "./products";
import { users } from "./auth/users";

// Cart items table
export const cartItems = pgTable(
  "cart_items",
  {
    ...baseTimestamps,
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    productId: uuid("product_id")
      .references(() => products.id)
      .notNull(),
    variantId: uuid("variant_id").references(() => productVariants.id),
    quantity: integer("quantity").notNull().default(1),
  },
  (table) => [
    index("cart_user_idx").on(table.userId),
    index("cart_product_idx").on(table.productId),
  ]
);

export type CartItem = typeof cartItems.$inferSelect;
