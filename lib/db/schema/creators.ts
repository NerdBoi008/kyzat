import {
  boolean,
  decimal,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { baseTimestamps } from "./base";
import { users } from "./auth/users";

export const creators = pgTable(
  "creators",
  {
    ...baseTimestamps,
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    followers: integer("followers").default(0),
    following: integer("following").default(0),
    image: text("image"),
    coverImage: text("cover_image"),
    story: text("story"),
    description: text("description"),
    location: varchar("location", { length: 255 }),
    category: varchar("category", { length: 255 }),
    rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
    sales: integer("sales").default(0),
    isVerified: boolean("is_verified").default(false),
    isFeatured: boolean("is_featured").default(false),
    joined: timestamp("joined").defaultNow(),
    categories: jsonb("categories").$type<string[]>(),
    socialLinks: jsonb("social_links").$type<{
      twitter?: string;
      instagram?: string;
      facebook?: string;
      linkedin?: string;
      whatsapp?: string;
      [key: string]: string | undefined;
    }>(),

    // RANKING FIELDS
    totalRevenue: decimal("total_revenue", { precision: 12, scale: 2 }).default(
      "0.00"
    ),
    monthlyRevenue: decimal("monthly_revenue", {
      precision: 12,
      scale: 2,
    }).default("0.00"),
    engagementScore: decimal("engagement_score", {
      precision: 5,
      scale: 2,
    }).default("0.00"), // 0-100
    responseTime: integer("response_time").default(0), // in hours
    completionRate: decimal("completion_rate", {
      precision: 5,
      scale: 2,
    }).default("100.00"), // % of orders completed successfully
    topScore: decimal("top_score", { precision: 8, scale: 2 }).default("0.00"), // Calculated ranking score
    lastActiveAt: timestamp("last_active_at").defaultNow(),
  },
  (table) => [
    index("creators_user_id_idx").on(table.userId),
    index("creators_rating_idx").on(table.rating),
    index("creators_verified_idx").on(table.isVerified),
    index("creators_featured_idx").on(table.isFeatured),
    index("creators_top_score_idx").on(table.topScore),
    index("creators_sales_idx").on(table.sales),
    index("creators_total_revenue_idx").on(table.totalRevenue),
    index("creators_verified_featured_idx").on(
      table.isVerified,
      table.isFeatured
    ),
    index("creators_location_category_idx").on(table.location, table.category),
  ]
);

export const creatorStats = pgTable(
  "creator_stats",
  {
    creatorId: uuid("creator_id")
      .references(() => creators.id)
      .primaryKey(),
    avgRating: decimal("avg_rating", { precision: 3, scale: 2 }).default(
      "0.00"
    ),
    totalReviews: integer("total_reviews").default(0),
    totalOrders: integer("total_orders").default(0),
    completedOrders: integer("completed_orders").default(0),
    avgResponseTime: integer("avg_response_time").default(0), // in minutes
    lastUpdated: timestamp("last_updated").defaultNow(),
  },
  (table) => [
    index("creator_stats_rating_idx").on(table.avgRating),
    index("creator_stats_reviews_idx").on(table.totalReviews),
  ]
);

// Creator followers junction table
export const creatorFollowers = pgTable(
  "creator_followers",
  {
    creatorId: uuid("creator_id")
      .references(() => creators.id)
      .notNull(),
    followerId: uuid("follower_id")
      .references(() => users.id)
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.creatorId, table.followerId] })]
);

// Creator reviews table
export const creatorReviews = pgTable(
  "creator_reviews",
  {
    ...baseTimestamps,
    creatorId: uuid("creator_id")
      .references(() => creators.id)
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    orderId: uuid("order_id"), // Optional: link to specific order/transaction
    rating: integer("rating").notNull(), // 1-5 stars
    comment: text("comment"),
    reviewType: varchar("review_type", { length: 50 }).default("general"), // general, communication, shipping, quality
    isVerified: boolean("is_verified").default(false), // verified purchase
    helpfulVotes: integer("helpful_votes").default(0),
  },
  (table) => [
    index("creator_reviews_creator_idx").on(table.creatorId),
    index("creator_reviews_user_idx").on(table.userId),
    index("creator_reviews_rating_idx").on(table.rating),
    index("creator_reviews_verified_idx").on(table.isVerified),
    // Prevent duplicate reviews per user per creator
    index("unique_creator_user_review").on(table.creatorId, table.userId),
  ]
);

export type CreatorReview = typeof creatorReviews.$inferSelect;
export type CreatorReviewInsert = typeof creatorReviews.$inferInsert;
export type Creator = typeof creators.$inferSelect;
export type CreatorInsert = typeof creators.$inferInsert;