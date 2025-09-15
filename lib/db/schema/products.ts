import {
  boolean,
  decimal,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { baseTimestamps } from "./base";
import { creators } from "./creators";

export const productCategories = pgTable(
  "product_categories",
  {
    ...baseTimestamps,
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    image: text("image"),
    icon: text("icon"),
    description: text("description"),
    productCount: integer("product_count").default(0),
    featured: boolean("featured").default(false),
  },
  (table) => [
    index("categories_name_idx").on(table.name),
    index("categories_featured_idx").on(table.featured),
  ]
);

// Products table
export const products = pgTable(
  "products",
  {
    ...baseTimestamps,
    name: varchar("name", { length: 255 }).notNull(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    creatorId: uuid("creator_id")
      .references(() => creators.id)
      .notNull(),
    image: text("image").notNull(),
    categoryId: uuid("category_id")
      .references(() => productCategories.id)
      .notNull(),
    description: text("description"),
    materials: jsonb("materials").$type<string[]>(),
    rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
    attributes: jsonb("attributes").$type<Record<string, string>>(),
    otherImages: jsonb("other_images").$type<string[]>(),
    highlights: jsonb("highlights").$type<string[]>(),
    care: text("care"),
    shipping: text("shipping"),
    returns: text("returns"),
    stock: integer("stock").default(0),
    isFeatured: boolean("is_featured").default(false),
    relatedProducts: jsonb("related_product").$type<string[]>(),
    isApproved: boolean("is_approved").default(false),
  },
  (table) => [
    index("products_creator_idx").on(table.creatorId),
    index("products_category_idx").on(table.categoryId),
    index("products_price_idx").on(table.price),
    index("products_rating_idx").on(table.rating),
    index("products_stock_idx").on(table.stock),
    index("products_name_search_idx").on(table.name),
    index("products_slug_idx").on(table.slug),
    index("products_creator_rating_idx").on(table.creatorId, table.rating),
    index("products_category_price_idx").on(table.categoryId, table.price),
  ]
);

// Product variants table
export const productVariants = pgTable(
  "product_variants",
  {
    ...baseTimestamps,
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .references(() => products.id)
      .notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    stock: integer("stock").default(0),
  },
  (table) => [index("variants_product_idx").on(table.productId)]
);

export type Product = typeof products.$inferSelect;
export type ProductVariant = typeof productVariants.$inferSelect;
export type ProductCategory = typeof productCategories.$inferSelect;
