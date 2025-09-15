"use client";

import { useState } from "react";
import Link from "next/link";
import { Product, Creator, ProductCategory, User } from "@/lib/db/schema/index";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { CircleCheckIcon, MapPin, Star, Users } from "lucide-react";
import useSWR from "swr";
import { FollowButton } from "@/components/common/follow-button";
import { Badge } from "@/components/ui/badge";

export interface CreatorWithUser extends Omit<Creator, "userId"> {
  user: User; // Full user object instead of just userId string
}

type ProductAlias = Product & {
  creator: CreatorWithUser;
  category: ProductCategory;
};

interface APIResponse {
  success: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  data: Array<{
    product: Product;
    category: ProductCategory;
    creator: CreatorWithUser;
    user: User;
  }>;
}

interface CreatorAPIResponse {
  success: boolean;
  timeframe: string;
  criteria: string;
  data: CreatorWithUser[];
}

// Properly typed fetcher functions
const fetchProducts = async (url: string): Promise<APIResponse> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

const fetchCreators = async (url: string): Promise<CreatorAPIResponse> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("all");

  // SWR for products with category-based key
  const productsKey = `/api/products?page=1&limit=8&featured=true${
    activeCategory !== "all"
      ? `&category=${
          activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)
        }`
      : ""
  }`;

  const {
    data: productsData,
    error: productsError,
    isLoading: productsLoading,
    mutate: mutateProducts,
  } = useSWR<APIResponse>(productsKey, fetchProducts, {
    revalidateOnFocus: false, // Don't refetch on window focus
    revalidateOnReconnect: true, // Refetch on reconnect
    dedupingInterval: 60000, // Dedupe requests within 60 seconds
    focusThrottleInterval: 300000, // Throttle focus revalidation to 5 minutes
  });

  // SWR for top creators
  const {
    data: creatorsResponse,
    error: creatorsError,
    isLoading: creatorsLoading,
    mutate: mutateCreators,
  } = useSWR<{ success: boolean; data: CreatorWithUser[] }>(
    "/api/creators/top?limit=6&timeframe=overall&verified=true",
    fetchCreators,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 300000, // Cache for 5 minutes since creators data changes less frequently
    }
  );

  const products: ProductAlias[] = productsData?.success
    ? productsData.data.map((item) => ({
        ...item.product,
        creator: {
          ...item.creator,
          user: item.user,
        },
        category: item.category,
      }))
    : [];

  // Transform creators data
  const topCreators: CreatorWithUser[] = creatorsResponse?.success
    ? creatorsResponse.data
    : [];

  const categories: ProductCategory[] = [
    {
      id: "all",
      name: "All Products",
      icon: "🛍️",
      createdAt: new Date(),
      updatedAt: new Date(),
      image: null,
      description: null,
      slug: "",
      productCount: null,
      featured: null
    },
    {
      id: "clothing",
      name: "Clothing",
      icon: "👕",
      createdAt: new Date(),
      updatedAt: new Date(),
      image: null,
      description: null,
      slug: "",
      productCount: null,
      featured: null
    },
    {
      id: "jewelry",
      name: "Jewelry",
      icon: "💍",
      createdAt: new Date(),
      updatedAt: new Date(),
      image: null,
      description: null,
      slug: "",
      productCount: null,
      featured: null
    },
    {
      id: "crockery",
      name: "Crockery",
      icon: "🍽️",
      createdAt: new Date(),
      updatedAt: new Date(),
      image: null,
      description: null,
      slug: "",
      productCount: null,
      featured: null
    },
    {
      id: "art",
      name: "Art",
      icon: "🎨",
      createdAt: new Date(),
      updatedAt: new Date(),
      image: null,
      description: null,
      slug: "",
      productCount: null,
      featured: null
    },
    {
      id: "home",
      name: "Home Decor",
      icon: "🏠",
      createdAt: new Date(),
      updatedAt: new Date(),
      image: null,
      description: null,
      slug: "",
      productCount: null,
      featured: null
    },
  ];

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary to-secondary text-primary-foreground py-12 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">
            Discover Local Creativity
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-6 md:mb-8">
            Connect with local artisans, discover unique products, and support
            your community&apos;s creative economy.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4">
            <Button
              size="lg"
              className="bg-background text-foreground hover:bg-muted"
            >
              <Link href={"/products"}>
                Explore Products
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-background text-background hover:bg-background hover:text-foreground bg-transparent"
            >
              <Link href={'/profile'}>
                Become a Creator
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-8 md:py-12 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-12">
            Shop by Category
          </h2>

          {/* Mobile category selector */}
          <div className="block md:hidden mb-6">
            <Tabs
              value={activeCategory}
              onValueChange={setActiveCategory}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 mb-4">
                {categories.slice(0, 3).map((category) => (
                  <TabsTrigger key={category.id} value={category.id}>
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsList className="grid grid-cols-3">
                {categories.slice(3).map((category) => (
                  <TabsTrigger key={category.id} value={category.id}>
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Desktop category grid */}
          <div className="hidden md:grid grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className={`flex flex-col items-center p-4 md:p-6 rounded-lg cursor-pointer transition-all ${
                  activeCategory === category.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
                onClick={() => setActiveCategory(category.id)}
              >
                <span className="text-2xl md:text-3xl mb-2 md:mb-3">
                  {category.icon}
                </span>
                <span className="font-medium text-center text-sm md:text-base">
                  {category.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-8 md:py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
            <h2 className="text-2xl md:text-3xl font-bold">
              {activeCategory === "all"
                ? "Featured Products"
                : `${
                    categories.find((c) => c.id === activeCategory)?.name
                  } Products`}
            </h2>
            <Link
              href="/products"
              className="text-primary hover:text-primary/80 font-medium flex items-center"
            >
              View all <span className="ml-1">&rarr;</span>
            </Link>
          </div>

          {/* Loading State */}
          {productsLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(4)].map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <div className="h-40 md:h-48 bg-muted animate-pulse"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded animate-pulse mb-2"></div>
                    <div className="h-3 bg-muted rounded animate-pulse w-2/3"></div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <div className="w-full h-10 bg-muted rounded animate-pulse"></div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {/* Error State */}
          {productsError && (
            <div className="text-center py-12">
              <div className="text-red-500 mb-4">
                <span className="text-4xl">⚠️</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Something went wrong
              </h3>
              <p className="text-muted-foreground mb-4">{productsError}</p>
              <Button onClick={() => mutateProducts()}>Try Again</Button>
            </div>
          )}

          {/* No Products Found */}
          {!productsLoading && !productsError && products.length === 0 && (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                <span className="text-4xl">📦</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground mb-4">
                {activeCategory === "all"
                  ? "No products are currently available."
                  : `No products found in the ${
                      categories.find((c) => c.id === activeCategory)?.name
                    } category.`}
              </p>
              <Button onClick={() => handleCategoryChange("all")}>
                View All Products
              </Button>
            </div>
          )}

          {/* Products Grid */}
          {!productsLoading && !productsError && products.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => (
                <Card
                  key={product.id}
                  className="overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="h-40 md:h-48 bg-muted relative">
                    {product.image ? (
                      <Image
                        src={product.image ?? "/placeholder-image.png"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        height={100}
                        width={100}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                        Product Image
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-base md:text-lg line-clamp-1">
                        {product.name}
                      </h3>
                      <span className="font-bold text-primary">
                        ₹{product.price}
                      </span>
                    </div>
                    <Link
                      href={`/creator/${product.creator.user.id
                        .replace(/\s+/g, "-")
                        .toLowerCase()}`}
                    >
                      <span className="text-muted-foreground text-sm mt-1 block hover:text-primary cursor-pointer">
                        By {product.creator.user.name}
                      </span>
                    </Link>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button className="w-full">Add to Cart</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Top Creators */}
      <section className="py-8 md:py-12 bg-card">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Top Creators</h2>
              <p className="text-muted-foreground mt-1">
                Discover our most successful artisans
              </p>
            </div>
            <Link
              href="/creators"
              className="text-primary hover:text-primary/80 font-medium flex items-center"
            >
              View all <span className="ml-1">&rarr;</span>
            </Link>
          </div>

          {/* Loading State */}
          {creatorsLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[...Array(6)].map((_, index) => (
                <Card key={index} className="text-center p-4 md:p-6">
                  <div className="w-16 h-16 md:w-20 md:h-20 mx-auto rounded-full bg-muted animate-pulse mb-4"></div>
                  <div className="h-4 bg-muted rounded animate-pulse mb-2"></div>
                  <div className="h-3 bg-muted rounded animate-pulse w-2/3 mx-auto"></div>
                </Card>
              ))}
            </div>
          )}

          {/* Error State */}
          {creatorsError && (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">{creatorsError}</p>
              <Button onClick={() => mutateCreators()} variant="outline">
                Try Again
              </Button>
            </div>
          )}

          {/* Top Creators Grid */}
          {!creatorsLoading && !creatorsError && topCreators.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {topCreators.map((creator) => (
                <Card
                  key={creator.id}
                  className="overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="h-32 md:h-40 bg-muted relative">
                    {creator.coverImage ? (
                      <Image
                        src={creator.coverImage}
                        alt={`${creator.user?.name || "Creator"}'s cover image`}
                        fill
                        className="object-cover"
                        priority={false}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
                        No cover image
                      </div>
                    )}
                    <div className="absolute -bottom-6 left-4 w-12 h-12 md:w-14 md:h-14 rounded-full border-4 border-background bg-card overflow-hidden">
                      {creator.image ? (
                        <Image
                          src={creator.image ?? "/placeholder-image.png"} // Replace with actual avatar
                          alt={creator.user?.name || "Creator"}
                          className="w-full h-full object-cover"
                          height={56}
                          width={56}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                          {creator.user?.name?.[0]?.toUpperCase() || "A"}
                        </div>
                      )}
                    </div>
                  </div>

                  <CardContent className="pt-8 md:pt-10 px-4 pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <h3 className="font-semibold text-base md:text-lg line-clamp-1">
                            {creator.user?.name || "Unknown Creator"}
                          </h3>
                          {creator.isVerified && (
                            <CircleCheckIcon className="fill-blue-500 stroke-white size-4 flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center text-xs md:text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="line-clamp-1">
                            {creator.location ||
                              creator.user?.location ||
                              "Location not specified"}
                          </span>
                        </div>
                      </div>

                      <FollowButton
                        creatorId={creator.id}
                        creatorName={creator.user.name}
                        variant={"outline"}
                        size={"sm"}
                      />
                    </div>

                    <p className="text-xs md:text-sm text-muted-foreground mb-3 line-clamp-2">
                      {creator.description ||
                        creator.story ||
                        "No description available"}
                    </p>

                    <div className="flex justify-between text-xs md:text-sm mb-3">
                      <div className="flex items-center">
                        <Users className="h-3 w-3 md:h-4 md:w-4 mr-1 text-muted-foreground" />
                        <span>{(creator.followers || 0).toLocaleString()}</span>
                      </div>

                      <div className="flex items-center">
                        <Star className="h-3 w-3 md:h-4 md:w-4 mr-1 text-amber-500 fill-current" />
                        <span>{Number(creator.rating || 0).toFixed(1)}</span>
                      </div>

                      <div>
                        <span className="font-medium">
                          {creator.sales || 0}
                        </span>{" "}
                        sales
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {creator.categories?.map((category) => (
                        <Badge
                          key={category}
                          variant="secondary"
                          className="text-xs capitalize"
                        >
                          {category}
                        </Badge>
                      )) || (
                        <Badge variant="secondary" className="text-xs">
                          General
                        </Badge>
                      )}
                    </div>

                    <Button
                      asChild
                      variant="outline"
                      className="w-full text-xs md:text-sm h-8 md:h-9"
                    >
                      <Link href={`/creator/${creator.id}`}>View Profile</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-8 md:py-12 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <Card className="text-center p-6">
              <div className="w-12 h-12 md:w-16 md:h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center text-primary text-xl md:text-2xl mb-4">
                1
              </div>
              <CardHeader className="p-0">
                <CardTitle className="text-lg md:text-xl mb-2">
                  For Shoppers
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-muted-foreground">
                  Discover unique local products, follow your favorite creators,
                  and get updates on new items.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center p-6">
              <div className="w-12 h-12 md:w-16 md:h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center text-primary text-xl md:text-2xl mb-4">
                2
              </div>
              <CardHeader className="p-0">
                <CardTitle className="text-lg md:text-xl mb-2">
                  For Creators
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-muted-foreground">
                  Showcase your products, build a following, and reach customers
                  who appreciate handmade quality.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center p-6">
              <div className="w-12 h-12 md:w-16 md:h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center text-primary text-xl md:text-2xl mb-4">
                3
              </div>
              <CardHeader className="p-0">
                <CardTitle className="text-lg md:text-xl mb-2">
                  For the Community
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-muted-foreground">
                  Support local economy, reduce environmental impact, and build
                  connections within your community.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">
            Ready to join our community?
          </h2>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-6 md:mb-8">
            Whether you&apos;re a creator or a shopper, we&apos;d love to have
            you as part of our growing community.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4">
            <Button size="lg" variant="secondary" className="text-foreground">
              <Link href={"/auth"}>
                Sign Up as Shopper
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-background text-background bg-transparent hover:bg-background hover:text-foreground"
            >
              <Link href={"/profile"}>
                Apply as Creator
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
