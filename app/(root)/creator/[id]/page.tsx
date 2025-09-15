"use client";

import { use } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  MapPin,
  Users,
  Star,
  ShoppingBag,
  Share,
  MessageCircle,
  Calendar,
  Instagram,
  Mail,
  Link as LinkIcon,
  UserCheck,
  AlertCircle,
  LucideIcon,
  Shield,
  Award,
  CheckCircle2,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import useSWR from "swr";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";
import { cn, formatSmartDate } from "@/lib/utils";
import { FollowButton } from "@/components/common/follow-button";
import FavoriteButton from "@/components/common/favorite-button";
import { useWishlist } from "@/hooks/useWishlist";

// API Response Interface
interface CreatorWithRelations {
  creator: {
    id: string;
    userId: string;
    followers: number;
    following: number;
    image: string;
    coverImage?: string;
    story: string;
    description?: string;
    location?: string;
    category?: string;
    rating: number;
    sales: number;
    isVerified: boolean;
    isFeatured: boolean;
    joined: string;
    categories: string[];
    socialLinks: {
      twitter?: string;
      instagram?: string;
      facebook?: string;
      linkedin?: string;
      whatsapp?: string;
      [key: string]: string | undefined;
    };
    engagementScore: string;
    responseTime: number;
    completionRate: string;
    topScore: string;
    lastActiveAt: string;
    created_at: string;
    updated_at: string;
  };
  user: {
    id: string;
    role: "customer" | "creator" | "admin";
    creatorStatus?: "none" | "pending" | "approved" | "rejected";
    name: string;
    email: string;
    avatar?: string;
    bio?: string;
    location?: string;
    website?: string;
    socialLinks?: {
      twitter?: string;
      instagram?: string;
      facebook?: string;
      linkedin?: string;
      whatsapp?: string;
      [key: string]: string | undefined;
    };
    created_at: string;
    updated_at: string;
  };
  products?: Array<{
    id: string;
    name: string;
    price: string;
    image: string;
    rating: number;
    stock: number;
    categoryId: string;
    creatorId: string;
    slug: string;
  }>;
  creatorReviews?: Array<{
    id: string;
    rating: number;
    comment: string;
    reviewType: string;
    isVerified: boolean;
    helpfulVotes: number;
    created_at: string;
    timeAgo: string;
    user: {
      id: string;
      name: string;
      avatar: string;
    };
  }>;
  reviewStats?: {
    totalReviews: number;
    averageRating: number;
    ratingDistribution: { [key: number]: number };
  };
}

interface APIResponse {
  success: boolean;
  data: CreatorWithRelations;
  message?: string;
}

interface CreatorProfilePageProps {
  params: Promise<{ id: string }>;
}

// Product Card Component
const ProductCard = ({
  product,
}: {
  product: {
    id: string;
    name: string;
    price: string;
    image: string;
    rating: number;
    stock: number;
    categoryId: string;
    creatorId: string;
    slug: string;
  };
}) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  return (
    <Card className="overflow-hidden hover:shadow-md transition">
      <div className="h-48 bg-muted relative">
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
        <FavoriteButton
          productId={product.id}
          productName={product.name}
          isInWishlist={isInWishlist}
          handleToggleFavorite={toggleWishlist}
        />
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg">{product.name}</h3>
        <div className="flex justify-between items-center mt-2">
          <span className="font-bold text-primary">₹{product.price}</span>
          <div className="flex items-center">
            <Star className="h-4 w-4 text-amber-500 fill-current" />
            <span className="text-sm ml-1">{product.rating}</span>
          </div>
        </div>

        <Button asChild className="w-full mt-4">
          <Link href={`/product/${product.slug}`}>View Details</Link>
        </Button>
      </CardContent>
    </Card>
  );
};

// Review Card Component
const ReviewCard = ({
  review,
}: {
  review: NonNullable<CreatorWithRelations["creatorReviews"]>[number];
}) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold">{review.user.name}</h3>
          <div className="flex items-center mt-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < review.rating
                    ? "text-amber-500 fill-current"
                    : "text-muted-foreground"
                }`}
              />
            ))}
          </div>
        </div>
        <span className="text-sm text-muted-foreground">
          {review.created_at}
        </span>
      </div>
      <p className="text-muted-foreground">{review.comment}</p>
    </CardContent>
  </Card>
);

// Stat Item Component
const StatItem = ({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}) => (
  <div className="flex items-center">
    {icon}
    <span className="font-semibold ml-1">{value}</span>
    <span className="text-muted-foreground ml-1">{label}</span>
  </div>
);

// Fetcher function for SWR
const fetchCreator = async (url: string): Promise<APIResponse> => {
  const response = await fetch(url);

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as {
      message?: string;
    };
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }

  return response.json();
};

interface TrustBadgeProps {
  icon: LucideIcon;
  label: string;
  active: boolean;
  variant?: "default" | "success" | "warning" | "info";
  className?: string;
}

const TrustBadge = ({
  icon: Icon,
  label,
  active,
  variant = "default",
  className,
}: TrustBadgeProps) => {
  const variantStyles = {
    default: "bg-blue-50 text-blue-700 border-blue-200",
    success: "bg-green-50 text-green-700 border-green-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    info: "bg-gray-50 text-gray-700 border-gray-200",
  };

  const inactiveStyle = "bg-gray-50 text-gray-400 border-gray-200 opacity-60";

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all",
        active ? variantStyles[variant] : inactiveStyle,
        className
      )}
    >
      <Icon className={cn("h-4 w-4", active ? "" : "opacity-50")} />
      <span className="text-sm font-medium">{label}</span>
      {active && (
        <div className="ml-auto">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

// // Alternative: Compact version for smaller spaces
// export const TrustBadgeCompact = ({
//   icon: Icon,
//   label,
//   active,
//   variant = "default",
//   className,
// }: TrustBadgeProps) => {
//   const variantStyles = {
//     default: "bg-blue-100 text-blue-800",
//     success: "bg-green-100 text-green-800",
//     warning: "bg-amber-100 text-amber-800",
//     info: "bg-gray-100 text-gray-800",
//   };

//   if (!active) return null;

//   return (
//     <div
//       className={cn(
//         "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
//         variantStyles[variant],
//         className
//       )}
//     >
//       <Icon className="h-3 w-3" />
//       <span>{label}</span>
//     </div>
//   );
// };

export default function CreatorProfilePage({
  params,
}: CreatorProfilePageProps) {
  const { id: creatorId } = use(params);

  // SWR hook for fetching creator data
  const {
    data: creatorResponse,
    error: creatorError,
    isLoading: creatorLoading,
    mutate: refetchCreator,
  } = useSWR<APIResponse>(
    creatorId
      ? `/api/creators/${creatorId}?withProducts=true&withReviews=true`
      : null,
    fetchCreator,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000,
      errorRetryCount: 3,
      errorRetryInterval: 5000,
    }
  );

  // Extract creator data
  const creatorData = creatorResponse?.data;
  const creatorReviews = creatorData?.creatorReviews ?? [];
  // const reviewStats = creatorData?.reviewStats ?? {};

  // Loading state
  if (creatorLoading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <ProfileSkeleton />
          <div className="mb-6">
            <div className="flex gap-8 mb-6">
              {["Products", "Reviews", "About"].map((tab, i) => (
                <div
                  key={i}
                  className="h-8 bg-muted rounded animate-pulse w-20"
                />
              ))}
            </div>
            <ProductSkeleton />
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (creatorError) {
    return <ErrorState error={creatorError} onRetry={() => refetchCreator()} />;
  }

  // No data state
  if (!creatorResponse?.success || !creatorResponse?.data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Creator not found or data unavailable.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const { creator, user, products = [] } = creatorResponse.data;
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="overflow-hidden mb-8">
          {/* Cover Photo */}
          <div className="h-48 bg-muted relative">
            {creator.coverImage ? (
              <Image
                src={creator.coverImage}
                alt="Cover"
                className="w-full h-full object-cover"
                fill
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                Cover Photo
              </div>
            )}
          </div>

          {/* Profile Info */}
          <CardContent className="px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-start">
              {/* Avatar */}
              <div className="relative w-32 h-32">
                <Avatar className="size-32 border-4 border-background">
                  <AvatarFallback>
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                  <AvatarImage
                    src={user.avatar || creator.image}
                    alt={user.name}
                  />
                </Avatar>
                {creator.isVerified && (
                  <div className="absolute bottom-2 right-2 h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <UserCheck className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>

              {/* Creator Info */}
              <div className="md:ml-6 mt-4 md:mt-0 flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      {user.name}
                      {creator.isFeatured && (
                        <Badge variant="default">Featured</Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {creator.location ||
                        user.location ||
                        "Location not specified"}
                    </CardDescription>
                  </div>

                  <div className="flex items-center space-x-2 mt-4 md:mt-0">
                    <Button variant="outline" size="sm">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                    <FollowButton
                      creatorId={creator.id}
                      creatorName={user.name}
                      variant={"outline"}
                      size={"sm"}
                      onFollowChange={() => refetchCreator()}
                    />
                    <Button variant="outline" size="icon">
                      <Share className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-4 mt-4">
                  <StatItem
                    icon={<Users className="h-4 w-4 text-muted-foreground" />}
                    value={creator.followers.toLocaleString()}
                    label="followers"
                  />
                  <StatItem
                    icon={
                      <UserCheck className="h-4 w-4 text-muted-foreground" />
                    }
                    value={creator.following}
                    label="following"
                  />
                  <StatItem
                    icon={
                      <Star className="h-4 w-4 text-amber-500 fill-current" />
                    }
                    value={creator.rating || 0}
                    label={`(${creatorReviews.length} reviews)`}
                  />
                  <StatItem
                    icon={
                      <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    }
                    value={products.length}
                    label="products"
                  />
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground ml-1">Joined</span>
                    <span className="font-semibold ml-1">
                      {formatSmartDate(creator.joined)}
                    </span>
                  </div>
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {creator.categories.map((category, index) => (
                    <Badge key={index} variant="secondary">
                      {category}
                    </Badge>
                  ))}
                </div>

                {/* Social Links */}
                <div className="flex items-center space-x-3 mt-4">
                  {creator.socialLinks?.instagram && (
                    <a
                      href={creator.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary"
                    >
                      <Instagram className="h-5 w-5" />
                    </a>
                  )}
                  {user.website && (
                    <a
                      href={user.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary"
                    >
                      <LinkIcon className="h-5 w-5" />
                    </a>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Link href={`mailto:${user.email}`}>
                      <Mail className="h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mt-6">
              <h2 className="font-semibold mb-2">About</h2>
              <CardDescription>
                {creator.description || user.bio}
              </CardDescription>

              {creator.story && (
                <>
                  <h2 className="font-semibold mt-6 mb-2">My Story</h2>
                  <CardDescription>{creator.story}</CardDescription>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="products" className="mb-6">
          <TabsList className="w-full justify-start p-0 bg-transparent h-auto border-b rounded-none mb-6">
            <TabsTrigger
              value="products"
              className="py-3 px-1 mr-8 border-0 data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:border-b-3 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none"
            >
              Products ({products.length})
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="py-3 px-1 mr-8 border-0 data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:border-b-3 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none"
            >
              Reviews ({creatorReviews.length})
            </TabsTrigger>
            <TabsTrigger
              value="about"
              className="py-3 px-1 mr-8 border-0 data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:border-b-3 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none"
            >
              About
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No products available yet.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviews">
            <div className="space-y-6">
              {creatorReviews && creatorReviews.length > 0 ? (
                creatorReviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))
              ) : (
                <p className="text-center text-muted-foreground">
                  No reviews yet. Be the first to leave one!
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="about">
            <Card className="py-6">
              <CardHeader>
                <CardTitle>More About {user.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground">
                  {creator.story || "No additional information available."}
                </p>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">
                      Performance Highlights
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Sales:</span>
                        <span>₹{creator.sales}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Response Time:</span>
                        <span>{creator.responseTime}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Completion Rate:</span>
                        <span>{creator.completionRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Active Since:</span>
                        <span>
                          {new Date(creator.joined).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Active:</span>
                        <span>
                          {new Date(creator.lastActiveAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Trust & Verification */}
                  <div>
                    <h3 className="font-semibold mb-4">Trust & Verification</h3>
                    <div className="space-y-3">
                      <TrustBadge
                        icon={Shield}
                        label="Verified Creator"
                        active={creator.isVerified}
                        variant="success"
                      />
                      <TrustBadge
                        icon={Award}
                        label="Featured Seller"
                        active={creator.isFeatured}
                        variant="default"
                      />
                      <TrustBadge
                        icon={CheckCircle2}
                        label="Identity Verified"
                        active={creator.isVerified}
                        variant="success"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// Loading Skeleton Components
const ProfileSkeleton = () => (
  <Card className="overflow-hidden mb-8">
    <div className="h-48 bg-muted animate-pulse" />
    <CardContent className="px-6 pb-6">
      <div className="flex flex-col md:flex-row md:items-start">
        <div className="w-32 h-32 bg-muted rounded-full animate-pulse" />
        <div className="md:ml-6 mt-4 md:mt-0 flex-1 space-y-4">
          <div className="h-8 bg-muted rounded animate-pulse w-48" />
          <div className="h-4 bg-muted rounded animate-pulse w-32" />
          <div className="flex gap-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-6 bg-muted rounded animate-pulse w-20"
              />
            ))}
          </div>
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-6 bg-muted rounded-full animate-pulse w-16"
              />
            ))}
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const ProductSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(6)].map((_, i) => (
      <Card key={i} className="overflow-hidden">
        <div className="h-48 bg-muted animate-pulse" />
        <CardContent className="p-4 space-y-3">
          <div className="h-6 bg-muted rounded animate-pulse" />
          <div className="flex justify-between">
            <div className="h-6 bg-muted rounded animate-pulse w-16" />
            <div className="h-6 bg-muted rounded animate-pulse w-20" />
          </div>
          <div className="h-10 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    ))}
  </div>
);

// Error Component
const ErrorState = ({
  error,
  onRetry,
}: {
  error: Error;
  onRetry: () => void;
}) => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <Alert className="max-w-md">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex flex-col gap-4">
        <span>Failed to load creator profile: {error.message}</span>
        <Button onClick={onRetry} size="sm">
          Try Again
        </Button>
      </AlertDescription>
    </Alert>
  </div>
);
