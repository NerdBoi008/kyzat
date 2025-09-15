import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createDB } from "@/lib/db/src";
import { orders, products, orderItems } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";

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
    const creatorId = searchParams.get("creatorId");

    if (!creatorId) {
      return NextResponse.json(
        { success: false, error: "Creator ID required" },
        { status: 400 }
      );
    }

    const db = await createDB();

    // Get recent orders
    const recentOrders = await db
      .select({
        id: orders.id,
        status: orders.status,
        totalAmount: orders.totalAmount,
        createdAt: orders.createdAt,
        completedAt: orders.completedAt,
        user: {
          name: sql`(SELECT name FROM users WHERE id = ${orders.userId})`,
        },
        items: sql`(
          SELECT json_agg(json_build_object(
            'product', json_build_object('name', p.name)
          ))
          FROM order_items oi
          LEFT JOIN products p ON p.id = oi.product_id
          WHERE oi.order_id = ${orders.id}
          LIMIT 1
        )`,
      })
      .from(orders)
      .where(eq(orders.creatorId, creatorId))
      .orderBy(desc(orders.createdAt))
      .limit(10);

    // Get top products
    const topProducts = await db
      .select({
        id: products.id,
        name: products.name,
        stock: products.stock,
        rating: products.rating,
        sales: sql<number>`COALESCE(SUM(${orderItems.quantity}), 0)`,
        revenue: sql<number>`COALESCE(SUM(${orderItems.quantity} * ${orderItems.price}), 0)`,
      })
      .from(products)
      .leftJoin(orderItems, eq(products.id, orderItems.productId))
      .where(eq(products.creatorId, creatorId))
      .groupBy(products.id, products.name, products.stock, products.rating)
      .orderBy(desc(sql`COALESCE(SUM(${orderItems.quantity}), 0)`))
      .limit(10);

    return NextResponse.json({
      success: true,
      data: {
        recentOrders,
        topProducts: topProducts.map((p) => ({
          ...p,
          rating: parseFloat(String(p.rating)),
          revenue: parseFloat(String(p.revenue)),
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
