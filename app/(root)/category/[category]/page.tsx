"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import Link from "next/link";
import {
  Search,
  Filter,
  Grid,
  List,
  Star,
  X,
  ChevronLeft,
  Loader2,
  Eye,
} from "lucide-react";
import useSWR from "swr";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { useDebounce } from "@/hooks/useDebounce";
import { AddToCartButton } from "@/components/common/add-to-cart-button";
import FavoriteButton from "@/components/common/favorite-button";
import { useWishlist } from "@/hooks/useWishlist";

interface CategoryData {
  category: {
    id: string;
    name: string;
    slug: string;
    description: string;
    icon: string;
  };
  products: Array<{
    id: string;
    createdAt: string;
    updatedAt: string;
    name: string;
    slug: string;
    price: number;
    image: string;
    rating: number;
    description: string;
    stock: number;
    attributes: Record<string, string>;
    materials: string[];
    creator: {
      id: string;
      name: string;
      isVerified: boolean;
    };
  }>;
  filters: {
    price: Array<{
      id: string;
      name: string;
      min: number;
      max: number;
      count: number;
    }>;
    creators: Array<{
      id: string;
      name: string;
      count: number;
      isVerified: boolean;
    }>;
    attributes: Array<{ id: string; name: string; count: number }>;
    materials: Array<{ id: string; name: string; count: number }>;
  };
  totalProducts: number;
}

interface APIResponse {
  success: boolean;
  data: CategoryData;
  message?: string;
}

interface SortOption {
  id: string;
  name: string;
}

const sortOptions: SortOption[] = [
  { id: "featured", name: "Featured" },
  { id: "newest", name: "Newest" },
  { id: "price-low", name: "Price: Low to High" },
  { id: "price-high", name: "Price: High to Low" },
  { id: "rating", name: "Top Rated" },
];

const priceRanges = [
  { id: "under25", name: "Under $25", min: 0, max: 25 },
  { id: "25-50", name: "$25 - $50", min: 25, max: 50 },
  { id: "50-100", name: "$50 - $100", min: 50, max: 100 },
  { id: "over100", name: "Over $100", min: 100, max: 10000 },
];

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

const ITEMS_PER_PAGE = 12;

// Fetcher function for SWR
const fetchCategoryData = async (url: string): Promise<APIResponse> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export default function CategoryPage({ params }: CategoryPageProps) {
  const { category } = use(params);
  const searchParams = useSearchParams();

  // State management
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [priceRange, setPriceRange] = useState("all");
  const [selectedCreators, setSelectedCreators] = useState<string[]>(
    searchParams.get("creators")?.split(",").filter(Boolean) || []
  );
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>(
    searchParams.get("attributes")?.split(",").filter(Boolean) || []
  );
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>(
    searchParams.get("materials")?.split(",").filter(Boolean) || []
  );
  const [sortBy, setSortBy] = useState(
    searchParams.get("sortBy") || "featured"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { isInWishlist, toggleWishlist, wishlistItems } = useWishlist();

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Build query string for API call - ONLY for server-side operations [web:154]
  const buildQueryString = () => {
    const params = new URLSearchParams();

    // Only include search query in API call - filters will be applied client-side
    if (debouncedSearchQuery.trim()) params.set("q", debouncedSearchQuery);
    if (sortBy !== "featured") params.set("sortBy", sortBy);
    // Remove pagination from API - we'll handle it client-side

    return params.toString();
  };

  // SWR hook - fetches ALL products for the category [web:154]
  const queryString = buildQueryString();
  const {
    data: categoryResponse,
    error: categoryError,
    isLoading: categoryLoading,
    isValidating: categoryValidating,
    mutate: refetchCategory,
  } = useSWR<APIResponse>(
    `/api/categories/${category}?${queryString}`,
    fetchCategoryData,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // Cache longer since data doesn't change often
      keepPreviousData: true,
    }
  );

  // Client-side filtering and sorting logic [web:154][web:158]
  const { filteredProducts, availableFilters, totalProducts } = useMemo(() => {
    if (!categoryResponse?.success || !categoryResponse?.data) {
      return {
        filteredProducts: [],
        availableFilters: {
          price: [],
          creators: [],
          attributes: [],
          materials: [],
        },
        totalProducts: 0,
      };
    }

    const { products, filters } = categoryResponse.data;

    // Apply client-side filters [web:156]
    let filtered = [...products];

    // Filter by price range
    if (priceRange !== "all") {
      const range = priceRanges.find((r) => r.id === priceRange);
      if (range) {
        filtered = filtered.filter(
          (product) => product.price >= range.min && product.price <= range.max
        );
      }
    }

    // Filter by selected creators
    if (selectedCreators.length > 0) {
      filtered = filtered.filter((product) =>
        selectedCreators.includes(product.creator.id)
      );
    }

    // Filter by selected attributes (if product has attributes field)
    if (selectedAttributes.length > 0) {
      filtered = filtered.filter((product) => {
        // Assuming product.attributes exists and contains the attribute keys
        return selectedAttributes.some((attr) =>
          product.attributes?.hasOwnProperty(attr)
        );
      });
    }

    // Filter by selected materials
    if (selectedMaterials.length > 0) {
      filtered = filtered.filter((product) => {
        // Assuming product.materials is an array
        return selectedMaterials.some((material) =>
          product.materials?.includes(material)
        );
      });
    }

    // Client-side sorting [web:158]
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "rating":
          return b.rating - a.rating;
        case "newest":
          // Assuming you have a createdAt field
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );
        case "featured":
        default:
          return b.rating - a.rating; // Default to rating
      }
    });

    // Update available filters based on current filtered results
    const updateFilters = (originalFilters: typeof filters) => {
      // Get unique creators from current filtered results
      const availableCreators = Array.from(
        new Set(filtered.map((p) => p.creator.id))
      );

      return {
        ...originalFilters,
        creators: originalFilters.creators.filter((creator) =>
          availableCreators.includes(creator.id)
        ),
        // You can similarly update other filters based on filtered results
      };
    };

    return {
      filteredProducts: filtered,
      availableFilters: updateFilters(filters),
      totalProducts: filtered.length,
    };
  }, [
    categoryResponse,
    priceRange,
    selectedCreators,
    selectedAttributes,
    selectedMaterials,
    sortBy,
  ]);

  // Client-side pagination
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

  // Update URL when filters change (for bookmarking/sharing)
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearchQuery.trim()) params.set("q", debouncedSearchQuery);
    if (priceRange !== "all") params.set("priceRange", priceRange);
    if (selectedCreators.length > 0)
      params.set("creators", selectedCreators.join(","));
    if (selectedAttributes.length > 0)
      params.set("attributes", selectedAttributes.join(","));
    if (selectedMaterials.length > 0)
      params.set("materials", selectedMaterials.join(","));
    if (sortBy !== "featured") params.set("sortBy", sortBy);
    if (currentPage > 1) params.set("page", currentPage.toString());

    const newUrl = `${window.location.pathname}${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    window.history.replaceState(null, "", newUrl);
  }, [
    debouncedSearchQuery,
    priceRange,
    selectedCreators,
    selectedAttributes,
    selectedMaterials,
    sortBy,
    currentPage,
  ]);

  // Filter manipulation functions
  const toggleCreatorFilter = (creatorId: string) => {
    setSelectedCreators((prev) =>
      prev.includes(creatorId)
        ? prev.filter((id) => id !== creatorId)
        : [...prev, creatorId]
    );
    setCurrentPage(1);
  };

  const toggleAttributeFilter = (attributeId: string) => {
    setSelectedAttributes((prev) =>
      prev.includes(attributeId)
        ? prev.filter((id) => id !== attributeId)
        : [...prev, attributeId]
    );
    setCurrentPage(1);
  };

  const toggleMaterialFilter = (materialId: string) => {
    setSelectedMaterials((prev) =>
      prev.includes(materialId)
        ? prev.filter((id) => id !== materialId)
        : [...prev, materialId]
    );
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setPriceRange("all");
    setSelectedCreators([]);
    setSelectedAttributes([]);
    setSelectedMaterials([]);
    setCurrentPage(1);
  };

  const handlePriceRangeChange = (rangeId: string) => {
    setPriceRange(rangeId);
    setCurrentPage(1);
  };

  const handleToggleFavorite = useCallback(
    async (productId: string, productName: string) => {
      await toggleWishlist(productId, productName);
    },
    [toggleWishlist]
  );

  // Loading state
  if (categoryLoading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-80 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (categoryError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Failed to load category</h2>
          <p className="text-muted-foreground mb-4">{categoryError.message}</p>
          <Button onClick={() => refetchCategory()}>Try Again</Button>
        </div>
      </div>
    );
  }

  // Only show full-page skeleton on initial load
  if (!categoryResponse?.success || !categoryResponse?.data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Category not found</h2>
          <Button asChild>
            <Link href="/shop">Browse All Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  const { category: categoryInfo } = categoryResponse.data;
  const isSearching =
    searchQuery !== debouncedSearchQuery && searchQuery.trim() !== "";
  const isOnlyValidating = categoryValidating && !categoryLoading;

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
            <Link href="/shop" className="hover:text-primary">
              Shop
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground capitalize">
              {categoryInfo.name}
            </span>
          </nav>

          <h1 className="text-2xl md:text-3xl font-bold mb-2 capitalize">
            {categoryInfo.name}
          </h1>
          <p className="text-muted-foreground max-w-3xl text-sm md:text-base">
            {categoryInfo.description}
          </p>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6 md:mb-8">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={`Search ${categoryInfo.name.toLowerCase()}...`}
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                  }}
                />
                {/* Show search loading indicator */}
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
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

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="md:hidden">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 sm:w-96 p-5">
                  <SheetHeader className="text-left pb-4">
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>

                  {/* Mobile Filters */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium mb-3">Price Range</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant={priceRange === "all" ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePriceRangeChange("all")}
                          className="text-xs"
                        >
                          Any Price
                        </Button>
                        {priceRanges.map((range) => (
                          <Button
                            key={range.id}
                            variant={
                              priceRange === range.id ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => handlePriceRangeChange(range.id)}
                            className="text-xs"
                          >
                            {range.name}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Creator Filters */}
                    <div>
                      <h3 className="font-medium mb-3">Creators</h3>
                      <div className="space-y-3">
                        {availableFilters.creators.map((creator) => (
                          <div key={creator.id} className="flex items-center">
                            <Checkbox
                              id={`m-creator-${creator.id}`}
                              checked={selectedCreators.includes(creator.id)}
                              onCheckedChange={() =>
                                toggleCreatorFilter(creator.id)
                              }
                            />
                            <Label
                              htmlFor={`creator-${creator.id}`}
                              className="ml-2 text-sm cursor-pointer flex items-center"
                            >
                              {creator.name}
                              {creator.isVerified && (
                                <Badge
                                  variant="secondary"
                                  className="ml-1 text-xs"
                                >
                                  ✓
                                </Badge>
                              )}
                              <span className="text-muted-foreground ml-1">
                                ({creator.count})
                              </span>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Attribute Filters */}
                    <div>
                      <h3 className="font-medium mb-3">Attributes</h3>
                      <div className="space-y-3">
                        {availableFilters.attributes.map((attr) => (
                          <div key={attr.id} className="flex items-center">
                            <Checkbox
                              id={`m-attr-${attr.id}`}
                              checked={selectedAttributes.includes(attr.id)}
                              onCheckedChange={() =>
                                toggleAttributeFilter(attr.id)
                              }
                            />
                            <Label
                              htmlFor={`m-attr-${attr.id}`}
                              className="ml-2 text-sm cursor-pointer"
                            >
                              {attr.name}{" "}
                              <span className="text-muted-foreground">
                                ({attr.count})
                              </span>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Material Filters */}
                    <div>
                      <span className="text-sm font-medium mb-2 block">
                        Materials
                      </span>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {availableFilters.materials.map((material) => (
                          <div key={material.id} className="flex items-center">
                            <Checkbox
                              id={`material-${material.id}`}
                              checked={selectedMaterials.includes(material.id)}
                              onCheckedChange={() =>
                                toggleMaterialFilter(material.id)
                              }
                            />
                            <Label
                              htmlFor={`material-${material.id}`}
                              className="ml-2 text-sm cursor-pointer"
                            >
                              {material.name} ({material.count})
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Category Filters - Desktop */}
            <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <span className="text-sm font-medium mb-2 block">
                  Price Range
                </span>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={priceRange === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePriceRangeChange("all")}
                  >
                    Any Price
                  </Button>
                  {availableFilters.price.map((range) => (
                    <Button
                      key={range.id}
                      variant={priceRange === range.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePriceRangeChange(range.id)}
                    >
                      {range.name} ({range.count})
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-sm font-medium mb-2 block">Creators</span>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {availableFilters.creators.map((creator) => (
                    <div key={creator.id} className="flex items-center">
                      <Checkbox
                        id={`creator-${creator.id}`}
                        checked={selectedCreators.includes(creator.id)}
                        onCheckedChange={() => toggleCreatorFilter(creator.id)}
                      />
                      <Label
                        htmlFor={`creator-${creator.id}`}
                        className="ml-2 text-sm cursor-pointer flex items-center"
                      >
                        {creator.name}
                        {creator.isVerified && (
                          <Badge variant="secondary" className="ml-1 text-xs">
                            ✓
                          </Badge>
                        )}
                        <span className="text-muted-foreground ml-1">
                          ({creator.count})
                        </span>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-sm font-medium mb-2 block">
                  Attributes
                </span>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {availableFilters.attributes.map((attr) => (
                    <div key={attr.id} className="flex items-center">
                      <Checkbox
                        id={`attr-${attr.id}`}
                        checked={selectedAttributes.includes(attr.id)}
                        onCheckedChange={() => toggleAttributeFilter(attr.id)}
                      />
                      <Label
                        htmlFor={`attr-${attr.id}`}
                        className="ml-2 text-sm cursor-pointer"
                      >
                        {attr.name} ({attr.count})
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Material Filters */}
              <div>
                <span className="text-sm font-medium mb-2 block">
                  Materials
                </span>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {availableFilters.materials.map((material) => (
                    <div key={material.id} className="flex items-center">
                      <Checkbox
                        id={`material-${material.id}`}
                        checked={selectedMaterials.includes(material.id)}
                        onCheckedChange={() =>
                          toggleMaterialFilter(material.id)
                        }
                      />
                      <Label
                        htmlFor={`material-${material.id}`}
                        className="ml-2 text-sm cursor-pointer"
                      >
                        {material.name} ({material.count})
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count and Active Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <div className="flex items-center gap-2">
            <p className="text-muted-foreground text-sm">
              {totalProducts} {totalProducts === 1 ? "product" : "products"}{" "}
              found
              {currentPage > 1 && (
                <span>
                  {" "}
                  (Page {currentPage} of {totalPages})
                </span>
              )}
            </p>
            {/* Only show loading when search is happening */}
            {(isSearching || isOnlyValidating) && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>

          {(priceRange !== "all" ||
            selectedCreators.length > 0 ||
            selectedAttributes.length > 0) && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Active filters:
              </span>
              <div className="flex flex-wrap gap-2">
                {priceRange !== "all" && (
                  <Badge variant="secondary" className="text-xs">
                    {
                      availableFilters.price.find((p) => p.id === priceRange)
                        ?.name
                    }
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => setPriceRange("all")}
                    />
                  </Badge>
                )}
                {selectedCreators.map((creatorId) => (
                  <Badge
                    key={creatorId}
                    variant="secondary"
                    className="text-xs"
                  >
                    {
                      availableFilters.creators.find((c) => c.id === creatorId)
                        ?.name
                    }
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => toggleCreatorFilter(creatorId)}
                    />
                  </Badge>
                ))}
                {selectedAttributes.map((attrId) => (
                  <Badge key={attrId} variant="secondary" className="text-xs">
                    {
                      availableFilters.attributes.find((a) => a.id === attrId)
                        ?.name
                    }
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => toggleAttributeFilter(attrId)}
                    />
                  </Badge>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs h-7"
              >
                Clear all
              </Button>
            </div>
          )}

          {wishlistItems.length > 0 && (
            <Button variant="outline" size="sm" asChild className="text-xs">
              <Link href="/wishlist">
                View {wishlistItems.length} wishlisted items
              </Link>
            </Button>
          )}
        </div>

        {/* Products Grid/List */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {paginatedProducts.map((product) => (
              <Card
                key={product.id}
                className="overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="h-40 md:h-48 bg-muted relative">
                  <div className="h-40 md:h-48 bg-muted relative">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        fill
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                        Product Image
                      </div>
                    )}
                  </div>
                  <FavoriteButton
                    productId={product.id}
                    productName={product.name}
                    isInWishlist={isInWishlist}
                    handleToggleFavorite={handleToggleFavorite}
                  />
                </div>

                <CardContent className="p-4">
                  <h3 className="font-semibold text-base md:text-lg line-clamp-1">
                    {product.name}
                  </h3>
                  <Link
                    href={`/creator/${product.creator.id
                      .replace(/\s+/g, "-")
                      .toLowerCase()}`}
                  >
                    <span className="text-sm text-muted-foreground hover:text-primary cursor-pointer block mt-1">
                      By {product.creator.name}
                    </span>
                  </Link>
                  <div className="flex justify-between items-center mt-3">
                    <span className="font-bold text-primary">
                      ₹{product.price}
                    </span>
                    <div className="flex items-center">
                      <Star className="h-3 w-3 md:h-4 md:w-4 text-amber-500 fill-current" />
                      <span className="text-xs md:text-sm ml-1">
                        {product.rating}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <AddToCartButton
                      product={{
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image: product.image,
                        slug: product.slug,
                        stock: product.stock,
                        creator: product.creator,
                      }}
                      variant="compact"
                      className="flex-1"
                    />

                    <Button
                      asChild
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 md:h-9 md:w-9"
                    >
                      <Link href={`/product/${product.slug}`}>
                        <Eye className="h-3 w-3 md:h-4 md:w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedProducts.map((product) => (
              <Card
                key={product.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4 flex flex-col sm:flex-row items-start">
                  <div className="w-full sm:w-32 h-32 bg-muted flex items-center justify-center mr-0 sm:mr-4 mb-3 sm:mb-0 shrink-0 relative">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        fill
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                        Product Image
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base md:text-lg line-clamp-1">
                          {product.name}
                        </h3>
                        <Link
                          href={`/creator/${product.creator.id
                            .replace(/\s+/g, "-")
                            .toLowerCase()}`}
                        >
                          <span className="text-sm text-muted-foreground hover:text-primary cursor-pointer">
                            By {product.creator.name}
                          </span>
                        </Link>
                      </div>

                      <span className="font-bold text-primary text-base md:text-lg ml-2">
                        ₹{product.price}
                      </span>
                    </div>

                    <div className="flex items-center mb-2">
                      <div className="flex items-center mr-2">
                        <Star className="h-3 w-3 md:h-4 md:w-4 text-amber-500 fill-current" />
                        <span className="text-xs md:text-sm ml-1">
                          {product.rating}
                        </span>
                      </div>
                    </div>

                    <p className="text-muted-foreground mb-4 line-clamp-2 text-sm md:text-base">
                      {product.description || "No description available."}
                    </p>

                    <div className="flex items-center gap-2 flex-wrap">
                      <AddToCartButton
                        product={{
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          image: product.image,
                          slug: product.slug,
                          stock: product.stock,
                          creator: product.creator,
                        }}
                        variant="compact"
                        className="flex-1"
                      />

                      <FavoriteButton
                        productId={product.id}
                        productName={product.name}
                        isInWishlist={isInWishlist}
                        handleToggleFavorite={handleToggleFavorite}
                      />

                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-8"
                      >
                        <Link href={`/product/${product.slug}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {totalProducts === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="mx-auto w-16 h-16 md:w-24 md:h-24 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters to find what you&apos;re looking for
              </p>
              <Button onClick={clearAllFilters}>Clear all filters</Button>
            </CardContent>
          </Card>
        )}

        {/* Client-side Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 md:mt-12">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (page) =>
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1
                )
                .map((page, index, array) => (
                  <div key={page} className="flex items-center">
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="px-2">...</span>
                    )}
                    <Button
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  </div>
                ))}

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                Next
                <ChevronLeft className="h-4 w-4 ml-1 rotate-180" />
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// "use client";

// import { use, useEffect, useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
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
// import Link from "next/link";
// import {
//   Search,
//   Filter,
//   Grid,
//   List,
//   Star,
//   Heart,
//   ShoppingCart,
//   X,
//   ChevronLeft,
//   Loader2,
// } from "lucide-react";
// import useSWR from "swr";
// import { useSearchParams } from "next/navigation";
// import Image from "next/image";
// import { useDebounce } from "@/hooks/useDebounce";

// interface CategoryData {
//   category: {
//     id: string;
//     name: string;
//     slug: string;
//     description: string;
//     icon: string;
//   };
//   products: Array<{
//     id: string;
//     name: string;
//     slug: string;
//     price: number;
//     image: string;
//     rating: number;
//     stock: number;
//     creator: {
//       id: string;
//       name: string;
//       isVerified: boolean;
//     };
//   }>;
//   filters: {
//     price: Array<{
//       id: string;
//       name: string;
//       min: number;
//       max: number;
//       count: number;
//     }>;
//     creators: Array<{
//       id: string;
//       name: string;
//       count: number;
//       isVerified: boolean;
//     }>;
//     attributes: Array<{ id: string; name: string; count: number }>;
//     materials: Array<{ id: string; name: string; count: number }>;
//   };
//   totalProducts: number;
// }

// interface APIResponse {
//   success: boolean;
//   data: CategoryData;
//   message?: string;
// }

// interface SortOption {
//   id: string;
//   name: string;
// }

// const sortOptions: SortOption[] = [
//   { id: "featured", name: "Featured" },
//   { id: "newest", name: "Newest" },
//   { id: "price-low", name: "Price: Low to High" },
//   { id: "price-high", name: "Price: High to Low" },
//   { id: "rating", name: "Top Rated" },
// ];

// const priceRanges = [
//   { id: "under25", name: "Under $25", min: 0, max: 25 },
//   { id: "25-50", name: "$25 - $50", min: 25, max: 50 },
//   { id: "50-100", name: "$50 - $100", min: 50, max: 100 },
//   { id: "over100", name: "Over $100", min: 100, max: 10000 },
// ];

// interface CategoryPageProps {
//   params: Promise<{
//     category: string;
//   }>;
// }

// // Fetcher function for SWR
// const fetchCategoryData = async (url: string): Promise<APIResponse> => {
//   const response = await fetch(url);
//   if (!response.ok) {
//     throw new Error(`HTTP error! status: ${response.status}`);
//   }
//   return response.json();
// };

// export default function CategoryPage({ params }: CategoryPageProps) {
//   const { category } = use(params);
//   const searchParams = useSearchParams();

//   // State management
//   const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
//   const [priceRange, setPriceRange] = useState("all");
//   const [selectedCreators, setSelectedCreators] = useState<string[]>(
//     searchParams.get("creators")?.split(",") || []
//   );
//   const [selectedAttributes, setSelectedAttributes] = useState<string[]>(
//     searchParams.get("attributes")?.split(",") || []
//   );
//   const [selectedMaterials, setSelectedMaterials] = useState<string[]>(
//     searchParams.get("materials")?.split(",") || []
//   );
//   const [sortBy, setSortBy] = useState(
//     searchParams.get("sortBy") || "featured"
//   );
//   const [currentPage, setCurrentPage] = useState(
//     parseInt(searchParams.get("page") || "1", 10)
//   );
//   const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
//   const [favorites, setFavorites] = useState<string[]>(["2"]);
//   const [cartItems, setCartItems] = useState<string[]>([]);
//   const [isFilterLoading, setIsFilterLoading] = useState(false);

//   // Debounce search query [web:138][web:140]
//   const debouncedSearchQuery = useDebounce(searchQuery, 500);

//   // Build query string for API call [web:98][web:100]
//   const buildQueryString = () => {
//     const params = new URLSearchParams();

//     if (debouncedSearchQuery.trim()) params.set("q", debouncedSearchQuery);
//     if (priceRange !== "all") {
//       const range = priceRanges.find((r) => r.id === priceRange);
//       if (range) {
//         params.set("priceMin", range.min.toString());
//         params.set("priceMax", range.max.toString());
//       }
//     }
//     if (selectedCreators.length > 0)
//       params.set("creators", selectedCreators.join(","));
//     if (selectedAttributes.length > 0)
//       params.set("attributes", selectedAttributes.join(","));
//     if (selectedMaterials.length > 0)
//       params.set("materials", selectedMaterials.join(","));
//     if (sortBy !== "featured") params.set("sortBy", sortBy);
//     if (currentPage > 1) params.set("page", currentPage.toString());

//     return params.toString();
//   };

//   // SWR hook for fetching data [web:98]
//   const queryString = buildQueryString();
//   const {
//     data: categoryResponse,
//     error: categoryError,
//     isLoading: categoryLoading, // Only true on first load
//     isValidating: categoryValidating, // True during any revalidation
//     mutate: refetchCategory,
//   } = useSWR<APIResponse>(
//     `/api/categories/${category}?${queryString}`,
//     fetchCategoryData,
//     {
//       revalidateOnFocus: false,
//       revalidateOnReconnect: true,
//       dedupingInterval: 30000,
//       keepPreviousData: true,
//     }
//   );

//   // Update URL when filters change
//   useEffect(() => {
//     const params = new URLSearchParams();
//     if (debouncedSearchQuery.trim()) params.set("q", debouncedSearchQuery);
//     if (priceRange !== "all") params.set("priceRange", priceRange);
//     if (selectedCreators.length > 0)
//       params.set("creators", selectedCreators.join(","));
//     if (selectedAttributes.length > 0)
//       params.set("attributes", selectedAttributes.join(","));
//     if (selectedMaterials.length > 0)
//       params.set("materials", selectedMaterials.join(","));
//     if (sortBy !== "featured") params.set("sortBy", sortBy);
//     if (currentPage > 1) params.set("page", currentPage.toString());

//     const newUrl = `${window.location.pathname}${
//       params.toString() ? `?${params.toString()}` : ""
//     }`;
//     window.history.replaceState(null, "", newUrl);

//     // Set loading state for products only when filters change
//     if (categoryResponse?.data) {
//       setIsFilterLoading(true);
//       // Auto-hide loading after a short delay if validation completes quickly
//       const timeout = setTimeout(() => setIsFilterLoading(false), 100);
//       return () => clearTimeout(timeout);
//     }
//   }, [searchQuery, priceRange, selectedCreators, selectedAttributes, selectedMaterials, sortBy, currentPage, categoryResponse?.data, debouncedSearchQuery]);

//   // Reset filter loading when validation completes
//   useEffect(() => {
//     if (!categoryValidating) {
//       setIsFilterLoading(false);
//     }
//   }, [categoryValidating]);

//   // Filter manipulation functions
//   const toggleCreatorFilter = (creatorId: string) => {
//     setSelectedCreators((prev) =>
//       prev.includes(creatorId)
//         ? prev.filter((id) => id !== creatorId)
//         : [...prev, creatorId]
//     );
//     setCurrentPage(1);
//     setIsFilterLoading(true); // Immediate feedback
//   };

//   const toggleAttributeFilter = (attributeId: string) => {
//     setSelectedAttributes((prev) =>
//       prev.includes(attributeId)
//         ? prev.filter((id) => id !== attributeId)
//         : [...prev, attributeId]
//     );
//     setCurrentPage(1);
//     setIsFilterLoading(true);
//   };

//   const toggleMaterialFilter = (materialId: string) => {
//     setSelectedMaterials((prev) =>
//       prev.includes(materialId)
//         ? prev.filter((id) => id !== materialId)
//         : [...prev, materialId]
//     );
//     setCurrentPage(1);
//     setIsFilterLoading(true);
//   };

//   const clearAllFilters = () => {
//     setSearchQuery("");
//     setPriceRange("all");
//     setSelectedCreators([]);
//     setSelectedAttributes([]);
//     setSelectedMaterials([]);
//     setCurrentPage(1);
//     setIsFilterLoading(true);
//   };

//   // Handle price range change properly
//   const handlePriceRangeChange = (rangeId: string) => {
//     setPriceRange(rangeId);
//     setCurrentPage(1);
//     setIsFilterLoading(true);
//   };

//   const toggleFavorite = (productId: string) => {
//     if (favorites.includes(productId)) {
//       setFavorites(favorites.filter((id) => id !== productId));
//     } else {
//       setFavorites([...favorites, productId]);
//     }
//   };

//   const toggleCart = (productId: string) => {
//     if (cartItems.includes(productId)) {
//       setCartItems(cartItems.filter((id) => id !== productId));
//     } else {
//       setCartItems([...cartItems, productId]);
//     }
//   };

//   // Loading state
//   if (categoryLoading) {
//     return (
//       <div className="min-h-screen bg-background">
//         <main className="container mx-auto px-4 py-8">
//           <div className="animate-pulse space-y-4">
//             <div className="h-8 bg-muted rounded w-1/3"></div>
//             <div className="h-4 bg-muted rounded w-2/3"></div>
//             <div className="h-32 bg-muted rounded"></div>
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//               {[...Array(8)].map((_, i) => (
//                 <div key={i} className="h-80 bg-muted rounded"></div>
//               ))}
//             </div>
//           </div>
//         </main>
//       </div>
//     );
//   }

//   // Error state
//   if (categoryError) {
//     return (
//       <div className="min-h-screen bg-background flex items-center justify-center">
//         <div className="text-center">
//           <h2 className="text-2xl font-bold mb-4">Failed to load category</h2>
//           <p className="text-muted-foreground mb-4">{categoryError.message}</p>
//           <Button onClick={() => refetchCategory()}>Try Again</Button>
//         </div>
//       </div>
//     );
//   }

//   // Only show full-page skeleton on initial load
//   if (!categoryResponse?.success || !categoryResponse?.data) {
//     if (categoryLoading) {
//       return (
//         <div className="min-h-screen bg-background">
//           <main className="container mx-auto px-4 py-8">
//             <div className="animate-pulse space-y-4">
//               <div className="h-8 bg-muted rounded w-1/3"></div>
//               <div className="h-4 bg-muted rounded w-2/3"></div>
//               <div className="h-32 bg-muted rounded"></div>
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//                 {[...Array(8)].map((_, i) => (
//                   <div key={i} className="h-80 bg-muted rounded"></div>
//                 ))}
//               </div>
//             </div>
//           </main>
//         </div>
//       );
//     }

//     return (
//       <div className="min-h-screen bg-background flex items-center justify-center">
//         <div className="text-center">
//           <h2 className="text-2xl font-bold mb-4">Category not found</h2>
//           <Button asChild>
//             <Link href="/shop">Browse All Products</Link>
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   const {
//     category: categoryInfo,
//     products,
//     filters,
//     totalProducts,
//   } = categoryResponse.data;

//   const isProductsLoading = isFilterLoading || categoryValidating;
//   const isSearching = searchQuery !== debouncedSearchQuery && searchQuery.trim() !== "";

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
//             <Link href="/shop" className="hover:text-primary">
//               Shop
//             </Link>
//             <span className="mx-2">/</span>
//             <span className="text-foreground capitalize">
//               {categoryInfo.name}
//             </span>
//           </nav>

//           <h1 className="text-2xl md:text-3xl font-bold mb-2 capitalize">
//             {categoryInfo.name}
//           </h1>
//           <p className="text-muted-foreground max-w-3xl text-sm md:text-base">
//             {categoryInfo.description}
//           </p>
//         </div>

//         {/* Filters and Search */}
//         <Card className="mb-6 md:mb-8">
//           <CardContent className="p-4 md:p-6">
//             <div className="flex flex-col md:flex-row gap-4 mb-4">
//               <div className="relative flex-1">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                 <Input
//                   placeholder={`Search ${categoryInfo.name.toLowerCase()}...`}
//                   className="pl-10"
//                   value={searchQuery}
//                   onChange={(e) => {
//                     setSearchQuery(e.target.value);
//                     setCurrentPage(1);
//                   }}
//                 />
//                 {/* Show search loading indicator */}
//                 {isSearching && (
//                   <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
//                 )}
//               </div>

//               <Select
//                 value={sortBy}
//                 onValueChange={(value) => {
//                   setSortBy(value);
//                   setCurrentPage(1);
//                   setIsFilterLoading(true);
//                 }}
//               >
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
//                   <Button
//                     variant="outline"
//                     className="md:hidden"
//                   >
//                     <Filter className="h-4 w-4 mr-2" />
//                     Filters
//                   </Button>
//                 </SheetTrigger>
//                 <SheetContent side="left" className="w-80 sm:w-96 p-5">
//                   <SheetHeader className="text-left pb-4">
//                     <SheetTitle>Filters</SheetTitle>
//                   </SheetHeader>

//                   {/* Mobile Filters */}
//                   <div className="space-y-6">
//                     <div>
//                       <h3 className="font-medium mb-3">Price Range</h3>
//                       <div className="grid grid-cols-2 gap-2">
//                         <Button
//                           variant={priceRange === "all" ? "default" : "outline"}
//                           size="sm"
//                           onClick={() => handlePriceRangeChange("all")}
//                           className="text-xs"
//                         >
//                           Any Price
//                         </Button>
//                         {filters.price.map((range) => (
//                           <Button
//                             key={range.id}
//                             variant={priceRange === range.id ? "default" : "outline"}
//                             size="sm"
//                             onClick={() => handlePriceRangeChange(range.id)}
//                             className="text-xs"
//                           >
//                             {range.name} ({range.count})
//                           </Button>
//                         ))}
//                       </div>
//                     </div>

//                     {/* Creator Filters */}
//                     <div>
//                       <h3 className="font-medium mb-3">Creators</h3>
//                       <div className="space-y-3">
//                         {filters.creators.map((creator) => (
//                           <div key={creator.id} className="flex items-center">
//                             <Checkbox
//                               id={`m-creator-${creator.id}`}
//                               checked={selectedCreators.includes(creator.id)}
//                               onCheckedChange={() =>
//                                 toggleCreatorFilter(creator.id)
//                               }
//                             />
//                             <Label
//                               htmlFor={`creator-${creator.id}`}
//                               className="ml-2 text-sm cursor-pointer flex items-center"
//                             >
//                               {creator.name}
//                               {creator.isVerified && (
//                                 <Badge
//                                   variant="secondary"
//                                   className="ml-1 text-xs"
//                                 >
//                                   ✓
//                                 </Badge>
//                               )}
//                               <span className="text-muted-foreground ml-1">
//                                 ({creator.count})
//                               </span>
//                             </Label>
//                           </div>
//                         ))}
//                       </div>
//                     </div>

//                     {/* Attribute Filters */}
//                     <div>
//                       <h3 className="font-medium mb-3">Attributes</h3>
//                       <div className="space-y-3">
//                         {filters.attributes.map((attr) => (
//                           <div key={attr.id} className="flex items-center">
//                             <Checkbox
//                               id={`m-attr-${attr.id}`}
//                               checked={selectedAttributes.includes(attr.id)}
//                               onCheckedChange={() =>
//                                 toggleAttributeFilter(attr.id)
//                               }
//                             />
//                             <Label
//                               htmlFor={`m-attr-${attr.id}`}
//                               className="ml-2 text-sm cursor-pointer"
//                             >
//                               {attr.name}{" "}
//                               <span className="text-muted-foreground">
//                                 ({attr.count})
//                               </span>
//                             </Label>
//                           </div>
//                         ))}
//                       </div>
//                     </div>

//                     {/* Material Filters */}
//                     <div>
//                       <span className="text-sm font-medium mb-2 block">
//                         Materials
//                       </span>
//                       <div className="space-y-2 max-h-40 overflow-y-auto">
//                         {filters.materials.map((material) => (
//                           <div key={material.id} className="flex items-center">
//                             <Checkbox
//                               id={`material-${material.id}`}
//                               checked={selectedMaterials.includes(material.id)}
//                               onCheckedChange={() =>
//                                 toggleMaterialFilter(material.id)
//                               }
//                             />
//                             <Label
//                               htmlFor={`material-${material.id}`}
//                               className="ml-2 text-sm cursor-pointer"
//                             >
//                               {material.name} ({material.count})
//                             </Label>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   </div>
//                 </SheetContent>
//               </Sheet>
//             </div>

//             {/* Category Filters - Desktop */}
//             <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-6">
//               <div>
//                 <span className="text-sm font-medium mb-2 block">
//                   Price Range
//                 </span>
//                 <div className="flex flex-wrap gap-2">
//                   <Button
//                     variant={priceRange === "all" ? "default" : "outline"}
//                     size="sm"
//                     onClick={() => handlePriceRangeChange("all")}
//                   >
//                     Any Price
//                   </Button>
//                   {filters.price.map((range) => (
//                     <Button
//                       key={range.id}
//                       variant={priceRange === range.id ? "default" : "outline"}
//                       size="sm"
//                       onClick={() => handlePriceRangeChange(range.id)}
//                     >
//                       {range.name} ({range.count})
//                     </Button>
//                   ))}
//                 </div>
//               </div>

//               <div>
//                 <span className="text-sm font-medium mb-2 block">Creators</span>
//                 <div className="space-y-2 max-h-40 overflow-y-auto">
//                   {filters.creators.map((creator) => (
//                     <div key={creator.id} className="flex items-center">
//                       <Checkbox
//                         id={`creator-${creator.id}`}
//                         checked={selectedCreators.includes(creator.id)}
//                         onCheckedChange={() => toggleCreatorFilter(creator.id)}
//                       />
//                       <Label
//                         htmlFor={`creator-${creator.id}`}
//                         className="ml-2 text-sm cursor-pointer flex items-center"
//                       >
//                         {creator.name}
//                         {creator.isVerified && (
//                           <Badge variant="secondary" className="ml-1 text-xs">✓</Badge>
//                         )}
//                         <span className="text-muted-foreground ml-1">({creator.count})</span>
//                       </Label>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               <div>
//                 <span className="text-sm font-medium mb-2 block">Attributes</span>
//                 <div className="space-y-2 max-h-40 overflow-y-auto">
//                   {filters.attributes.map((attr) => (
//                     <div key={attr.id} className="flex items-center">
//                       <Checkbox
//                         id={`attr-${attr.id}`}
//                         checked={selectedAttributes.includes(attr.id)}
//                         onCheckedChange={() => toggleAttributeFilter(attr.id)}
//                       />
//                       <Label
//                         htmlFor={`attr-${attr.id}`}
//                         className="ml-2 text-sm cursor-pointer"
//                       >
//                         {attr.name} ({attr.count})
//                       </Label>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Material Filters */}
//               <div>
//                 <span className="text-sm font-medium mb-2 block">Materials</span>
//                 <div className="space-y-2 max-h-40 overflow-y-auto">
//                   {filters.materials.map((material) => (
//                     <div key={material.id} className="flex items-center">
//                       <Checkbox
//                         id={`material-${material.id}`}
//                         checked={selectedMaterials.includes(material.id)}
//                         onCheckedChange={() => toggleMaterialFilter(material.id)}
//                       />
//                       <Label
//                         htmlFor={`material-${material.id}`}
//                         className="ml-2 text-sm cursor-pointer"
//                       >
//                         {material.name} ({material.count})
//                       </Label>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Results Count and Active Filters */}
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
//           <div className="flex items-center gap-2">
//             <p className="text-muted-foreground text-sm">
//               {products.length} of {totalProducts} products found
//             </p>
//             {(isProductsLoading || isSearching) && (
//               <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
//             )}
//           </div>

//           {(priceRange !== "all" ||
//             selectedCreators.length > 0 ||
//             selectedAttributes.length > 0) && (
//             <div className="flex items-center gap-2">
//               <span className="text-sm text-muted-foreground">
//                 Active filters:
//               </span>
//               <div className="flex flex-wrap gap-2">
//                 {priceRange !== "all" && (
//                   <Badge variant="secondary" className="text-xs">
//                     {filters.price.find((p) => p.id === priceRange)?.name}
//                     <X
//                       className="h-3 w-3 ml-1 cursor-pointer"
//                       onClick={() => setPriceRange("all")}
//                     />
//                   </Badge>
//                 )}
//                 {selectedCreators.map((creatorId) => (
//                   <Badge
//                     key={creatorId}
//                     variant="secondary"
//                     className="text-xs"
//                   >
//                     {filters.creators.find((c) => c.id === creatorId)?.name}
//                     <X
//                       className="h-3 w-3 ml-1 cursor-pointer"
//                       onClick={() => toggleCreatorFilter(creatorId)}
//                     />
//                   </Badge>
//                 ))}
//                 {selectedAttributes.map((attrId) => (
//                   <Badge key={attrId} variant="secondary" className="text-xs">
//                     {filters.attributes.find((a) => a.id === attrId)?.name}
//                     <X
//                       className="h-3 w-3 ml-1 cursor-pointer"
//                       onClick={() => toggleAttributeFilter(attrId)}
//                     />
//                   </Badge>
//                 ))}
//               </div>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={clearAllFilters}
//                 className="text-xs h-7"
//               >
//                 Clear all
//               </Button>
//             </div>
//           )}

//           {favorites.length > 0 && (
//             <Button variant="outline" size="sm" asChild className="text-xs">
//               <Link href="/wishlist">
//                 View {favorites.length} wishlisted items
//               </Link>
//             </Button>
//           )}
//         </div>

//         {/* Products Section - Show loading overlay or skeleton [web:121] */}
//         <div className="relative">
//           {/* Loading overlay for products */}
//           {isProductsLoading && (
//             <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-start justify-center pt-8">
//               <div className="flex items-center gap-2 bg-background border rounded-lg px-4 py-2 shadow-lg">
//                 <Loader2 className="h-4 w-4 animate-spin" />
//                 <span className="text-sm">
//                   {isSearching ? "Searching..." : "Updating products..."}
//                 </span>
//               </div>
//             </div>
//           )}

//           {/* Products Grid/List */}
//           {viewMode === "grid" ? (
//             <div
//               className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 transition-opacity ${
//                 isProductsLoading ? "opacity-60" : "opacity-100"
//               }`}
//             >
//               {products.map((product) => (
//                 <Card
//                   key={product.id}
//                   className="overflow-hidden hover:shadow-md transition-shadow"
//                 >
//                   <div className="h-40 md:h-48 bg-muted relative">
//                     <div className="h-40 md:h-48 bg-muted relative">
//                       {product.image ? (
//                         <Image
//                           src={product.image}
//                           alt={product.name}
//                           className="w-full h-full object-cover"
//                           fill
//                         />
//                       ) : (
//                         <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
//                           Product Image
//                         </div>
//                       )}
//                     </div>
//                     <Button
//                       variant="ghost"
//                       size="icon"
//                       className="absolute top-2 right-2 bg-background/80 rounded-full h-8 w-8"
//                       onClick={() => toggleFavorite(product.id)}
//                     >
//                       <Heart
//                         className={`h-4 w-4 ${
//                           favorites.includes(product.id)
//                             ? "fill-red-500 text-red-500"
//                             : ""
//                         }`}
//                       />
//                     </Button>
//                   </div>

//                   <CardContent className="p-4">
//                     <h3 className="font-semibold text-base md:text-lg line-clamp-1">
//                       {product.name}
//                     </h3>
//                     <Link
//                       href={`/creator/${product.creator.id
//                         .replace(/\s+/g, "-")
//                         .toLowerCase()}`}
//                     >
//                       <span className="text-sm text-muted-foreground hover:text-primary cursor-pointer block mt-1">
//                         By {product.creator.name}
//                       </span>
//                     </Link>
//                     <div className="flex justify-between items-center mt-3">
//                       <span className="font-bold text-primary">
//                         ₹{product.price}
//                       </span>
//                       <div className="flex items-center">
//                         <Star className="h-3 w-3 md:h-4 md:w-4 text-amber-500 fill-current" />
//                         <span className="text-xs md:text-sm ml-1">
//                           {product.rating}
//                         </span>
//                       </div>
//                     </div>

//                     <div className="flex gap-2 mt-4">
//                       <Button
//                         variant={
//                           cartItems.includes(product.id) ? "default" : "outline"
//                         }
//                         className="flex-1 text-xs md:text-sm h-8 md:h-9"
//                         onClick={() => toggleCart(product.id)}
//                       >
//                         {cartItems.includes(product.id)
//                           ? "Added"
//                           : "Add to Cart"}
//                       </Button>
//                       <Button
//                         asChild
//                         variant="outline"
//                         size="icon"
//                         className="h-8 w-8 md:h-9 md:w-9"
//                       >
//                         <Link href={`/product/${product.id}`}>
//                           <ShoppingCart className="h-3 w-3 md:h-4 md:w-4" />
//                         </Link>
//                       </Button>
//                     </div>
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           ) : (
//             <div
//               className={`space-y-4 transition-opacity ${
//                 isProductsLoading ? "opacity-60" : "opacity-100"
//               }`}
//             >
//               {products.map((product) => (
//                 <Card
//                   key={product.id}
//                   className="hover:shadow-md transition-shadow"
//                 >
//                   <CardContent className="p-4 flex flex-col sm:flex-row items-start">
//                     <div className="w-full sm:w-32 h-32 bg-muted flex items-center justify-center mr-0 sm:mr-4 mb-3 sm:mb-0 flex-shrink-0">
//                       Product Image
//                     </div>

//                     <div className="flex-1 min-w-0">
//                       <div className="flex justify-between items-start mb-2">
//                         <div className="flex-1 min-w-0">
//                           <h3 className="font-semibold text-base md:text-lg line-clamp-1">
//                             {product.name}
//                           </h3>
//                           <Link
//                             href={`/creator/${product.creator.id
//                               .replace(/\s+/g, "-")
//                               .toLowerCase()}`}
//                           >
//                             <span className="text-sm text-muted-foreground hover:text-primary cursor-pointer">
//                               By {product.creator.name}
//                             </span>
//                           </Link>
//                         </div>

//                         <span className="font-bold text-primary text-base md:text-lg ml-2">
//                           ₹{product.price}
//                         </span>
//                       </div>

//                       <div className="flex items-center mb-2">
//                         <div className="flex items-center mr-2">
//                           <Star className="h-3 w-3 md:h-4 md:w-4 text-amber-500 fill-current" />
//                           <span className="text-xs md:text-sm ml-1">
//                             {product.rating}
//                           </span>
//                         </div>
//                       </div>

//                       <p className="text-muted-foreground mb-4 line-clamp-2 text-sm md:text-base">
//                         Product description would go here in a real application.
//                       </p>

//                       <div className="flex items-center gap-2 flex-wrap">
//                         <Button
//                           variant={
//                             cartItems.includes(product.id)
//                               ? "default"
//                               : "outline"
//                           }
//                           onClick={() => toggleCart(product.id)}
//                           size="sm"
//                           className="text-xs md:text-sm h-8"
//                         >
//                           {cartItems.includes(product.id)
//                             ? "Added to Cart"
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
//                           <Link href={`/product/${product.id}`}>
//                             View Details
//                           </Link>
//                         </Button>
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Empty State */}
//         {!isProductsLoading && totalProducts === 0 && (
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

//         {/* Pagination - Always visible */}
//         {totalProducts > 0 && (
//           <div className="flex justify-center mt-8 md:mt-12">
//             <div className="flex items-center space-x-2">
//               <Button
//                 variant="outline"
//                 size="sm"
//                 disabled={currentPage <= 1 || isProductsLoading}
//                 onClick={() => {
//                   setCurrentPage((prev) => Math.max(1, prev - 1));
//                   setIsFilterLoading(true);
//                 }}
//               >
//                 <ChevronLeft className="h-4 w-4 mr-1" />
//                 Previous
//               </Button>

//               {/* Pagination numbers - disable during loading */}
//               {Array.from(
//                 { length: Math.ceil(totalProducts / 12) },
//                 (_, i) => i + 1
//               )
//                 .filter(
//                   (page) =>
//                     page === 1 ||
//                     page === Math.ceil(totalProducts / 12) ||
//                     Math.abs(page - currentPage) <= 1
//                 )
//                 .map((page, index, array) => (
//                   <div key={page} className="flex items-center">
//                     {index > 0 && array[index - 1] !== page - 1 && (
//                       <span className="px-2">...</span>
//                     )}
//                     <Button
//                       variant={currentPage === page ? "default" : "outline"}
//                       size="sm"
//                       disabled={isProductsLoading}
//                       onClick={() => {
//                         setCurrentPage(page);
//                         setIsFilterLoading(true);
//                       }}
//                     >
//                       {page}
//                     </Button>
//                   </div>
//                 ))}

//               <Button
//                 variant="outline"
//                 size="sm"
//                 disabled={
//                   currentPage >= Math.ceil(totalProducts / 12) ||
//                   isProductsLoading
//                 }
//                 onClick={() => {
//                   setCurrentPage((prev) => prev + 1);
//                   setIsFilterLoading(true);
//                 }}
//               >
//                 Next
//                 <ChevronLeft className="h-4 w-4 ml-1 rotate-180" />
//               </Button>
//             </div>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }
