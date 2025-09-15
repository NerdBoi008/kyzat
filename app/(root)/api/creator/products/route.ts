import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createDB } from "@/lib/db/src";
import { products, creators } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

// GET all products for logged-in creator
export async function GET(request: Request) {
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

    // Fetch only creator's products
    const creatorProducts = await db.query.products.findMany({
      where: eq(products.creatorId, creator.id),
      orderBy: [desc(products.createdAt)],
      with: {
        category: true,
        variants: true,
      },
    });

    return NextResponse.json({ 
      success: true, 
      data: creatorProducts,
      total: creatorProducts.length
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
