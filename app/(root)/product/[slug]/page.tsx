"use client";

import { useState, use, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Star,
  Heart,
  Share,
  Truck,
  Shield,
  ArrowLeft,
  Check,
  Minus,
  Plus,
  MessageCircle,
  MapPin,
  Users,
  ShoppingCart,
} from "lucide-react";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ProductWithRelations } from "@/app/(root)/api/products/route";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useCart } from "@/hooks/useCart";
import Image from "next/image";

interface Review {
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
  }

interface RelatedProduct {
  id: string;
  name: string;
  slug?: string | undefined;
  price: number;
  image: string;
  rating: number;
  creator: {
    id: string;
    name: string;
    avatar?: string;
    isVerified: boolean;
  };
}

// Reusable Components
const RatingStars = ({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "md" | "lg";
}) => {
  const starSize =
    size === "sm" ? "h-4 w-4" : size === "md" ? "h-5 w-5" : "h-6 w-6";

  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`${starSize} ${
            i < Math.floor(rating)
              ? "text-amber-500 fill-current"
              : "text-muted-foreground"
          }`}
        />
      ))}
    </div>
  );
};

const QuantitySelector = ({
  quantity,
  onDecrease,
  onIncrease,
  maxStock = 100,
}: {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  maxStock?: number;
}) => (
  <div className="flex items-center border rounded-lg">
    <button
      className="px-3 py-2 disabled:opacity-50"
      onClick={onDecrease}
      disabled={quantity <= 1}
      aria-label="Decrease quantity"
    >
      <Minus className="h-4 w-4" />
    </button>
    <span className="px-3 py-2 border-x min-w-12 text-center">
      {quantity}
    </span>
    <button
      className="px-3 py-2 disabled:opacity-50"
      onClick={onIncrease}
      disabled={quantity >= maxStock}
      aria-label="Increase quantity"
    >
      <Plus className="h-4 w-4" />
    </button>
  </div>
);

const ReviewCard = ({ review }: { review: Review }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold">{review.user.name}</h3>
          <div className="flex items-center mt-1">
            <RatingStars rating={review.rating} size="sm" />
            {review.verified && (
              <Badge variant="secondary" className="ml-2">
                Verified Purchase
              </Badge>
            )}
          </div>
        </div>
        <span className="text-sm text-muted-foreground">{review.timeAgo}</span>
      </div>
      <CardDescription>{review.comment}</CardDescription>
    </CardContent>
  </Card>
);

const RelatedProductCard = ({ product }: { product: RelatedProduct }) => (
  <Card className="overflow-hidden hover:shadow-md transition">
    <div className="h-48 bg-muted relative">
      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
        Product Image
      </div>
    </div>

    <CardContent className="p-4">
      <h3 className="font-semibold text-lg">{product.name}</h3>
      <CardDescription className="mt-1">
        By {product.creator.name}
      </CardDescription>
      <div className="flex gap-5 items-center mt-3">
        <span className="font-bold text-primary">₹{product.price}</span>
        <div className="flex items-center">
          <RatingStars rating={product.rating} size="sm" />
          <span className="text-sm ml-1">{product.rating}</span>
        </div>
      </div>
      <Button asChild variant="outline" className="w-full mt-4">
        <Link href={`/product/${product.slug}`}>View Details</Link>
      </Button>
    </CardContent>
  </Card>
);

const VariantSelector = ({
  variants,
  selectedVariant,
  onVariantChange,
  basePrice,
}: {
  variants: Array<{ id: string; name: string; price: number; stock: number }>;
  selectedVariant: string | null;
  onVariantChange: (variantId: string) => void;
  basePrice: number;
}) => {

  useEffect(() => {
    if (!selectedVariant && variants.length > 0) {
      onVariantChange(variants[0].id);
    }
  }, [selectedVariant, variants, onVariantChange]);
  
  return (
  <div className="space-y-3">
    {variants.map((variant) => {
      const priceDifference = variant.price - basePrice;
      const isSelected = selectedVariant === variant.id;

      return (
        <div
          key={variant.id}
          className={`border rounded-lg p-4 cursor-pointer transition-all ${
            isSelected
              ? "border-primary bg-primary/5"
              : "border-gray-200 hover:border-gray-300"
          }`}
          onClick={() => onVariantChange(variant.id)}
        >
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium">{variant.name}</div>
              <div className="text-sm text-muted-foreground">
                Stock: {variant.stock} available
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-primary">₹{variant.price}</div>
              {priceDifference !== 0 && (
                <div className="text-xs text-muted-foreground">
                  {priceDifference > 0 ? "+" : ""}₹{priceDifference.toFixed(2)}
                </div>
              )}
            </div>
          </div>
          {isSelected && (
            <div className="mt-2 flex items-center text-primary text-sm">
              <Check className="h-4 w-4 mr-1" />
              Selected
            </div>
          )}
        </div>
      );
    })}
  </div>
)};

const fetchProduct = async (
  url: string
): Promise<{ success: boolean; data: ProductWithRelations }> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  const router = useRouter();
  const { slug } = use(params);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  // const [selectedVariant, setSelectedVariant] = useState("");
  const [userSelectedVariantId, setUserSelectedVariantId] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const { addToCart, isInCart } = useCart();

  const {
    data: productResponse,
    error: productError,
    isLoading: productLoading,
  } = useSWR(slug ? `/api/products/${slug}` : null, fetchProduct, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 60000,
    errorRetryCount: 3,
    errorRetryInterval: 5000,
  });

  const handleQuantityChange = (amount: number) => {
    setQuantity((prev) => Math.max(1, prev + amount));
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  // Extract product data
  const productData = productResponse?.success ? productResponse.data : null;
  const product = productData?.product;
  const creator = productData?.creator;
  // Derive the selected variant ID (user choice OR first variant as default)
  const selectedVariantId = userSelectedVariantId || productData?.variants?.[0]?.id || null;
  const currentVariant = productData?.variants?.find(
    (v) => v.id === selectedVariantId
  );

  // Get selected variant details and calculate price
  const basePrice = Number(product?.price) || 0;
  const displayPrice: number = Number(currentVariant?.price) || basePrice;
  const hasVariantPricing: boolean =
    !!(currentVariant && Number(currentVariant.price) !== basePrice);

  // Loading state
  if (productLoading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          {/* Breadcrumb skeleton */}
          <div className="h-4 bg-muted animate-pulse rounded w-1/2 mb-6"></div>

          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Image skeleton */}
            <div>
              <div className="h-96 bg-muted animate-pulse rounded mb-4"></div>
              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-20 bg-muted animate-pulse rounded"
                  ></div>
                ))}
              </div>
            </div>

            {/* Content skeleton */}
            <div className="space-y-4">
              <div className="h-8 bg-muted animate-pulse rounded"></div>
              <div className="h-4 bg-muted animate-pulse rounded w-1/2"></div>
              <div className="h-6 bg-muted animate-pulse rounded w-1/3"></div>
              <div className="h-12 bg-muted animate-pulse rounded"></div>
              <div className="h-10 bg-muted animate-pulse rounded"></div>
              <div className="h-16 bg-muted animate-pulse rounded"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (productError || !productResponse?.success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">😞</div>
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The product you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            <Button asChild>
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!product || !creator) {
    return null;
  }

  // Get images for thumbnail navigation
  const productImages = product.otherImages || [];
  const allImages = product.image ? [product.image, ...productImages] : productImages;

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-muted-foreground mb-6">
          <Link href="/shop" className="hover:text-primary flex items-center">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Shop
          </Link>
          <span className="mx-2">/</span>
          <Link
            href={`/category/${productData.category.slug}`}
            className="hover:text-primary capitalize"
          >
            {productData.category.name}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <div>
            <Card className="overflow-hidden mb-4">
              <Image
                src={allImages[selectedImage]}
                alt={product.name}
                width={600}
                height={600}
                className="w-full h-96 object-cover"
              />
            </Card>

            <div className="grid grid-cols-4 gap-2">
              {allImages.map((image, index) => (
                <Image 
                  key={index} 
                  src={image} 
                  alt={`Product Image ${index + 1}`}
                  width={80}
                  height={80}
                  className={`h-20 w-full object-cover rounded cursor-pointer ${selectedImage === index ? "ring-2 ring-primary" : ""}`}
                  onClick={() => setSelectedImage(index)}
                />
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                <Link href={`/creator/${productData.creator.id}`}>
                  <CardDescription className="hover:text-primary cursor-pointer">
                    By {productData.creator.user.name}
                  </CardDescription>
                </Link>
              </div>

              <div className="flex space-x-2">
                <Button variant="ghost" size="icon" onClick={toggleFavorite}>
                  <Heart
                    className={`h-5 w-5 ${
                      isFavorite ? "fill-red-500 text-red-500" : ""
                    }`}
                  />
                </Button>
                <Button variant="ghost" size="icon">
                  <Share className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center mb-6">
              <RatingStars rating={product.rating} size="md" />
              <CardDescription className="ml-2">
                {product.rating} ({product.reviews} reviews)
              </CardDescription>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-primary">
                  ₹{displayPrice}
                </span>
                {hasVariantPricing && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">
                      ₹{basePrice}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {displayPrice > basePrice
                        ? `+₹${displayPrice - basePrice}`
                        : `-₹${basePrice - displayPrice}`}
                    </Badge>
                  </>
                )}
              </div>
              {hasVariantPricing && (
                <p className="text-sm text-muted-foreground mt-1">
                  Price varies by selected option
                </p>
              )}
            </div>

            {/* Variants */}
            {productData.variants && productData.variants.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium mb-3">Select Option:</h3>
                <VariantSelector
                  variants={productData.variants.map(v => ({
                    id: v.id,
                    name: v.name,
                    price: Number(v.price),
                    stock: v.stock ?? 0
                  }))}
                  selectedVariant={selectedVariantId}
                  onVariantChange={(varaintId: string) => {
                    setUserSelectedVariantId(varaintId);
                  }}
                  basePrice={basePrice}
                />
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="mb-6">
              <div className="flex items-center space-x-4 mb-3">
                <QuantitySelector
                  quantity={quantity}
                  maxStock={currentVariant?.stock || product.stock}
                  onDecrease={() => handleQuantityChange(-1)}
                  onIncrease={() => handleQuantityChange(1)}
                />

                <div className="flex-1">
                  {isInCart(product.id, currentVariant?.id) ? (
                    <Button>
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Already in the Cart
                    </Button>
                  ) : (
                  <Button
                    className="w-full"
                    size="lg"
                    disabled={(currentVariant?.stock || product.stock) === 0}
                    onClick={() => {
                      addToCart({
                        slug: product.slug,
                        creator: {
                          id: creator.id,
                          name: creator.user.name,
                          isVerified: creator.isVerified ?? false
                        },
                        image: product.image,
                        id: product.id,
                        name: product.name,
                        price: Number(product.price),
                        variantId: currentVariant?.id,
                        stock: currentVariant?.stock || product.stock
                      }, quantity)
                    }}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    {(currentVariant?.stock || product.stock) === 0
                      ? "Out of Stock"
                      : "Add to Cart"}
                  </Button>

                  )}
                </div>
              </div>

              {/* Show total price for selected quantity */}
              {quantity > 1 && (
                <div className="text-sm text-muted-foreground">
                  Total: ₹{(displayPrice * quantity).toFixed(2)} ({quantity} × ₹
                  {displayPrice})
                </div>
              )}

              {(currentVariant?.stock || product.stock) === 0 && (
                <Alert variant="destructive" className="mt-2">
                  <AlertTitle>Out of Stock</AlertTitle>
                  <AlertDescription>
                    This item is currently unavailable
                  </AlertDescription>
                </Alert>
              )}
              {(currentVariant?.stock || product.stock) > 0 &&
                (currentVariant?.stock || product.stock) < 10 && (
                  <Alert
                    variant="default"
                    className="bg-amber-50 border-amber-200 text-amber-800 mt-2"
                  >
                    <AlertTitle>Low Stock</AlertTitle>
                    <AlertDescription>
                      Only {currentVariant?.stock || product.stock} left in
                      stock
                    </AlertDescription>
                  </Alert>
                )}
            </div>

            {/* Shipping and Guarantee */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center">
                <Truck className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-sm">Free shipping over ₹50</p>
              </div>
              <div className="text-center">
                <Shield className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-sm">30-day returns</p>
              </div>
              <div className="text-center">
                <Check className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-sm">Handmade quality</p>
              </div>
            </div>

            {/* Creator Info */}
            <Card className="mb-8">
              <CardContent className="p-4">
                <div className="flex items-center mb-4">
                  <Avatar className="w-12 h-12 mr-3">
                    <AvatarFallback>EP</AvatarFallback>
                    <AvatarImage
                      src={productData.creator.image}
                      alt={productData.creator.user.name}
                    />
                  </Avatar>
                  <div>
                    <Link href={`/creator/${productData.creator.id}`}>
                      <h3 className="font-semibold hover:text-primary cursor-pointer">
                        {productData.creator.user.name}
                      </h3>
                    </Link>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3 mr-1" />
                      {productData.creator.location}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>
                      {productData.creator.followers.toLocaleString()} followers
                    </span>
                  </div>
                  <div className="flex items-center">
                    <RatingStars
                      rating={productData.creator.rating}
                      size="sm"
                    />
                    <span className="ml-1">{productData.creator.rating}</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full mt-4">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message Creator
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Product Tabs */}
        <Tabs defaultValue="description" className="mb-12">
          <TabsList className="w-full justify-start p-0 bg-transparent h-auto border-b rounded-none">
            <TabsTrigger
              value="description"
              className="py-3 px-1 mr-8 border-0 data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:border-b-3 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none"
            >
              Description
            </TabsTrigger>
            <TabsTrigger
              value="details"
              className="py-3 px-1 mr-8 border-0 data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:border-b-3 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none"
            >
              Details
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="py-3 px-1 mr-8 border-0 data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:border-b-3 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none"
            >
              Reviews ({productData.productReviews?.length})
            </TabsTrigger>
            <TabsTrigger
              value="shipping"
              className="py-3 px-1 mr-8 border-0 data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:border-b-3 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none"
            >
              Shipping & Returns
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="py-8">
            <CardDescription className="mb-6">
              {product.description}
            </CardDescription>
            <Card className="bg-primary-50 border-primary-100">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">Why you&apos;ll love it:</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>
                    Each piece is completely unique with organic glaze patterns
                  </li>
                  <li>Perfect weight and balance for comfortable daily use</li>
                  <li>Food-safe glaze makes it practical for everyday use</li>
                  <li>
                    Supports independent artists and sustainable craftsmanship
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="py-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold mb-3">Product Highlights</h3>
                <ul className="space-y-2 text-muted-foreground">
                  {product.highlights?.map((detail, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 shrink-0 mt-0.5" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Materials & Care</h3>
                <p className="text-muted-foreground mb-4">
                  <strong>Materials:</strong> {product.materials}
                </p>
                <p className="text-muted-foreground">
                  <strong>Care:</strong> {product.care}
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="py-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <div className="text-4xl font-bold mr-4">{product.rating}</div>
                <div>
                  <RatingStars rating={product.rating} size="md" />
                  <CardDescription>
                    Based on {product.reviews} reviews
                  </CardDescription>
                </div>
              </div>

              <Button>Write a Review</Button>
            </div>

            <div className="space-y-6">
              {productData.productReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>

            <Button variant="outline" className="mt-8">
              Load More Reviews
            </Button>
          </TabsContent>

          <TabsContent value="shipping" className="py-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold mb-3">Shipping Information</h3>
                <CardDescription className="mb-4">
                  {product.shipping}
                </CardDescription>
                <CardDescription>
                  All items are carefully packaged to ensure they arrive safely.
                  You will receive a tracking number once your order ships.
                </CardDescription>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Return Policy</h3>
                <CardDescription className="mb-4">
                  {product.returns}
                </CardDescription>
                <CardDescription>
                  If you&apos;re not completely satisfied with your purchase,
                  please contact us within 30 days of receipt. Return shipping
                  is the responsibility of the customer unless the item arrived
                  damaged or defective.
                </CardDescription>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {productData.relatedProducts &&
          productData.relatedProducts.length > 0 && (
            <div className="mb-16">
              <h2 className="text-2xl font-bold mb-8">Related Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {productData.relatedProducts.map((relatedProduct) => (
                  <RelatedProductCard
                    key={relatedProduct.id}
                    product={relatedProduct}
                  />
                ))}
              </div>
            </div>
          )}

        {/* More from Creator Section */}
        {productData.moreFromCreator &&
          productData.moreFromCreator.length > 0 && (
            <div className="mb-16">
              <h2 className="text-2xl font-bold mb-8">
                More from {creator.user.name}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {productData.moreFromCreator
                  .slice(0, 6)
                  .map((creatorProduct) => (
                    <RelatedProductCard
                      key={creatorProduct.id}
                      product={creatorProduct}
                    />
                  ))}
              </div>
            </div>
          )}
      </main>
    </div>
  );
}