import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createDB } from "@/lib/db/src";
import { userFavorites, products, creators, users } from "@/lib/db/schema";
import { eq, desc, count } from "drizzle-orm";
import { z } from "zod";

// Validation schema
const wishlistQuerySchema = z.object({
  userId: z.uuid(),
  page: z
    .string()
    .nullish()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().positive()),
  pageSize: z
    .string()
    .nullish()
    .transform((val) => (val ? parseInt(val, 10) : 12))
    .pipe(z.number().int().positive().max(50)),
});

export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const validationResult = wishlistQuerySchema.safeParse({
      userId: searchParams.get("userId"),
      page: searchParams.get("page"),
      pageSize: searchParams.get("pageSize"),
    });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid query parameters",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { userId, page, pageSize } = validationResult.data;
    const db = await createDB();

    // Verify user is requesting their own wishlist
    if (userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized to view this wishlist" },
        { status: 403 }
      );
    }

    // Get total count
    const [{ totalCount }] = await db
      .select({ totalCount: count() })
      .from(userFavorites)
      .where(eq(userFavorites.userId, userId));

    // Fetch wishlist items with product and creator details
    const wishlistItems = await db
      .select({
        id: userFavorites.userId, // Composite key as id
        productId: products.id,
        productName: products.name,
        productImage: products.image,
        productSlug: products.slug,
        productPrice: products.price,
        productStock: products.stock,
        productRating: products.rating,
        creatorId: creators.id,
        creatorName: users.name,
        creatorImage: creators.image,
        addedAt: userFavorites.createdAt,
      })
      .from(userFavorites)
      .leftJoin(products, eq(userFavorites.productId, products.id))
      .leftJoin(creators, eq(products.creatorId, creators.id))
      .leftJoin(users, eq(creators.userId, users.id))
      .where(eq(userFavorites.userId, userId))
      .orderBy(desc(userFavorites.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    const totalPages = Math.ceil(totalCount / pageSize);

    return NextResponse.json({
      success: true,
      data: {
        items: wishlistItems,
        pagination: {
          page,
          pageSize,
          totalCount,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch wishlist" },
      { status: 500 }
    );
  }
}

// Add item to wishlist
export async function POST(request: NextRequest) {
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

    const body: { productId: string } = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }

    const db = await createDB();

    // Check if already in wishlist
    const existing = await db.query.userFavorites.findFirst({
      where: (favorites, { and, eq }) =>
        and(
          eq(favorites.userId, session.user.id),
          eq(favorites.productId, productId)
        ),
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Product already in wishlist" },
        { status: 409 }
      );
    }

    // Add to wishlist
    await db.insert(userFavorites).values({
      userId: session.user.id,
      productId,
    });

    return NextResponse.json({
      success: true,
      message: "Product added to wishlist",
    });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add to wishlist" },
      { status: 500 }
    );
  }
}
