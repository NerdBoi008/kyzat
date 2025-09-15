"use client";

import { useState, useMemo, useCallback } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Link from "next/link";
import {
  Search,
  Grid,
  List,
  Star,
  Heart,
  SlidersHorizontal,
  X,
  AlertCircle,
  RefreshCw,
  Eye,
} from "lucide-react";
import { isProductNew } from "@/lib/utils";
import { useCart } from "@/hooks/useCart";
import Image from "next/image";
import { Creator, User } from "@/lib/db/schema/index";
import { useWishlist } from "@/hooks/useWishlist";
import FavoriteButton from "@/components/common/favorite-button";
import { useDebounce } from "@/hooks/useDebounce";
import { FiltersContent } from "./_components/filter-content";

interface Product {
  id: string;
  name: string;
  price: string;
  slug: string;
  image: string;
  categoryId: string;
  rating: string;
  stock: number;
  isFeatured: boolean;
  createdAt: string;
  materials: string[];
  creator: Creator & { user: User };
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ApiResponse {
  success: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  data: {
    product: Product;
    category: Category;
    creator: Creator;
    user: User;
    relatedProducts: Product[];
  }[];
}

const sortOptions = [
  { id: "featured", name: "Featured" },
  { id: "newest", name: "Newest" },
  { id: "price-low", name: "Price: Low to High" },
  { id: "price-high", name: "Price: High to Low" },
  { id: "rating", name: "Top Rated" },
  { id: "popular", name: "Most Popular" },
];

const fetcher = (url: string): Promise<ApiResponse> =>
  fetch(url).then((res) => res.json());

export default function ProductsPage() {
  // State
  const [localSearch, setLocalSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [showNewOnly, setShowNewOnly] = useState(false);
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const debouncedLocalSearch = useDebounce(localSearch, 700);

  const { isInCart, addToCart } = useCart();
  const { isInWishlist, toggleWishlist, wishlistItems } = useWishlist();
  const productsPerPage = 30;

  // API URL - Only fetch all products, filtering done locally
  const apiUrl = useMemo(() => {
    return `/api/products?page=1&limit=${productsPerPage}&featured=false`;
  }, []);

  // Fetch products with SWR
  const { data, error, isLoading, mutate } = useSWR<ApiResponse>(
    apiUrl,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // Cache for 1 minute
    }
  );

  // Transform API data
  const allProducts = useMemo(
    () =>
      data?.data.map((element) => ({
        ...element.product,
        creator: {
          ...element.creator,
          user: element.user,
        },
        category: element.category,
      })) ?? [],
    [data?.data]
  );

  // Extract unique categories
  const categories = (() => {
    if (!data?.data) return [];
    const categoryMap = new Map<string, Category>();
    data.data.forEach((el) => {
      if (!categoryMap.has(el.category.id)) {
        categoryMap.set(el.category.id, el.category);
      }
    });
    return Array.from(categoryMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  })();

  // Extract unique materials
  const availableMaterials = useMemo(() => {
    const materialsSet = new Set<string>();
    allProducts.forEach((product) => {
      product.materials?.forEach((material: string) =>
        materialsSet.add(material)
      );
    });
    return Array.from(materialsSet).sort();
  }, [allProducts]);

  // Local filtering and sorting
  const filteredAndSortedProducts = useMemo(() => {
    const filtered = allProducts.filter((product: Product) => {
      const price = parseFloat(product.price);
      const rating = parseFloat(product.rating);

      // Search filter
      if (
        debouncedLocalSearch &&
        !product.name.toLowerCase().includes(debouncedLocalSearch.toLowerCase()) &&
        !product.creator.user.name
          .toLowerCase()
          .includes(debouncedLocalSearch.toLowerCase())
      ) {
        return false;
      }
      // if (
      //   localSearch &&
      //   !product.name.toLowerCase().includes(localSearch.toLowerCase()) &&
      //   !product.creator.user.name
      //     .toLowerCase()
      //     .includes(localSearch.toLowerCase())
      // ) {
      //   return false;
      // }
      

      // Category filter
      if (activeCategory !== "all" && product.categoryId !== activeCategory) {
        return false;
      }

      // Price range filter
      if (price < priceRange[0] || price > priceRange[1]) {
        return false;
      }

      // Rating filter
      if (rating < minRating) {
        return false;
      }

      // Stock filter
      if (showInStockOnly && product.stock === 0) {
        return false;
      }

      // New filter
      if (showNewOnly && !isProductNew(product.createdAt)) {
        return false;
      }

      // Verified creator filter
      if (showVerifiedOnly && !product.creator.isVerified) {
        return false;
      }

      // Materials filter
      if (
        selectedMaterials.length > 0 &&
        !selectedMaterials.some((mat) => product.materials?.includes(mat))
      ) {
        return false;
      }

      return true;
    });

    // Sorting
    filtered.sort((a: Product, b: Product) => {
      switch (sortBy) {
        case "price-low":
          return parseFloat(a.price) - parseFloat(b.price);
        case "price-high":
          return parseFloat(b.price) - parseFloat(a.price);
        case "rating":
          return parseFloat(b.rating) - parseFloat(a.rating);
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "popular":
          return (b.creator.followers ?? 0) - (a.creator.followers ?? 0);
        case "featured":
        default:
          return b.isFeatured === a.isFeatured ? 0 : b.isFeatured ? 1 : -1;
      }
    });

    return filtered;
  }, [
    allProducts,
    debouncedLocalSearch,
    activeCategory,
    priceRange,
    minRating,
    sortBy,
    showInStockOnly,
    showNewOnly,
    showVerifiedOnly,
    selectedMaterials,
  ]);

  // Pagination on filtered results
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * productsPerPage;
    const end = start + productsPerPage;
    return filteredAndSortedProducts.slice(start, end);
  }, [filteredAndSortedProducts, currentPage]);

  const totalPages = Math.ceil(
    filteredAndSortedProducts.length / productsPerPage
  );

  const handleToggleFavorite = useCallback(
    async (productId: string, productName: string) => {
      await toggleWishlist(productId, productName);
    },
    [toggleWishlist]
  );

  const handleAddToCart = useCallback(
    async (product: Product) => {
      await addToCart({
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        image: product.image,
        slug: product.slug,
        stock: product.stock,
        creator: {
          id: product.creator.id,
          name: product.creator.user.name,
          isVerified: product.creator.isVerified ?? false,
        },
      });
    },
    [addToCart]
  );

  const clearAllFilters = useCallback(() => {
    setLocalSearch("");
    setActiveCategory("all");
    setPriceRange([0, 1000]);
    setMinRating(0);
    setShowInStockOnly(false);
    setShowNewOnly(false);
    setShowVerifiedOnly(false);
    setSelectedMaterials([]);
    setCurrentPage(1);
  }, []);

  const toggleMaterial = useCallback((material: string) => {
    setSelectedMaterials((prev) =>
      prev.includes(material)
        ? prev.filter((m) => m !== material)
        : [...prev, material]
    );
  }, []);

  const hasActiveFilters =
    activeCategory !== "all" ||
    priceRange[0] !== 0 ||
    priceRange[1] !== 1000 ||
    minRating > 0 ||
    debouncedLocalSearch !== "" ||
    showInStockOnly ||
    showNewOnly ||
    showVerifiedOnly ||
    selectedMaterials.length > 0;

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-6 md:py-8">
          <div className="mb-6 md:mb-8">
            <Skeleton className="h-4 w-32 mb-4" />
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>

          <Card className="mb-6 md:mb-8">
            <CardContent className="p-4 md:p-6">
              <div className="flex gap-4 mb-4">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-40" />
                <Skeleton className="h-10 w-24" />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i}>
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-9 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Failed to Load Products
              </h3>
              <p className="text-muted-foreground mb-6">
                There was an error loading products. Please try again.
              </p>
              <Button onClick={() => mutate()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <nav className="flex items-center text-sm text-muted-foreground mb-3 md:mb-4">
            <Link href="/" className="hover:text-primary">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">All Products</span>
          </nav>

          <h1 className="text-2xl md:text-3xl font-bold mb-2">All Products</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Discover our complete collection of handcrafted items from local
            artisans
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block w-64 shrink-0">
            <Card className="sticky top-4">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold">Filters</h2>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="h-7 text-xs"
                    >
                      Clear
                    </Button>
                  )}
                </div>
                <FiltersContent
                  categories={categories}
                  activeCategory={activeCategory}
                  setActiveCategory={setActiveCategory}
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                  minRating={minRating}
                  setMinRating={setMinRating}
                  showInStockOnly={showInStockOnly}
                  setShowInStockOnly={setShowInStockOnly}
                  showNewOnly={showNewOnly}
                  setShowNewOnly={setShowNewOnly}
                  showVerifiedOnly={showVerifiedOnly}
                  setShowVerifiedOnly={setShowVerifiedOnly}
                  selectedMaterials={selectedMaterials}
                  toggleMaterial={toggleMaterial}
                  availableMaterials={availableMaterials}
                  setCurrentPage={setCurrentPage}
                />
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Search and Controls */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search products..."
                      className="pl-10"
                      value={localSearch}
                      onChange={(e) => {
                        setLocalSearch(e.target.value);
                        setCurrentPage(1);
                      }}
                    />
                  </div>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex border border-input rounded-md overflow-hidden">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="icon"
                      onClick={() => setViewMode("grid")}
                      className="rounded-none h-10 w-10"
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="icon"
                      onClick={() => setViewMode("list")}
                      className="rounded-none h-10 w-10"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Mobile Filters */}
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="lg:hidden">
                        <SlidersHorizontal className="h-4 w-4 mr-2" />
                        Filters
                        {hasActiveFilters && (
                          <Badge variant="destructive" className="ml-2">
                            {
                              [
                                activeCategory !== "all",
                                priceRange[0] !== 0 || priceRange[1] !== 1000,
                                minRating > 0,
                                showInStockOnly,
                                showNewOnly,
                                showVerifiedOnly,
                                selectedMaterials.length > 0,
                              ].filter(Boolean).length
                            }
                          </Badge>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent
                      side="left"
                      className="w-80 overflow-y-auto p-6"
                    >
                      <SheetHeader className="text-left pb-4">
                        <SheetTitle>Filters</SheetTitle>
                      </SheetHeader>
                      <FiltersContent
                        categories={categories}
                        activeCategory={activeCategory}
                        setActiveCategory={setActiveCategory}
                        priceRange={priceRange}
                        setPriceRange={setPriceRange}
                        minRating={minRating}
                        setMinRating={setMinRating}
                        showInStockOnly={showInStockOnly}
                        setShowInStockOnly={setShowInStockOnly}
                        showNewOnly={showNewOnly}
                        setShowNewOnly={setShowNewOnly}
                        showVerifiedOnly={showVerifiedOnly}
                        setShowVerifiedOnly={setShowVerifiedOnly}
                        selectedMaterials={selectedMaterials}
                        toggleMaterial={toggleMaterial}
                        availableMaterials={availableMaterials}
                        setCurrentPage={setCurrentPage}
                      />
                    </SheetContent>
                  </Sheet>
                </div>

                {/* Active Filters */}
                {hasActiveFilters && (
                  <div className="flex items-center gap-2 mt-4 flex-wrap">
                    <span className="text-sm text-muted-foreground">
                      Active:
                    </span>
                    {activeCategory !== "all" && (
                      <Badge variant="secondary" className="text-xs">
                        {categories.find((c) => c.id === activeCategory)?.name}
                        <X
                          className="h-3 w-3 ml-1 cursor-pointer"
                          onClick={() => setActiveCategory("all")}
                        />
                      </Badge>
                    )}
                    {(priceRange[0] !== 0 || priceRange[1] !== 1000) && (
                      <Badge variant="secondary" className="text-xs">
                        ₹{priceRange[0]} - ₹{priceRange[1]}
                        <X
                          className="h-3 w-3 ml-1 cursor-pointer"
                          onClick={() => setPriceRange([0, 1000])}
                        />
                      </Badge>
                    )}
                    {minRating > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {minRating}★+
                        <X
                          className="h-3 w-3 ml-1 cursor-pointer"
                          onClick={() => setMinRating(0)}
                        />
                      </Badge>
                    )}
                    {showInStockOnly && (
                      <Badge variant="secondary" className="text-xs">
                        In Stock
                        <X
                          className="h-3 w-3 ml-1 cursor-pointer"
                          onClick={() => setShowInStockOnly(false)}
                        />
                      </Badge>
                    )}
                    {showNewOnly && (
                      <Badge variant="secondary" className="text-xs">
                        New
                        <X
                          className="h-3 w-3 ml-1 cursor-pointer"
                          onClick={() => setShowNewOnly(false)}
                        />
                      </Badge>
                    )}
                    {showVerifiedOnly && (
                      <Badge variant="secondary" className="text-xs">
                        Verified
                        <X
                          className="h-3 w-3 ml-1 cursor-pointer"
                          onClick={() => setShowVerifiedOnly(false)}
                        />
                      </Badge>
                    )}
                    {selectedMaterials.map((material) => (
                      <Badge
                        key={material}
                        variant="secondary"
                        className="text-xs"
                      >
                        {material}
                        <X
                          className="h-3 w-3 ml-1 cursor-pointer"
                          onClick={() => toggleMaterial(material)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Results Count */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-muted-foreground text-sm">
                Showing{" "}
                {paginatedProducts.length > 0
                  ? (currentPage - 1) * productsPerPage + 1
                  : 0}{" "}
                -{" "}
                {Math.min(
                  currentPage * productsPerPage,
                  filteredAndSortedProducts.length
                )}{" "}
                of {filteredAndSortedProducts.length} products
              </p>
              {wishlistItems.length > 0 && (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/wishlist">
                    <Heart className="h-4 w-4 mr-2" />
                    {wishlistItems.length}
                  </Link>
                </Button>
              )}
            </div>

            {/* Products Grid */}
            {paginatedProducts.length > 0 ? (
              <>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-8">
                    {paginatedProducts.map((product: Product) => (
                      <Card
                        key={product.id}
                        className="overflow-hidden hover:shadow-lg transition-all group"
                      >
                        <div className="h-48 bg-muted relative overflow-hidden">
                          {product.image ? (
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                              No Image
                            </div>
                          )}

                          {isProductNew(product.createdAt) && (
                            <Badge className="absolute top-2 left-2">New</Badge>
                          )}
                          {product.stock === 0 && (
                            <Badge
                              variant="destructive"
                              className="absolute top-2 left-2"
                            >
                              Out of Stock
                            </Badge>
                          )}

                          <FavoriteButton
                            productId={product.id}
                            productName={product.name}
                            isInWishlist={isInWishlist}
                            handleToggleFavorite={handleToggleFavorite}
                          />
                        </div>

                        <CardContent className="p-4">
                          <Link href={`/product/${product.slug}`}>
                            <h3 className="font-semibold text-base line-clamp-1 hover:text-primary">
                              {product.name}
                            </h3>
                          </Link>

                          <Link href={`/creator/${product.creator.id}`}>
                            <p className="text-sm text-muted-foreground hover:text-primary cursor-pointer mt-1 flex items-center gap-1">
                              By {product.creator.user.name}
                              {product.creator.isVerified && (
                                <Badge variant="secondary" className="text-xs">
                                  ✓
                                </Badge>
                              )}
                            </p>
                          </Link>

                          <div className="flex justify-between items-center mt-3">
                            <span className="font-bold text-primary">
                              ₹{parseFloat(product.price).toFixed(2)}
                            </span>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                              <span className="text-sm ml-1">
                                {parseFloat(product.rating).toFixed(1)}
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-2 mt-4">
                            <Button
                              variant={
                                isInCart(product.id) ? "default" : "outline"
                              }
                              className="flex-1 text-xs h-9"
                              onClick={() => handleAddToCart(product)}
                              disabled={product.stock === 0}
                            >
                              {product.stock === 0
                                ? "Out of Stock"
                                : isInCart(product.id)
                                ? "In Cart"
                                : "Add to Cart"}
                            </Button>

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
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  // List view
                  <div className="space-y-4 mb-8">
                    {paginatedProducts.map((product: Product) => (
                      <Card
                        key={product.id}
                        className="hover:shadow-lg transition-shadow"
                      >
                        <CardContent className="p-4 md:p-6">
                          <div className="flex flex-col sm:flex-row items-start gap-4">
                            <div className="w-full sm:w-32 h-32 bg-muted rounded-lg shrink-0 overflow-hidden relative">
                              {product.image ? (
                                <Image
                                  src={product.image}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <span className="text-xs text-muted-foreground">
                                  No Image
                                </span>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <Link href={`/product/${product.slug}`}>
                                    <h3 className="font-semibold text-lg hover:text-primary">
                                      {product.name}
                                    </h3>
                                  </Link>
                                  <Link href={`/creator/${product.creator.id}`}>
                                    <p className="text-sm text-muted-foreground hover:text-primary">
                                      By {product.creator.user.name}
                                    </p>
                                  </Link>
                                </div>
                                <span className="font-bold text-primary text-xl">
                                  ₹{parseFloat(product.price).toFixed(2)}
                                </span>
                              </div>

                              <div className="flex items-center gap-3 mb-3">
                                <div className="flex items-center">
                                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                                  <span className="text-sm ml-1">
                                    {parseFloat(product.rating).toFixed(1)}
                                  </span>
                                </div>
                                {isProductNew(product.createdAt) && (
                                  <Badge>New</Badge>
                                )}
                                {product.stock === 0 && (
                                  <Badge variant="destructive">
                                    Out of Stock
                                  </Badge>
                                )}
                                {product.creator.isVerified && (
                                  <Badge variant="secondary">
                                    Verified Creator
                                  </Badge>
                                )}
                              </div>

                              <div className="flex items-center gap-2 flex-wrap">
                                <Button
                                  variant={
                                    isInCart(product.id) ? "default" : "outline"
                                  }
                                  onClick={() => handleAddToCart(product)}
                                  size="sm"
                                  disabled={product.stock === 0}
                                >
                                  {product.stock === 0
                                    ? "Out of Stock"
                                    : isInCart(product.id)
                                    ? "In Cart"
                                    : "Add to Cart"}
                                </Button>

                                <FavoriteButton
                                  productId={product.id}
                                  productName={product.name}
                                  isInWishlist={isInWishlist}
                                  handleToggleFavorite={handleToggleFavorite}
                                />

                                <Button asChild variant="outline" size="sm">
                                  <Link href={`/product/${product.slug}`}>
                                    View Details
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    No products found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your filters or search query
                  </p>
                  <Button onClick={clearAllFilters}>Clear all filters</Button>
                </CardContent>
              </Card>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination className="mt-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          isActive={currentPage === pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// "use client";

// import { useState, useMemo } from "react";
// import useSWR from "swr";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Skeleton } from "@/components/ui/skeleton";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Sheet,
//   SheetContent,
//   SheetHeader,
//   SheetTitle,
//   SheetTrigger,
// } from "@/components/ui/sheet";
// import {
//   Pagination,
//   PaginationContent,
//   PaginationItem,
//   PaginationLink,
//   PaginationNext,
//   PaginationPrevious,
// } from "@/components/ui/pagination";
// import Link from "next/link";
// import {
//   Search,
//   Grid,
//   List,
//   Star,
//   Heart,
//   SlidersHorizontal,
//   X,
//   AlertCircle,
//   RefreshCw,
//   Eye,
// } from "lucide-react";
// import { isProductNew } from "@/lib/utils";
// import { useCart } from "@/hooks/useCart";
// import Image from "next/image";
// import { Creator, User } from "@/lib/types";

// interface Product {
//   id: string;
//   name: string;
//   price: string;
//   slug: string;
//   image: string;
//   categoryId: string;
//   rating: string;
//   stock: number;
//   isFeatured: boolean;
//   createdAt: string;
//   creator: {
//     id: string;
//     name: string;
//     isVerified: boolean;
//   };
//   category: {
//     id: string;
//     name: string;
//     slug: string;
//   };
// }

// interface Category {
//   id: string;
//   name: string;
//   slug: string;
// }

// // interface ApiResponse {
// //   success: boolean;
// //   data: {
// //     products: Product[];
// //     categories: Category[];
// //     pagination: {
// //       page: number;
// //       pageSize: number;
// //       totalCount: number;
// //       totalPages: number;
// //     };
// //   };
// // }

// interface ApiResponse {
//   success: boolean;
//   pagination: {
//     page: number;
//     limit: number;
//     total: number;
//     totalPages: number;
//   };
//   data: {
//     product: Product;
//     category: Category;
//     creator: Creator;
//     user: User;
//     relatedProducts: Product[];
//   }[];
// }

// const priceRanges = [
//   { id: "all", name: "Any Price" },
//   { id: "under25", name: "Under ₹25" },
//   { id: "25-50", name: "₹25 - ₹50" },
//   { id: "50-100", name: "₹50 - ₹100" },
//   { id: "over100", name: "Over ₹100" },
// ];

// const sortOptions = [
//   { id: "featured", name: "Featured" },
//   { id: "newest", name: "Newest" },
//   { id: "price-low", name: "Price: Low to High" },
//   { id: "price-high", name: "Price: High to Low" },
//   { id: "rating", name: "Top Rated" },
//   { id: "name", name: "Alphabetical" },
// ];

// const fetcher = (url: string): Promise<ApiResponse> =>
//   fetch(url).then((res) => res.json());

// export default function ProductsPage() {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [activeCategory, setActiveCategory] = useState("all");
//   const [priceRange, setPriceRange] = useState("all");
//   const [sortBy, setSortBy] = useState("featured");
//   const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [favorites, setFavorites] = useState<string[]>([]);

//   const { isInCart, addToCart } = useCart();
//   const productsPerPage = 30;

//   // Build API URL with params
//   const apiUrl = useMemo(() => {
//     const params = new URLSearchParams({
//       page: currentPage.toString(),
//       limit: productsPerPage.toString(),
//       featured: "false", // Show all products, not just featured
//     });

//     if (searchQuery) params.append("search", searchQuery);
//     if (activeCategory !== "all") params.append("categoryId", activeCategory);
//     if (sortBy) params.append("sortBy", sortBy);

//     return `/api/products?${params.toString()}`;
//   }, [currentPage, searchQuery, activeCategory, sortBy]);

//   // Fetch products with SWR
//   const { data, error, isLoading, mutate } = useSWR<ApiResponse>(
//     apiUrl,
//     fetcher,
//     {
//       revalidateOnFocus: false,
//       revalidateOnReconnect: true,
//       dedupingInterval: 5000,
//     }
//   );

//   const products = useMemo(
//     () =>
//       data?.data.map((element) => ({
//         ...element.product,
//         creator: {
//           ...element.creator,
//           user: element.user,
//         },
//       })) ?? [],
//     [data?.data]
//   );

//   const categories = useMemo(() => {
//     if (!data?.data) return [];

//     const allCategories = data.data.map((el) => el.category);

//     // Use Map to ensure uniqueness by `id`
//     const uniqueCategories = Array.from(
//       new Map(allCategories.map((cat) => [cat.id, cat])).values()
//     );

//     return uniqueCategories.sort((a, b) => a.name.localeCompare(b.name));
//   }, [data?.data]);

//   const pagination = data?.pagination;

//   // Client-side price filtering
//   const filteredProducts = useMemo(() => {
//     return products.filter((product) => {
//       const price = parseFloat(product.price);

//       if (priceRange === "under25") return price < 25;
//       if (priceRange === "25-50") return price >= 25 && price <= 50;
//       if (priceRange === "50-100") return price >= 50 && price <= 100;
//       if (priceRange === "over100") return price > 100;

//       return true;
//     });
//   }, [products, priceRange]);

//   const toggleFavorite = (productId: string) => {
//     setFavorites((prev) =>
//       prev.includes(productId)
//         ? prev.filter((id) => id !== productId)
//         : [...prev, productId]
//     );
//   };

//   const handleAddToCart = async (product: Product) => {
//     await addToCart({
//       id: product.id,
//       name: product.name,
//       price: parseFloat(product.price),
//       image: product.image,
//       slug: product.slug,
//       stock: product.stock,
//       creator: {
//         id: product.creator.id,
//         name: product.creator.name,
//         isVerified: product.creator.isVerified,
//       },
//     });
//   };

//   const clearAllFilters = () => {
//     setSearchQuery("");
//     setActiveCategory("all");
//     setPriceRange("all");
//     setCurrentPage(1);
//   };

//   const hasActiveFilters =
//     activeCategory !== "all" || priceRange !== "all" || searchQuery;

//   // Loading State
//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-background">
//         <main className="container mx-auto px-4 py-6 md:py-8">
//           {/* Header Skeleton */}
//           <div className="mb-6 md:mb-8">
//             <Skeleton className="h-4 w-32 mb-4" />
//             <Skeleton className="h-8 w-64 mb-2" />
//             <Skeleton className="h-4 w-96" />
//           </div>

//           {/* Filters Skeleton */}
//           <Card className="mb-6 md:mb-8">
//             <CardContent className="p-4 md:p-6">
//               <div className="flex gap-4 mb-4">
//                 <Skeleton className="h-10 flex-1" />
//                 <Skeleton className="h-10 w-40" />
//                 <Skeleton className="h-10 w-24" />
//               </div>
//               <div className="flex gap-4">
//                 <Skeleton className="h-8 w-32" />
//                 <Skeleton className="h-8 w-32" />
//                 <Skeleton className="h-8 w-32" />
//               </div>
//             </CardContent>
//           </Card>

//           {/* Products Grid Skeleton */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
//             {[...Array(8)].map((_, i) => (
//               <Card key={i}>
//                 <Skeleton className="h-48 w-full" />
//                 <CardContent className="p-4">
//                   <Skeleton className="h-5 w-full mb-2" />
//                   <Skeleton className="h-4 w-24 mb-3" />
//                   <Skeleton className="h-4 w-20 mb-4" />
//                   <Skeleton className="h-9 w-full" />
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         </main>
//       </div>
//     );
//   }

//   // Error State
//   if (error) {
//     return (
//       <div className="min-h-screen bg-background">
//         <main className="container mx-auto px-4 py-8">
//           <Card>
//             <CardContent className="p-12 text-center">
//               <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
//               <h3 className="text-lg font-semibold mb-2">
//                 Failed to Load Products
//               </h3>
//               <p className="text-muted-foreground mb-6">
//                 There was an error loading products. Please try again.
//               </p>
//               <Button onClick={() => mutate()}>
//                 <RefreshCw className="h-4 w-4 mr-2" />
//                 Retry
//               </Button>
//             </CardContent>
//           </Card>
//         </main>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-background">
//       <main className="container mx-auto px-4 py-6 md:py-8">
//         {/* Header */}
//         <div className="mb-6 md:mb-8">
//           <nav className="flex items-center text-sm text-muted-foreground mb-3 md:mb-4">
//             <Link href="/" className="hover:text-primary">
//               Home
//             </Link>
//             <span className="mx-2">/</span>
//             <span className="text-foreground">All Products</span>
//           </nav>

//           <h1 className="text-2xl md:text-3xl font-bold mb-2">All Products</h1>
//           <p className="text-muted-foreground text-sm md:text-base">
//             Discover our complete collection of handcrafted items from local
//             artisans
//           </p>
//         </div>

//         {/* Filters and Search */}
//         <Card className="mb-6 md:mb-8">
//           <CardContent className="p-4 md:p-6">
//             <div className="flex flex-col md:flex-row gap-4 mb-4">
//               <div className="relative flex-1">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                 <Input
//                   placeholder="Search products, creators, categories..."
//                   className="pl-10"
//                   value={searchQuery}
//                   onChange={(e) => {
//                     setSearchQuery(e.target.value);
//                     setCurrentPage(1);
//                   }}
//                 />
//               </div>

//               <Select value={sortBy} onValueChange={setSortBy}>
//                 <SelectTrigger className="w-full md:w-[180px]">
//                   <SelectValue placeholder="Sort by" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {sortOptions.map((option) => (
//                     <SelectItem key={option.id} value={option.id}>
//                       {option.name}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>

//               <div className="flex border border-input rounded-md overflow-hidden">
//                 <Button
//                   variant={viewMode === "grid" ? "default" : "ghost"}
//                   size="icon"
//                   onClick={() => setViewMode("grid")}
//                   className="rounded-none h-10 w-10"
//                 >
//                   <Grid className="h-4 w-4" />
//                 </Button>
//                 <Button
//                   variant={viewMode === "list" ? "default" : "ghost"}
//                   size="icon"
//                   onClick={() => setViewMode("list")}
//                   className="rounded-none h-10 w-10"
//                 >
//                   <List className="h-4 w-4" />
//                 </Button>
//               </div>

//               <Sheet>
//                 <SheetTrigger asChild>
//                   <Button variant="outline" className="md:hidden">
//                     <SlidersHorizontal className="h-4 w-4 mr-2" />
//                     Filters
//                   </Button>
//                 </SheetTrigger>
//                 <SheetContent side="left" className="w-80 sm:w-96">
//                   <SheetHeader className="text-left pb-4">
//                     <SheetTitle>Filters</SheetTitle>
//                   </SheetHeader>

//                   {/* Mobile Filters */}
//                   <div className="space-y-6">
//                     <div>
//                       <h3 className="font-medium mb-3">Category</h3>
//                       <div className="grid grid-cols-2 gap-2">
//                         <Button
//                           variant={
//                             activeCategory === "all" ? "default" : "outline"
//                           }
//                           size="sm"
//                           onClick={() => {
//                             setActiveCategory("all");
//                             setCurrentPage(1);
//                           }}
//                           className="text-xs"
//                         >
//                           All Categories
//                         </Button>
//                         {categories.map((category) => (
//                           <Button
//                             key={category.id}
//                             variant={
//                               activeCategory === category.id
//                                 ? "default"
//                                 : "outline"
//                             }
//                             size="sm"
//                             onClick={() => {
//                               setActiveCategory(category.id);
//                               setCurrentPage(1);
//                             }}
//                             className="text-xs"
//                           >
//                             {category.name}
//                           </Button>
//                         ))}
//                       </div>
//                     </div>

//                     <div>
//                       <h3 className="font-medium mb-3">Price Range</h3>
//                       <div className="grid grid-cols-2 gap-2">
//                         {priceRanges.map((range) => (
//                           <Button
//                             key={range.id}
//                             variant={
//                               priceRange === range.id ? "default" : "outline"
//                             }
//                             size="sm"
//                             onClick={() => setPriceRange(range.id)}
//                             className="text-xs"
//                           >
//                             {range.name}
//                           </Button>
//                         ))}
//                       </div>
//                     </div>
//                   </div>
//                 </SheetContent>
//               </Sheet>
//             </div>

//             {/* Active Filters */}
//             {hasActiveFilters && (
//               <div className="flex items-center gap-2 mb-4 flex-wrap">
//                 <span className="text-sm text-muted-foreground">
//                   Active filters:
//                 </span>
//                 <div className="flex flex-wrap gap-2">
//                   {activeCategory !== "all" && (
//                     <Badge variant="secondary" className="text-xs">
//                       {categories.find((c) => c.id === activeCategory)?.name}
//                       <X
//                         className="h-3 w-3 ml-1 cursor-pointer"
//                         onClick={() => setActiveCategory("all")}
//                       />
//                     </Badge>
//                   )}
//                   {priceRange !== "all" && (
//                     <Badge variant="secondary" className="text-xs">
//                       {priceRanges.find((p) => p.id === priceRange)?.name}
//                       <X
//                         className="h-3 w-3 ml-1 cursor-pointer"
//                         onClick={() => setPriceRange("all")}
//                       />
//                     </Badge>
//                   )}
//                   {searchQuery && (
//                     <Badge variant="secondary" className="text-xs">
//                       Search: {searchQuery}
//                       <X
//                         className="h-3 w-3 ml-1 cursor-pointer"
//                         onClick={() => setSearchQuery("")}
//                       />
//                     </Badge>
//                   )}
//                 </div>
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   onClick={clearAllFilters}
//                   className="text-xs h-7"
//                 >
//                   Clear all
//                 </Button>
//               </div>
//             )}

//             {/* Desktop Filters */}
//             <div className="hidden md:flex flex-wrap gap-4">
//               <div>
//                 <span className="text-sm font-medium mb-2 block">Category</span>
//                 <div className="flex flex-wrap gap-2">
//                   <Button
//                     variant={activeCategory === "all" ? "default" : "outline"}
//                     size="sm"
//                     onClick={() => {
//                       setActiveCategory("all");
//                       setCurrentPage(1);
//                     }}
//                     className="text-xs"
//                   >
//                     All Categories
//                   </Button>
//                   {categories.map((category) => (
//                     <Button
//                       key={category.id}
//                       variant={
//                         activeCategory === category.id ? "default" : "outline"
//                       }
//                       size="sm"
//                       onClick={() => {
//                         setActiveCategory(category.id);
//                         setCurrentPage(1);
//                       }}
//                       className="text-xs"
//                     >
//                       {category.name}
//                     </Button>
//                   ))}
//                 </div>
//               </div>

//               <div>
//                 <span className="text-sm font-medium mb-2 block">
//                   Price Range
//                 </span>
//                 <div className="flex flex-wrap gap-2">
//                   {priceRanges.map((range) => (
//                     <Button
//                       key={range.id}
//                       variant={priceRange === range.id ? "default" : "outline"}
//                       size="sm"
//                       onClick={() => setPriceRange(range.id)}
//                       className="text-xs"
//                     >
//                       {range.name}
//                     </Button>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Results Count */}
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
//           <p className="text-muted-foreground text-sm">
//             Showing{" "}
//             {filteredProducts.length > 0
//               ? (currentPage - 1) * productsPerPage + 1
//               : 0}
//             -{Math.min(currentPage * productsPerPage, filteredProducts.length)}{" "}
//             of {pagination?.total} products
//           </p>

//           {favorites.length > 0 && (
//             <Button variant="outline" size="sm" asChild className="text-xs">
//               <Link href="/wishlist">
//                 View {favorites.length} wishlisted items
//               </Link>
//             </Button>
//           )}
//         </div>

//         {/* Products Grid/List */}
//         {viewMode === "grid" ? (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-8">
//             {filteredProducts.map((product) => (
//               <Card
//                 key={product.id}
//                 className="overflow-hidden hover:shadow-md transition-shadow"
//               >
//                 <div className="h-40 md:h-48 bg-muted relative">
//                   {product.image ? (
//                     <Image
//                       src={product.image}
//                       alt={product.name}
//                       className="w-full h-full object-cover"
//                       height={100}
//                       width={100}
//                     />
//                   ) : (
//                     <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
//                       No Image
//                     </div>
//                   )}

//                   {isProductNew(product.createdAt) && (
//                     <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
//                       New
//                     </Badge>
//                   )}

//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full h-8 w-8"
//                     onClick={() => toggleFavorite(product.id)}
//                   >
//                     <Heart
//                       className={`h-4 w-4 ${
//                         favorites.includes(product.id)
//                           ? "fill-red-500 text-red-500"
//                           : ""
//                       }`}
//                     />
//                   </Button>
//                 </div>

//                 <CardContent className="p-4">
//                   <Link href={`/product/${product.slug}`}>
//                     <h3 className="font-semibold text-base md:text-lg line-clamp-1 hover:text-primary">
//                       {product.name}
//                     </h3>
//                   </Link>

//                   <Link href={`/creator/${product.creator.id}`}>
//                     <p className="text-sm text-muted-foreground hover:text-primary cursor-pointer mt-1">
//                       By {product.creator.user.name}
//                       {product.creator.isVerified && (
//                         <Badge variant="secondary" className="ml-1 text-xs">
//                           Verified
//                         </Badge>
//                       )}
//                     </p>
//                   </Link>

//                   <div className="flex justify-between items-center mt-3">
//                     <span className="font-bold text-primary">
//                       ₹{parseFloat(product.price).toFixed(2)}
//                     </span>
//                     <div className="flex items-center">
//                       <Star className="h-3 w-3 md:h-4 md:w-4 text-amber-500 fill-current" />
//                       <span className="text-xs md:text-sm ml-1">
//                         {parseFloat(product.rating).toFixed(1)}
//                       </span>
//                     </div>
//                   </div>

//                   <div className="flex gap-2 mt-4">
//                     <Button
//                       variant={isInCart(product.id) ? "default" : "outline"}
//                       className="flex-1 text-xs md:text-sm h-8 md:h-9"
//                       onClick={() =>
//                         handleAddToCart({
//                           ...product,
//                           creator: {
//                             id: product.categoryId,
//                             name: product.creator.user.name,
//                             isVerified: product.creator.isVerified ?? false,
//                           },
//                         })
//                       }
//                       disabled={product.stock === 0}
//                     >
//                       {product.stock === 0
//                         ? "Out of Stock"
//                         : isInCart(product.id)
//                         ? "In Cart"
//                         : "Add to Cart"}
//                     </Button>

//                     <Button
//                       asChild
//                       variant="outline"
//                       size="icon"
//                       className="h-8 w-8 md:h-9 md:w-9"
//                     >
//                       <Link href={`/product/${product.slug}`}>
//                         <Eye className="h-3 w-3 md:h-4 md:w-4" />
//                       </Link>
//                     </Button>
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         ) : (
//           // List view implementation (similar to grid but horizontal layout)
//           <div className="space-y-4 mb-8">
//             {filteredProducts.map((product) => (
//               <Card
//                 key={product.id}
//                 className="hover:shadow-md transition-shadow"
//               >
//                 <CardContent className="p-4 md:p-6">
//                   <div className="flex flex-col sm:flex-row items-start gap-4">
//                     <div className="w-full sm:w-32 h-32 bg-muted flex items-center justify-center rounded-lg flex-shrink-0 overflow-hidden">
//                       {product.image ? (
//                         <Image
//                           src={product.image}
//                           alt={product.name}
//                           className="w-full h-full object-cover"
//                           height={100}
//                           width={100}
//                         />
//                       ) : (
//                         <span className="text-xs text-muted-foreground">
//                           No Image
//                         </span>
//                       )}
//                     </div>

//                     <div className="flex-1 min-w-0">
//                       <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
//                         <div className="min-w-0">
//                           <Link href={`/products/${product.slug}`}>
//                             <h3 className="font-semibold text-lg md:text-xl line-clamp-1 hover:text-primary">
//                               {product.name}
//                             </h3>
//                           </Link>

//                           <Link href={`/creator/${product.creator.id}`}>
//                             <p className="text-sm text-muted-foreground hover:text-primary cursor-pointer mt-1">
//                               By {product.creator.user.name}
//                             </p>
//                           </Link>
//                         </div>

//                         <span className="font-bold text-primary text-lg md:text-xl sm:self-start">
//                           ₹{parseFloat(product.price).toFixed(2)}
//                         </span>
//                       </div>

//                       <div className="flex items-center mb-2">
//                         <div className="flex items-center mr-2">
//                           <Star className="h-4 w-4 text-amber-500 fill-current" />
//                           <span className="text-sm ml-1">
//                             {parseFloat(product.rating).toFixed(1)}
//                           </span>
//                         </div>

//                         {isProductNew(product.createdAt) && (
//                           <Badge className="ml-3 bg-primary text-primary-foreground">
//                             New
//                           </Badge>
//                         )}

//                         {product.stock === 0 && (
//                           <Badge variant="destructive" className="ml-3">
//                             Out of Stock
//                           </Badge>
//                         )}
//                       </div>

//                       <div className="flex items-center gap-2 flex-wrap mt-4">
//                         <Button
//                           variant={isInCart(product.id) ? "default" : "outline"}
//                           onClick={() =>
//                             handleAddToCart({
//                               ...product,
//                               creator: {
//                                 id: product.categoryId,
//                                 name: product.creator.user.name,
//                                 isVerified: product.creator.isVerified ?? false,
//                               },
//                             })
//                           }
//                           size="sm"
//                           className="text-xs md:text-sm h-8"
//                           disabled={product.stock === 0}
//                         >
//                           {product.stock === 0
//                             ? "Out of Stock"
//                             : isInCart(product.id)
//                             ? "In Cart"
//                             : "Add to Cart"}
//                         </Button>

//                         <Button
//                           variant="ghost"
//                           size="icon"
//                           onClick={() => toggleFavorite(product.id)}
//                           className="h-8 w-8"
//                         >
//                           <Heart
//                             className={`h-4 w-4 ${
//                               favorites.includes(product.id)
//                                 ? "fill-red-500 text-red-500"
//                                 : ""
//                             }`}
//                           />
//                         </Button>

//                         <Button
//                           asChild
//                           variant="outline"
//                           size="sm"
//                           className="h-8"
//                         >
//                           <Link href={`/products/${product.slug}`}>
//                             View Details
//                           </Link>
//                         </Button>
//                       </div>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         )}

//         {/* Empty State */}
//         {filteredProducts.length === 0 && !isLoading && (
//           <Card className="text-center py-12">
//             <CardContent>
//               <div className="mx-auto w-16 h-16 md:w-24 md:h-24 rounded-full bg-muted flex items-center justify-center mb-4">
//                 <Search className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground" />
//               </div>
//               <h3 className="text-xl font-semibold mb-2">No products found</h3>
//               <p className="text-muted-foreground mb-4">
//                 Try adjusting your filters to find what you&apos;re looking for
//               </p>
//               <Button onClick={clearAllFilters}>Clear all filters</Button>
//             </CardContent>
//           </Card>
//         )}

//         {/* Pagination */}
//         {pagination && pagination.totalPages > 1 && (
//           <Pagination className="mt-8">
//             <PaginationContent>
//               <PaginationItem>
//                 <PaginationPrevious
//                   onClick={() =>
//                     setCurrentPage((prev) => Math.max(1, prev - 1))
//                   }
//                   className={
//                     !(pagination.page > 1)
//                       ? "pointer-events-none opacity-50"
//                       : "cursor-pointer"
//                   }
//                 />
//               </PaginationItem>

//               {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
//                 const pageNum = i + 1;
//                 return (
//                   <PaginationItem key={pageNum}>
//                     <PaginationLink
//                       isActive={currentPage === pageNum}
//                       onClick={() => setCurrentPage(pageNum)}
//                       className="cursor-pointer"
//                     >
//                       {pageNum}
//                     </PaginationLink>
//                   </PaginationItem>
//                 );
//               })}

//               <PaginationItem>
//                 <PaginationNext
//                   onClick={() =>
//                     setCurrentPage((prev) =>
//                       Math.min(pagination.totalPages, prev + 1)
//                     )
//                   }
//                   className={
//                     !(pagination.page < pagination.total)
//                       ? "pointer-events-none opacity-50"
//                       : "cursor-pointer"
//                   }
//                 />
//               </PaginationItem>
//             </PaginationContent>
//           </Pagination>
//         )}
//       </main>
//     </div>
//   );
// }

// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import Link from "next/link";
// import {
//   Search,
//   Grid,
//   List,
//   Star,
//   Heart,
//   ShoppingCart,
//   SlidersHorizontal
// } from "lucide-react";

// const allProducts = [
//   {
//     id: 1,
//     name: "Handcrafted Ceramic Mug",
//     price: 28.99,
//     creator: "Earth & Fire Pottery",
//     image: "/placeholder-mug.jpg",
//     category: "crockery",
//     rating: 4.8,
//     reviews: 42,
//     isFavorite: false,
//     inCart: false,
//     isNew: true
//   },
//   {
//     id: 2,
//     name: "Handwoven Wool Scarf",
//     price: 42.50,
//     creator: "Weaver's Studio",
//     image: "/placeholder-scarf.jpg",
//     category: "clothing",
//     rating: 4.6,
//     reviews: 28,
//     isFavorite: true,
//     inCart: false,
//     isNew: false
//   },
//   {
//     id: 3,
//     name: "Silver Leaf Earrings",
//     price: 56.00,
//     creator: "Silver Linings Jewelry",
//     image: "/placeholder-earrings.jpg",
//     category: "jewelry",
//     rating: 4.9,
//     reviews: 67,
//     isFavorite: false,
//     inCart: true,
//     isNew: true
//   },
//   {
//     id: 4,
//     name: "Coastal Landscape Painting",
//     price: 120.00,
//     creator: "Seaside Art",
//     image: "/placeholder-painting.jpg",
//     category: "art",
//     rating: 4.7,
//     reviews: 19,
//     isFavorite: false,
//     inCart: false,
//     isNew: false
//   },
//   {
//     id: 5,
//     name: "Handmade Wooden Cutting Board",
//     price: 38.00,
//     creator: "Woodcraft by James",
//     image: "/placeholder-cuttingboard.jpg",
//     category: "home",
//     rating: 4.5,
//     reviews: 35,
//     isFavorite: false,
//     inCart: false,
//     isNew: false
//   },
//   {
//     id: 6,
//     name: "Embroidered Denim Jacket",
//     price: 89.99,
//     creator: "Threads of Tradition",
//     image: "/placeholder-jacket.jpg",
//     category: "clothing",
//     rating: 4.8,
//     reviews: 23,
//     isFavorite: true,
//     inCart: false,
//     isNew: true
//   },
//   {
//     id: 7,
//     name: "Stained Glass Sun Catcher",
//     price: 45.00,
//     creator: "Glass Gardens",
//     image: "/placeholder-suncatcher.jpg",
//     category: "home",
//     rating: 4.9,
//     reviews: 31,
//     isFavorite: false,
//     inCart: false,
//     isNew: false
//   },
//   {
//     id: 8,
//     name: "Ceramic Plant Pot with Stand",
//     price: 52.00,
//     creator: "Clay & Co.",
//     image: "/placeholder-planter.jpg",
//     category: "home",
//     rating: 4.7,
//     reviews: 27,
//     isFavorite: false,
//     inCart: false,
//     isNew: false
//   },
//   {
//     id: 9,
//     name: "Hand-painted Silk Scarf",
//     price: 68.00,
//     creator: "Weaver's Studio",
//     image: "/placeholder-silkscarf.jpg",
//     category: "clothing",
//     rating: 4.8,
//     reviews: 18,
//     isFavorite: false,
//     inCart: false,
//     isNew: true
//   },
//   {
//     id: 10,
//     name: "Artisanal Leather Journal",
//     price: 47.00,
//     creator: "Leather Craftsmen",
//     image: "/placeholder-journal.jpg",
//     category: "accessories",
//     rating: 4.6,
//     reviews: 22,
//     isFavorite: false,
//     inCart: false,
//     isNew: false
//   },
//   {
//     id: 11,
//     name: "Hand-forged Iron Wall Hook",
//     price: 34.00,
//     creator: "Ironworks Studio",
//     image: "/placeholder-wallhook.jpg",
//     category: "home",
//     rating: 4.7,
//     reviews: 15,
//     isFavorite: false,
//     inCart: false,
//     isNew: false
//   },
//   {
//     id: 12,
//     name: "Natural Soy Candle Set",
//     price: 39.00,
//     creator: "Aromatherapy Crafts",
//     image: "/placeholder-candles.jpg",
//     category: "home",
//     rating: 4.9,
//     reviews: 41,
//     isFavorite: false,
//     inCart: false,
//     isNew: true
//   }
// ];

// const categories = [
//   { id: "all", name: "All Categories" },
//   { id: "clothing", name: "Clothing & Accessories" },
//   { id: "jewelry", name: "Jewelry" },
//   { id: "crockery", name: "Pottery & Ceramics" },
//   { id: "art", name: "Art" },
//   { id: "home", name: "Home Decor" },
//   { id: "accessories", name: "Accessories" }
// ];

// const priceRanges = [
//   { id: "all", name: "Any Price" },
//   { id: "under25", name: "Under $25" },
//   { id: "25-50", name: "$25 - $50" },
//   { id: "50-100", name: "$50 - $100" },
//   { id: "over100", name: "Over $100" }
// ];

// const sortOptions = [
//   { id: "featured", name: "Featured" },
//   { id: "newest", name: "Newest" },
//   { id: "price-low", name: "Price: Low to High" },
//   { id: "price-high", name: "Price: High to Low" },
//   { id: "rating", name: "Top Rated" },
//   { id: "name", name: "Alphabetical" }
// ];

// const creators = [
//   { id: "all", name: "All Creators" },
//   { id: "earth-fire", name: "Earth & Fire Pottery" },
//   { id: "weavers-studio", name: "Weaver's Studio" },
//   { id: "silver-linings", name: "Silver Linings Jewelry" },
//   { id: "seaside-art", name: "Seaside Art" },
//   { id: "woodcraft-james", name: "Woodcraft by James" },
//   { id: "threads-tradition", name: "Threads of Tradition" }
// ];

// export default function ProductsPage() {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [activeCategory, setActiveCategory] = useState("all");
//   const [priceRange, setPriceRange] = useState("all");
//   const [sortBy, setSortBy] = useState("featured");
//   const [viewMode, setViewMode] = useState("grid");
//   const [showFilters, setShowFilters] = useState(false);
//   const [selectedCreator, setSelectedCreator] = useState("all");
//   const [favorites, setFavorites] = useState([2, 6]);
//   const [cartItems, setCartItems] = useState([3]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const productsPerPage = 12;

//   const toggleFavorite = (productId) => {
//     if (favorites.includes(productId)) {
//       setFavorites(favorites.filter(id => id !== productId));
//     } else {
//       setFavorites([...favorites, productId]);
//     }
//   };

//   const toggleCart = (productId) => {
//     if (cartItems.includes(productId)) {
//       setCartItems(cartItems.filter(id => id !== productId));
//     } else {
//       setCartItems([...cartItems, productId]);
//     }
//   };

//   // Filter products based on search, category, price, and creator
//   const filteredProducts = allProducts.filter(product => {
//     const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//                           product.creator.toLowerCase().includes(searchQuery.toLowerCase());

//     const matchesCategory = activeCategory === "all" || product.category === activeCategory;

//     let matchesPrice = true;
//     if (priceRange === "under25") matchesPrice = product.price < 25;
//     else if (priceRange === "25-50") matchesPrice = product.price >= 25 && product.price <= 50;
//     else if (priceRange === "50-100") matchesPrice = product.price >= 50 && product.price <= 100;
//     else if (priceRange === "over100") matchesPrice = product.price > 100;

//     const matchesCreator = selectedCreator === "all" ||
//       product.creator.replace(/\s+/g, '-').toLowerCase() === selectedCreator;

//     return matchesSearch && matchesCategory && matchesPrice && matchesCreator;
//   });

//   // Sort products
//   const sortedProducts = [...filteredProducts].sort((a, b) => {
//     if (sortBy === "featured") return b.rating - a.rating;
//     if (sortBy === "price-low") return a.price - b.price;
//     if (sortBy === "price-high") return b.price - a.price;
//     if (sortBy === "newest") return b.id - a.id;
//     if (sortBy === "rating") return b.rating - a.rating;
//     if (sortBy === "name") return a.name.localeCompare(b.name);
//     return 0;
//   });

//   // Pagination
//   const indexOfLastProduct = currentPage * productsPerPage;
//   const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
//   const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);
//   const totalPages = Math.ceil(sortedProducts.length / productsPerPage);

//   const paginate = (pageNumber) => setCurrentPage(pageNumber);

//   return (
//     <div className="min-h-screen bg-background">
//       <main className="container mx-auto px-4 py-8">
//         {/* Header */}
//         <div className="mb-8">
//           <nav className="flex items-center text-sm text-muted-foreground mb-4">
//             <Link href="/" className="hover:text-primary">Home</Link>
//             <span className="mx-2">/</span>
//             <span className="text-foreground">All Products</span>
//           </nav>

//           <h1 className="text-3xl font-bold mb-2">All Products</h1>
//           <p className="text-muted-foreground">
//             Discover our complete collection of handcrafted items from local artisans
//           </p>
//         </div>

//         {/* Filters and Search */}
//         <div className="bg-muted/30 p-4 rounded-lg mb-8">
//           <div className="flex flex-col md:flex-row gap-4 mb-4">
//             <div className="relative flex-1">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//               <Input
//                 placeholder="Search products, creators, categories..."
//                 className="pl-10"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//               />
//             </div>

//             <select
//               className="p-2 rounded-md border border-input bg-background"
//               value={sortBy}
//               onChange={(e) => setSortBy(e.target.value)}
//             >
//               {sortOptions.map(option => (
//                 <option key={option.id} value={option.id}>{option.name}</option>
//               ))}
//             </select>

//             <div className="flex border border-input rounded-md overflow-hidden">
//               <Button
//                 variant={viewMode === "grid" ? "default" : "ghost"}
//                 size="icon"
//                 onClick={() => setViewMode("grid")}
//                 className="rounded-none"
//               >
//                 <Grid className="h-4 w-4" />
//               </Button>
//               <Button
//                 variant={viewMode === "list" ? "default" : "ghost"}
//                 size="icon"
//                 onClick={() => setViewMode("list")}
//                 className="rounded-none"
//               >
//                 <List className="h-4 w-4" />
//               </Button>
//             </div>

//             <Button
//               variant="outline"
//               className="md:hidden"
//               onClick={() => setShowFilters(!showFilters)}
//             >
//               <SlidersHorizontal className="h-4 w-4 mr-2" />
//               Filters
//             </Button>
//           </div>

//           {/* Category Filters - Desktop */}
//           <div className="hidden md:flex flex-wrap gap-4">
//             <div>
//               <span className="text-sm font-medium mb-2 block">Category</span>
//               <div className="flex flex-wrap gap-2">
//                 {categories.map(category => (
//                   <Button
//                     key={category.id}
//                     variant={activeCategory === category.id ? "default" : "outline"}
//                     size="sm"
//                     onClick={() => setActiveCategory(category.id)}
//                   >
//                     {category.name}
//                   </Button>
//                 ))}
//               </div>
//             </div>

//             <div>
//               <span className="text-sm font-medium mb-2 block">Price Range</span>
//               <div className="flex flex-wrap gap-2">
//                 {priceRanges.map(range => (
//                   <Button
//                     key={range.id}
//                     variant={priceRange === range.id ? "default" : "outline"}
//                     size="sm"
//                     onClick={() => setPriceRange(range.id)}
//                   >
//                     {range.name}
//                   </Button>
//                 ))}
//               </div>
//             </div>

//             <div>
//               <span className="text-sm font-medium mb-2 block">Creator</span>
//               <select
//                 className="p-2 rounded-md border border-input bg-background"
//                 value={selectedCreator}
//                 onChange={(e) => setSelectedCreator(e.target.value)}
//               >
//                 {creators.map(creator => (
//                   <option key={creator.id} value={creator.id}>{creator.name}</option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           {/* Mobile Filters */}
//           {showFilters && (
//             <div className="md:hidden mt-4 space-y-4">
//               <div>
//                 <span className="text-sm font-medium mb-2 block">Category</span>
//                 <div className="flex flex-wrap gap-2">
//                   {categories.map(category => (
//                     <Button
//                       key={category.id}
//                       variant={activeCategory === category.id ? "default" : "outline"}
//                       size="sm"
//                       onClick={() => setActiveCategory(category.id)}
//                     >
//                       {category.name}
//                     </Button>
//                   ))}
//                 </div>
//               </div>

//               <div>
//                 <span className="text-sm font-medium mb-2 block">Price Range</span>
//                 <div className="flex flex-wrap gap-2">
//                   {priceRanges.map(range => (
//                     <Button
//                       key={range.id}
//                       variant={priceRange === range.id ? "default" : "outline"}
//                       size="sm"
//                       onClick={() => setPriceRange(range.id)}
//                     >
//                       {range.name}
//                     </Button>
//                   ))}
//                 </div>
//               </div>

//               <div>
//                 <span className="text-sm font-medium mb-2 block">Creator</span>
//                 <select
//                   className="p-2 rounded-md border border-input bg-background w-full"
//                   value={selectedCreator}
//                   onChange={(e) => setSelectedCreator(e.target.value)}
//                 >
//                   {creators.map(creator => (
//                     <option key={creator.id} value={creator.id}>{creator.name}</option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Results Count */}
//         <div className="flex justify-between items-center mb-6">
//           <p className="text-muted-foreground">
//             Showing {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, sortedProducts.length)} of {sortedProducts.length} products
//           </p>

//           {favorites.length > 0 && (
//             <Button variant="outline" size="sm" asChild>
//               <Link href="/wishlist">
//                 View {favorites.length} wishlisted items
//               </Link>
//             </Button>
//           )}
//         </div>

//         {/* Products Grid/List */}
//         {viewMode === "grid" ? (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
//             {currentProducts.map(product => (
//               <div key={product.id} className="bg-card rounded-lg border overflow-hidden hover:shadow-md transition">
//                 <div className="h-48 bg-muted relative">
//                   <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
//                     Product Image
//                   </div>

//                   {product.isNew && (
//                     <div className="absolute top-2 left-2">
//                       <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded">
//                         New
//                       </span>
//                     </div>
//                   )}

//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     className="absolute top-2 right-2 bg-background/80 rounded-full"
//                     onClick={() => toggleFavorite(product.id)}
//                   >
//                     <Heart
//                       className={`h-5 w-5 ${favorites.includes(product.id) ? 'fill-red-500 text-red-500' : ''}`}
//                     />
//                   </Button>
//                 </div>

//                 <div className="p-4">
//                   <Link href={`/product/${product.id}`}>
//                     <h3 className="font-semibold text-lg hover:text-primary">{product.name}</h3>
//                   </Link>

//                   <Link href={`/creator/${product.creator.replace(/\s+/g, '-').toLowerCase()}`}>
//                     <p className="text-sm text-muted-foreground hover:text-primary cursor-pointer mt-1">
//                       By {product.creator}
//                     </p>
//                   </Link>

//                   <div className="flex justify-between items-center mt-3">
//                     <span className="font-bold text-primary">${product.price}</span>
//                     <div className="flex items-center">
//                       <Star className="h-4 w-4 text-amber-500 fill-current" />
//                       <span className="text-sm ml-1">{product.rating}</span>
//                       <span className="text-sm text-muted-foreground ml-1">({product.reviews})</span>
//                     </div>
//                   </div>

//                   <div className="flex gap-2 mt-4">
//                     <Button
//                       variant={cartItems.includes(product.id) ? "default" : "outline"}
//                       className="flex-1"
//                       onClick={() => toggleCart(product.id)}
//                     >
//                       {cartItems.includes(product.id) ? "Added to Cart" : "Add to Cart"}
//                     </Button>

//                     <Button asChild variant="outline" size="icon">
//                       <Link href={`/product/${product.id}`}>
//                         <ShoppingCart className="h-4 w-4" />
//                       </Link>
//                     </Button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="space-y-4 mb-8">
//             {currentProducts.map(product => (
//               <div key={product.id} className="bg-card rounded-lg border p-4 flex hover:shadow-md transition">
//                 <div className="w-32 h-32 bg-muted flex items-center justify-center mr-4 flex-shrink-0">
//                   Product Image
//                 </div>

//                 <div className="flex-1">
//                   <div className="flex justify-between items-start mb-2">
//                     <div>
//                       <Link href={`/product/${product.id}`}>
//                         <h3 className="font-semibold text-lg hover:text-primary">{product.name}</h3>
//                       </Link>

//                       <Link href={`/creator/${product.creator.replace(/\s+/g, '-').toLowerCase()}`}>
//                         <p className="text-sm text-muted-foreground hover:text-primary cursor-pointer">
//                           By {product.creator}
//                         </p>
//                       </Link>
//                     </div>

//                     <span className="font-bold text-primary">${product.price}</span>
//                   </div>

//                   <div className="flex items-center mb-2">
//                     <div className="flex items-center mr-2">
//                       <Star className="h-4 w-4 text-amber-500 fill-current" />
//                       <span className="text-sm ml-1">{product.rating}</span>
//                     </div>
//                     <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>

//                     {product.isNew && (
//                       <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded ml-3">
//                         New
//                       </span>
//                     )}
//                   </div>

//                   <p className="text-muted-foreground mb-4 line-clamp-2">
//                     Product description would go here in a real application.
//                   </p>

//                   <div className="flex items-center gap-2">
//                     <Button
//                       variant={cartItems.includes(product.id) ? "default" : "outline"}
//                       onClick={() => toggleCart(product.id)}
//                     >
//                       {cartItems.includes(product.id) ? "Added to Cart" : "Add to Cart"}
//                     </Button>

//                     <Button
//                       variant="ghost"
//                       size="icon"
//                       onClick={() => toggleFavorite(product.id)}
//                     >
//                       <Heart
//                         className={`h-5 w-5 ${favorites.includes(product.id) ? 'fill-red-500 text-red-500' : ''}`}
//                       />
//                     </Button>

//                     <Button asChild variant="outline" size="sm">
//                       <Link href={`/product/${product.id}`}>
//                         View Details
//                       </Link>
//                     </Button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* Empty State */}
//         {sortedProducts.length === 0 && (
//           <div className="text-center py-12">
//             <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
//               <Search className="h-10 w-10 text-muted-foreground" />
//             </div>
//             <h3 className="text-xl font-semibold mb-2">No products found</h3>
//             <p className="text-muted-foreground mb-4">
//               Try adjusting your filters to find what you&apos;re looking for
//             </p>
//             <Button onClick={() => {
//               setSearchQuery("");
//               setActiveCategory("all");
//               setPriceRange("all");
//               setSelectedCreator("all");
//             }}>
//               Clear all filters
//             </Button>
//           </div>
//         )}

//         {/* Pagination */}
//         {sortedProducts.length > 0 && (
//           <div className="flex justify-center mt-8">
//             <div className="flex items-center space-x-2">
//               <Button
//                 variant="outline"
//                 onClick={() => paginate(currentPage - 1)}
//                 disabled={currentPage === 1}
//               >
//                 Previous
//               </Button>

//               {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
//                 // Show pages around current page
//                 let pageNum;
//                 if (totalPages <= 5) {
//                   pageNum = i + 1;
//                 } else if (currentPage <= 3) {
//                   pageNum = i + 1;
//                 } else if (currentPage >= totalPages - 2) {
//                   pageNum = totalPages - 4 + i;
//                 } else {
//                   pageNum = currentPage - 2 + i;
//                 }

//                 return (
//                   <Button
//                     key={pageNum}
//                     variant={currentPage === pageNum ? "default" : "outline"}
//                     onClick={() => paginate(pageNum)}
//                   >
//                     {pageNum}
//                   </Button>
//                 );
//               })}

//               {totalPages > 5 && currentPage < totalPages - 2 && (
//                 <span className="px-2 py-1">...</span>
//               )}

//               {totalPages > 5 && currentPage < totalPages - 2 && (
//                 <Button
//                   variant="outline"
//                   onClick={() => paginate(totalPages)}
//                 >
//                   {totalPages}
//                 </Button>
//               )}

//               <Button
//                 variant="outline"
//                 onClick={() => paginate(currentPage + 1)}
//                 disabled={currentPage === totalPages}
//               >
//                 Next
//               </Button>
//             </div>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }
