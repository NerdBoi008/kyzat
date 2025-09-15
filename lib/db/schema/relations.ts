import { relations } from "drizzle-orm";
import { cartItems } from "./cart-items";
import { conversations } from "./conversations";
import {
  creators,
  creatorFollowers,
  creatorReviews,
  creatorStats,
} from "./creators";
import { messages } from "./messages";
import { notifications } from "./notifications";
import { orders, orderItems } from "./orders";
import { products, productCategories, productVariants } from "./products";
import { reviews } from "./reviews";
import { savedItems } from "./saved-items";
import { accounts } from "./auth/accounts";
import { sessions } from "./auth/sessions";
import { users, userFavorites } from "./auth/users";

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  creator: one(creators, {
    fields: [users.id],
    references: [creators.userId],
  }),
  cartItems: many(cartItems),
  savedItems: many(savedItems),
  reviews: many(reviews),
  favorites: many(userFavorites),
  following: many(creatorFollowers, { relationName: "follower" }),
  // Orders Relations
  orders: many(orders),
  // Creator Reviews
  creatorReviews: many(creatorReviews),
  // Notifications
  notifications: many(notifications),
  // BetterAuth relations
  accounts: many(accounts),
  sessions: many(sessions),
}));

export const creatorReviewsRelations = relations(creatorReviews, ({ one }) => ({
  creator: one(creators, {
    fields: [creatorReviews.creatorId],
    references: [creators.id],
  }),
  user: one(users, {
    fields: [creatorReviews.userId],
    references: [users.id],
  }),
  order: one(orders, {
    fields: [creatorReviews.orderId],
    references: [orders.id],
  }),
}));

// Relations for BetterAuth tables
export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

// Creators relations
export const creatorsRelations = relations(creators, ({ one, many }) => ({
  user: one(users, {
    fields: [creators.userId],
    references: [users.id],
  }),
  products: many(products),
  followers: many(creatorFollowers, { relationName: "creator" }),
  creatorReviews: many(creatorReviews),
  orders: many(orders),
  stats: one(creatorStats, {
    fields: [creators.id],
    references: [creatorStats.creatorId],
  }),
  conversations: many(conversations),
}));

export const creatorFollowersRelations = relations(
  creatorFollowers,
  ({ one }) => ({
    creator: one(creators, {
      fields: [creatorFollowers.creatorId],
      references: [creators.id],
      relationName: "creator",
    }),
    follower: one(users, {
      fields: [creatorFollowers.followerId],
      references: [users.id],
      relationName: "follower",
    }),
  })
);

export const productCategoriesRelations = relations(
  productCategories,
  ({ many }) => ({
    products: many(products),
  })
);

export const productsRelations = relations(products, ({ one, many }) => ({
  creator: one(creators, {
    fields: [products.creatorId],
    references: [creators.id],
  }),
  category: one(productCategories, {
    fields: [products.categoryId],
    references: [productCategories.id],
  }),
  variants: many(productVariants),
  reviews: many(reviews),
  cartItems: many(cartItems),
  savedItems: many(savedItems),
  favorites: many(userFavorites),
  orderItems: many(orderItems),
}));

export const productVariantsRelations = relations(
  productVariants,
  ({ one, many }) => ({
    product: one(products, {
      fields: [productVariants.productId],
      references: [products.id],
    }),
    cartItems: many(cartItems),
    orderItems: many(orderItems),
  })
);

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, {
    fields: [cartItems.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [cartItems.variantId],
    references: [productVariants.id],
  }),
}));

export const savedItemsRelations = relations(savedItems, ({ one }) => ({
  user: one(users, {
    fields: [savedItems.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [savedItems.productId],
    references: [products.id],
  }),
}));

export const userFavoritesRelations = relations(userFavorites, ({ one }) => ({
  user: one(users, {
    fields: [userFavorites.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [userFavorites.productId],
    references: [products.id],
  }),
}));

// Orders relations
export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  creator: one(creators, {
    fields: [orders.creatorId],
    references: [creators.id],
  }),
  items: many(orderItems),
  creatorReview: one(creatorReviews, {
    fields: [orders.id],
    references: [creatorReviews.orderId],
  }),
}));

// Order Items relations
export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [orderItems.variantId],
    references: [productVariants.id],
  }),
}));

// Creator Stats relations
export const creatorStatsRelations = relations(creatorStats, ({ one }) => ({
  creator: one(creators, {
    fields: [creatorStats.creatorId],
    references: [creators.id],
  }),
}));

// Notifications relations -
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// Conversations relations
export const conversationsRelations = relations(
  conversations,
  ({ one, many }) => ({
    creator: one(creators, {
      fields: [conversations.creatorId],
      references: [creators.id],
    }),
    customer: one(users, {
      fields: [conversations.customerId],
      references: [users.id],
    }),
    messages: many(messages),
  })
);

// Messages relations
export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));
