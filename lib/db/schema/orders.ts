import {
  decimal,
  index,
  integer,
  jsonb,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { baseTimestamps } from "./base";
import { creators } from "./creators";
import { users } from "./auth/users";
import { products, productVariants } from "./products";

export const orders = pgTable(
  "orders",
  {
    ...baseTimestamps,
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    creatorId: uuid("creator_id")
      .references(() => creators.id)
      .notNull(),
    status: varchar("status", { length: 50 }).notNull().default("pending"),
    totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
    shippingAddress: jsonb("shipping_address").$type<{
      name: string;
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
      phone?: string;
      [key: string]: string | undefined;
    }>(),
    trackingNumber: varchar("tracking_number", { length: 255 }),
    paymentMethod: varchar("payment_method", { length: 50 }),
    paymentStatus: varchar("payment_status", { length: 50 }).default("pending"),
    subtotal: decimal("subtotal", { precision: 10, scale: 2 }),
    shipping: decimal("shipping", { precision: 10, scale: 2 }),
    tax: decimal("tax", { precision: 10, scale: 2 }),
    discount: decimal("discount", { precision: 10, scale: 2 }).default("0"),
    couponCode: varchar("coupon_code", { length: 100 }),
    completedAt: timestamp("completed_at"),
  },
  (table) => [
    index("orders_user_idx").on(table.userId),
    index("orders_creator_idx").on(table.creatorId),
    index("orders_status_idx").on(table.status),
  ]
);

export const orderItems = pgTable(
  "order_items",
  {
    ...baseTimestamps,
    orderId: uuid("order_id")
      .references(() => orders.id)
      .notNull(),
    productId: uuid("product_id")
      .references(() => products.id)
      .notNull(),
    variantId: uuid("variant_id").references(() => productVariants.id),
    quantity: integer("quantity").notNull(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  },
  (table) => [
    index("order_items_order_idx").on(table.orderId),
    index("order_items_product_idx").on(table.productId),
  ]
);
