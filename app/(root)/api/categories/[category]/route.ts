import { NextResponse } from "next/server";
import { eq, and, gte, lte, sql, count, inArray } from "drizzle-orm";
import { createDB } from "@/lib/db/src";
import {
  products,
  creators,
  users,
  productCategories,
} from "@/lib/db/schema";

interface CategoryFiltersResponse {
  category: {
    id: string;
    name: string;
    slug: string;
    description: string;
    icon: string;
  };
  products: Array<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    slug: string;
    price: number;
    image: string;
    rating: number;
    stock: number;
    description: string;
    attributes: Record<string, string>;
    materials: string[];
    creator: {
      id: string;
      name: string;
      isVerified: boolean;
    };
  }>;
  filters: {
    price: Array<{
      id: string;
      name: string;
      min: number;
      max: number;
      count: number;
    }>;
    creators: Array<{
      id: string;
      name: string;
      count: number;
      isVerified: boolean;
    }>;
    attributes: Array<{
      id: string;
      name: string;
      count: number;
    }>;
    materials: Array<{
      id: string;
      name: string;
      count: number;
    }>;
  };
  totalProducts: number;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ category: string }> }
) {
  try {
    const db = await createDB();
    const { searchParams } = new URL(req.url);
    const categorySlug = (await params).category;

    // Parse query parameters for filtering
    const searchQuery = searchParams.get("q") || "";
    const priceMin = searchParams.get("priceMin");
    const priceMax = searchParams.get("priceMax");
    const creatorIds = searchParams.get("creators")?.split(",") || [];
    const selectedAttributes = searchParams.get("attributes")?.split(",") || [];
    const selectedMaterials = searchParams.get("materials")?.split(",") || [];
    const sortBy = searchParams.get("sortBy") || "featured";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);
    const offset = (page - 1) * limit;

    // First, get category info
    const categoryResult = await db
      .select({
        id: productCategories.id,
        name: productCategories.name,
        slug: productCategories.slug,
        description: productCategories.description,
        icon: productCategories.icon,
      })
      .from(productCategories)
      .where(eq(productCategories.slug, categorySlug))
      .limit(1);

    if (!categoryResult.length) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    const category = categoryResult[0];

    // Build filter conditions [web:98][web:100]
    const conditions = [eq(products.categoryId, category.id)];

    if (searchQuery) {
      conditions.push(sql`${products.name} ILIKE ${`%${searchQuery}%`}`);
    }

    if (priceMin && priceMax) {
      conditions.push(
        and(gte(products.price, priceMin), lte(products.price, priceMax))!
      );
    }

    if (creatorIds.length > 0) {
      conditions.push(inArray(products.creatorId, creatorIds));
    }

    // For attributes filtering (assuming JSONB field)
    if (selectedAttributes.length > 0) {
      selectedAttributes.forEach((attr) => {
        conditions.push(sql`${products.attributes}::jsonb ? ${attr}`);
      });
    }

    // For materials filtering
    if (selectedMaterials.length > 0) {
      selectedMaterials.forEach((material) => {
        conditions.push(
          sql`${products.materials}::jsonb @> ${JSON.stringify([material])}`
        );
      });
    }

    // Get filtered products with creator info [web:104]
    const productsResult = await db
      .select({
        product: {
          id: products.id,
          name: products.name,
          slug: products.slug,
          price: products.price,
          image: products.image,
          description: products.description,
          rating: products.rating,
          stock: products.stock,
          attributes: products.attributes,
          materials: products.materials,
          createdAt: products.createdAt,
          updatedAt: products.updatedAt,
        },
        creator: {
          id: creators.id,
          name: users.name,
          isVerified: creators.isVerified,
        },
      })
      .from(products)
      .leftJoin(creators, eq(products.creatorId, creators.id))
      .leftJoin(users, eq(creators.userId, users.id))
      .where(and(...conditions))
      .limit(limit)
      .offset(offset)
      .orderBy(
        sortBy === "price-low"
          ? products.price
          : sortBy === "price-high"
          ? sql`${products.price} DESC`
          : sortBy === "rating"
          ? sql`${products.rating} DESC`
          : sql`${products.createdAt} DESC`
      );

    // Get total count for pagination
    const [totalResult] = await db
      .select({ count: count() })
      .from(products)
      .leftJoin(creators, eq(products.creatorId, creators.id))
      .where(and(...conditions));

    // Generate dynamic filters [web:106][web:109]

    // 1. Price range filters with counts
    const priceRanges = [
      { id: "under25", name: "Under $25", min: 0, max: 25 },
      { id: "25-50", name: "$25 - $50", min: 25, max: 50 },
      { id: "50-100", name: "$50 - $100", min: 50, max: 100 },
      { id: "over100", name: "Over $100", min: 100, max: 10000 },
    ];

    const priceFiltersWithCounts = await Promise.all(
      priceRanges.map(async (range) => {
        const [countResult] = await db
          .select({ count: count() })
          .from(products)
          .where(
            and(
              eq(products.categoryId, category.id),
              gte(products.price, range.min.toString()),
              lte(products.price, range.max.toString())
            )
          );

        return {
          ...range,
          count: Number(countResult.count) || 0,
        };
      })
    );

    // 2. Creator filters with counts [web:104]
    const creatorFilters = await db
      .select({
        id: creators.id,
        name: users.name,
        isVerified: creators.isVerified,
        count: count(products.id),
      })
      .from(products)
      .leftJoin(creators, eq(products.creatorId, creators.id))
      .leftJoin(users, eq(creators.userId, users.id))
      .where(eq(products.categoryId, category.id))
      .groupBy(creators.id, users.name, creators.isVerified)
      .having(sql`count(${products.id}) > 0`);

    // 3. Dynamic attribute filters [web:108]
    const attributeFilters = await db.execute(sql`
        SELECT 
          key as id,
          key as name,
          COUNT(*) as count
        FROM products p,
        jsonb_object_keys(p.attributes) as key
        WHERE p.category_id = ${category.id}
        AND p.attributes IS NOT NULL
        GROUP BY key
        ORDER BY count DESC
      `);

    // 4. Material filters
    const materialFilters = await db.execute(sql`
        SELECT 
          material as id,
          material as name,
          COUNT(*) as count
        FROM products p,
        jsonb_array_elements_text(p.materials) as material
        WHERE p.category_id = ${category.id}
        AND p.materials IS NOT NULL
        GROUP BY material
        ORDER BY count DESC
      `);

    const attributeRows = attributeFilters.rows as {
      id: string;
      name: string;
      count: number | string;
    }[];

    const materialRows = materialFilters.rows as {
      id: string;
      name: string;
      count: number | string;
    }[];

    const response: CategoryFiltersResponse = {
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        icon: category.icon || "",
      },
      products: productsResult.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        createdAt: item.product.createdAt,
        updatedAt: item.product.updatedAt,
        description: item.product.description || "",
        price: Number(item.product.price),
        image: item.product.image,
        rating: Number(item.product.rating) || 0,
        stock: item.product.stock || 0,
        attributes: item.product.attributes || {},
        materials: item.product.materials || [],
        creator: {
          id: item.creator?.id || "",
          name: item.creator?.name || "Unknown",
          isVerified: item.creator?.isVerified || false,
        },
      })),
      filters: {
        price: priceFiltersWithCounts.filter((f) => f.count > 0),
        creators: creatorFilters.map((c) => ({
          id: c.id ?? "",
          name: c.name ?? "",
          count: Number(c.count),
          isVerified: c.isVerified || false,
        })),
        attributes: attributeRows.map((attr) => ({
          id: attr.id,
          name: attr.name,
          count: Number(attr.count),
        })),
        materials: materialRows.map((material) => ({
          id: material.id,
          name: material.name,
          count: Number(material.count),
        })),
      },
      totalProducts: Number(totalResult.count) || 0,
    };

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("❌ Error fetching category data:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch category data" },
      { status: 500 }
    );
  }
}
