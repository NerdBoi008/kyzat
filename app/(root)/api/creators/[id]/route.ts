import { NextResponse } from "next/server";
import { eq, desc, and } from "drizzle-orm";
import { createDB } from "@/lib/db/src";
import { creatorReviews, creators, products, users } from "@/lib/db/schema";
import { calculateRatingDistribution, calculateTimeAgo } from "@/lib/utils";
import { auth } from "@/lib/auth";

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
    engagementScore: string;
    responseTime: number;
    completionRate: string;
    topScore: string;
    lastActiveAt: string;
    // Private fields (only for owner)
    totalRevenue?: string;
    monthlyRevenue?: string;
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
    slug: string;
  }>;
  creatorReviews?: Array<{
    id: string;
    rating: number;
    comment: string;
    reviewType: string;
    isVerified: boolean;
    helpfulVotes: number;
    created_at: string;
    timeAgo: string;
    user: {
      id: string;
      name: string;
      avatar: string;
    };
  }>;
  reviewStats?: {
    totalReviews: number;
    averageRating: number;
    ratingDistribution: { [key: number]: number };
  };
  isOwner?: boolean;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = await createDB();
    const session = await auth.api.getSession({
      headers: req.headers,
    });
    const { searchParams } = new URL(req.url);
    const creatorId = (await params).id;

    const withProducts = searchParams.get("withProducts") === "true";
    const withReviews = searchParams.get("withReviews") === "true";

    // Fetch creator with user data
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
      .leftJoin(users, eq(creators.userId, users.id))
      .where(eq(creators.id, creatorId))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Creator not found",
        },
        { status: 404 }
      );
    }

    const creatorData = result[0];

    // Check if the current user is the owner
    const isOwner = session?.user?.id === creatorData.creator.userId;

    // Base creator data with all public fields
    const creatorDataFormatted = {
      id: creatorData.creator.id,
      userId: creatorData.creator.userId,
      followers: creatorData.creator.followers ?? 0,
      following: creatorData.creator.following ?? 0,
      image: creatorData.creator.image ?? "",
      coverImage: creatorData.creator.coverImage ?? "",
      story: creatorData.creator.story ?? "",
      description: creatorData.creator.description ?? "",
      location: creatorData.creator.location ?? "",
      category: creatorData.creator.category ?? "",
      rating:
        typeof creatorData.creator.rating === "string"
          ? Number(creatorData.creator.rating)
          : creatorData.creator.rating ?? 0,
      sales: creatorData.creator.sales ?? 0,
      isVerified: creatorData.creator.isVerified ?? false,
      isFeatured: creatorData.creator.isFeatured ?? false,
      joined:
        typeof creatorData.creator.joined === "string"
          ? creatorData.creator.joined
          : creatorData.creator.joined
          ? creatorData.creator.joined.toISOString()
          : "",
      categories: creatorData.creator.categories ?? [],
      socialLinks: creatorData.creator.socialLinks ?? {},
      engagementScore: creatorData.creator.engagementScore ?? "0",
      responseTime: creatorData.creator.responseTime ?? 0,
      completionRate: creatorData.creator.completionRate ?? "0",
      topScore: creatorData.creator.topScore ?? "0",
      lastActiveAt:
        typeof creatorData.creator.lastActiveAt === "string"
          ? creatorData.creator.lastActiveAt
          : creatorData.creator.lastActiveAt
          ? creatorData.creator.lastActiveAt.toISOString()
          : "",
      created_at: creatorData.creator.created_at.toISOString() ?? "",
      updated_at: creatorData.creator.updated_at.toISOString() ?? "",
      // Only include revenue if owner
      ...(isOwner && {
        totalRevenue: creatorData.creator.totalRevenue ?? "0",
        monthlyRevenue: creatorData.creator.monthlyRevenue ?? "0",
      }),
    };

    const data: CreatorWithRelations = {
      creator: creatorDataFormatted,
      user: {
        id: creatorData.user!.id,
        role: creatorData.user?.role as "customer" | "creator" | "admin",
        creatorStatus:
          (creatorData.user?.creatorStatus as
            | "none"
            | "pending"
            | "approved"
            | "rejected") ?? "none",
        name: creatorData.user!.name,
        email: creatorData.user!.email,
        avatar: creatorData.user?.avatar ?? "",
        bio: creatorData.user?.bio ?? "",
        location: creatorData.user?.location ?? "",
        website: creatorData.user?.website ?? "",
        socialLinks: creatorData.user?.socialLinks ?? {},
        created_at: creatorData.user?.created_at.toISOString() ?? "",
        updated_at: creatorData.user?.updated_at.toISOString() ?? "",
      },
      isOwner,
    };

    // Fetch creator reviews if requested
    if (withReviews) {
      const reviewsResult = await db
        .select({
          id: creatorReviews.id,
          rating: creatorReviews.rating,
          comment: creatorReviews.comment,
          reviewType: creatorReviews.reviewType,
          isVerified: creatorReviews.isVerified,
          helpfulVotes: creatorReviews.helpfulVotes,
          created_at: creatorReviews.createdAt,
          user: {
            id: users.id,
            name: users.name,
            avatar: users.image,
          },
        })
        .from(creatorReviews)
        .leftJoin(users, eq(creatorReviews.userId, users.id))
        .where(eq(creatorReviews.creatorId, creatorId))
        .orderBy(desc(creatorReviews.createdAt))
        .limit(20);

      const avgRating =
        reviewsResult.length > 0
          ? reviewsResult.reduce((sum, review) => sum + review.rating, 0) /
            reviewsResult.length
          : 0;

      data.creatorReviews = reviewsResult.map((review) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment ?? "",
        reviewType: review.reviewType ?? "general",
        isVerified: review.isVerified ?? false,
        helpfulVotes: review.helpfulVotes ?? 0,
        created_at: review.created_at ? review.created_at.toISOString() : "",
        timeAgo: calculateTimeAgo(review.created_at),
        user: {
          id: review.user?.id ?? "",
          name: review.user?.name ?? "Anonymous",
          avatar: review.user?.avatar ?? "",
        },
      }));

      data.reviewStats = {
        totalReviews: reviewsResult.length,
        averageRating: Number(avgRating.toFixed(2)),
        ratingDistribution: calculateRatingDistribution(reviewsResult),
      };

      if (reviewsResult.length > 0) {
        data.creator.rating = Number(avgRating.toFixed(2));
      }
    }

    // Fetch products if requested
    if (withProducts) {
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
          slug: products.slug,
        })
        .from(products)
        .where(
          and(eq(products.creatorId, creatorId), eq(products.isApproved, true))
        );

      data.products = productsResult.map((p) => ({
        ...p,
        slug: p.slug ?? "",
        rating: typeof p.rating === "string" ? Number(p.rating) : p.rating ?? 0,
        stock: typeof p.stock === "number" ? p.stock : p.stock ?? 0,
      }));
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("❌ Error fetching creator:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch creator",
      },
      { status: 500 }
    );
  }
}

// import { NextResponse } from "next/server";
// import { eq, desc } from "drizzle-orm";
// import { createDB } from "@/lib/db/src";
// import { creatorReviews, creators, products, users } from "@/lib/db/src/schema";
// import { calculateRatingDistribution, calculateTimeAgo } from "@/lib/utils";

// export interface CreatorWithRelations {
//   creator: {
//     id: string;
//     userId: string;
//     followers: number;
//     following: number;
//     image: string;
//     coverImage?: string;
//     story: string;
//     description?: string;
//     location?: string;
//     category?: string;
//     rating: number;
//     sales: number;
//     isVerified: boolean;
//     isFeatured: boolean;
//     joined: string;
//     categories: string[];
//     socialLinks: {
//       twitter?: string;
//       instagram?: string;
//       facebook?: string;
//       linkedin?: string;
//       whatsapp?: string;
//       [key: string]: string | undefined;
//     };
//     totalRevenue: string;
//     monthlyRevenue: string;
//     engagementScore: string;
//     responseTime: number;
//     completionRate: string;
//     topScore: string;
//     lastActiveAt: string;
//     created_at: string;
//     updated_at: string;
//   };
//   user: {
//     id: string;
//     role: "customer" | "creator" | "admin";
//     creatorStatus?: "none" | "pending_review" | "approved" | "rejected";
//     name: string;
//     email: string;
//     avatar?: string;
//     bio?: string;
//     location?: string;
//     website?: string;
//     socialLinks?: {
//       twitter?: string;
//       instagram?: string;
//       facebook?: string;
//       linkedin?: string;
//       whatsapp?: string;
//       [key: string]: string | undefined;
//     };
//     created_at: string;
//     updated_at: string;
//   };
//   products?: Array<{
//     id: string;
//     name: string;
//     price: string;
//     image: string;
//     rating: number;
//     stock: number;
//     categoryId: string;
//     creatorId: string;
//     slug: string;
//   }>;
//   creatorReviews?: Array<{
//     id: string;
//     rating: number;
//     comment: string;
//     reviewType: string;
//     isVerified: boolean;
//     helpfulVotes: number;
//     created_at: string;
//     timeAgo: string;
//     user: {
//       id: string;
//       name: string;
//       avatar: string;
//     };
//   }>;
//   reviewStats?: {
//     totalReviews: number;
//     averageRating: number;
//     ratingDistribution: { [key: number]: number };
//   };
// }

// export async function GET(
//   req: Request,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const db = await createDB();
//     const { searchParams } = new URL(req.url);
//     const creatorId = (await params).id;

//     // Check if we should include products
//     const withProducts = searchParams.get("withProducts") === "true";

//     // Check if we should include products and reviews
//     const withReviews = searchParams.get("withReviews") === "true";

//     // Fetch creator with user data
//     const result = await db
//       .select({
//         creator: {
//           id: creators.id,
//           userId: creators.userId,
//           followers: creators.followers,
//           following: creators.following,
//           image: creators.image,
//           coverImage: creators.coverImage,
//           story: creators.story,
//           description: creators.description,
//           location: creators.location,
//           category: creators.category,
//           rating: creators.rating,
//           sales: creators.sales,
//           isVerified: creators.isVerified,
//           isFeatured: creators.isFeatured,
//           joined: creators.joined,
//           categories: creators.categories,
//           socialLinks: creators.socialLinks,
//           totalRevenue: creators.totalRevenue,
//           monthlyRevenue: creators.monthlyRevenue,
//           engagementScore: creators.engagementScore,
//           responseTime: creators.responseTime,
//           completionRate: creators.completionRate,
//           topScore: creators.topScore,
//           lastActiveAt: creators.lastActiveAt,
//           created_at: creators.createdAt,
//           updated_at: creators.updatedAt,
//         },
//         user: {
//           id: users.id,
//           role: users.role,
//           creatorStatus: users.creatorStatus,
//           name: users.name,
//           email: users.email,
//           avatar: users.image,
//           bio: users.bio,
//           location: users.location,
//           website: users.website,
//           socialLinks: users.socialLinks,
//           created_at: users.createdAt,
//           updated_at: users.updatedAt,
//         },
//       })
//       .from(creators)
//       .leftJoin(users, eq(creators.userId, users.id))
//       .where(eq(creators.id, creatorId))
//       .limit(1);

//     // Check if creator exists
//     if (result.length === 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Creator not found"
//         },
//         { status: 404 }
//       );
//     }

//     const creatorData = result[0];

//     // Transform the data to match the interface
//     const data: CreatorWithRelations = {
//       creator: {
//         ...creatorData.creator,
//         followers: creatorData.creator.followers ?? 0,
//         following: creatorData.creator.following ?? 0,
//         image: creatorData.creator.image ?? "",
//         coverImage: creatorData.creator.coverImage ?? "",
//         story: creatorData.creator.story ?? "",
//         description: creatorData.creator.description ?? "",
//         location: creatorData.creator.location ?? "",
//         category: creatorData.creator.category ?? "",
//         rating: typeof creatorData.creator.rating === "string"
//           ? Number(creatorData.creator.rating)
//           : (creatorData.creator.rating ?? 0),
//         sales: creatorData.creator.sales ?? 0,
//         isVerified: creatorData.creator.isVerified ?? false,
//         isFeatured: creatorData.creator.isFeatured ?? false,
//         joined: typeof creatorData.creator.joined === "string"
//           ? creatorData.creator.joined
//           : creatorData.creator.joined
//           ? creatorData.creator.joined.toISOString()
//           : "",
//         categories: creatorData.creator.categories ?? [],
//         socialLinks: creatorData.creator.socialLinks ?? {},
//         totalRevenue: creatorData.creator.totalRevenue ?? "0",
//         monthlyRevenue: creatorData.creator.monthlyRevenue ?? "0",
//         engagementScore: creatorData.creator.engagementScore ?? "0",
//         responseTime: creatorData.creator.responseTime ?? 0,
//         completionRate: creatorData.creator.completionRate ?? "0",
//         topScore: creatorData.creator.topScore ?? "0",
//         lastActiveAt: typeof creatorData.creator.lastActiveAt === "string"
//           ? creatorData.creator.lastActiveAt
//           : creatorData.creator.lastActiveAt
//           ? creatorData.creator.lastActiveAt.toISOString()
//           : "",
//         created_at: creatorData.creator.created_at.toISOString() ?? "",
//         updated_at: creatorData.creator.updated_at.toISOString() ?? "",
//       },
//       user: {
//         ...creatorData.user!,
//         role: creatorData.user?.role as "customer" | "creator" | "admin",
//         creatorStatus: creatorData.user?.creatorStatus as "none" | "pending_review" | "approved" | "rejected" ?? "none",
//         avatar: creatorData.user?.avatar ?? "",
//         bio: creatorData.user?.bio ?? "",
//         location: creatorData.user?.location ?? "",
//         website: creatorData.user?.website ?? "",
//         socialLinks: creatorData.user?.socialLinks ?? {},
//         created_at: creatorData.user?.created_at.toISOString() ?? "",
//         updated_at: creatorData.user?.updated_at.toISOString() ?? "",
//       },
//     };

//     // Fetch creator reviews if requested
//     if (withReviews) {
//       const reviewsResult = await db
//         .select({
//           id: creatorReviews.id,
//           rating: creatorReviews.rating,
//           comment: creatorReviews.comment,
//           reviewType: creatorReviews.reviewType,
//           isVerified: creatorReviews.isVerified,
//           helpfulVotes: creatorReviews.helpfulVotes,
//           created_at: creatorReviews.createdAt,
//           user: {
//             id: users.id,
//             name: users.name,
//             avatar: users.image,
//           },
//         })
//         .from(creatorReviews)
//         .leftJoin(users, eq(creatorReviews.userId, users.id))
//         .where(eq(creatorReviews.creatorId, creatorId))
//         .orderBy(desc(creatorReviews.createdAt))
//         .limit(20);

//       // Calculate average rating from actual reviews
//       const avgRating = reviewsResult.length > 0
//         ? reviewsResult.reduce((sum, review) => sum + review.rating, 0) / reviewsResult.length
//         : 0;

//       // Format reviews data
//       data.creatorReviews = reviewsResult.map((review) => ({
//         id: review.id,
//         rating: review.rating,
//         comment: review.comment ?? "",
//         reviewType: review.reviewType ?? "general",
//         isVerified: review.isVerified ?? false,
//         helpfulVotes: review.helpfulVotes ?? 0,
//         created_at: review.created_at ? review.created_at.toISOString() : "",
//         timeAgo: calculateTimeAgo(review.created_at),
//         user: {
//           id: review.user?.id ?? "",
//           name: review.user?.name ?? "Anonymous",
//           avatar: review.user?.avatar ?? "",
//         },
//       }));

//       // Calculate review statistics
//       data.reviewStats = {
//         totalReviews: reviewsResult.length,
//         averageRating: Number(avgRating.toFixed(2)),
//         ratingDistribution: calculateRatingDistribution(reviewsResult),
//       };

//       // Update creator rating with calculated average if reviews exist
//       if (reviewsResult.length > 0) {
//         data.creator.rating = Number(avgRating.toFixed(2));
//       }
//     }

//     // If withProducts=true, fetch and include product details
//     if (withProducts) {
//       const productsResult = await db
//         .select({
//           id: products.id,
//           name: products.name,
//           price: products.price,
//           image: products.image,
//           rating: products.rating,
//           stock: products.stock,
//           categoryId: products.categoryId,
//           creatorId: products.creatorId,
//           slug: products.slug,
//         })
//         .from(products)
//         .where(eq(products.creatorId, creatorId));

//       data.products = productsResult.map((p) => ({
//         ...p,
//         slug: p.slug ?? "",
//         rating: typeof p.rating === "string" ? Number(p.rating) : (p.rating ?? 0),
//         stock: typeof p.stock === "number" ? p.stock : (p.stock ?? 0),
//       }));
//     }

//     return NextResponse.json({
//       success: true,
//       data,
//     });

//   } catch (error) {
//     console.error("❌ Error fetching creator:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         message: "Failed to fetch creator"
//       },
//       { status: 500 }
//     );
//   }
// }
