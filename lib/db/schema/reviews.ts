import { index, integer, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { baseTimestamps } from "./base";
import { products } from "./products";
import { users } from "./auth/users";

// Reviews table
export const reviews = pgTable(
  "reviews",
  {
    ...baseTimestamps,
    productId: uuid("product_id")
      .references(() => products.id)
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    rating: integer("rating").notNull(),
    comment: text("comment"),
  },
  (table) => [
    index("reviews_product_idx").on(table.productId),
    index("reviews_user_idx").on(table.userId),
    index("reviews_rating_idx").on(table.rating),
  ]
);

export type Review = typeof reviews.$inferSelect;
