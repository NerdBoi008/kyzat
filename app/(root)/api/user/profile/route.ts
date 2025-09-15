import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createDB } from "@/lib/db/src";
import {
  users,
  creators,
  creatorStats,
  cartItems,
  userFavorites,
  savedItems,
  orders,
  reviews,
  products,
  conversations,
  messages,
  creatorReviews,
  orderItems,
} from "@/lib/db/schema";
import { eq, count, desc, and, gte, sql } from "drizzle-orm";

type CreatorProfileFromDB = typeof creators.$inferSelect &
  Partial<{
    stats: typeof creatorStats.$inferSelect;
  }>;

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await createDB();

    // Fetch comprehensive user data
    const userData = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        creatorStatus: users.creatorStatus,
        avatar: users.image,
        image: users.image,
        bio: users.bio,
        location: users.location,
        website: users.website,
        socialLinks: users.socialLinks,
        preferences: users.preferences,
        emailVerified: users.emailVerified,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!userData.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = userData[0];
    const isCreator =
      user.role === "creator" || user.creatorStatus === "approved";

    // Initialize variables
    let creatorProfile: CreatorProfileFromDB | null = null;
    let notifications = null;
    let topProducts: Array<{
      id: string;
      name: string;
      stock: number | null;
      rating: string | null;
      sales: number;
      revenue: number;
    }> = [];
    let creatorProducts: Array<{
      id: string;
      name: string;
      stock: number | null;
      rating: string | null;
      image: string | null;
      price: string;
      isFeatured: boolean | null;
    }> = [];

    // CREATOR-SPECIFIC DATA
    if (isCreator) {
      const creatorData = await db
        .select({
          id: creators.id,
          userId: creators.userId,
          createdAt: creators.createdAt,
          updatedAt: creators.updatedAt,
          followers: creators.followers,
          following: creators.following,
          image: creators.image,
          coverImage: creators.coverImage,
          story: creators.story,
          description: creators.description,
          location: creators.location,
          category: creators.category,
          categories: creators.categories,
          rating: creators.rating,
          sales: creators.sales,
          isVerified: creators.isVerified,
          isFeatured: creators.isFeatured,
          joined: creators.joined,
          socialLinks: creators.socialLinks,
          totalRevenue: creators.totalRevenue,
          monthlyRevenue: creators.monthlyRevenue,
          engagementScore: creators.engagementScore,
          responseTime: creators.responseTime,
          completionRate: creators.completionRate,
          topScore: creators.topScore,
          lastActiveAt: creators.lastActiveAt,
        })
        .from(creators)
        .where(eq(creators.userId, user.id))
        .limit(1);

      if (creatorData.length > 0) {
        creatorProfile = creatorData[0];

        // Get creator stats
        const statsData = await db
          .select()
          .from(creatorStats)
          .where(eq(creatorStats.creatorId, creatorProfile.id))
          .limit(1);

        if (statsData.length > 0) {
          creatorProfile.stats = statsData[0];
        }

        creatorProducts = await db.query.products.findMany({
          columns: {
            id: true,
            slug: true,
            name: true,
            stock: true,
            rating: true,
            image: true,
            price: true,
            isFeatured: true,
            isApproved: true,
          },
          where: eq(products.creatorId, creatorProfile.id),
          orderBy: [desc(products.createdAt)],
        });

        // Get top products for creator
        const topProductsData = await db
          .select({
            id: products.id,
            name: products.name,
            stock: products.stock,
            rating: products.rating,
            sales: sql<number>`COALESCE(SUM(${orderItems.quantity}), 0)`.as(
              "sales"
            ),
            revenue:
              sql<number>`COALESCE(SUM(${orderItems.quantity} * CAST(${orderItems.price} AS NUMERIC)), 0)`.as(
                "revenue"
              ),
          })
          .from(products)
          .leftJoin(orderItems, eq(products.id, orderItems.productId))
          .where(eq(products.creatorId, creatorProfile.id))
          .groupBy(products.id, products.name, products.stock, products.rating)
          .orderBy(desc(sql`COALESCE(SUM(${orderItems.quantity}), 0)`))
          .limit(10);

        topProducts = topProductsData;

        // Calculate notifications for creators
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        // Pending orders
        const pendingOrdersQuery = await db
          .select({ value: count() })
          .from(orders)
          .where(
            and(
              eq(orders.creatorId, creatorProfile.id),
              eq(orders.status, "pending")
            )
          );
        const pendingOrders = pendingOrdersQuery[0]?.value || 0;

        // New orders (last 24 hours)
        const newOrdersQuery = await db
          .select({ value: count() })
          .from(orders)
          .where(
            and(
              eq(orders.creatorId, creatorProfile.id),
              gte(orders.createdAt, twentyFourHoursAgo)
            )
          );
        const newOrders = newOrdersQuery[0]?.value || 0;

        // Unread messages
        const creatorConversations = await db
          .select({ id: conversations.id })
          .from(conversations)
          .where(eq(conversations.creatorId, creatorProfile.id));

        const conversationIds = creatorConversations.map((c) => c.id);
        let unreadMessages = 0;

        if (conversationIds.length > 0) {
          const unreadMessagesQuery = await db
            .select({ value: count() })
            .from(messages)
            .where(
              and(
                sql`${messages.conversationId} = ANY(${sql.raw(
                  `ARRAY[${conversationIds.map((id) => `'${id}'`).join(",")}]`
                )})`,
                eq(messages.isRead, false),
                sql`${messages.senderId} != ${session.user.id}`
              )
            );
          unreadMessages = unreadMessagesQuery[0]?.value || 0;
        }

        // New reviews (last 7 days)
        const newReviewsQuery = await db
          .select({ value: count() })
          .from(creatorReviews)
          .where(
            and(
              eq(creatorReviews.creatorId, creatorProfile.id),
              gte(creatorReviews.createdAt, sevenDaysAgo)
            )
          );
        const newReviews = newReviewsQuery[0]?.value || 0;

        notifications = {
          pendingOrders,
          newOrders,
          unreadMessages,
          newReviews,
          totalNotifications:
            pendingOrders + newOrders + unreadMessages + newReviews,
        };
      }
    }

    // SHARED STATISTICS (for both customers and creators)
    const [
      productsCount,
      cartCount,
      favoritesCount,
      savedCount,
      ordersCount,
      reviewsCount,
    ] = await Promise.all([
      // Products count - only for creators
      isCreator && creatorProfile
        ? db
            .select({ count: count() })
            .from(products)
            .where(eq(products.creatorId, creatorProfile.id))
        : Promise.resolve([{ count: 0 }]),

      // Cart items count - for all users
      db
        .select({ count: count() })
        .from(cartItems)
        .where(eq(cartItems.userId, user.id)),

      // Favorites count - for all users
      db
        .select({ count: count() })
        .from(userFavorites)
        .where(eq(userFavorites.userId, user.id)),

      // Saved items count - for all users
      db
        .select({ count: count() })
        .from(savedItems)
        .where(eq(savedItems.userId, user.id)),

      // Orders count - for all users (purchases)
      db
        .select({ count: count() })
        .from(orders)
        .where(eq(orders.userId, user.id)),

      // Reviews count - for all users
      db
        .select({ count: count() })
        .from(reviews)
        .where(eq(reviews.userId, user.id)),
    ]);

    // RECENT ORDERS - Different logic for creators vs customers
    let recentOrders;

    if (isCreator && creatorProfile) {
      // For creators: show sales orders (orders they received)
      recentOrders = await db.query.orders.findMany({
        where: eq(orders.creatorId, creatorProfile.id),
        orderBy: [desc(orders.createdAt)],
        limit: 10,
        with: {
          user: {
            columns: {
              name: true,
              email: true,
              image: true,
            },
          },
          items: {
            limit: 1,
            with: {
              product: {
                columns: {
                  name: true,
                  image: true,
                },
              },
            },
            columns: {
              quantity: true,
            },
          },
        },
      });
    } else {
      // For customers: show purchase orders (orders they placed)
      recentOrders = await db.query.orders.findMany({
        where: eq(orders.userId, user.id),
        orderBy: [desc(orders.createdAt)],
        limit: 5,
        with: {
          creator: {
            columns: {
              description: true,
              image: true,
            },
          },
          items: {
            limit: 1,
            with: {
              product: {
                columns: {
                  name: true,
                  image: true,
                },
              },
            },
            columns: {
              quantity: true,
            },
          },
        },
      });
    }

    // Prepare response
    const profileData = {
      user: {
        ...user,
        profileImage: user.image || user.avatar,
      },
      creatorProfile: isCreator ? creatorProfile : null,
      notifications: isCreator ? notifications : null,
      statistics: {
        productsCount: Number(productsCount[0]?.count || 0),
        cartItems: Number(cartCount[0]?.count || 0),
        favorites: Number(favoritesCount[0]?.count || 0),
        savedItems: Number(savedCount[0]?.count || 0),
        orders: Number(ordersCount[0]?.count || 0),
        reviews: Number(reviewsCount[0]?.count || 0),
      },
      recentOrders,
      creatorProducts: isCreator ? creatorProducts : [],
      topProducts: isCreator ? topProducts : [],
    };

    return NextResponse.json({
      success: true,
      data: profileData,
    });
  } catch (error) {
    console.error("❌ Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile data" },
      { status: 500 }
    );
  }
}

// type UserUpdateFields = {
//   name?: string;
//   bio?: string | null;
//   location?: string | null;
//   website?: string | null;
//   socialLinks?: Record<string, string | undefined> | null;
//   image?: string | null;
//   preferences?: {
//     newsletter?: boolean;
//     notifications?: boolean;
//     darkMode?: boolean;
//     [key: string]: boolean | undefined;
//   } | null;
// };

// // Update user profile
// export async function PUT(request: Request) {
//   try {
//     const session = await auth();

//     if (!session?.user?.id) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const updateData = (await request.json()) as Partial<UserUpdateFields>;
//     const db = await createDB();

//     // Validate and sanitize update data
//     const allowedFields = [
//       "name",
//       "bio",
//       "location",
//       "website",
//       "socialLinks",
//       "image",
//       "preferences",
//     ];

//     const filteredData: Partial<UserUpdateFields> = Object.fromEntries(
//       Object.entries(updateData).filter(([key]) => allowedFields.includes(key))
//     );

//     if (Object.keys(filteredData).length === 0) {
//       return NextResponse.json(
//         { error: "No valid fields to update" },
//         { status: 400 }
//       );
//     }

//     const normalizedPreferences =
//       filteredData.preferences !== undefined
//         ? {
//             newsletter: filteredData.preferences?.newsletter ?? false,
//             notifications: filteredData.preferences?.notifications ?? true,
//             darkMode: filteredData.preferences?.darkMode ?? false,
//           }
//         : undefined;

//     // Update user data
//     const updatedUser = await db
//       .update(users)
//       .set({
//         ...filteredData,
//         preferences: normalizedPreferences,
//         updatedAt: new Date(),
//       })
//       .where(eq(users.id, session.user.id))
//       .returning();

//     return NextResponse.json({
//       success: true,
//       data: updatedUser[0],
//     });
//   } catch (error) {
//     console.error("❌ Error updating user profile:", error);
//     return NextResponse.json(
//       { error: "Failed to update profile" },
//       { status: 500 }
//     );
//   }
// }

// // app/api/user/profile/route.ts
// import { NextResponse } from "next/server";
// import { auth } from "@/lib/auth";
// import { createDB } from "@/lib/db/src";
// import {
//   users,
//   creators,
//   creatorStats,
//   cartItems,
//   userFavorites,
//   savedItems,
//   orders,
//   reviews,
//   products,
//   conversations,
//   messages,
//   creatorReviews,
//   orderItems,
// } from "@/lib/db/src/schema";
// import { eq, count, desc, and, gte, sql } from "drizzle-orm";

// type CreatorProfileFromDB = typeof creators.$inferSelect &
//   Partial<{
//     stats: typeof creatorStats.$inferSelect;
//   }>;

// export async function GET() {
//   try {
//     const session = await auth();

//     if (!session?.user?.id) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const db = await createDB();

//     // Fetch comprehensive user data
//     const userData = await db
//       .select({
//         // Basic user info
//         id: users.id,
//         name: users.name,
//         email: users.email,
//         role: users.role,
//         creatorStatus: users.creatorStatus,
//         avatar: users.image,
//         image: users.image,
//         bio: users.bio,
//         location: users.location,
//         website: users.website,
//         socialLinks: users.socialLinks,
//         emailVerified: users.emailVerified,
//         createdAt: users.createdAt,
//         updatedAt: users.updatedAt,
//       })
//       .from(users)
//       .where(eq(users.id, session.user.id))
//       .limit(1);

//     if (!userData.length) {
//       return NextResponse.json({ error: "User not found" }, { status: 404 });
//     }

//     const user = userData[0];

//     // Fetch creator profile if user is a creator
//     let creatorProfile: CreatorProfileFromDB | null = null;
//     let notifications = null;
//     let topProducts: {
//       id: string;
//       name: string;
//       stock: number | null;
//       rating: string | null;
//       sales: number;
//       revenue: number;
//     }[] = [];

//     if (user.role === "creator" || user.creatorStatus === "approved") {
//       const creatorData = await db
//         .select({
//           id: creators.id,
//           userId: creators.userId,
//           createdAt: creators.createdAt,
//           updatedAt: creators.updatedAt,
//           followers: creators.followers,
//           following: creators.following,
//           image: creators.image,
//           coverImage: creators.coverImage,
//           story: creators.story,
//           description: creators.description,
//           location: creators.location,
//           category: creators.category,
//           categories: creators.categories,
//           rating: creators.rating,
//           sales: creators.sales,
//           isVerified: creators.isVerified,
//           isFeatured: creators.isFeatured,
//           joined: creators.joined,
//           socialLinks: creators.socialLinks,
//           totalRevenue: creators.totalRevenue,
//           monthlyRevenue: creators.monthlyRevenue,
//           engagementScore: creators.engagementScore,
//           responseTime: creators.responseTime,
//           completionRate: creators.completionRate,
//           topScore: creators.topScore,
//           lastActiveAt: creators.lastActiveAt,
//         })
//         .from(creators)
//         .where(eq(creators.userId, user.id))
//         .limit(1);

//       if (creatorData.length > 0) {
//         creatorProfile = creatorData[0];

//         // Get creator stats
//         const statsData = await db
//           .select()
//           .from(creatorStats)
//           .where(eq(creatorStats.creatorId, creatorProfile.id))
//           .limit(1);

//         if (statsData.length > 0) {
//           creatorProfile.stats = statsData[0];
//         }

//         const topProductsData = await db
//           .select({
//             id: products.id,
//             name: products.name,
//             stock: products.stock,
//             rating: products.rating,
//             sales: sql<number>`COALESCE(SUM(${orderItems.quantity}), 0)`.as(
//               "sales"
//             ),
//             revenue:
//               sql<number>`COALESCE(SUM(${orderItems.quantity} * CAST(${orderItems.price} AS NUMERIC)), 0)`.as(
//                 "revenue"
//               ),
//           })
//           .from(products)
//           .leftJoin(orderItems, eq(products.id, orderItems.productId))
//           .where(eq(products.creatorId, creatorProfile.id))
//           .groupBy(products.id, products.name, products.stock, products.rating)
//           .orderBy(desc(sql`COALESCE(SUM(${orderItems.quantity}), 0)`))
//           .limit(10);

//         topProducts = topProductsData;

//         // Calculate notifications for creators
//         const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
//         const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

//         // Pending orders
//         const pendingOrdersQuery = await db
//           .select({ value: count() })
//           .from(orders)
//           .where(
//             and(
//               eq(orders.creatorId, creatorProfile.id),
//               eq(orders.status, "pending")
//             )
//           );
//         const pendingOrders = pendingOrdersQuery[0]?.value || 0;

//         // New orders (last 24 hours)
//         const newOrdersQuery = await db
//           .select({ value: count() })
//           .from(orders)
//           .where(
//             and(
//               eq(orders.creatorId, creatorProfile.id),
//               gte(orders.createdAt, twentyFourHoursAgo)
//             )
//           );
//         const newOrders = newOrdersQuery[0]?.value || 0;

//         // Unread messages
//         const creatorConversations = await db
//           .select({ id: conversations.id })
//           .from(conversations)
//           .where(eq(conversations.creatorId, creatorProfile.id));

//         const conversationIds = creatorConversations.map((c) => c.id);
//         let unreadMessages = 0;

//         if (conversationIds.length > 0) {
//           const unreadMessagesQuery = await db
//             .select({ value: count() })
//             .from(messages)
//             .where(
//               and(
//                 sql`${messages.conversationId} = ANY(${sql.raw(
//                   `ARRAY[${conversationIds.map((id) => `'${id}'`).join(",")}]`
//                 )})`,
//                 eq(messages.isRead, false),
//                 sql`${messages.senderId} != ${session.user.id}`
//               )
//             );
//           unreadMessages = unreadMessagesQuery[0]?.value || 0;
//         }

//         // New reviews (last 7 days)
//         const newReviewsQuery = await db
//           .select({ value: count() })
//           .from(creatorReviews)
//           .where(
//             and(
//               eq(creatorReviews.creatorId, creatorProfile.id),
//               gte(creatorReviews.createdAt, sevenDaysAgo)
//             )
//           );
//         const newReviews = newReviewsQuery[0]?.value || 0;

//         notifications = {
//           pendingOrders,
//           newOrders,
//           unreadMessages,
//           newReviews,
//           totalNotifications:
//             pendingOrders + newOrders + unreadMessages + newReviews,
//         };
//       }
//     }

//     // Fetch user activity statistics
//     const [
//       productsCount,
//       cartCount,
//       favoritesCount,
//       savedCount,
//       ordersCount,
//       reviewsCount,
//     ] = await Promise.all([
//       // Products count of creator's products
//       db
//         .select({ count: count() })
//         .from(products)
//         .where(eq(products.creatorId, creatorProfile?.id || user.id)),

//       // Cart items count
//       db
//         .select({ count: count() })
//         .from(cartItems)
//         .where(eq(cartItems.userId, user.id)),

//       // Favorites count
//       db
//         .select({ count: count() })
//         .from(userFavorites)
//         .where(eq(userFavorites.userId, user.id)),

//       // Saved items count
//       db
//         .select({ count: count() })
//         .from(savedItems)
//         .where(eq(savedItems.userId, user.id)),

//       // Orders count
//       db
//         .select({ count: count() })
//         .from(orders)
//         .where(eq(orders.userId, user.id)),

//       // Reviews count
//       db
//         .select({ count: count() })
//         .from(reviews)
//         .where(eq(reviews.userId, user.id)),
//     ]);

//     // Get recent orders (last 5)
//     // const recentOrders = await db
//     //   .select({
//     //     id: orders.id,
//     //     status: orders.status,
//     //     totalAmount: orders.totalAmount,
//     //     createdAt: orders.createdAt,
//     //     completedAt: orders.completedAt,
//     //   })
//     //   .from(orders)
//     //   .where(eq(orders.userId, user.id))
//     //   .orderBy(desc(orders.createdAt))
//     //   .limit(5);

//     const recentOrders = await db.query.orders.findMany({
//         where: eq(orders.creatorId, creatorProfile?.id ?? ""),
//         orderBy: [desc(orders.createdAt)],
//         limit: 5,
//         with: {
//           user: {
//             columns: {
//               name: true,
//               email: true,
//               image: true,
//             },
//           },
//           items: {
//             limit: 1, // Get first item for preview
//             with: {
//               product: {
//                 columns: {
//                   name: true,
//                   image: true,
//                 },
//               },
//             },
//             columns: {
//               quantity: true,
//             },
//           },
//         },
//       });

//     // Prepare response
//     const profileData = {
//       user: {
//         ...user,
//         // Convert avatar/image preference
//         profileImage: user.image || user.avatar,
//       },
//       creatorProfile,
//       notifications,
//       statistics: {
//         productsCount: Number(productsCount[0]?.count || 0),
//         cartItems: Number(cartCount[0]?.count || 0),
//         favorites: Number(favoritesCount[0]?.count || 0),
//         savedItems: Number(savedCount[0]?.count || 0),
//         orders: Number(ordersCount[0]?.count || 0),
//         reviews: Number(reviewsCount[0]?.count || 0),
//       },
//       recentOrders,
//       preferences: {
//         // Add user preferences if you have them
//         notifications: true,
//         marketing: true,
//         // etc.
//       },
//       topProducts,
//     };

//     return NextResponse.json({
//       success: true,
//       data: profileData,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching user profile:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch profile data" },
//       { status: 500 }
//     );
//   }
// }

// type UserUpdateFields = {
//   name?: string;
//   bio?: string | null;
//   location?: string | null;
//   website?: string | null;
//   socialLinks?: Record<string, string | undefined> | null;
//   avatar?: string | null;
// };

// // Update user profile
// export async function PUT(request: Request) {
//   try {
//     const session = await auth();

//     if (!session?.user?.id) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const updateData = (await request.json()) as Partial<UserUpdateFields>;
//     const db = await createDB();

//     // Validate and sanitize update data
//     // const allowedFields = [
//     //   "name",
//     //   "bio",
//     //   "location",
//     //   "website",
//     //   "socialLinks",
//     //   "avatar",
//     // ];

//     const filteredData: UserUpdateFields = Object.fromEntries(
//       Object.entries(updateData).filter(([key]) => key in updateData)
//     ) as UserUpdateFields;

//     if (Object.keys(filteredData).length === 0) {
//       return NextResponse.json(
//         { error: "No valid fields to update" },
//         { status: 400 }
//       );
//     }

//     // Update user data
//     const updatedUser = await db
//       .update(users)
//       .set({
//         ...filteredData,
//         updatedAt: new Date(),
//       })
//       .where(eq(users.id, session.user.id))
//       .returning();

//     return NextResponse.json({
//       success: true,
//       data: updatedUser[0],
//     });
//   } catch (error) {
//     console.error("❌ Error updating user profile:", error);
//     return NextResponse.json(
//       { error: "Failed to update profile" },
//       { status: 500 }
//     );
//   }
// }
