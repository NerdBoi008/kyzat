'use client';

import useSWR from 'swr';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Star, ThumbsUp, CheckCircle, MessageSquare, AlertCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

interface CreatorReview {
  id: string;
  userId: string;
  userName: string;
  userImage: string | null;
  rating: number;
  comment: string;
  reviewType: 'general' | 'communication' | 'shipping' | 'quality';
  isVerified: boolean;
  helpfulVotes: number;
  createdAt: string;
  orderId: string | null;
}

interface ReviewsResponse {
  success: boolean;
  data: {
    reviews: CreatorReview[];
    pagination: {
      page: number;
      pageSize: number;
      totalCount: number;
      totalPages: number;
    };
    stats: {
      averageRating: number;
      totalReviews: number;
      ratingDistribution: Record<number, number>;
    };
  };
}

interface CreatorReviewsListProps {
  creatorId: string;
}

const fetcher = (url: string): Promise<ReviewsResponse> => fetch(url).then((res) => res.json());

export default function CreatorReviewsList({ creatorId }: CreatorReviewsListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const getUrl = () => {
    const params = new URLSearchParams({
      creatorId,
      page: currentPage.toString(),
      pageSize: '10',
    });

    if (ratingFilter) {
      params.append('rating', ratingFilter.toString());
    }

    return `/api/reviews/creator?${params}`;
  };

  const { data, error, isLoading, mutate } = useSWR<ReviewsResponse>(getUrl(), fetcher, {
    revalidateOnFocus: true,
  });

  const reviews = data?.data?.reviews || [];
  const pagination = data?.data?.pagination;
  const stats = data?.data?.stats;

  const reviewTypeColors = {
    general: 'bg-gray-100 text-gray-800',
    communication: 'bg-blue-100 text-blue-800',
    shipping: 'bg-purple-100 text-purple-800',
    quality: 'bg-green-100 text-green-800',
  };

  const handleReply = async (reviewId: string) => {
    if (!replyText.trim()) return;

    try {
      await fetch(`/api/reviews/${reviewId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: replyText }),
      });

      setReplyingTo(null);
      setReplyText('');
      mutate();
    } catch (error) {
      console.error('Failed to post reply:', error);
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
    <div className="space-y-6">
      {/* Stats Dashboard */}
      {stats && (
        <Card className='py-6'>
          <CardHeader>
            <CardTitle>Review Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
                  <span className="text-4xl font-bold">
                    {stats.averageRating.toFixed(1)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {stats.totalReviews} reviews
                </p>
              </div>

              <div className="col-span-2">
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = stats.ratingDistribution[rating] || 0;
                    const percentage = stats.totalReviews
                      ? (count / stats.totalReviews) * 100
                      : 0;

                    return (
                      <div key={rating} className="flex items-center gap-2">
                        <span className="text-sm w-8">{rating}★</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-12 text-right">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
            <Star className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
            <p className="text-muted-foreground text-center">
              {ratingFilter
                ? `No ${ratingFilter}-star reviews found`
                : 'Customer reviews will appear here'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="w-12 h-12">
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
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{review.userName}</h4>
                          {review.isVerified && (
                            <Badge
                              variant="secondary"
                              className="bg-green-100 text-green-800"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified Purchase
                            </Badge>
                          )}
                          <Badge
                            variant="secondary"
                            className={reviewTypeColors[review.reviewType]}
                          >
                            {review.reviewType}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>

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
                    </div>

                    <p className="text-sm mb-4">{review.comment}</p>

                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground"
                      >
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        Helpful ({review.helpfulVotes})
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReplyingTo(review.id)}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Reply
                      </Button>
                    </div>

                    {/* Reply Form */}
                    {replyingTo === review.id && (
                      <div className="mt-4 p-4 bg-muted rounded-lg">
                        <Textarea
                          placeholder="Write your response..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="mb-2"
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleReply(review.id)}
                          >
                            Post Reply
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyText('');
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
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
