import { NextRequest, NextResponse } from "next/server";
import { createDB } from "@/lib/db/src";
import {
  products,
  productVariants,
  creators,
  productCategories,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { z } from "zod";

export interface CreatorProductApiResponse {
  success: boolean;
  data?: {
    product: typeof products.$inferSelect;
    variants: (typeof productVariants.$inferSelect)[];
    category: typeof productCategories.$inferSelect;
    creator: typeof creators.$inferSelect;
  };
  error?: string;
}

// GET single product (OWNER ONLY - for editing)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: productId } = await params;

  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const db = await createDB();

    // Get the creator ID for the logged-in user
    const creator = await db.query.creators.findFirst({
      where: eq(creators.userId, session.user.id),
    });

    if (!creator) {
      return NextResponse.json(
        { error: "Creator profile not found" },
        { status: 403 }
      );
    }

    // Fetch product and verify ownership
    const product = await db.query.products.findFirst({
      where: and(
        eq(products.id, productId),
        eq(products.creatorId, creator.id) // Only fetch if user is the creator
      ),
      with: {
        variants: true,
        category: true,
        creator: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        {
          error: "Product not found or you don't have permission to access it",
          code: "FORBIDDEN",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        product: {
          ...product,
          variants: undefined,
          category: undefined,
          creator: undefined,
        },
        variants: product.variants || [],
        category: product.category,
        creator: product.creator,
      },
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// ---------- ZOD VALIDATION SCHEMA ----------
const variantSchema = z.object({
  name: z.string().min(1),
  price: z.number().nonnegative(),
  stock: z.number().int().nonnegative(),
});

const updateProductSchema = z.object({
  name: z.string().optional(),
  price: z.number().optional(),
  slug: z.string().optional(),
  image: z.url().optional(),
  categoryId: z.uuid().optional(),
  description: z.string().optional(),
  materials: z.array(z.string()).optional(),
  attributes: z.record(z.string(), z.string()).optional(),
  otherImages: z.array(z.url()).optional(),
  highlights: z.array(z.string()).optional(),
  care: z.string().optional(),
  shipping: z.string().optional(),
  returns: z.string().optional(),
  stock: z.number().int().optional(),
  isFeatured: z.boolean().optional(),
  relatedProducts: z.array(z.uuid()).optional(),
  variants: z.array(variantSchema).optional(),
});

// ---------- PATCH API ----------
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // ───────────────────────────
    //  AUTH CHECK (Required)
    // ───────────────────────────
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { id: productId } = await params;

    const db = await createDB();

    // ───────────────────────────
    //  CHECK PRODUCT OWNERSHIP
    // ───────────────────────────
    const existingProduct = await db.query.products.findFirst({
      where: eq(products.id, productId),
      columns: {
        id: true,
        creatorId: true,
      },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (existingProduct.creatorId !== userId) {
      return NextResponse.json(
        { error: "Forbidden — you cannot edit this product" },
        { status: 403 }
      );
    }

    // ───────────────────────────
    //  PARSE & VALIDATE BODY
    // ───────────────────────────
    const body = await request.json();

    const parsed = updateProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { variants, ...productData } = parsed.data;

    // Remove undefined fields (so we update only provided values)
    const cleanData: Record<string, unknown> = {};

    for (const key in productData) {
      const typedKey = key as keyof typeof productData;
      if (productData[typedKey] !== undefined) {
        cleanData[typedKey] = productData[typedKey];
      }
    }

    cleanData.updatedAt = new Date();

    // ───────────────────────────
    //  UPDATE PRODUCT (only provided fields)
    // ───────────────────────────
    if (Object.keys(cleanData).length > 0) {
      await db
        .update(products)
        .set(cleanData)
        .where(
          and(
            eq(products.id, productId),
            eq(products.creatorId, userId) // extra safety
          )
        );
    }

    // ───────────────────────────
    //  UPDATE VARIANTS (optional)
    // ───────────────────────────
    if (variants) {
      // Delete old variants
      await db
        .delete(productVariants)
        .where(eq(productVariants.productId, productId));

      if (variants.length > 0) {
        await db.insert(productVariants).values(
          variants.map((v) => ({
            productId: productId,
            name: v.name,
            price: v.price.toString(),
            stock: v.stock,
          }))
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Server error — failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE product (bonus - only owner can delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: productId } = await params;
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const db = await createDB();

    const creator = await db.query.creators.findFirst({
      where: eq(creators.userId, session.user.id),
    });

    if (!creator) {
      return NextResponse.json(
        { error: "Creator profile not found" },
        { status: 403 }
      );
    }

    // Verify ownership before deletion
    const existingProduct = await db.query.products.findFirst({
      where: and(
        eq(products.id, productId),
        eq(products.creatorId, creator.id)
      ),
    });

    if (!existingProduct) {
      return NextResponse.json(
        {
          error: "Product not found or you don't have permission to delete it",
          code: "FORBIDDEN",
        },
        { status: 403 }
      );
    }

    // Delete variants first (foreign key constraint)
    await db
      .delete(productVariants)
      .where(eq(productVariants.productId, productId));

    // Delete product
    await db
      .delete(products)
      .where(
        and(eq(products.id, productId), eq(products.creatorId, creator.id))
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
