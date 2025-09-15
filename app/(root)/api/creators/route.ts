import { NextResponse } from "next/server";
import { eq, and, ilike, gte, count, SQL, sql, inArray, or } from "drizzle-orm";
import { createDB } from "@/lib/db/src";
import { creatorFollowers, creators, products, users } from "@/lib/db/schema";
import { auth } from "@/lib/auth";

// Example Requests
// Fetch creators only:
// /api/creators?page=1&limit=5

// Verified creators only:
// /api/creators?verified=true

// Featured creators with rating ≥ 4:
// /api/creators?featured=true&minRating=4

// Fetch creators with full product data:
// /api/creators?withProducts=true

export interface CreatorWithRelations {
  creator: {
    id: string;
    userId: string;
    followers: number;
    following: number;
    image: string;
    coverImage?: string;
    story: string;
    description?: string;
    location?: string;
    category?: string;
    rating: number;
    sales: number;
    isVerified: boolean;
    isFeatured: boolean;
    joined: string;
    categories: string[];
    socialLinks: {
      twitter?: string;
      instagram?: string;
      facebook?: string;
      linkedin?: string;
      whatsapp?: string;
      [key: string]: string | undefined;
    };
    totalRevenue: string;
    monthlyRevenue: string;
    engagementScore: string;
    responseTime: number;
    completionRate: string;
    topScore: string;
    lastActiveAt: string;
    created_at: string;
    updated_at: string;
  };
  user: {
    id: string;
    role: "customer" | "creator" | "admin";
    creatorStatus?: "none" | "pending" | "approved" | "rejected";
    name: string;
    email: string;
    avatar?: string;
    bio?: string;
    location?: string;
    website?: string;
    socialLinks?: {
      twitter?: string;
      instagram?: string;
      facebook?: string;
      linkedin?: string;
      whatsapp?: string;
      [key: string]: string | undefined;
    };
    created_at: string;
    updated_at: string;
  };
  products?: Array<{
    id: string;
    name: string;
    price: string;
    image: string;
    rating: number;
    stock: number;
    categoryId: string;
    creatorId: string;
  }>;
}

export async function GET(req: Request) {
  try {
    const db = await createDB();
    const session = await auth.api.getSession({
      headers: req.headers,
    });
    const { searchParams } = new URL(req.url);

    // Filters
    const searchQuery = searchParams.get("q"); // search by description / category / location
    const verifiedFilter = searchParams.get("verified"); // true / false
    const featuredFilter = searchParams.get("featured"); // true / false
    const minRating = searchParams.get("minRating"); // e.g. 4.0
    const locationFilter = searchParams.get("location"); // e.g. "Delhi"
    const categoryFilter = searchParams.get("category"); // category filter
    const followingOnly = searchParams.get("followingOnly") === "true"; // get only creators followed by user

    // Products option
    const withProducts = searchParams.get("withProducts") === "true"; // if true → fetch full product objects

    // Pagination
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "10", 10);
    const offset = (page - 1) * limit;

    // Conditions
    const conditions: SQL[] = [];

    if (verifiedFilter === "true")
      conditions.push(eq(creators.isVerified, true));
    if (verifiedFilter === "false")
      conditions.push(eq(creators.isVerified, false));
    if (featuredFilter === "true")
      conditions.push(eq(creators.isFeatured, true));
    if (featuredFilter === "false")
      conditions.push(eq(creators.isFeatured, false));

    if (searchQuery) {
      // Search in multiple fields
      const searchConditions = [
        ilike(creators.description, `%${searchQuery}%`),
        ilike(creators.story, `%${searchQuery}%`),
        ilike(users.name, `%${searchQuery}%`),
      ];
      conditions.push(or(...searchConditions)!); // Non-null assertion since we know we have conditions
    }

    if (locationFilter && locationFilter !== "All Locations") {
      const locationConditions = [
        ilike(creators.location, `%${locationFilter}%`),
        ilike(users.location, `%${locationFilter}%`),
      ];
      conditions.push(or(...locationConditions)!);
    }

    if (minRating) conditions.push(gte(creators.rating, minRating));

    // Category filtering
    if (categoryFilter && categoryFilter !== "all") {
      // Use a more reliable approach for JSON array searching
      conditions.push(
        or(
          eq(creators.category, categoryFilter),
          // Use PostgreSQL's JSON contains operator
          sql`${creators.categories}::jsonb ? ${categoryFilter}`
        )!
      );
    }

    // Check if user is authenticated
    if (followingOnly && !session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        { status: 401 }
      );
    }

    // Filter by following if requested and user is authenticated
    if (followingOnly && session?.user?.id) {
      const followedCreatorIds = await db
        .select({ creatorId: creatorFollowers.creatorId })
        .from(creatorFollowers)
        .where(eq(creatorFollowers.followerId, session.user.id));

      if (followedCreatorIds.length > 0) {
        conditions.push(
          inArray(
            creators.id,
            followedCreatorIds.map((f) => f.creatorId)
          )
        );
      } else {
        // If user follows no one, return empty result
        return NextResponse.json({
          success: true,
          pagination: { page, limit, total: 0, totalPages: 0 },
          data: [],
        });
      }
    }

    // Enhanced query with user join
    const result = await db
      .select({
        creator: {
          id: creators.id,
          userId: creators.userId,
          followers: creators.followers,
          following: creators.following,
          image: creators.image,
          coverImage: creators.coverImage,
          story: creators.story,
          description: creators.description,
          location: creators.location,
          category: creators.category,
          rating: creators.rating,
          sales: creators.sales,
          isVerified: creators.isVerified,
          isFeatured: creators.isFeatured,
          joined: creators.joined,
          categories: creators.categories,
          socialLinks: creators.socialLinks,
          totalRevenue: creators.totalRevenue,
          monthlyRevenue: creators.monthlyRevenue,
          engagementScore: creators.engagementScore,
          responseTime: creators.responseTime,
          completionRate: creators.completionRate,
          topScore: creators.topScore,
          lastActiveAt: creators.lastActiveAt,
          created_at: creators.createdAt,
          updated_at: creators.updatedAt,
        },
        user: {
          id: users.id,
          role: users.role,
          creatorStatus: users.creatorStatus,
          name: users.name,
          email: users.email,
          avatar: users.image,
          bio: users.bio,
          location: users.location,
          website: users.website,
          socialLinks: users.socialLinks,
          created_at: users.createdAt,
          updated_at: users.updatedAt,
        },
      })
      .from(creators)
      .leftJoin(users, eq(creators.userId, users.id)) // Join users table
      .where(conditions.length ? and(...conditions) : undefined)
      .limit(limit)
      .offset(offset);

    // Count total for pagination (updated with user join)
    const [{ total }] = await db
      .select({ total: count(creators.id) })
      .from(creators)
      .leftJoin(users, eq(creators.userId, users.id))
      .where(conditions.length ? and(...conditions) : undefined);

    let data: CreatorWithRelations[] = result.map((item) => ({
      creator: {
        ...item.creator,
        followers: item.creator.followers ?? 0,
        following: item.creator.following ?? 0,
        image: item.creator.image ?? "",
        coverImage: item.creator.coverImage ?? "",
        story: item.creator.story ?? "",
        description: item.creator.description ?? "",
        location: item.creator.location ?? "",
        category: item.creator.category ?? "",
        rating:
          typeof item.creator.rating === "string"
            ? Number(item.creator.rating)
            : item.creator.rating ?? 0,
        sales: item.creator.sales ?? 0,
        isVerified: item.creator.isVerified ?? false,
        isFeatured: item.creator.isFeatured ?? false,
        joined:
          typeof item.creator.joined === "string"
            ? item.creator.joined
            : item.creator.joined
            ? item.creator.joined.toISOString()
            : "",
        categories: item.creator.categories ?? [],
        socialLinks: item.creator.socialLinks ?? {},
        totalRevenue: item.creator.totalRevenue ?? "0",
        monthlyRevenue: item.creator.monthlyRevenue ?? "0",
        engagementScore: item.creator.engagementScore ?? "0",
        responseTime: item.creator.responseTime ?? 0,
        completionRate: item.creator.completionRate ?? "0",
        topScore: item.creator.topScore ?? "0",
        lastActiveAt:
          typeof item.creator.lastActiveAt === "string"
            ? item.creator.lastActiveAt
            : item.creator.lastActiveAt
            ? item.creator.lastActiveAt.toISOString()
            : "",
        created_at: item.creator.created_at.toISOString() ?? "",
        updated_at: item.creator.updated_at.toISOString() ?? "",
      },
      user: {
        ...item.user!,
        role: item.user?.role as "customer" | "creator" | "admin",
        creatorStatus:
          (item.user?.creatorStatus as
            | "none"
            | "pending"
            | "approved"
            | "rejected") ?? "none",
        avatar: item.user?.avatar ?? "",
        bio: item.user?.bio ?? "",
        location: item.user?.location ?? "",
        website: item.user?.website ?? "",
        socialLinks: item.user?.socialLinks ?? {},
        created_at: item.user?.created_at.toISOString() ?? "",
        updated_at: item.user?.updated_at.toISOString() ?? "",
      },
    }));

    // If withProducts=true, expand product details
    if (withProducts) {
      const creatorIds = result.map((r) => r.creator.id);

      if (creatorIds.length > 0) {
        // Fetch products for all creators at once instead of just the first one
        const productsResult = await db
          .select({
            id: products.id,
            name: products.name,
            price: products.price,
            image: products.image,
            rating: products.rating,
            stock: products.stock,
            categoryId: products.categoryId,
            creatorId: products.creatorId,
          })
          .from(products)
          .where(
            and(
              eq(products.isApproved, true),
              // Use IN clause to get products for all creators
              inArray(products.creatorId, creatorIds)
            )
          );

        // Merge products into creators
        data = data.map((item) => ({
          ...item,
          products: productsResult
            .filter((p) => p.creatorId === item.creator.id)
            .map((p) => ({
              ...p,
              rating:
                typeof p.rating === "string" ? Number(p.rating) : p.rating ?? 0,
              stock: typeof p.stock === "number" ? p.stock : p.stock ?? 0,
            })),
        }));
      }
    }

    return NextResponse.json({
      success: true,
      pagination: {
        page,
        limit,
        total: Number(total ?? 0),
        totalPages: Math.ceil(Number(total ?? 0) / limit),
      },
      data,
    });
  } catch (error) {
    console.error("❌ Error fetching creators:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch creators" },
      { status: 500 }
    );
  }
}
