import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createDB } from "@/lib/db/src";
import {
  cartItems,
  savedItems,
  products,
  users,
  creators,
  productVariants,
} from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  slug: string;
  quantity: number;
  stock: number;
  creator: {
    id: string;
    name: string;
    isVerified: boolean;
  };
  variantId?: string;
  variantName?: string;
}

interface SavedItem {
  id: string;
  name: string;
  price: number;
  image: string;
  slug: string;
  stock: number;
  creator: {
    id: string;
    name: string;
    isVerified: boolean;
  };
  variantId?: string;
  variantName?: string;
}

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await createDB();

    // Fetch cart items with variant information
    const userCartItems = await db
      .select({
        id: cartItems.id,
        productId: cartItems.productId,
        variantId: cartItems.variantId,
        quantity: cartItems.quantity,
        product: {
          id: products.id,
          name: products.name,
          price: products.price,
          image: products.image,
          slug: products.slug,
          stock: products.stock,
        },
        variant: {
          id: productVariants.id,
          name: productVariants.name,
          price: productVariants.price,
          stock: productVariants.stock,
        },
        creator: {
          id: creators.id,
          name: users.name,
          isVerified: creators.isVerified,
        },
      })
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.id))
      .leftJoin(productVariants, eq(cartItems.variantId, productVariants.id))
      .leftJoin(creators, eq(products.creatorId, creators.id))
      .leftJoin(users, eq(creators.userId, users.id))
      .where(eq(cartItems.userId, session.user.id));

    // Fetch saved items with variant information
    const userSavedItems = await db
      .select({
        id: savedItems.id,
        productId: savedItems.productId,
        variantId: savedItems.variantId,
        product: {
          id: products.id,
          name: products.name,
          price: products.price,
          image: products.image,
          slug: products.slug,
          stock: products.stock,
        },
        variant: {
          id: productVariants.id,
          name: productVariants.name,
          price: productVariants.price,
          stock: productVariants.stock,
        },
        creator: {
          id: creators.id,
          name: users.name,
          isVerified: creators.isVerified,
        },
      })
      .from(savedItems)
      .leftJoin(products, eq(savedItems.productId, products.id))
      .leftJoin(productVariants, eq(savedItems.variantId, productVariants.id))
      .leftJoin(creators, eq(products.creatorId, creators.id))
      .leftJoin(users, eq(creators.userId, users.id))
      .where(eq(savedItems.userId, session.user.id));

    // Format cart items - use variant price/stock if variant exists, otherwise use product price/stock
    const formattedCartItems: CartItem[] = userCartItems.map((item) => {
      const hasVariant = !!item.variant?.id;

      return {
        id: item.product?.id || "",
        name: item.product?.name || "",
        price: hasVariant
          ? Number(item.variant?.price || 0)
          : Number(item.product?.price || 0),
        image: item.product?.image || "",
        slug: item.product?.slug || "",
        quantity: item.quantity,
        stock: hasVariant ? item.variant?.stock || 0 : item.product?.stock || 0,
        variantId: item.variantId || undefined,
        variantName: item.variant?.name || undefined,
        creator: {
          id: item.creator?.id || "",
          name: item.creator?.name || "Unknown",
          isVerified: item.creator?.isVerified || false,
        },
      };
    });

    // Format saved items - use variant price/stock if variant exists
    const formattedSavedItems: SavedItem[] = userSavedItems.map((item) => {
      const hasVariant = !!item.variant?.id;

      return {
        id: item.product?.id || "",
        name: item.product?.name || "",
        price: hasVariant
          ? Number(item.variant?.price || 0)
          : Number(item.product?.price || 0),
        image: item.product?.image || "",
        slug: item.product?.slug || "",
        stock: hasVariant ? item.variant?.stock || 0 : item.product?.stock || 0,
        variantId: item.variantId || undefined,
        variantName: item.variant?.name || undefined,
        creator: {
          id: item.creator?.id || "",
          name: item.creator?.name || "Unknown",
          isVerified: item.creator?.isVerified || false,
        },
      };
    });

    return NextResponse.json({
      cartItems: formattedCartItems,
      savedItems: formattedSavedItems,
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      cartItems: newCartItems = [],
      savedItems: newSavedItems = [],
    }: {
      cartItems?: CartItem[];
      savedItems?: SavedItem[];
    } = await request.json();

    const db = await createDB();

    // Clear existing cart items
    await db.delete(cartItems).where(eq(cartItems.userId, session.user.id));

    // Clear existing saved items
    await db.delete(savedItems).where(eq(savedItems.userId, session.user.id));

    // Insert new cart items
    if (newCartItems.length > 0) {
      await db.insert(cartItems).values(
        newCartItems.map((item: CartItem) => ({
          userId: session.user.id,
          productId: item.id,
          variantId: item.variantId || null,
          quantity: item.quantity,
        }))
      );
    }

    // Insert new saved items
    if (newSavedItems.length > 0) {
      await db.insert(savedItems).values(
        newSavedItems.map((item: SavedItem) => ({
          userId: session.user.id,
          productId: item.id,
          variantId: item.variantId || null,
        }))
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating cart:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Add single item to cart
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      productId,
      variantId,
      quantity = 1,
      saveForLater = false,
    }: {
      productId: string;
      variantId?: string | null;
      quantity?: number;
      saveForLater?: boolean;
    } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const db = await createDB();

    // Validate stock before adding
    if (variantId) {
      const variant = await db.query.productVariants.findFirst({
        where: eq(productVariants.id, variantId),
      });

      if (!variant) {
        return NextResponse.json(
          { error: "Variant not found" },
          { status: 404 }
        );
      }

      if (variant.stock || 0 < quantity) {
        return NextResponse.json(
          { error: "Insufficient stock for this variant" },
          { status: 400 }
        );
      }
    } else {
      const product = await db.query.products.findFirst({
        where: eq(products.id, productId),
      });

      if (!product) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }

      if (product.stock || 0 < quantity) {
        return NextResponse.json(
          { error: "Insufficient stock" },
          { status: 400 }
        );
      }
    }

    if (saveForLater) {
      // Add to saved items
      const existing = await db.query.savedItems.findFirst({
        where: (items, { and, eq }) => {
          const conditions = [
            eq(items.userId, session.user.id),
            eq(items.productId, productId),
          ];

          if (variantId) {
            conditions.push(eq(items.variantId, variantId));
          }

          return and(...conditions);
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: "Item already saved" },
          { status: 409 }
        );
      }

      await db.insert(savedItems).values({
        userId: session.user.id,
        productId,
        variantId: variantId || null,
      });

      return NextResponse.json({
        success: true,
        message: "Item saved for later",
      });
    } else {
      // Add to cart
      const existingCartItem = await db.query.cartItems.findFirst({
        where: (items, { and, eq, isNull }) => {
          const conditions = [
            eq(items.userId, session.user.id),
            eq(items.productId, productId),
          ];

          if (variantId) {
            conditions.push(eq(items.variantId, variantId));
          } else {
            conditions.push(isNull(items.variantId));
          }

          return and(...conditions);
        },
      });

      if (existingCartItem) {
        // Update quantity
        await db
          .update(cartItems)
          .set({
            quantity: existingCartItem.quantity + quantity,
            updatedAt: new Date(),
          })
          .where(eq(cartItems.id, existingCartItem.id));

        return NextResponse.json({
          success: true,
          message: "Cart updated",
        });
      } else {
        // Insert new item
        await db.insert(cartItems).values({
          userId: session.user.id,
          productId,
          variantId: variantId || null,
          quantity,
        });

        return NextResponse.json({
          success: true,
          message: "Item added to cart",
        });
      }
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Remove item from cart
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const variantId = searchParams.get("variantId");
    const isSaved = searchParams.get("saved") === "true";

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const db = await createDB();

    if (isSaved) {
      // Remove from saved items
      const conditions = [
        eq(savedItems.userId, session.user.id),
        eq(savedItems.productId, productId),
      ];

      if (variantId) {
        conditions.push(eq(savedItems.variantId, variantId));
      }

      await db.delete(savedItems).where(and(...conditions));
    } else {
      // Remove from cart
      const conditions = [
        eq(cartItems.userId, session.user.id),
        eq(cartItems.productId, productId),
      ];

      if (variantId) {
        conditions.push(eq(cartItems.variantId, variantId));
      }

      await db.delete(cartItems).where(and(...conditions));
    }

    return NextResponse.json({
      success: true,
      message: isSaved ? "Removed from saved items" : "Removed from cart",
    });
  } catch (error) {
    console.error("Error removing from cart:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// import { NextRequest, NextResponse } from 'next/server';
// import { auth } from '@/lib/auth';
// import { createDB } from '@/lib/db/src';
// import { cartItems, savedItems, products, users, creators } from '@/lib/db/src/schema';
// import { and, eq } from 'drizzle-orm';

// interface CartItem {
//   id: string;
//   name: string;
//   price: number;
//   image: string;
//   slug: string;
//   quantity: number;
//   stock: number;
//   creator: {
//     id: string;
//     name: string;
//     isVerified: boolean;
//   };
//   variantId?: string;
//   variantName?: string;
// }

// interface SavedItem {
//   id: string;
//   name: string;
//   price: number;
//   image: string;
//   slug: string;
//   stock: number;
//   creator: {
//     id: string;
//     name: string;
//     isVerified: boolean;
//   };
//   variantId?: string;
//   variantName?: string;
// }

// export async function GET() {
//   try {
//     const session = await auth();

//     if (!session?.user?.id) {
//       return NextResponse.json(
//         { error: 'Unauthorized' },
//         { status: 401 }
//       );
//     }

//     const db = await createDB();

//     // Fetch cart items
//     const userCartItems = await db
//       .select({
//         id: cartItems.id,
//         productId: cartItems.productId,
//         variantId: cartItems.variantId,
//         quantity: cartItems.quantity,
//         product: {
//           id: products.id,
//           name: products.name,
//           price: products.price,
//           image: products.image,
//           slug: products.slug,
//           stock: products.stock,
//         },
//         creator: {
//           id: creators.id,
//           name: users.name,
//           isVerified: creators.isVerified,
//         }
//       })
//       .from(cartItems)
//       .leftJoin(products, eq(cartItems.productId, products.id))
//       .leftJoin(creators, eq(products.creatorId, creators.id))
//       .leftJoin(users, eq(creators.userId, users.id))
//       .where(eq(cartItems.userId, session.user.id));

//     // Fetch saved items
//     const userSavedItems = await db
//       .select({
//         id: savedItems.id,
//         productId: savedItems.productId,
//         product: {
//           id: products.id,
//           name: products.name,
//           price: products.price,
//           image: products.image,
//           slug: products.slug,
//           stock: products.stock,
//         },
//         creator: {
//           id: creators.id,
//           name: users.name,
//           isVerified: creators.isVerified,
//         }
//       })
//       .from(savedItems)
//       .leftJoin(products, eq(savedItems.productId, products.id))
//       .leftJoin(creators, eq(products.creatorId, creators.id))
//       .leftJoin(users, eq(creators.userId, users.id))
//       .where(eq(savedItems.userId, session.user.id));

//     // Format cart items
//     const formattedCartItems = userCartItems.map(item => ({
//       id: item.product?.id || '',
//       name: item.product?.name || '',
//       price: Number(item.product?.price || 0),
//       image: item.product?.image || '',
//       slug: item.product?.slug || '',
//       quantity: item.quantity,
//       stock: item.product?.stock || 0,
//       variantId: item.variantId || undefined,
//       creator: {
//         id: item.creator?.id || '',
//         name: item.creator?.name || 'Unknown',
//         isVerified: item.creator?.isVerified || false,
//       }
//     }));

//     // Format saved items
//     const formattedSavedItems = userSavedItems.map(item => ({
//       id: item.product?.id || '',
//       name: item.product?.name || '',
//       price: Number(item.product?.price || 0),
//       image: item.product?.image || '',
//       slug: item.product?.slug || '',
//       stock: item.product?.stock || 0,
//       creator: {
//         id: item.creator?.id || '',
//         name: item.creator?.name || 'Unknown',
//         isVerified: item.creator?.isVerified || false,
//       }
//     }));

//     return NextResponse.json({
//       cartItems: formattedCartItems,
//       savedItems: formattedSavedItems,
//     });
//   } catch (error) {
//     console.error('Error fetching cart:', error);
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }

// export async function PUT(request: NextRequest) {
//   try {
//     const session = await auth();

//     if (!session?.user?.id) {
//       return NextResponse.json(
//         { error: 'Unauthorized' },
//         { status: 401 }
//       );
//     }

//     const {
//       cartItems: newCartItems = [],
//       savedItems: newSavedItems = []
//     }: {
//       cartItems?: CartItem[];
//       savedItems?: SavedItem[];
//     } = await request.json();

//     const db = await createDB();

//     // Clear existing cart items
//     await db
//       .delete(cartItems)
//       .where(eq(cartItems.userId, session.user.id));

//     // Clear existing saved items
//     await db
//       .delete(savedItems)
//       .where(eq(savedItems.userId, session.user.id));

//     // Insert new cart items
//     if (newCartItems.length > 0) {
//       await db.insert(cartItems).values(
//         newCartItems.map((item: CartItem) => ({
//           userId: session.user.id,
//           productId: item.id,
//           variantId: item.variantId || null,
//           quantity: item.quantity,
//         }))
//       );
//     }

//     // Insert new saved items
//     if (newSavedItems.length > 0) {
//       await db.insert(savedItems).values(
//         newSavedItems.map((item: SavedItem) => ({
//           userId: session.user.id,
//           productId: item.id,
//         }))
//       );
//     }

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error('Error updating cart:', error);
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }

// // POST - Add single item to cart
// export async function POST(request: NextRequest) {
//   try {
//     const session = await auth();

//     if (!session?.user?.id) {
//       return NextResponse.json(
//         { error: 'Unauthorized' },
//         { status: 401 }
//       );
//     }

//     const {
//       productId,
//       variantId,
//       quantity = 1,
//       saveForLater = false
//     }: {
//       productId: string;
//       variantId?: string | null;
//       quantity?: number;
//       saveForLater?: boolean;
//     } = await request.json();

//     if (!productId) {
//       return NextResponse.json(
//         { error: 'Product ID is required' },
//         { status: 400 }
//       );
//     }

//     const db = await createDB();

//     if (saveForLater) {
//       // Add to saved items
//       const existing = await db.query.savedItems.findFirst({
//         where: (items, { and, eq }) =>
//           and(
//             eq(items.userId, session.user.id),
//             eq(items.productId, productId)
//           ),
//       });

//       if (existing) {
//         return NextResponse.json(
//           { error: 'Item already saved' },
//           { status: 409 }
//         );
//       }

//       await db.insert(savedItems).values({
//         userId: session.user.id,
//         productId,
//       });

//       return NextResponse.json({
//         success: true,
//         message: 'Item saved for later'
//       });
//     } else {
//       // Add to cart
//       const existingCartItem = await db.query.cartItems.findFirst({
//         where: (items, { and, eq }) =>
//           and(
//             eq(items.userId, session.user.id),
//             eq(items.productId, productId),
//             variantId ? eq(items.variantId, variantId) : eq(items.variantId, "")
//           ),
//       });

//       if (existingCartItem) {
//         // Update quantity
//         await db
//           .update(cartItems)
//           .set({
//             quantity: existingCartItem.quantity + quantity,
//             updatedAt: new Date(),
//           })
//           .where(eq(cartItems.id, existingCartItem.id));

//         return NextResponse.json({
//           success: true,
//           message: 'Cart updated',
//         });
//       } else {
//         // Insert new item
//         await db.insert(cartItems).values({
//           userId: session.user.id,
//           productId,
//           variantId: variantId || null,
//           quantity,
//         });

//         return NextResponse.json({
//           success: true,
//           message: 'Item added to cart',
//         });
//       }
//     }
//   } catch (error) {
//     console.error('Error adding to cart:', error);
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }

// // DELETE - Remove item from cart
// export async function DELETE(request: NextRequest) {
//   try {
//     const session = await auth();

//     if (!session?.user?.id) {
//       return NextResponse.json(
//         { error: 'Unauthorized' },
//         { status: 401 }
//       );
//     }

//     const { searchParams } = new URL(request.url);
//     const productId = searchParams.get('productId');
//     const variantId = searchParams.get('variantId');
//     const isSaved = searchParams.get('saved') === 'true';

//     if (!productId) {
//       return NextResponse.json(
//         { error: 'Product ID is required' },
//         { status: 400 }
//       );
//     }

//     const db = await createDB();

//     if (isSaved) {
//       // Remove from saved items
//       await db
//         .delete(savedItems)
//         .where(
//           eq(savedItems.userId, session.user.id) &&
//           eq(savedItems.productId, productId)
//         );
//     } else {
//       // Remove from cart
//       const conditions = [
//         eq(cartItems.userId, session.user.id),
//         eq(cartItems.productId, productId),
//       ];

//       if (variantId) {
//         conditions.push(eq(cartItems.variantId, variantId));
//       }

//       await db
//         .delete(cartItems)
//         .where(and(...conditions));
//     }

//     return NextResponse.json({
//       success: true,
//       message: isSaved ? 'Removed from saved items' : 'Removed from cart',
//     });
//   } catch (error) {
//     console.error('Error removing from cart:', error);
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }
