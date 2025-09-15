import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createDB } from "@/lib/db/src";
import {
  users,
  creators,
  cartItems,
  userFavorites,
  savedItems,
  orders,
} from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const db = await createDB();

    // Parallel queries for maximum speed [web:235]
    const [
      userData,
      cartCountResult,
      favoritesCountResult,
      savedCountResult,
      ordersCountResult,
      creatorData,
    ] = await Promise.all([
      // Basic user info
      db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          profileImage: users.image,
        })
        .from(users)
        .where(eq(users.id, session.user.id))
        .limit(1),

      // Cart count
      db
        .select({ count: count() })
        .from(cartItems)
        .where(eq(cartItems.userId, session.user.id)),

      // Favorites count
      db
        .select({ count: count() })
        .from(userFavorites)
        .where(eq(userFavorites.userId, session.user.id)),

      // Saved items count
      db
        .select({ count: count() })
        .from(savedItems)
        .where(eq(savedItems.userId, session.user.id)),

      // Orders count
      db
        .select({ count: count() })
        .from(orders)
        .where(eq(orders.userId, session.user.id)),

      // Creator profile (if applicable)
      session.user.role === "creator"
        ? db
            .select({
              id: creators.id,
              isVerified: creators.isVerified,
              followers: creators.followers,
              sales: creators.sales,
              rating: creators.rating,
            })
            .from(creators)
            .where(eq(creators.userId, session.user.id))
            .limit(1)
        : Promise.resolve([]),
    ]);

    if (!userData.length) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const user = userData[0];

    const quickData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      cartCount: Number(cartCountResult[0]?.count || 0),
      favoritesCount: Number(favoritesCountResult[0]?.count || 0),
      savedItemsCount: Number(savedCountResult[0]?.count || 0),
      ordersCount: Number(ordersCountResult[0]?.count || 0),
      creatorProfile: creatorData.length > 0 ? creatorData[0] : null,
    };

    // Set aggressive caching headers for immediate availability
    const response = NextResponse.json({
      success: true,
      data: quickData,
    });

    // Cache for 30 seconds, but allow stale-while-revalidate for 5 minutes
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=30, stale-while-revalidate=300"
    );

    return response;
  } catch (error) {
    console.error("❌ Error fetching quick user data:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
