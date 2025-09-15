import { NextResponse } from "next/server";
import { eq, and, ilike, count, SQL } from "drizzle-orm";
import { createDB } from "@/lib/db/src";
import { productCategories } from "@/lib/db/schema";

// ✅ Example Requests
// All categories (page 1, limit 10):
// /api/categories?page=1&limit=10

// Search categories by name:
// /api/categories?q=clothing

// Featured categories only:
// /api/categories?featured=true

export interface CategoryApiResponse {
  success: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  data: typeof productCategories.$inferSelect[];
}

export async function GET(req: Request) {
  try {
    const db = await createDB();
    const { searchParams } = new URL(req.url);

    // Filters
    const searchQuery = searchParams.get("q");            // search by name
    const featuredFilter = searchParams.get("featured");  // true / false

    // Pagination
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "10", 10);
    const offset = (page - 1) * limit;

    // Build conditions
    const conditions: SQL[] = [];

    if (searchQuery) conditions.push(ilike(productCategories.name, `%${searchQuery}%`));
    if (featuredFilter === "true") conditions.push(eq(productCategories.featured, true));
    if (featuredFilter === "false") conditions.push(eq(productCategories.featured, false));

    // Main query
    const result = await db
      .select({
        id: productCategories.id,
        name: productCategories.name,
        image: productCategories.image,
        icon: productCategories.icon,
        slug: productCategories.slug,
        description: productCategories.description,
        productCount: productCategories.productCount,
        featured: productCategories.featured,
      })
      .from(productCategories)
      .where(conditions.length ? and(...conditions) : undefined)
      .limit(limit)
      .offset(offset);

    // Count total for pagination
    const [{ total }] = await db
      .select({ total: count(productCategories.id) })
      .from(productCategories)
      .where(conditions.length ? and(...conditions) : undefined);

    return NextResponse.json({
      success: true,
      pagination: {
        page,
        limit,
        total: Number(total ?? 0),
        totalPages: Math.ceil(Number(total ?? 0) / limit),
      },
      data: result,
    });
  } catch (error) {
    console.error("❌ Error fetching categories:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
