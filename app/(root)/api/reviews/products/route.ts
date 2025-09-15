import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createDB } from "@/lib/db/src";
import { reviews, products, users } from "@/lib/db/schema";
import { eq, and, count, sql, inArray } from "drizzle-orm";
import { z } from "zod";

// Validation schema
const productReviewsQuerySchema = z.object({
  creatorId: z.uuid(),
  rating: z
    .string()
    .nullish()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .pipe(z.number().int().min(1).max(5).optional()),
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
    const validationResult = productReviewsQuerySchema.safeParse({
      creatorId: searchParams.get("creatorId"),
      rating: searchParams.get("rating"),
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

    const { creatorId, rating, page, pageSize, sortBy, sortOrder } =
      validationResult.data;
    const db = await createDB();

    // First, get all product IDs for this creator
    const creatorProducts = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.creatorId, creatorId));

    if (creatorProducts.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          reviews: [],
          pagination: {
            page: 1,
            pageSize,
            totalCount: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: false,
          },
        },
      });
    }

    const productIds = creatorProducts.map((p) => p.id);

    // Build where conditions
    const whereConditions = rating
      ? and(inArray(reviews.productId, productIds), eq(reviews.rating, rating))
      : inArray(reviews.productId, productIds);

    // Get total count
    const [{ totalCount }] = await db
      .select({ totalCount: count() })
      .from(reviews)
      .where(whereConditions);

    const key = sortBy ?? 'createdAt';

    // Build order by
    const orderByCol = reviews[key];
    const orderByFn =
      sortOrder === "asc" ? sql`${orderByCol} ASC` : sql`${orderByCol} DESC`;

    // Fetch reviews with product and user details
    const reviewsData = await db
      .select({
        id: reviews.id,
        productId: reviews.productId,
        productName: products.name,
        productImage: products.image,
        productSlug: products.slug,
        userId: reviews.userId,
        userName: users.name,
        userImage: users.image,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
      })
      .from(reviews)
      .leftJoin(products, eq(reviews.productId, products.id))
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(whereConditions)
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
    console.error("Error fetching product reviews:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
