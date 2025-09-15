"use client";

import { useState, useMemo, useCallback } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Filter,
  Grid,
  List,
  Star,
  X,
  CircleCheckIcon,
  Eye,
} from "lucide-react";
import { Product, Creator, ProductCategory, User, Review } from "@/lib/db/schema/index";
import { useDebounce } from "@/hooks/useDebounce";
import { AddToCartButton } from "@/components/common/add-to-cart-button";
import FavoriteButton from "@/components/common/favorite-button";
import { useWishlist } from "@/hooks/useWishlist";

// Types from your existing code
export interface CreatorWithUser extends Omit<Creator, "userId"> {
  user: User;
  name: string;
  isVerified: boolean;
}

type ProductAlias = Product & {
  creator: CreatorWithUser;
  category: ProductCategory;
  reviews: Review[];
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
    creator: Creator;
    user: User;
  }>;
}

interface Category {
  id: string;
  name: string;
}

interface PriceRange {
  id: string;
  name: string;
  min: number;
  max: number;
}

// Fetcher function for SWR
const fetchProducts = async (url: string): Promise<APIResponse> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

const categories: Category[] = [
  { id: "all", name: "All Products" },
  { id: "clothing", name: "Clothing" },
  { id: "jewelry", name: "Jewelry" },
  { id: "crockery", name: "Pottery & Ceramics" },
  { id: "art", name: "Art" },
  { id: "home", name: "Home Decor" },
];

const priceRanges: PriceRange[] = [
  { id: "all", name: "Any Price", min: 0, max: 10000 },
  { id: "under25", name: "Under ₹25", min: 0, max: 25 },
  { id: "25-50", name: "₹25 - ₹50", min: 25, max: 50 },
  { id: "50-100", name: "₹50 - ₹100", min: 50, max: 100 },
  { id: "over100", name: "Over ₹100", min: 100, max: 10000 },
];

export default function ShopPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [cartItems, setCartItems] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const { isInWishlist, toggleWishlist, wishlistItems } = useWishlist();

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const itemsPerPage = 100;

  // Build API URL based on filters
  const buildApiUrl = (
    query: string,
    category: string,
    priceRangeId: string,
    page: number,
    limit: number
  ) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      featured: "false", // Show all products, not just featured
    });

    if (query.trim()) {
      params.append("q", query.trim());
    }

    if (category !== "all") {
      const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
      params.append("category", categoryName);
    }

    if (priceRangeId !== "all") {
      const selectedRange = priceRanges.find(
        (range) => range.id === priceRangeId
      );
      if (selectedRange) {
        params.append("minPrice", selectedRange.min.toString());
        if (selectedRange.max < 10000) {
          // Don't set max if it's the highest range
          params.append("maxPrice", selectedRange.max.toString());
        }
      }
    }

    return `/api/products?${params.toString()}`;
  };

  // SWR key using array format for multiple parameters [web:132][web:136]
  const apiUrl = buildApiUrl(
    debouncedSearchQuery,
    activeCategory,
    priceRange,
    currentPage,
    itemsPerPage
  );

  const {
    data: productsData,
    error: productsError,
    isLoading: productsLoading,
    mutate: mutateProducts,
  } = useSWR(
    apiUrl, // Dynamic URL based on filters
    fetchProducts,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000, // 30 seconds deduplication
      errorRetryCount: 3,
      errorRetryInterval: 5000,
    }
  );

  // Transform API data to match component structure
  const products: ProductAlias[] = useMemo(() => {
    return productsData?.success && productsData.data
      ? productsData.data.map((item) => ({
          ...item.product,
          creator: {
            ...item.creator,
            user: item.user,
            name: item.user.name || "Unknown Creator",
            isVerified: item.creator.isVerified || false,
          },
          category: item.category,
          reviews: [],
        }))
      : [];
  }, [productsData]);

  // Client-side sorting (since API doesn't handle all sort options)
  const sortedProducts = useMemo(() => {
    if (!products.length) return [];

    const sorted = [...products];

    switch (sortBy) {
      case "price-low":
        return sorted.sort((a, b) => Number(a.price) - Number(b.price));
      case "price-high":
        return sorted.sort((a, b) => Number(b.price) - Number(a.price));
      case "newest":
        return sorted.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA;
        });
      case "rating":
        return sorted.sort((a, b) => Number(b.rating) - Number(a.rating));
      case "featured":
      default:
        return sorted.sort((a, b) => Number(b.rating) - Number(a.rating));
    }
  }, [products, sortBy]);

  const toggleCart = (productId: string) => {
    setCartItems((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setActiveCategory("all");
    setPriceRange("all");
    setCurrentPage(1);
  };

  // Handle filter changes and reset page
  const handleFilterChange = (filterType: string, value: string) => {
    setCurrentPage(1); // Reset to first page when filters change

    switch (filterType) {
      case "category":
        setActiveCategory(value);
        break;
      case "priceRange":
        setPriceRange(value);
        break;
      case "search":
        setSearchQuery(value);
        break;
    }
  };

  const handleToggleFavorite = useCallback(
    async (productId: string, productName: string) => {
      await toggleWishlist(productId, productName);
    },
    [toggleWishlist]
  );

  // Pagination helpers
  const totalPages = productsData?.pagination?.totalPages || 0;
  const totalItems = productsData?.pagination?.total || 0;

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Shop Local Products
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Discover unique handmade items from local artisans
          </p>
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                onClick={() => handleFilterChange("search", "")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Top Rated</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex border border-input rounded-md overflow-hidden">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className="rounded-none h-10"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
                className="rounded-none h-10"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="md:hidden">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh]">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  <div>
                    <h3 className="font-medium mb-3">Category</h3>
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <div
                          key={category.id}
                          className="flex items-center space-x-2"
                        >
                          <Switch
                            id={`category-${category.id}`}
                            checked={activeCategory === category.id}
                            onCheckedChange={(checked) =>
                              checked &&
                              handleFilterChange("category", category.id)
                            }
                          />
                          <Label htmlFor={`category-${category.id}`}>
                            {category.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-3">Price Range</h3>
                    <div className="space-y-2">
                      {priceRanges.map((range) => (
                        <div
                          key={range.id}
                          className="flex items-center space-x-2"
                        >
                          <Switch
                            id={`price-${range.id}`}
                            checked={priceRange === range.id}
                            onCheckedChange={(checked) =>
                              checked &&
                              handleFilterChange("priceRange", range.id)
                            }
                          />
                          <Label htmlFor={`price-${range.id}`}>
                            {range.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Category and Price Filters - Desktop */}
        <div className="hidden md:flex flex-col gap-4 bg-muted/30 p-4 rounded-lg mb-6">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Category</span>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge
                  key={category.id}
                  variant={
                    activeCategory === category.id ? "default" : "outline"
                  }
                  className="cursor-pointer py-1.5 px-3"
                  onClick={() => handleFilterChange("category", category.id)}
                >
                  {category.name}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Price Range</span>
            <div className="flex flex-wrap gap-2">
              {priceRanges.map((range) => (
                <Badge
                  key={range.id}
                  variant={priceRange === range.id ? "default" : "outline"}
                  className="cursor-pointer py-1.5 px-3"
                  onClick={() => handleFilterChange("priceRange", range.id)}
                >
                  {range.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Results Count and Loading Indicator */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
          <p className="text-muted-foreground text-sm">
            {productsLoading
              ? "Loading products..."
              : `${totalItems} ${
                  totalItems === 1 ? "product" : "products"
                } found`}
          </p>

          <div className="flex gap-2">
            {wishlistItems.length > 0 && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/wishlist">
                  View {wishlistItems.length} wishlisted items
                </Link>
              </Button>
            )}
            {!productsLoading && sortedProducts.length === 0 && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear all filters
              </Button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {productsLoading && (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
                : "space-y-4"
            }
          >
            {[...Array(8)].map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="h-48 bg-muted animate-pulse"></div>
                <CardHeader className="p-4">
                  <div className="h-4 bg-muted rounded animate-pulse mb-2"></div>
                  <div className="h-3 bg-muted rounded animate-pulse w-2/3"></div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="h-3 bg-muted rounded animate-pulse mb-2"></div>
                  <div className="h-3 bg-muted rounded animate-pulse w-3/4"></div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <div className="w-full h-9 bg-muted rounded animate-pulse"></div>
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
            <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
            <p className="text-muted-foreground mb-4">
              {productsError instanceof Error
                ? productsError.message
                : "Failed to load products"}
            </p>
            <Button onClick={() => mutateProducts()}>Try Again</Button>
          </div>
        )}

        {/* Products Grid/List */}
        {!productsLoading && !productsError && (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {sortedProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="overflow-hidden hover:shadow-md transition-all"
                  >
                    <div className="h-48 bg-muted relative">
                      {product.image ? (
                        <Image
                          src={product.image ?? "/placeholder-image.png"}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          height={200}
                          width={300}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                          Product Image
                        </div>
                      )}

                      <FavoriteButton
                        productId={product.id}
                        productName={product.name}
                        isInWishlist={isInWishlist}
                        handleToggleFavorite={handleToggleFavorite}
                      />
                    </div>

                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h3 className="font-semibold text-base line-clamp-1">
                            {product.name}
                          </h3>
                          <Link href={`/creator/${product.creator.id}`}>
                            <span className="text-xs text-muted-foreground hover:text-primary cursor-pointer flex items-center gap-1">
                              By {product.creator.user?.name}
                              {product.creator.isVerified && (
                                <CircleCheckIcon className="fill-blue-500 stroke-white size-3" />
                              )}
                            </span>
                          </Link>
                        </div>

                        <span className="font-bold text-primary text-base">
                          ₹{product.price}
                        </span>
                      </div>
                    </CardHeader>

                    <CardContent className="p-4 pt-0 h-full">
                      <div className="flex items-center mb-2">
                        <div className="flex items-center mr-2">
                          <Star className="h-3 w-3 text-amber-500 fill-current" />
                          <span className="text-xs ml-1">
                            {Number(product.rating).toFixed(1)}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          ({product.reviews?.length || 0} reviews)
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
                        {product.description}
                      </p>
                    </CardContent>

                    <CardFooter className="p-4 pt-0">
                      <div className="flex gap-2 w-full">
                        <AddToCartButton
                          product={{
                            id: product.id,
                            name: product.name,
                            price: Number(product.price),
                            image: product.image,
                            slug: product.slug,
                            stock: Number(product.stock ?? 0),
                            creator: product.creator,
                          }}
                          variant="compact"
                          className="flex-1"
                        />
                        <Button
                          asChild
                          variant="outline"
                          size="icon"
                          className="h-9 w-9"
                        >
                          <Link href={`/product/${product.slug}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {sortedProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col sm:flex-row">
                      <div className="w-full sm:w-32 h-32 bg-muted flex items-center justify-center sm:rounded-l-lg">
                        {product.image ? (
                          <Image
                            src="/placeholder-image.png"
                            alt={product.name}
                            className="w-full h-full object-cover"
                            height={128}
                            width={128}
                          />
                        ) : (
                          "Product Image"
                        )}
                      </div>

                      <div className="flex-1 p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="space-y-1">
                            <h3 className="font-semibold text-base">
                              {product.name}
                            </h3>
                            <Link href={`/creator/${product.creator.id}`}>
                              <span className="text-xs text-muted-foreground hover:text-primary cursor-pointer flex items-center gap-1">
                                By {product.creator.user?.name}
                                {product.creator.isVerified && (
                                  <CircleCheckIcon className="fill-blue-500 stroke-white size-3" />
                                )}
                              </span>
                            </Link>
                          </div>

                          <span className="font-bold text-primary text-base">
                            ₹{product.price}
                          </span>
                        </div>

                        <div className="flex items-center mb-2">
                          <div className="flex items-center mr-2">
                            <Star className="h-3 w-3 text-amber-500 fill-current" />
                            <span className="text-xs ml-1">
                              {Number(product.rating).toFixed(1)}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            ({product.reviews?.length || 0} reviews)
                          </span>
                        </div>

                        <p className="text-sm text-muted-foreground mb-4">
                          {product.description}
                        </p>

                        <div className="flex items-center gap-2">
                          <Button
                            variant={
                              cartItems.includes(product.id)
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() => toggleCart(product.id)}
                          >
                            {cartItems.includes(product.id)
                              ? "Added to Cart"
                              : "Add to Cart"}
                          </Button>

                          <FavoriteButton
                            productId={product.id}
                            productName={product.name}
                            isInWishlist={isInWishlist}
                            handleToggleFavorite={handleToggleFavorite}
                          />

                          <Button asChild variant="outline" size="sm">
                            <Link href={`/product/${product.id}`}>
                              View Details
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1 || productsLoading}
                >
                  Previous
                </Button>

                <span className="text-sm text-muted-foreground px-4">
                  Page {currentPage} of {totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages || productsLoading}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!productsLoading && !productsError && sortedProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto w-20 h-20 md:w-24 md:h-24 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              Try adjusting your search or filters to find what you&apos;re
              looking for
            </p>
            <Button onClick={clearFilters}>Clear all filters</Button>
          </div>
        )}
      </main>
    </div>
  );
}
