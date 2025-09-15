import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createDB } from "@/lib/db/src";
import { creatorReviews, users } from "@/lib/db/schema";
import { eq, and, count, sql } from "drizzle-orm";
import { z } from "zod";

// Validation schema
const creatorReviewsQuerySchema = z.object({
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
  sortBy: z
    .enum(["createdAt", "rating", "helpfulVotes"])
    .nullish()
    .default("createdAt"),
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
    const validationResult = creatorReviewsQuerySchema.safeParse({
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

    // Build where conditions
    const whereConditions = rating
      ? and(
          eq(creatorReviews.creatorId, creatorId),
          eq(creatorReviews.rating, rating)
        )
      : eq(creatorReviews.creatorId, creatorId);

    // Get statistics
    const statsQuery = await db
      .select({
        averageRating: sql<number>`AVG(${creatorReviews.rating})`,
        totalReviews: count(),
        rating5: sql<number>`COUNT(CASE WHEN ${creatorReviews.rating} = 5 THEN 1 END)`,
        rating4: sql<number>`COUNT(CASE WHEN ${creatorReviews.rating} = 4 THEN 1 END)`,
        rating3: sql<number>`COUNT(CASE WHEN ${creatorReviews.rating} = 3 THEN 1 END)`,
        rating2: sql<number>`COUNT(CASE WHEN ${creatorReviews.rating} = 2 THEN 1 END)`,
        rating1: sql<number>`COUNT(CASE WHEN ${creatorReviews.rating} = 1 THEN 1 END)`,
      })
      .from(creatorReviews)
      .where(eq(creatorReviews.creatorId, creatorId));

    const stats = statsQuery[0];

    // Get total count for pagination
    const [{ totalCount }] = await db
      .select({ totalCount: count() })
      .from(creatorReviews)
      .where(whereConditions);

    const key = sortBy ?? "createdAt";

    // Build order by
    const orderByCol = creatorReviews[key];
    const orderByFn =
      sortOrder === "asc" ? sql`${orderByCol} ASC` : sql`${orderByCol} DESC`;

    // Fetch reviews with user details
    const reviewsData = await db
      .select({
        id: creatorReviews.id,
        userId: creatorReviews.userId,
        userName: users.name,
        userImage: users.image,
        rating: creatorReviews.rating,
        comment: creatorReviews.comment,
        reviewType: creatorReviews.reviewType,
        isVerified: creatorReviews.isVerified,
        helpfulVotes: creatorReviews.helpfulVotes,
        createdAt: creatorReviews.createdAt,
        orderId: creatorReviews.orderId,
      })
      .from(creatorReviews)
      .leftJoin(users, eq(creatorReviews.userId, users.id))
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
        stats: {
          averageRating: parseFloat((stats.averageRating || 0).toFixed(2)),
          totalReviews: stats.totalReviews,
          ratingDistribution: {
            5: stats.rating5,
            4: stats.rating4,
            3: stats.rating3,
            2: stats.rating2,
            1: stats.rating1,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching creator reviews:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
