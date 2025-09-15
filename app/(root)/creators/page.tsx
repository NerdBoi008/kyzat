"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  MapPin,
  Users,
  Star,
  Grid,
  List,
  X,
  CircleCheckIcon,
} from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { FollowButton } from "@/components/common/follow-button";
import { useFollow } from "@/hooks/useFollow";
import { Creator, User } from "@/lib/db/schema";

export interface CreatorWithUser extends Omit<Creator, "userId"> {
  user: User;
}

interface Category {
  id: string;
  name: string;
}

interface APIResponse {
  success: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  data: Array<{
    creator: Creator;
    user: User;
  }>;
}

// Fetcher function for SWR
const fetchCreators = async (url: string): Promise<APIResponse> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

const categories: Category[] = [
  { id: "all", name: "All Creators" },
  { id: "clothing", name: "Clothing & Textiles" },
  { id: "jewelry", name: "Jewelry" },
  { id: "crockery", name: "Pottery & Ceramics" },
  { id: "art", name: "Art" },
  { id: "home", name: "Home Decor" },
];

const locations = [
  "All Locations",
  "Portland, OR",
  "Asheville, NC",
  "Santa Fe, NM",
  "San Diego, CA",
  "Denver, CO",
  "Seattle, WA",
  "Austin, TX",
];

const sortOptions = [
  { id: "popular", name: "Most Popular" },
  { id: "rating", name: "Highest Rated" },
  { id: "newest", name: "Newest" },
  { id: "name", name: "Alphabetical" },
];

export default function CreatorsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("popular");
  const [currentPage, setCurrentPage] = useState(1);
  const { followedCreators } = useFollow();
  const [showFollowingOnly, setShowFollowingOnly] = useState(false);

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const itemsPerPage = 50;

  // Build API URL based on filters
  const buildApiUrl = (
    query: string,
    category: string,
    location: string,
    page: number,
    limit: number,
    followingOnly: boolean
  ) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (query.trim()) {
      params.append("q", query.trim());
    }

    if (category !== "all") {
      // You might need to adjust this based on how your API handles categories
      params.append("category", category);
    }

    if (location !== "All Locations") {
      params.append("location", location);
    }

    if (followingOnly) {
      params.append("followingOnly", "true");
    }

    return `/api/creators?${params.toString()}`;
  };

  const apiUrl = buildApiUrl(
    debouncedSearchQuery,
    activeCategory,
    selectedLocation,
    currentPage,
    itemsPerPage,
    showFollowingOnly
  );

  // SWR hook for fetching creators data
  const {
    data: creatorsData,
    error: creatorsError,
    isLoading: creatorsLoading,
    mutate: mutateCreators,
  } = useSWR(apiUrl, fetchCreators, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 30000, // 30 seconds
    errorRetryCount: 3,
    errorRetryInterval: 5000,
  });

  // Transform API data to match component structure
  const creators: CreatorWithUser[] = useMemo(() => {
    return creatorsData?.success && creatorsData.data
      ? creatorsData.data.map((item) => ({
          ...item.creator,
          user: item.user,
        }))
      : [];
  }, [creatorsData]);

  // Client-side sorting (since some sort options might not be available in API)
  const sortedCreators = useMemo(() => {
    if (!creators.length) return [];

    const sorted = [...creators];

    switch (sortBy) {
      case "popular":
        return sorted.sort((a, b) => (b.followers || 0) - (a.followers || 0));
      case "rating":
        return sorted.sort(
          (a, b) => Number(b.rating || 0) - Number(a.rating || 0)
        );
      case "newest":
        return sorted.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA;
        });
      case "name":
        return sorted.sort((a, b) =>
          (a.user?.name || "").localeCompare(b.user?.name || "")
        );
      default:
        return sorted;
    }
  }, [creators, sortBy]);

  const clearAllFilters = () => {
    setSearchQuery("");
    setActiveCategory("all");
    setSelectedLocation("All Locations");
    setCurrentPage(1);
  };

  // Handle filter changes and reset page
  const handleFilterChange = (filterType: string, value: string) => {
    setCurrentPage(1);

    switch (filterType) {
      case "search":
        setSearchQuery(value);
        break;
      case "category":
        setActiveCategory(value);
        break;
      case "location":
        setSelectedLocation(value);
        break;
    }
  };

  // Pagination helpers
  const totalPages = creatorsData?.pagination?.totalPages || 0;
  const totalItems = creatorsData?.pagination?.total || 0;

  return (
    <main className="container mx-auto px-4 py-6 md:py-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Meet Our Creators
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Discover talented local artisans and follow your favorites to get
          updates on their latest creations
        </p>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6 md:mb-8">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search creators by name or specialty..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>

            <Select
              value={selectedLocation}
              onValueChange={(value) => handleFilterChange("location", value)}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange("category", category.id)}
                className="text-xs md:text-sm"
              >
                {category.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Results Count and Active Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <p className="text-muted-foreground text-sm">
          {creatorsLoading
            ? "Loading creators..."
            : `${totalItems} ${
                totalItems === 1 ? "creator" : "creators"
              } found`}
        </p>

        <div className="flex items-center gap-2">
          {(activeCategory !== "all" ||
            selectedLocation !== "All Locations" ||
            searchQuery) && (
            <>
              <span className="text-sm text-muted-foreground">
                Active filters:
              </span>
              <div className="flex flex-wrap gap-2">
                {activeCategory !== "all" && (
                  <Badge variant="secondary" className="text-xs">
                    {categories.find((c) => c.id === activeCategory)?.name}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => handleFilterChange("category", "all")}
                    />
                  </Badge>
                )}
                {selectedLocation !== "All Locations" && (
                  <Badge variant="secondary" className="text-xs">
                    {selectedLocation}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() =>
                        handleFilterChange("location", "All Locations")
                      }
                    />
                  </Badge>
                )}
                {searchQuery && (
                  <Badge variant="secondary" className="text-xs">
                    Search: {searchQuery}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => handleFilterChange("search", "")}
                    />
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs h-7"
              >
                Clear all
              </Button>
            </>
          )}

          {followedCreators.size > 0 && (
            <Button
              variant={showFollowingOnly ? "default" : "outline"}
              size="sm"
              className="text-xs"
              disabled={creatorsLoading}
              onClick={() => setShowFollowingOnly(!showFollowingOnly)}
            >
              {showFollowingOnly
                ? `View all Creators`
                : `View ${followedCreators.size} followed`}
            </Button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {creatorsLoading && (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
              : "space-y-4"
          }
        >
          {[...Array(8)].map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="h-32 md:h-40 bg-muted animate-pulse relative">
                <div className="absolute -bottom-6 left-4 w-12 h-12 md:w-14 md:h-14 rounded-full bg-muted animate-pulse border-4 border-background"></div>
              </div>
              <CardContent className="pt-8 md:pt-10 px-4 pb-4">
                <div className="h-4 bg-muted rounded animate-pulse mb-2"></div>
                <div className="h-3 bg-muted rounded animate-pulse w-2/3 mb-3"></div>
                <div className="h-3 bg-muted rounded animate-pulse mb-3"></div>
                <div className="flex gap-2 mb-3">
                  <div className="h-6 w-16 bg-muted rounded animate-pulse"></div>
                  <div className="h-6 w-12 bg-muted rounded animate-pulse"></div>
                </div>
                <div className="w-full h-8 bg-muted rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {creatorsError && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-red-500 mb-4">
              <span className="text-4xl">⚠️</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Something went wrong</h3>
            <p className="text-muted-foreground mb-4">
              {creatorsError instanceof Error
                ? creatorsError.message
                : "Failed to load creators"}
            </p>
            <Button onClick={() => mutateCreators()}>Try Again</Button>
          </CardContent>
        </Card>
      )}

      {/* Creators Grid/List */}
      {!creatorsLoading && !creatorsError && (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {sortedCreators.map((creator) => (
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
                        onFollowChange={() => mutateCreators()}
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
          ) : (
            <div className="space-y-4">
              {sortedCreators.map((creator) => (
                <Card
                  key={creator.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {creator.image ? (
                          <Image
                            src="/placeholder-image.png"
                            alt={creator.user?.name || "Creator"}
                            className="w-full h-full object-cover"
                            height={80}
                            width={80}
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {creator.user?.name?.[0]?.toUpperCase() || "A"}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1 mb-1">
                              <h3 className="font-semibold text-lg md:text-xl line-clamp-1">
                                {creator.user?.name || "Unknown Creator"}
                              </h3>
                              {creator.isVerified && (
                                <CircleCheckIcon className="fill-blue-500 stroke-white size-5 flex-shrink-0" />
                              )}
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground mb-2">
                              <MapPin className="h-3 w-3 md:h-4 md:w-4 mr-1 flex-shrink-0" />
                              <span>
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

                        <p className="text-muted-foreground text-sm md:text-base mb-4">
                          {creator.description ||
                            creator.story ||
                            "No description available"}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                            <span>
                              {(creator.followers || 0).toLocaleString()}{" "}
                              followers
                            </span>
                          </div>

                          <div className="flex items-center">
                            <Star className="h-4 w-4 mr-1 text-amber-500 fill-current" />
                            <span>
                              {Number(creator.rating || 0).toFixed(1)} rating
                            </span>
                          </div>

                          <div>
                            <span className="font-medium">
                              {creator.sales || 0}
                            </span>{" "}
                            sales
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {creator.categories?.map((category) => (
                            <Badge
                              key={category}
                              variant="secondary"
                              className="text-sm capitalize"
                            >
                              {category}
                            </Badge>
                          )) || (
                            <Badge variant="secondary" className="text-sm">
                              General
                            </Badge>
                          )}
                        </div>

                        <Button asChild variant="outline" size="sm">
                          <Link href={`/creator/${creator.id}`}>
                            View Profile
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
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
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || creatorsLoading}
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
                disabled={currentPage === totalPages || creatorsLoading}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!creatorsLoading && !creatorsError && sortedCreators.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="mx-auto w-16 h-16 md:w-24 md:h-24 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No creators found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filters to find what you&apos;re
              looking for
            </p>
            <Button onClick={clearAllFilters}>Clear all filters</Button>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
