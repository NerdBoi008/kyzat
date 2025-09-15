import { NextRequest, NextResponse } from "next/server";
import { createDB } from "@/lib/db/src";
import { creators, productCategories, products, users } from "@/lib/db/schema";
import { eq, and, ilike, gte, lte, count, SQL } from "drizzle-orm";
import z from "zod";
import { auth } from "@/lib/auth";
import { ProductVariant } from "@/lib/db/schema";

// Updated response type to include full user data
export interface ProductWithRelations {
  product: {
    id: string;
    name: string;
    price: string;
    image: string;
    description: string;
    rating: number;
    stock: number;
    categoryId: string;
    creatorId: string;
    slug: string;
    materials: string[];
    reviews?: string[];
    attributes?: Record<string, string>;
    otherImages?: string[];
    highlights?: string[];
    care?: string;
    shipping?: string;
    returns?: string;
    relatedProducts?: string[];
    isFeatured: boolean;
  };
  variants: ProductVariant[];
  category: {
    id: string;
    name: string;
    slug: string;
  };
  productReviews: Array<{
    id: string;
    rating: number;
    comment: string;
    created_at: string;
    updated_at: string;
    timeAgo: string;
    verified: boolean;
    user: {
      id: string;
      name: string;
      avatar: string;
    };
  }>;
  // Review statistics
  reviewStats: {
    totalReviews: number;
    averageRating: number;
    ratingDistribution: { [key: number]: number };
  };
  relatedProducts: Array<{
    id: string;
    name: string;
    slug?: string;
    price: number;
    image: string;
    rating: number;
    reviews: string[];
    creator: {
      id: string;
      name: string;
      avatar?: string;
      isVerified: boolean;
    };
  }>;
  moreFromCreator: Array<{
    id: string;
    name: string;
    slug?: string;
    price: number;
    image: string;
    rating: number;
    reviews: string[];
    creator: {
      id: string;
      name: string;
      avatar?: string;
      isVerified: boolean;
    };
  }>;
  creator: {
    id: string;
    userId: string;
    followers: number;
    following: number;
    image: string;
    story: string;
    description?: string;
    location?: string;
    category?: string;
    rating: number;
    sales?: number;
    isVerified?: boolean;
    isFeatured?: boolean;
    joined: string;
    categories: string[];
    // Full user data instead of just userId
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
        [key: string]: string | undefined;
      };
      created_at: string;
      updated_at: string;
    };
  };
}

export async function GET(req: Request) {
  try {
    const db = await createDB();
    const { searchParams } = new URL(req.url);

    // Filters
    const categoryFilter = searchParams.get("category");
    const creatorFilter = searchParams.get("creator");
    const searchQuery = searchParams.get("q");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const featuredOnly = searchParams.get("featured");

    // Pagination
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "10", 10);
    const offset = (page - 1) * limit;

    // Build conditions
    const conditions: SQL[] = [];

    conditions.push(eq(products.isApproved, true)); // Only approved products

    if (featuredOnly === "false") {
      // Don't filter by featured if explicitly set to false
    } else {
      // Default: only show featured products
      conditions.push(eq(products.isFeatured, true));
    }

    if (creatorFilter) conditions.push(eq(products.creatorId, creatorFilter));
    if (categoryFilter)
      conditions.push(eq(productCategories.name, categoryFilter));
    if (searchQuery) conditions.push(ilike(products.name, `%${searchQuery}%`));
    if (minPrice) conditions.push(gte(products.price, minPrice));
    if (maxPrice) conditions.push(lte(products.price, maxPrice));

    // Enhanced query with user join
    const result = await db
      .select({
        product: {
          id: products.id,
          name: products.name,
          slug: products.slug,
          price: products.price,
          image: products.image,
          otherImages: products.otherImages,
          materials: products.materials,
          attributes: products.attributes,
          highlights: products.highlights,
          care: products.care,
          shipping: products.shipping,
          returns: products.returns,
          description: products.description,
          rating: products.rating,
          stock: products.stock,
          categoryId: products.categoryId,
          creatorId: products.creatorId,
          created_at: products.createdAt,
          updated_at: products.updatedAt,
        },
        category: {
          id: productCategories.id,
          name: productCategories.name,
          icon: productCategories.icon,
          created_at: productCategories.createdAt,
          updated_at: productCategories.updatedAt,
          slug: productCategories.slug,
        },
        creator: {
          id: creators.id,
          userId: creators.userId,
          followers: creators.followers,
          following: creators.following,
          image: creators.image,
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
        relatedProducts: products.relatedProducts,
      })
      .from(products)
      .leftJoin(
        productCategories,
        eq(products.categoryId, productCategories.id)
      )
      .leftJoin(creators, eq(products.creatorId, creators.id))
      .leftJoin(users, eq(creators.userId, users.id)) // Join users table
      .where(conditions.length ? and(...conditions) : undefined)
      .limit(limit)
      .offset(offset);

    // Count total for pagination (updated with user join)
    const [{ total }] = await db
      .select({ total: count(products.id) })
      .from(products)
      .leftJoin(
        productCategories,
        eq(products.categoryId, productCategories.id)
      )
      .leftJoin(creators, eq(products.creatorId, creators.id))
      .leftJoin(users, eq(creators.userId, users.id))
      .where(conditions.length ? and(...conditions) : undefined);

    return NextResponse.json({
      success: true,
      pagination: {
        page,
        limit,
        total: Number(total),
        totalPages: Math.ceil(Number(total) / limit),
      },
      data: result,
    });
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// Validation schema
const createProductSchema = z.object({
  name: z.string().min(2).max(255),
  description: z.string().min(10).max(2000),
  categoryId: z.uuid(),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  slug: z.string().min(1),
  image: z.url(),
  otherImages: z.array(z.url()).optional(),
  materials: z.array(z.string()).optional(),
  highlights: z.array(z.string()).optional(),
  care: z.string().optional(),
  shipping: z.string().optional(),
  returns: z.string().optional(),
  attributes: z.record(z.string(), z.string()).optional(),
  isFeatured: z.boolean().optional(),
});

// POST - Create new product
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

    const body = await request.json();

    // Validate input
    const validationResult = createProductSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    const db = await createDB();

    // Check if user is a creator
    const creator = await db.query.creators.findFirst({
      where: eq(creators.userId, session.user.id),
    });

    if (!creator) {
      return NextResponse.json(
        { success: false, error: "User is not a creator" },
        { status: 403 }
      );
    }

    // Check if slug already exists for this creator
    const existingProduct = await db.query.products.findFirst({
      where: (products, { and, eq }) =>
        and(eq(products.slug, data.slug), eq(products.creatorId, creator.id)),
    });

    if (existingProduct) {
      // Generate unique slug
      const timestamp = Date.now();
      data.slug = `${data.slug}-${timestamp}`;
    }

    // Create product
    const [newProduct] = await db
      .insert(products)
      .values({
        name: data.name,
        description: data.description,
        categoryId: data.categoryId,
        price: data.price.toString(),
        stock: data.stock,
        slug: data.slug,
        image: data.image,
        otherImages: data.otherImages || [],
        materials: data.materials || [],
        highlights: data.highlights || [],
        care: data.care || null,
        shipping: data.shipping || null,
        returns: data.returns || null,
        attributes: data.attributes || {},
        isFeatured: data.isFeatured || false,
        rating: "0",
        creatorId: creator.id,
      })
      .returning();

    return NextResponse.json({
      success: true,
      product: {
        id: newProduct.id,
        slug: newProduct.slug,
        name: newProduct.name,
      },
      message: "Product created successfully",
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create product" },
      { status: 500 }
    );
  }
}

// // GET - Fetch products (for creator's dashboard)
// export async function GET(request: NextRequest) {
//   try {
//     const session = await auth();

//     if (!session?.user?.id) {
//       return NextResponse.json(
//         { success: false, error: 'Unauthorized' },
//         { status: 401 }
//       );
//     }

//     const { searchParams } = new URL(request.url);
//     const page = parseInt(searchParams.get('page') || '1');
//     const limit = parseInt(searchParams.get('limit') || '10');
//     const offset = (page - 1) * limit;

//     const db = await createDB();

//     // Get creator profile
//     const creator = await db.query.creators.findFirst({
//       where: eq(creators.userId, session.user.id),
//     });

//     if (!creator) {
//       return NextResponse.json(
//         { success: false, error: 'User is not a creator' },
//         { status: 403 }
//       );
//     }

//     // Fetch creator's products
//     const creatorProducts = await db.query.products.findMany({
//       where: eq(products.creatorId, creator.id),
//       orderBy: (products, { desc }) => [desc(products.createdAt)],
//       limit,
//       offset,
//     });

//     // Count total products
//     const [{ total }] = await db
//       .select({ total: count(products.id) })
//       .from(products)
//       .where(eq(products.creatorId, creator.id));

//     return NextResponse.json({
//       success: true,
//       products: creatorProducts,
//       pagination: {
//         page,
//         limit,
//         total: Number(total),
//         totalPages: Math.ceil(Number(total) / limit),
//       },
//     });

//   } catch (error) {
//     console.error('Error fetching products:', error);
//     return NextResponse.json(
//       { success: false, error: 'Failed to fetch products' },
//       { status: 500 }
//     );
//   }
// }
