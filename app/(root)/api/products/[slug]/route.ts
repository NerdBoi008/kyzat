import { NextResponse } from "next/server";
import { createDB } from "@/lib/db/src";
import {
  creators,
  productCategories,
  products,
  productVariants,
  users,
  reviews,
} from "@/lib/db/schema";
import { eq, and, ne, inArray, desc } from "drizzle-orm";
import { ProductWithRelations } from "../route";
import { calculateRatingDistribution, calculateTimeAgo } from "@/lib/utils";

type RelatedProductRow = {
  id: string;
  name: string;
  slug: string;
  price: number | string | null;
  image: string | null;
  rating: number | string | null;
  creatorId: string | null;
  creatorName: string | null;
  creatorAvatar: string | null;
  creatorVerified: boolean | null;
  reviews?: string[];
};

export type ProductApiResponse = {
  success: boolean;
  data?: ProductWithRelations;
  message?: string;
};

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const db = await createDB();
    const { slug } = await params;

    // First, get the main product data
    const productResult = await db
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
          relatedProducts: products.relatedProducts,
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
      })
      .from(products)
      .leftJoin(
        productCategories,
        eq(products.categoryId, productCategories.id)
      )
      .leftJoin(creators, eq(products.creatorId, creators.id))
      .leftJoin(users, eq(creators.userId, users.id))
      .where(eq(products.slug, slug))
      .limit(1);

    if (!productResult.length) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    const productData = productResult[0];

    // Fetch all variants for this product
    const variantsResult = await db
      .select({
        id: productVariants.id,
        productId: productVariants.productId,
        name: productVariants.name,
        price: productVariants.price,
        stock: productVariants.stock,
        created_at: productVariants.createdAt,
        updated_at: productVariants.updatedAt,
      })
      .from(productVariants)
      .where(eq(productVariants.productId, productData.product.id));

    // Fetch reviews for this product with user information
    const reviewsResult = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        created_at: reviews.createdAt,
        updated_at: reviews.createdAt,
        user: {
          id: users.id,
          name: users.name,
          avatar: users.image,
        },
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.productId, productData.product.id))
      .orderBy(desc(reviews.createdAt)) // Most recent reviews first
      .limit(20); // Limit to 20 reviews initially

    // Calculate average rating from actual reviews
    const avgRating =
      reviewsResult.length > 0
        ? reviewsResult.reduce((sum, review) => sum + review.rating, 0) /
          reviewsResult.length
        : 0;

    // Fetch related products using the relatedProduct array IDs
    let relatedProductsResult: RelatedProductRow[] = [];
    let moreFromCreatorResult: RelatedProductRow[] = [];

    // Get products from the relatedProduct array with creator info
    if (
      productData.product.relatedProducts &&
      productData.product.relatedProducts.length > 0
    ) {
      relatedProductsResult = await db
        .select({
          id: products.id,
          name: products.name,
          slug: products.slug,
          price: products.price,
          image: products.image,
          rating: products.rating,
          creatorId: products.creatorId,
          creatorName: users.name,
          creatorAvatar: users.image,
          creatorVerified: creators.isVerified,
        })
        .from(products)
        .leftJoin(creators, eq(products.creatorId, creators.id))
        .leftJoin(users, eq(creators.userId, users.id))
        .where(inArray(products.id, productData.product.relatedProducts));
    }

    // Get more products from the same creator as fallback
    moreFromCreatorResult = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        price: products.price,
        image: products.image,
        rating: products.rating,
        creatorId: products.creatorId,
        creatorName: users.name,
        creatorAvatar: users.image,
        creatorVerified: creators.isVerified,
      })
      .from(products)
      .leftJoin(creators, eq(products.creatorId, creators.id))
      .leftJoin(users, eq(creators.userId, users.id))
      .where(
        and(
          eq(products.creatorId, productData.product.creatorId),
          ne(products.id, productData.product.id)
        )
      )
      .limit(6);

    // Format the response
    const formattedResult: ProductWithRelations = {
      product: {
        ...productData.product,
        highlights: productData.product.highlights ?? [],
        care: productData.product.care ?? "",
        shipping: productData.product.shipping ?? "",
        returns: productData.product.returns ?? "",
        otherImages: productData.product.otherImages ?? [],
        relatedProducts: productData.product.relatedProducts ?? [],
        materials: productData.product.materials ?? [],
        description: productData.product.description ?? "",
        // Use calculated rating from reviews if available, otherwise use stored rating
        rating:
          reviewsResult.length > 0
            ? avgRating
            : productData.product.rating !== null
            ? Number(productData.product.rating)
            : 0,
        stock:
          productData.product.stock !== null ? productData.product.stock : 0,
        attributes: productData.product.attributes ?? undefined,
        isFeatured: false,
      },
      variants: variantsResult.map((variant) => ({
        id: variant.id,
        name: variant.name,
        price: variant.price !== null && variant.price !== undefined ? String(variant.price) : "0",
        createdAt: variant.created_at,
        updatedAt: variant.updated_at,
        stock: variant.stock ?? null,
        productId: variant.productId,
      })),
      // Real reviews from the reviews table
      productReviews: reviewsResult.map((review) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment ?? "",
        created_at: review.created_at ? review.created_at.toISOString() : "",
        updated_at: review.updated_at ? review.updated_at.toISOString() : "",
        user: {
          id: review.user?.id ?? "",
          name: review.user?.name ?? "Anonymous",
          avatar: review.user?.avatar ?? "",
        },
        // Calculate time ago for display
        timeAgo: calculateTimeAgo(review.created_at),
        verified: true, // All reviews from logged-in users are considered verified
      })),
      // Review statistics
      reviewStats: {
        totalReviews: reviewsResult.length,
        averageRating: avgRating,
        ratingDistribution: calculateRatingDistribution(reviewsResult),
      },
      relatedProducts: relatedProductsResult.map((relatedProduct) => ({
        id: relatedProduct.id,
        name: relatedProduct.name,
        slug: relatedProduct.slug,
        price:
          typeof relatedProduct.price === "string"
            ? Number(relatedProduct.price)
            : Number(relatedProduct.price),
        image: relatedProduct.image ?? "",
        rating:
          typeof relatedProduct.rating === "string"
            ? Number(relatedProduct.rating)
            : relatedProduct.rating ?? 0,
        reviews: relatedProduct.reviews ?? [],
        creator: {
          id: relatedProduct.creatorId ?? "",
          name: relatedProduct.creatorName ?? "Unknown Creator",
          avatar: relatedProduct.creatorAvatar ?? "",
          isVerified: relatedProduct.creatorVerified ?? false,
        },
      })),
      moreFromCreator: moreFromCreatorResult.map((creatorProduct) => ({
        id: creatorProduct.id,
        name: creatorProduct.name,
        slug: creatorProduct.slug,
        price:
          typeof creatorProduct.price === "string"
            ? Number(creatorProduct.price)
            : Number(creatorProduct.price),
        image: creatorProduct.image ?? "",
        rating:
          typeof creatorProduct.rating === "string"
            ? Number(creatorProduct.rating)
            : creatorProduct.rating ?? 0,
        reviews: creatorProduct.reviews ?? [],
        creator: {
          id: creatorProduct.creatorId ?? "",
          name: creatorProduct.creatorName ?? "Unknown Creator",
          avatar: creatorProduct.creatorAvatar ?? "",
          isVerified: creatorProduct.creatorVerified ?? false,
        },
      })),
      category: productData?.category
        ? {
            id: productData.category.id,
            name: productData.category.name,
            slug: productData.category.slug ?? "",
          }
        : { id: "", name: "", slug: "" },
      creator: {
        id: productData?.creator?.id ?? "",
        userId: productData?.creator?.userId ?? "",
        followers: productData?.creator?.followers ?? 0,
        following: productData?.creator?.following ?? 0,
        image: productData?.creator?.image ?? "",
        story: productData?.creator?.story ?? "",
        description: productData?.creator?.description ?? "",
        location: productData?.creator?.location ?? "",
        category: productData?.creator?.category ?? "",
        rating: Number(productData?.creator?.rating) ?? 0,
        sales: productData?.creator?.sales ?? 0,
        isVerified: productData?.creator?.isVerified ?? false,
        isFeatured: productData?.creator?.isFeatured ?? false,
        joined: productData?.creator?.joined?.toISOString() ?? "",
        categories: productData?.creator?.categories ?? [],
        user: productData?.user
          ? {
              ...productData.user,
              role: ["customer", "creator", "admin"].includes(
                productData.user.role
              )
                ? (productData.user.role as "customer" | "creator" | "admin")
                : "customer",
              creatorStatus: [
                "none",
                "pending",
                "approved",
                "rejected",
              ].includes(productData.user.creatorStatus ?? "")
                ? ((productData.user.creatorStatus ?? "none") as
                    | "none"
                    | "pending"
                    | "approved"
                    | "rejected")
                : "none",
              avatar: productData.user.avatar ?? "",
              bio: productData.user.bio ?? "",
              location: productData.user.location ?? "",
              website: productData.user.website ?? "",
              socialLinks: productData.user.socialLinks ?? {},
              created_at: productData.user.created_at
                ? productData.user.created_at.toISOString()
                : "",
              updated_at: productData.user.updated_at
                ? productData.user.updated_at.toISOString()
                : "",
            }
          : {
              id: "",
              role: "customer",
              creatorStatus: "none",
              name: "",
              email: "",
              avatar: "",
              bio: "",
              location: "",
              website: "",
              socialLinks: {},
              created_at: "",
              updated_at: "",
            },
      },
    };

    return NextResponse.json({
      success: true,
      data: formattedResult,
    });
  } catch (error) {
    console.error("❌ Error fetching product:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
