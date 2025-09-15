import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createDB } from "@/lib/db/src";
import { reviews, products } from "@/lib/db/schema";
import { eq, count, sql } from "drizzle-orm";
import { z } from "zod";

// Validation schema
const userReviewsQuerySchema = z.object({
  userId: z.uuid(),
  page: z
    .string()
    .nullish()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().positive()),
  pageSize: z
    .string()
    .nullish()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .pipe(z.number().int().positive().max(50)),
  sortBy: z.enum(["createdAt", "rating"]).nullish().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).nullish().default("desc"),
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
    const validationResult = userReviewsQuerySchema.safeParse({
      userId: searchParams.get("userId"),
      page: searchParams.get("page"),
      pageSize: searchParams.get("pageSize"),
      sortBy: searchParams.get("sortBy"),
      sortOrder: searchParams.get("sortOrder"),
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

    const { userId, page, pageSize, sortBy, sortOrder } = validationResult.data;
    const db = await createDB();

    // Verify the user is requesting their own reviews
    if (userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized to view these reviews" },
        { status: 403 }
      );
    }

    // Get total count
    const [{ totalCount }] = await db
      .select({ totalCount: count() })
      .from(reviews)
      .where(eq(reviews.userId, userId));

    const key = sortBy ?? "createdAt";

    // Build order by
    const orderByCol = reviews[key];
    const orderByFn =
      sortOrder === "asc" ? sql`${orderByCol} ASC` : sql`${orderByCol} DESC`;

    // Fetch reviews with product details
    const reviewsData = await db
      .select({
        id: reviews.id,
        productId: reviews.productId,
        productName: products.name,
        productImage: products.image,
        productSlug: products.slug,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
      })
      .from(reviews)
      .leftJoin(products, eq(reviews.productId, products.id))
      .where(eq(reviews.userId, userId))
      .orderBy(orderByFn)
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    const totalPages = Math.ceil(totalCount / pageSize);

    return NextResponse.json({
      success: true,
      data: {
        reviews: reviewsData,
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
    console.error("Error fetching user reviews:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
