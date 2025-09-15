'use client';

import useSWR from 'swr';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Package, Edit, Trash2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Image from 'next/image';

interface UserReview {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  productSlug: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ReviewsResponse {
  success: boolean;
  data: {
    reviews: UserReview[];
    pagination: {
      page: number;
      pageSize: number;
      totalCount: number;
      totalPages: number;
    };
  };
}

interface UserWrittenReviewsProps {
  userId: string;
}

const fetcher = (url: string): Promise<ReviewsResponse> => fetch(url).then((res) => res.json());

export default function UserWrittenReviews({ userId }: UserWrittenReviewsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteReviewId, setDeleteReviewId] = useState<string | null>(null);

  const getUrl = () => {
    const params = new URLSearchParams({
      userId,
      page: currentPage.toString(),
      pageSize: '10',
    });

    return `/api/reviews/user?${params}`;
  };

  const { data, error, isLoading, mutate } = useSWR<ReviewsResponse>(getUrl(), fetcher);

  const reviews = data?.data?.reviews || [];
  const pagination = data?.data?.pagination;

  const handleDelete = async () => {
    if (!deleteReviewId) return;

    try {
      await fetch(`/api/reviews/${deleteReviewId}`, {
        method: 'DELETE',
      });

      mutate();
      setDeleteReviewId(null);
    } catch (error) {
      console.error('Failed to delete review:', error);
    }
  };

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
    <>
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Star className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Reviews Written</h3>
              <p className="text-muted-foreground text-center mb-4">
                Start reviewing products you&apos;ve purchased
              </p>
              <Button asChild>
                <Link href="/orders">View Orders</Link>
              </Button>
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
                      <div className="w-24 h-24 bg-muted rounded overflow-hidden">
                        {review.productImage ? (
                          <Image
                            src={review.productImage}
                            alt={review.productName}
                            className="w-full h-full object-cover"
                            width={96}
                            height={96}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-10 w-10 text-muted-foreground" />
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

                      {/* Rating */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? 'text-yellow-500 fill-yellow-500'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      {/* Review Comment */}
                      <p className="text-sm mb-4">{review.comment}</p>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/reviews/${review.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteReviewId(review.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteReviewId}
        onOpenChange={() => setDeleteReviewId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this review? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
