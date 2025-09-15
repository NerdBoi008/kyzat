'use client';

import useSWR from 'swr';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart, Trash2, AlertCircle, Star, Package } from 'lucide-react';
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

interface WishlistProduct {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  productSlug: string;
  productPrice: string;
  productStock: number;
  productRating: string;
  creatorName: string;
  creatorImage: string | null;
  addedAt: string;
}

interface WishlistResponse {
  success: boolean;
  data: {
    items: WishlistProduct[];
    pagination: {
      page: number;
      pageSize: number;
      totalCount: number;
      totalPages: number;
    };
  };
}

interface WishlistGridProps {
  userId: string;
}

const fetcher = (url: string): Promise<WishlistResponse> => fetch(url).then((res) => res.json());

export default function WishlistGrid({ userId }: WishlistGridProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [removeItemId, setRemoveItemId] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  const getUrl = () => {
    const params = new URLSearchParams({
      userId,
      page: currentPage.toString(),
      pageSize: '12',
    });
    return `/api/wishlist?${params}`;
  };

  const { data, error, isLoading, mutate } = useSWR<WishlistResponse>(getUrl(), fetcher, {
    revalidateOnFocus: true,
  });

  const items = data?.data?.items || [];
  const pagination = data?.data?.pagination;

  // Remove item from wishlist
  const handleRemove = async () => {
    if (!removeItemId) return;

    // Optimistic update
    mutate(
      {
        ...data!,
        data: {
          ...data!.data,
          items: items.filter((item) => item.id !== removeItemId),
        },
      },
      false
    );

    try {
      await fetch(`/api/wishlist/${removeItemId}`, {
        method: 'DELETE',
      });
      mutate();
      setRemoveItemId(null);
    } catch (error) {
      mutate(); // Revert on error
      console.error('Failed to remove item:', error);
    }
  };

  // Add to cart
  const handleAddToCart = async (productId: string) => {
    setAddingToCart(productId);

    try {
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      // Show success feedback
      setAddingToCart(null);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      setAddingToCart(null);
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-16 w-16 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to Load Wishlist</h3>
          <Button onClick={() => mutate()}>Try Again</Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-48 w-full mb-4" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Heart className="h-20 w-20 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Your Wishlist is Empty</h3>
          <p className="text-muted-foreground text-center mb-6">
            Start adding products you love to your wishlist
          </p>
          <Button asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Items Count */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {pagination?.totalCount} {pagination?.totalCount === 1 ? 'Item' : 'Items'}
          </h3>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <Card key={item.id} className="group hover:shadow-lg transition overflow-hidden">
              <CardContent className="p-0">
                {/* Product Image */}
                <Link href={`/products/${item.productSlug}`} className="block relative">
                  <div className="aspect-square bg-muted relative overflow-hidden">
                    {item.productImage ? (
                      <Image
                        src={item.productImage}
                        alt={item.productName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        width={400}
                        height={400}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}

                    {/* Stock Badge */}
                    {item.productStock === 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute top-2 right-2"
                      >
                        Out of Stock
                      </Badge>
                    )}

                    {/* Remove Button */}
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition"
                      onClick={(e) => {
                        e.preventDefault();
                        setRemoveItemId(item.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Link>

                {/* Product Info */}
                <div className="p-4">
                  <Link
                    href={`/products/${item.productSlug}`}
                    className="block mb-2"
                  >
                    <h4 className="font-semibold text-sm line-clamp-2 hover:underline">
                      {item.productName}
                    </h4>
                  </Link>

                  {/* Creator */}
                  <p className="text-xs text-muted-foreground mb-2">
                    by {item.creatorName}
                  </p>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-3">
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-medium">
                      {parseFloat(item.productRating).toFixed(1)}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-primary">
                      ${parseFloat(item.productPrice).toFixed(2)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      disabled={item.productStock === 0 || addingToCart === item.productId}
                      onClick={() => handleAddToCart(item.productId)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {addingToCart === item.productId ? 'Adding...' : 'Add to Cart'}
                    </Button>
                  </div>

                  {/* Added Date */}
                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    Added {new Date(item.addedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 pt-4">
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

      {/* Remove Confirmation Dialog */}
      <AlertDialog
        open={!!removeItemId}
        onOpenChange={() => setRemoveItemId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from Wishlist</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this item from your wishlist?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemove}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
