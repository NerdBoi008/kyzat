import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createDB } from "@/lib/db/src";
import {
  orders,
  orderItems,
  products,
  productVariants,
} from "@/lib/db/schema";
import { and, eq, gte, lte, sql } from "drizzle-orm";

/* -----------------------------------------------------
    TYPES
----------------------------------------------------- */

type OrderInsertType = typeof orders.$inferInsert;

// Line Item type (from cart)
export interface CartItem {
  productId: string;
  variantId?: string | null;
  quantity: number;
  price: number;
}

// Request Body Type
export interface CreateOrderBody {
  items: CartItem[];
  shippingAddress: OrderInsertType["shippingAddress"];
  paymentMethod: "cod" | "card" | "upi" | "wallet";
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  couponCode?: string | null;
}

// GET filter params
export interface OrderFilters {
  status?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  dateRange?: "7d" | "30d" | "month" | null;
  page: number;
  limit: number;
}

/* -----------------------------------------------------
    POST — CREATE ORDER
----------------------------------------------------- */

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

    const body: CreateOrderBody = await request.json();

    const {
      items,
      shippingAddress,
      paymentMethod,
      subtotal,
      shipping,
      tax,
      discount,
      couponCode,
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Cart is empty" },
        { status: 400 }
      );
    }

    const db = await createDB();

    /* -----------------------------
        Group items by creator
    ----------------------------- */
    const itemsByCreator = new Map<string, CartItem[]>();

    for (const item of items) {
      const product = await db.query.products.findFirst({
        where: eq(products.id, item.productId),
        columns: { creatorId: true },
      });

      if (!product) {
        return NextResponse.json(
          { success: false, error: `Product ${item.productId} not found` },
          { status: 404 }
        );
      }

      const creatorId = product.creatorId;

      if (!itemsByCreator.has(creatorId)) {
        itemsByCreator.set(creatorId, []);
      }

      itemsByCreator.get(creatorId)!.push(item);
    }

    /* -----------------------------
        Validate stock
    ----------------------------- */
    for (const item of items) {
      if (item.variantId) {
        const variant = await db.query.productVariants.findFirst({
          where: eq(productVariants.id, item.variantId),
        });

        if (!variant || variant.stock || 0 < item.quantity) {
          return NextResponse.json(
            {
              success: false,
              error: "Variant is out of stock or insufficient quantity",
            },
            { status: 400 }
          );
        }
      } else {
        const product = await db.query.products.findFirst({
          where: eq(products.id, item.productId),
        });

        if (!product || product.stock || 0 < item.quantity) {
          return NextResponse.json(
            {
              success: false,
              error: `Product ${product?.name || "not found"} is out of stock`,
            },
            { status: 400 }
          );
        }
      }
    }

    /* -----------------------------
        Create orders
    ----------------------------- */

    const createdOrders: {
      orderId: string;
      creatorId: string;
      total: number;
    }[] = [];

    for (const [creatorId, creatorItems] of itemsByCreator.entries()) {
      const creatorSubtotal = creatorItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      const proportion = creatorSubtotal / subtotal;

      const creatorShipping = shipping * proportion;
      const creatorTax = tax * proportion;
      const creatorDiscount = discount * proportion;

      const creatorTotal =
        creatorSubtotal + creatorShipping + creatorTax - creatorDiscount;

      const payload: OrderInsertType = {
        userId: session.user.id,
        creatorId,
        status: "pending",
        totalAmount: creatorTotal.toFixed(2),
        shippingAddress,
        paymentMethod,
        paymentStatus: paymentMethod === "cod" ? "pending" : "processing",
        subtotal: creatorSubtotal.toFixed(2),
        shipping: creatorShipping.toFixed(2),
        tax: creatorTax.toFixed(2),
        discount: creatorDiscount.toFixed(2),
        couponCode: discount > 0 ? couponCode || null : null,
      };
      // Create order
      const [order] = await db.insert(orders).values(payload).returning();

      // Create order items
      for (const item of creatorItems) {
        await db.insert(orderItems).values({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price.toString(),
          variantId: item.variantId || null,
        });

        // Decrease stock
        if (item.variantId) {
          await db
            .update(productVariants)
            .set({
              stock: sql`${productVariants.stock} - ${item.quantity}`,
            })
            .where(eq(productVariants.id, item.variantId));
        } else {
          await db
            .update(products)
            .set({
              stock: sql`${products.stock} - ${item.quantity}`,
            })
            .where(eq(products.id, item.productId));
        }
      }

      createdOrders.push({
        orderId: order.id,
        creatorId,
        total: creatorTotal,
      });
    }

    return NextResponse.json({
      success: true,
      orders: createdOrders,
      message: `${createdOrders.length} order(s) created successfully`,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create order" },
      { status: 500 }
    );
  }
}

/* -----------------------------------------------------
    GET — FETCH ORDERS WITH TYPES
----------------------------------------------------- */

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

    const url = new URL(request.url);

    const filters: OrderFilters = {
      status: url.searchParams.get("status"),
      dateFrom: url.searchParams.get("dateFrom"),
      dateTo: url.searchParams.get("dateTo"),
      dateRange: url.searchParams.get("dateRange") as
        | "7d"
        | "30d"
        | "month"
        | null,
      page: parseInt(url.searchParams.get("page") || "1", 10),
      limit: parseInt(url.searchParams.get("limit") || "10", 10),
    };

    const { status, dateFrom, dateTo, dateRange, page, limit } = filters;
    const offset = (page - 1) * limit;

    const db = await createDB();

    const conditions = [eq(orders.userId, session.user.id)];

    if (status) conditions.push(eq(orders.status, status));

    let fromDate: Date | undefined;
    let toDate: Date | undefined;

    if (dateRange) {
      const now = new Date();
      if (dateRange === "7d")
        fromDate = new Date(now.setDate(now.getDate() - 7));
      if (dateRange === "30d")
        fromDate = new Date(now.setDate(now.getDate() - 30));
      if (dateRange === "month")
        fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    if (dateFrom) fromDate = new Date(dateFrom);
    if (dateTo) toDate = new Date(dateTo);

    if (fromDate) {
      conditions.push(gte(orders.createdAt, fromDate));
    }
    if (toDate) {
      conditions.push(lte(orders.createdAt, toDate));
    }

    // Count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(and(...conditions));

    const totalCount = Number(count);
    const totalPages = Math.ceil(totalCount / limit);

    // Fetch
    const userOrders = await db.query.orders.findMany({
      where: (_, { and, eq, gte, lte }) => {
        const dyn = [eq(orders.userId, session.user.id)];

        if (status) dyn.push(eq(orders.status, status));

        if (fromDate) {
          conditions.push(gte(orders.createdAt, fromDate));
        }
        
        if (toDate) {
          conditions.push(lte(orders.createdAt, toDate));
        } 
        else if (fromDate) dyn.push(gte(orders.createdAt, fromDate));
        else if (toDate) dyn.push(lte(orders.createdAt, toDate));

        return and(...dyn);
      },
      with: {
        items: {
          with: {
            product: true,
            variant: true,
          },
        },
        creator: {
          with: {
            user: {
              columns: { name: true, image: true },
            },
          },
        },
      },
      orderBy: (orders, { desc }) => [desc(orders.createdAt)],
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      orders: userOrders,
      pagination: {
        page,
        pageSize: limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      filters,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// import { NextRequest, NextResponse } from 'next/server';
// import { auth } from '@/lib/auth';
// import { createDB } from '@/lib/db/src';
// import { orders, orderItems, products, productVariants } from '@/lib/db/src/schema';
// import { and, eq, gte, lte, sql } from 'drizzle-orm';

// export async function POST(request: NextRequest) {
//   try {
//     const session = await auth();

//     if (!session?.user?.id) {
//       return NextResponse.json(
//         { success: false, error: 'Unauthorized' },
//         { status: 401 }
//       );
//     }

//     const body = await request.json();
//     const {
//       items,
//       shippingAddress,
//       paymentMethod,
//       subtotal,
//       shipping,
//       tax,
//       discount,
//       // total,
//       couponCode,
//     } = body;

//     if (!items || items.length === 0) {
//       return NextResponse.json(
//         { success: false, error: 'Cart is empty' },
//         { status: 400 }
//       );
//     }

//     const db = await createDB();

//     // Group items by creator
//     const itemsByCreator = new Map<string, typeof items>();

//     for (const item of items) {
//       // Get product to find creator
//       const product = await db.query.products.findFirst({
//         where: eq(products.id, item.productId),
//         columns: {
//           creatorId: true,
//         },
//       });

//       if (!product) {
//         return NextResponse.json(
//           { success: false, error: `Product ${item.productId} not found` },
//           { status: 404 }
//         );
//       }

//       const creatorId = product.creatorId;

//       if (!itemsByCreator.has(creatorId)) {
//         itemsByCreator.set(creatorId, []);
//       }

//       itemsByCreator.get(creatorId)!.push(item);
//     }

//     // Validate stock availability for all items
//     for (const item of items) {
//       if (item.variantId) {
//         const variant = await db.query.productVariants.findFirst({
//           where: eq(productVariants.id, item.variantId),
//         });

//         if (!variant || variant.stock < item.quantity) {
//           return NextResponse.json(
//             {
//               success: false,
//               error: `Variant is out of stock or insufficient quantity`,
//             },
//             { status: 400 }
//           );
//         }
//       } else {
//         const product = await db.query.products.findFirst({
//           where: eq(products.id, item.productId),
//         });

//         if (!product || product.stock < item.quantity) {
//           return NextResponse.json(
//             {
//               success: false,
//               error: `Product ${product?.name || 'not found'} is out of stock`,
//             },
//             { status: 400 }
//           );
//         }
//       }
//     }

//     const createdOrders = [];

//     // Create separate orders for each creator
//     for (const [creatorId, creatorItems] of itemsByCreator.entries()) {
//       // Calculate totals for this creator's items
//       const creatorSubtotal = creatorItems.reduce(
//         (sum: number, item: any) => sum + (item.price * item.quantity),
//         0
//       );

//       // Proportional split of shipping, tax, and discount
//       const proportion = creatorSubtotal / subtotal;
//       const creatorShipping = shipping * proportion;
//       const creatorTax = tax * proportion;
//       const creatorDiscount = discount * proportion;
//       const creatorTotal = creatorSubtotal + creatorShipping + creatorTax - creatorDiscount;

//       // Create order (let UUID generate automatically)
//       const [order] = await db
//         .insert(orders)
//         .values({
//           userId: session.user.id,
//           creatorId: creatorId,
//           status: 'pending',
//           totalAmount: creatorTotal.toFixed(2),
//           shippingAddress: JSON.stringify(shippingAddress),
//           paymentMethod,
//           paymentStatus: paymentMethod === 'cod' ? 'pending' : 'processing',
//           subtotal: creatorSubtotal.toFixed(2),
//           shipping: creatorShipping.toFixed(2),
//           tax: creatorTax.toFixed(2),
//           discount: creatorDiscount.toFixed(2),
//           couponCode: discount > 0 ? couponCode : null,
//         })
//         .returning();

//       // Create order items for this creator
//       for (const item of creatorItems) {
//         await db.insert(orderItems).values({
//           orderId: order.id,
//           productId: item.productId,
//           quantity: item.quantity,
//           price: item.price.toString(),
//           variantId: item.variantId || null,
//         });

//         // Decrease stock
//         if (item.variantId) {
//           // Update variant stock
//           await db
//             .update(productVariants)
//             .set({
//               stock: sql`${productVariants.stock} - ${item.quantity}`,
//             })
//             .where(eq(productVariants.id, item.variantId));
//         } else {
//           // Update product stock
//           await db
//             .update(products)
//             .set({
//               stock: sql`${products.stock} - ${item.quantity}`,
//             })
//             .where(eq(products.id, item.productId));
//         }
//       }

//       createdOrders.push({
//         orderId: order.id,
//         creatorId,
//         total: creatorTotal,
//       });
//     }

//     return NextResponse.json({
//       success: true,
//       orders: createdOrders,
//       message: `${createdOrders.length} order(s) created successfully`,
//     });

//   } catch (error) {
//     console.error('Error creating order:', error);
//     return NextResponse.json(
//       { success: false, error: 'Failed to create order' },
//       { status: 500 }
//     );
//   }
// }

// export async function GET(request: NextRequest) {
//   try {
//     const session = await auth();

//     if (!session?.user?.id) {
//       return NextResponse.json(
//         { success: false, error: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     const { searchParams } = new URL(request.url);
//     const status = searchParams.get("status");
//     const dateFromParam = searchParams.get("dateFrom");
//     const dateToParam = searchParams.get("dateTo");
//     const dateRangeParam = searchParams.get("dateRange"); // e.g. "7d", "30d", "month"

//     const page = parseInt(searchParams.get("page") || "1", 10);
//     const limit = parseInt(searchParams.get("limit") || "10", 10);
//     const offset = (page - 1) * limit;

//     const db = await createDB();

//     // --- Build WHERE conditions dynamically
//     const conditions = [eq(orders.userId, session.user.id)];
//     if (status) conditions.push(eq(orders.status, status));

//     // --- Handle date range filtering
//     let dateFrom: Date | undefined;
//     let dateTo: Date | undefined;

//     if (dateRangeParam) {
//       const now = new Date();
//       switch (dateRangeParam) {
//         case "7d":
//           dateFrom = new Date(now.setDate(now.getDate() - 7));
//           break;
//         case "30d":
//           dateFrom = new Date(now.setDate(now.getDate() - 30));
//           break;
//         case "month":
//           dateFrom = new Date(now.getFullYear(), now.getMonth(), 1);
//           break;
//         default:
//           break;
//       }
//     }

//     if (dateFromParam) dateFrom = new Date(dateFromParam);
//     if (dateToParam) dateTo = new Date(dateToParam);

//     if (dateFrom && dateTo) {
//       conditions.push(and(gte(orders.createdAt, dateFrom), lte(orders.createdAt, dateTo)));
//     } else if (dateFrom) {
//       conditions.push(gte(orders.createdAt, dateFrom));
//     } else if (dateTo) {
//       conditions.push(lte(orders.createdAt, dateTo));
//     }

//     // --- Count total orders for pagination
//     const [{ count }] = await db
//       .select({ count: sql<number>`count(*)` })
//       .from(orders)
//       .where(and(...conditions));

//     const totalCount = Number(count);
//     const totalPages = Math.ceil(totalCount / limit);

//     // --- Fetch paginated orders with relations
//     const userOrders = await db.query.orders.findMany({
//       where: (orders, { and, eq, gte, lte }) => {
//         const dynamic = [eq(orders.userId, session.user.id)];
//         if (status) dynamic.push(eq(orders.status, status));

//         if (dateFrom && dateTo) {
//           dynamic.push(and(gte(orders.createdAt, dateFrom), lte(orders.createdAt, dateTo)));
//         } else if (dateFrom) {
//           dynamic.push(gte(orders.createdAt, dateFrom));
//         } else if (dateTo) {
//           dynamic.push(lte(orders.createdAt, dateTo));
//         }

//         return and(...dynamic);
//       },
//       with: {
//         items: {
//           with: {
//             product: true,
//             variant: true,
//           },
//         },
//         creator: {
//           with: {
//             user: {
//               columns: {
//                 name: true,
//                 image: true,
//               },
//             },
//           },
//         },
//       },
//       orderBy: (orders, { desc }) => [desc(orders.createdAt)],
//       limit,
//       offset,
//     });

//     // --- Build typed response
//     const response = {
//       success: true,
//       orders: userOrders,
//       pagination: {
//         page,
//         pageSize: limit,
//         totalCount,
//         totalPages,
//         hasNextPage: page < totalPages,
//         hasPrevPage: page > 1,
//       },
//       filters: {
//         type: "user",
//         status,
//         dateFrom: dateFrom?.toISOString(),
//         dateTo: dateTo?.toISOString(),
//         dateRange: dateRangeParam || undefined,
//       },
//     };

//     return NextResponse.json(response);
//   } catch (error) {
//     console.error("Error fetching orders:", error);
//     return NextResponse.json(
//       { success: false, error: "Failed to fetch orders" },
//       { status: 500 }
//     );
//   }
// }
