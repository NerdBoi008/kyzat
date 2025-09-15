'use client';

import useSWR from 'swr';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Package, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

interface ProductReview {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  productSlug: string;
  userId: string;
  userName: string;
  userImage: string | null;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ReviewsResponse {
  success: boolean;
  data: {
    reviews: ProductReview[];
    pagination: {
      page: number;
      pageSize: number;
      totalCount: number;
      totalPages: number;
    };
  };
}

interface ProductReviewsListProps {
  creatorId: string;
}

const fetcher = (url: string): Promise<ReviewsResponse> => fetch(url).then((res) => res.json());

export default function ProductReviewsList({ creatorId }: ProductReviewsListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);

  const getUrl = () => {
    const params = new URLSearchParams({
      creatorId,
      page: currentPage.toString(),
      pageSize: '10',
    });

    if (ratingFilter) {
      params.append('rating', ratingFilter.toString());
    }

    return `/api/reviews/products?${params}`;
  };

  const { data, error, isLoading, mutate } = useSWR<ReviewsResponse>(getUrl(), fetcher);

  const reviews = data?.data?.reviews || [];
  const pagination = data?.data?.pagination;

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-16 w-16 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to Load Reviews</h3>
          <Button onClick={() => mutate()}>Try Again</Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Filter */}
      <Tabs
        value={ratingFilter?.toString() || 'all'}
        onValueChange={(v) => {
          setRatingFilter(v === 'all' ? null : parseInt(v));
          setCurrentPage(1);
        }}
      >
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="5">5★</TabsTrigger>
          <TabsTrigger value="4">4★</TabsTrigger>
          <TabsTrigger value="3">3★</TabsTrigger>
          <TabsTrigger value="2">2★</TabsTrigger>
          <TabsTrigger value="1">1★</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Product Reviews Yet</h3>
            <p className="text-muted-foreground text-center">
              Reviews on your products will appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} className="hover:shadow-md transition">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <Link
                    href={`/products/${review.productSlug}`}
                    className="flex-shrink-0"
                  >
                    <div className="w-20 h-20 bg-muted rounded overflow-hidden">
                      {review.productImage ? (
                        <Image
                          src={review.productImage}
                          alt={review.productName}
                          className="w-full h-full object-cover"
                          width={80}
                          height={80}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="flex-1">
                    {/* Product Name */}
                    <Link
                      href={`/products/${review.productSlug}`}
                      className="font-semibold hover:underline mb-2 block"
                    >
                      {review.productName}
                    </Link>

                    {/* Review Content */}
                    <div className="flex items-start gap-3 mb-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={review.userImage || undefined} />
                        <AvatarFallback>
                          {review.userName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {review.userName}
                          </span>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < review.rating
                                    ? 'text-yellow-500 fill-yellow-500'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground mb-2">
                          {new Date(review.createdAt).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>

                        <p className="text-sm">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={currentPage === pagination.totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
