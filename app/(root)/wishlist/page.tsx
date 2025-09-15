"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import {
  Heart,
  ShoppingCart,
  Trash2,
  Share2,
  ArrowLeft,
  Eye,
  AlertCircle,
  Package,
  Star,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import useSWR from "swr";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Image from "next/image";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WishlistItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  productSlug: string;
  productPrice: string;
  productStock: number;
  productRating: string;
  creatorId: string;
  creatorName: string;
  creatorImage: string | null;
  addedAt: string;
}

interface WishlistResponse {
  success: boolean;
  data: {
    items: WishlistItem[];
    pagination: {
      page: number;
      pageSize: number;
      totalCount: number;
      totalPages: number;
    };
  };
}

const fetcher = (url: string): Promise<WishlistResponse> =>
  fetch(url).then((res) => res.json());

export default function WishlistPage() {
  const { data: session } = useSession();
  const { addToCart } = useCart();
  const { toggleWishlist, refreshWishlist } = useWishlist();

  const [sortBy, setSortBy] = useState("date-added");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [removeItemId, setRemoveItemId] = useState<string | null>(null);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Fetch wishlist data
  const { data, error, isLoading, mutate } = useSWR<WishlistResponse>(
    session?.user?.id
      ? `/api/wishlist?userId=${session.user.id}&pageSize=50`
      : null,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  const items = useMemo(() => data?.data?.items || [], [data?.data?.items]);

  // Remove single item from wishlist
  const removeItem = async (productId: string, productName: string) => {
    setRemovingId(productId);
    try {
      await toggleWishlist(productId, productName);
      setSelectedItems((prev) => prev.filter((id) => id !== productId));
      setRemoveItemId(null);
      refreshWishlist();
      mutate(); // Refresh wishlist data
    } catch (error) {
      console.error("Failed to remove item:", error);
    } finally {
      setRemovingId(null);
    }
  };

  // Add item to cart
  const handleAddToCart = async (item: WishlistItem) => {
    await addToCart(
      {
        id: item.productId,
        name: item.productName,
        price: parseFloat(item.productPrice),
        image: item.productImage,
        slug: item.productSlug,
        stock: item.productStock,
        creator: {
          id: "",
          name: item.creatorName,
          isVerified: false,
        },
      },
      1
    );
  };

  // Toggle item selection
  const toggleSelectItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map((item) => item.productId));
    }
  };

  // Remove selected items
  const removeSelected = async () => {
    if (selectedItems.length === 0) return;

    try {
      // Remove all selected items
      await Promise.all(
        selectedItems.map(async (productId) => {
          const item = items.find((i) => i.productId === productId);
          if (item) {
            await toggleWishlist(productId, item.productName);
          }
        })
      );

      setSelectedItems([]);
      mutate();
      toast.success(`Removed ${selectedItems.length} items from wishlist`);
    } catch (error) {
      console.error("Failed to remove items:", error);
      toast.error("Failed to remove some items");
    }
  };

  // Clear entire wishlist
  const clearWishlist = async () => {
    if (items.length === 0) return;

    try {
      await Promise.all(
        items.map((item) => toggleWishlist(item.productId, item.productName))
      );

      setSelectedItems([]);
      mutate();
      setShowClearDialog(false);
      toast.success("Wishlist cleared successfully");
    } catch (error) {
      console.error("Failed to clear wishlist:", error);
      toast.error("Failed to clear wishlist");
    }
  };

  // Add all in-stock items to cart
  const addAllToCart = async () => {
    const inStockItems = items.filter((item) => item.productStock > 0);

    try {
      await Promise.all(inStockItems.map((item) => handleAddToCart(item)));
      toast.success(`Added ${inStockItems.length} items to cart`);
    } catch (error) {
      console.error("Failed to add items to cart:", error);
      toast.error("Failed to add some items to cart");
    }
  };

  // Share wishlist
  const shareWishlist = () => {
    const url = `${window.location.origin}/wishlist/${session?.user?.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Wishlist link copied to clipboard!");
  };

  // Sort items
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      switch (sortBy) {
        case "date-added":
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
        case "price-low":
          return parseFloat(a.productPrice) - parseFloat(b.productPrice);
        case "price-high":
          return parseFloat(b.productPrice) - parseFloat(a.productPrice);
        case "name":
          return a.productName.localeCompare(b.productName);
        default:
          return 0;
      }
    });
  }, [items, sortBy]);

  const inStockItems = items.filter((item) => item.productStock > 0);
  const selectedInStockItems = selectedItems.filter((id) => {
    const item = items.find((item) => item.productId === id);
    return item && item.productStock > 0;
  });

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-12">
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Failed to Load Wishlist
              </h3>
              <p className="text-muted-foreground mb-6">
                There was an error loading your wishlist. Please try again.
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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex gap-2 mt-4 sm:mt-0">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-40" />
            </div>
          </div>

          <Skeleton className="h-16 w-full mb-6" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i}>
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <div className="flex gap-2 mt-4">
                    <Skeleton className="h-9 flex-1" />
                    <Skeleton className="h-9 flex-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-12">
          <div className="text-center max-w-md mx-auto">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Your wishlist is empty</h1>
            <p className="text-muted-foreground mb-6">
              Save your favorite items here to easily find them later. Start
              browsing to discover amazing local products!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link href="/products">Start Shopping</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/creators">Discover Creators</Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Your Wishlist</h1>
            <p className="text-muted-foreground">
              {items.length} {items.length === 1 ? "item" : "items"} saved for
              later
            </p>
          </div>

          <div className="flex items-center gap-2 mt-4 sm:mt-0">
            <Button variant="outline" size="sm" onClick={shareWishlist}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/products">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>

        {/* Bulk Actions */}
        <Card className="mb-6">
          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="select-all"
                checked={
                  selectedItems.length === items.length && items.length > 0
                }
                onChange={toggleSelectAll}
                className="h-4 w-4 text-primary rounded cursor-pointer"
              />
              <label
                htmlFor="select-all"
                className="ml-2 text-sm cursor-pointer"
              >
                Select all ({selectedItems.length} selected)
              </label>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-added">Date added</SelectItem>
                  <SelectItem value="price-low">Price: Low to high</SelectItem>
                  <SelectItem value="price-high">Price: High to low</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>

              {selectedItems.length > 0 && (
                <Button variant="outline" size="sm" onClick={removeSelected}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove ({selectedItems.length})
                </Button>
              )}

              {selectedInStockItems.length > 0 && (
                <Button size="sm" onClick={addAllToCart}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to cart ({selectedInStockItems.length})
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Wishlist Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {sortedItems.map((item) => (
            <Card
              key={item.productId}
              className="group hover:shadow-lg transition overflow-hidden"
            >
              <div className="h-48 bg-muted relative overflow-hidden">
                {item.productImage ? (
                  <Image
                    src={item.productImage}
                    alt={item.productName}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <Package className="h-12 w-12" />
                  </div>
                )}

                <div className="absolute top-2 right-2 flex flex-col gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={removingId === item.productId}
                    className="h-8 w-8 bg-background/90 backdrop-blur-sm rounded-full hover:bg-background"
                    onClick={() => setRemoveItemId(item.productId)}
                  >
                    {removingId === item.productId ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {item.productStock === 0 && (
                  <div className="absolute top-2 left-10">
                    <Badge variant="destructive">Out of stock</Badge>
                  </div>
                )}

                <div className="absolute top-2 left-2">
                  <input
                    type="checkbox"
                    id={`select-${item.productId}`}
                    checked={selectedItems.includes(item.productId)}
                    onChange={() => toggleSelectItem(item.productId)}
                    className="h-4 w-4 text-primary rounded bg-background cursor-pointer"
                  />
                </div>
              </div>

              <CardContent className="p-4">
                <Link href={`/product/${item.productSlug}`}>
                  <h3 className="font-semibold text-lg hover:text-primary line-clamp-1">
                    {item.productName}
                  </h3>
                </Link>

                <p className="text-sm text-muted-foreground mb-2 hover:text-primary">
                  <Link href={`/creator/${item.creatorId}`}>
                    By {item.creatorName}
                  </Link>
                </p>

                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-lg text-primary">
                    ₹{parseFloat(item.productPrice).toFixed(2)}
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium">
                      {parseFloat(item.productRating).toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button asChild variant="outline" className="flex-1">
                    <Link href={`/product/${item.productSlug}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Link>
                  </Button>

                  {item.productStock > 0 ? (
                    <Button
                      className="flex-1"
                      onClick={() => handleAddToCart(item)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  ) : (
                    <Button variant="outline" className="flex-1" disabled>
                      Notify Me
                    </Button>
                  )}
                </div>

                <p className="text-xs text-muted-foreground text-center mt-3">
                  Added{" "}
                  {new Date(item.addedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Actions */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold mb-1">Ready to purchase?</h3>
                <p className="text-sm text-muted-foreground">
                  Add items to your cart to complete your purchase
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowClearDialog(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear wishlist
                </Button>

                {inStockItems.length > 0 && (
                  <Button onClick={addAllToCart}>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add all to cart ({inStockItems.length})
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Remove Item Dialog */}
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
            <AlertDialogAction
              onClick={() => {
                if (removeItemId) {
                  const item = items.find((i) => i.productId === removeItemId);
                  if (item) {
                    removeItem(removeItemId, item.productName);
                  }
                }
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear Wishlist Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Wishlist</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove all {items.length} items from your
              wishlist? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={clearWishlist}
              className="bg-destructive text-destructive-foreground text-white hover:bg-destructive/90"
            >
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// "use client";

// import { useState, useMemo } from "react";
// import useSWR from "swr";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Skeleton } from "@/components/ui/skeleton";
// import Link from "next/link";
// import {
//   Heart,
//   ShoppingCart,
//   Trash2,
//   Share2,
//   ArrowLeft,
//   Eye,
//   AlertCircle,
//   Package,
//   Star,
//   RefreshCw
// } from "lucide-react";
// import { useSession } from "next-auth/react";
// import { useCart } from "@/hooks/useCart";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
// import Image from "next/image";
// import { useWishlist } from "@/hooks/useWishlist";

// interface WishlistItem {
//   id: string;
//   productId: string;
//   productName: string;
//   productImage: string;
//   productSlug: string;
//   productPrice: string;
//   productStock: number;
//   productRating: string;
//   creatorName: string;
//   creatorImage: string | null;
//   addedAt: string;
// }

// interface WishlistResponse {
//   success: boolean;
//   data: {
//     items: WishlistItem[];
//     pagination: {
//       page: number;
//       pageSize: number;
//       totalCount: number;
//       totalPages: number;
//     };
//   };
// }

// // Fetcher function
// const fetcher = (url: string): Promise<WishlistResponse> => fetch(url).then((res) => res.json());

// export default function WishlistPage() {
//   const { data: session } = useSession();
//   const { addToCart } = useCart();
//   const [sortBy, setSortBy] = useState("date-added");
//   const [selectedItems, setSelectedItems] = useState<string[]>([]);
//   const [removeItemId, setRemoveItemId] = useState<string | null>(null);
//   const [showClearDialog, setShowClearDialog] = useState(false);
//   const { refreshWishlist } = useWishlist()

//   // Fetch wishlist data
//   const { data, error, isLoading, mutate } = useSWR<WishlistResponse>(
//     session?.user?.id ? `/api/wishlist?userId=${session.user.id}&pageSize=50` : null,
//     fetcher,
//     {
//       revalidateOnFocus: true,
//       revalidateOnReconnect: true,
//     }
//   );

//   const items = useMemo(() => data?.data?.items || [], [data?.data?.items]);

//   // Remove item from wishlist
//   const removeItem = async (productId: string) => {
//     // Optimistic update
//     mutate(
//       {
//         ...data!,
//         data: {
//           ...data!.data,
//           items: items.filter((item) => item.productId !== productId),
//         },
//       },
//       false
//     );

//     try {
//       await fetch(`/api/wishlist/${productId}`, {
//         method: 'DELETE',
//       });
//       setSelectedItems(selectedItems.filter(id => id !== productId));
//       mutate();
//       refreshWishlist();
//       setRemoveItemId(null);
//     } catch (error) {
//       console.error('Failed to remove item:', error);
//       mutate(); // Revert on error
//     }
//   };

//   // Add item to cart
//   const handleAddToCart = async (item: WishlistItem) => {
//     addToCart({
//       id: item.productId,
//       name: item.productName,
//       price: parseFloat(item.productPrice),
//       image: item.productImage,
//       slug: item.productSlug,
//       stock: item.productStock,
//       creator: {
//         id: '', // You might need to fetch this
//         name: item.creatorName,
//         isVerified: false,
//       },
//     }, 1);
//   };

//   // Toggle item selection
//   const toggleSelectItem = (id: string) => {
//     if (selectedItems.includes(id)) {
//       setSelectedItems(selectedItems.filter(itemId => itemId !== id));
//     } else {
//       setSelectedItems([...selectedItems, id]);
//     }
//   };

//   // Toggle select all
//   const toggleSelectAll = () => {
//     if (selectedItems.length === items.length) {
//       setSelectedItems([]);
//     } else {
//       setSelectedItems(items.map(item => item.productId));
//     }
//   };

//   // Remove selected items
//   const removeSelected = async () => {
//     // Optimistic update
//     mutate(
//       {
//         ...data!,
//         data: {
//           ...data!.data,
//           items: items.filter(item => !selectedItems.includes(item.productId)),
//         },
//       },
//       false
//     );

//     try {
//       await Promise.all(
//         selectedItems.map(id =>
//           fetch(`/api/wishlist/${id}`, { method: 'DELETE' })
//         )
//       );
//       setSelectedItems([]);
//       mutate();
//       refreshWishlist();
//     } catch (error) {
//       console.error('Failed to remove items:', error);
//       mutate(); // Revert on error
//     }
//   };

//   // Clear entire wishlist
//   const clearWishlist = async () => {
//     // Optimistic update
//     mutate(
//       {
//         ...data!,
//         data: {
//           ...data!.data,
//           items: [],
//         },
//       },
//       false
//     );

//     try {
//       await Promise.all(
//         items.map(item =>
//           fetch(`/api/wishlist/${item.productId}`, { method: 'DELETE' })
//         )
//       );
//       setSelectedItems([]);
//       mutate();
//       refreshWishlist();
//       setShowClearDialog(false);
//     } catch (error) {
//       console.error('Failed to clear wishlist:', error);
//       mutate(); // Revert on error
//     }
//   };

//   // Add all in-stock items to cart
//   const addAllToCart = () => {
//     const inStockItems = items.filter(item => item.productStock > 0);
//     inStockItems.forEach(item => handleAddToCart(item));
//   };

//   // Share wishlist
//   const shareWishlist = () => {
//     const url = `${window.location.origin}/wishlist/${session?.user?.id}`;
//     navigator.clipboard.writeText(url);
//     alert('Wishlist link copied to clipboard!');
//   };

//   // Sort items
//   const sortedItems = useMemo(() => {
//     return [...items].sort((a, b) => {
//       if (sortBy === "date-added") {
//         return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
//       } else if (sortBy === "price-low") {
//         return parseFloat(a.productPrice) - parseFloat(b.productPrice);
//       } else if (sortBy === "price-high") {
//         return parseFloat(b.productPrice) - parseFloat(a.productPrice);
//       } else if (sortBy === "name") {
//         return a.productName.localeCompare(b.productName);
//       }
//       return 0;
//     });
//   }, [items, sortBy]);

//   const inStockItems = items.filter(item => item.productStock > 0);
//   const selectedInStockItems = selectedItems.filter(id => {
//     const item = items.find(item => item.productId === id);
//     return item && item.productStock > 0;
//   });

//   // Error state
//   if (error) {
//     return (
//       <div className="min-h-screen bg-background">
//         <main className="container mx-auto px-4 py-12">
//           <Card>
//             <CardContent className="p-12 text-center">
//               <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
//               <h3 className="text-lg font-semibold mb-2">Failed to Load Wishlist</h3>
//               <p className="text-muted-foreground mb-6">
//                 There was an error loading your wishlist. Please try again.
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

//   // Loading state
//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-background">
//         <main className="container mx-auto px-4 py-8">
//           <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
//             <div className="space-y-2">
//               <Skeleton className="h-8 w-48" />
//               <Skeleton className="h-4 w-32" />
//             </div>
//             <div className="flex gap-2 mt-4 sm:mt-0">
//               <Skeleton className="h-9 w-24" />
//               <Skeleton className="h-9 w-40" />
//             </div>
//           </div>

//           <Skeleton className="h-16 w-full mb-6" />

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//             {[...Array(8)].map((_, i) => (
//               <Card key={i}>
//                 <Skeleton className="h-48 w-full" />
//                 <CardContent className="p-4 space-y-2">
//                   <Skeleton className="h-5 w-full" />
//                   <Skeleton className="h-4 w-24" />
//                   <Skeleton className="h-4 w-20" />
//                   <div className="flex gap-2 mt-4">
//                     <Skeleton className="h-9 flex-1" />
//                     <Skeleton className="h-9 flex-1" />
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         </main>
//       </div>
//     );
//   }

//   // Empty state
//   if (items.length === 0) {
//     return (
//       <div className="min-h-screen bg-background">
//         <main className="container mx-auto px-4 py-12">
//           <div className="text-center max-w-md mx-auto">
//             <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
//               <Heart className="h-12 w-12 text-muted-foreground" />
//             </div>
//             <h1 className="text-2xl font-bold mb-4">Your wishlist is empty</h1>
//             <p className="text-muted-foreground mb-6">
//               Save your favorite items here to easily find them later. Start browsing to discover amazing local products!
//             </p>
//             <div className="flex flex-col sm:flex-row gap-4 justify-center">
//               <Button asChild>
//                 <Link href="/products">Start Shopping</Link>
//               </Button>
//               <Button variant="outline" asChild>
//                 <Link href="/creators">Discover Creators</Link>
//               </Button>
//             </div>
//           </div>
//         </main>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-background">
//       <main className="container mx-auto px-4 py-8">
//         <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
//           <div>
//             <h1 className="text-3xl font-bold mb-2">Your Wishlist</h1>
//             <p className="text-muted-foreground">
//               {items.length} {items.length === 1 ? 'item' : 'items'} saved for later
//             </p>
//           </div>

//           <div className="flex items-center gap-2 mt-4 sm:mt-0">
//             <Button variant="outline" size="sm" onClick={shareWishlist}>
//               <Share2 className="h-4 w-4 mr-2" />
//               Share
//             </Button>
//             <Button asChild variant="outline" size="sm">
//               <Link href="/products">
//                 <ArrowLeft className="h-4 w-4 mr-2" />
//                 Continue Shopping
//               </Link>
//             </Button>
//           </div>
//         </div>

//         {/* Bulk Actions */}
//         <Card className="mb-6">
//           <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//             <div className="flex items-center">
//               <input
//                 type="checkbox"
//                 id="select-all"
//                 checked={selectedItems.length === items.length && items.length > 0}
//                 onChange={toggleSelectAll}
//                 className="h-4 w-4 text-primary rounded"
//               />
//               <label htmlFor="select-all" className="ml-2 text-sm">
//                 Select all ({selectedItems.length} selected)
//               </label>
//             </div>

//             <div className="flex items-center gap-2 flex-wrap">
//               <select
//                 className="p-2 rounded-md border border-input bg-background text-sm"
//                 value={sortBy}
//                 onChange={(e) => setSortBy(e.target.value)}
//               >
//                 <option value="date-added">Sort by: Date added</option>
//                 <option value="price-low">Sort by: Price low to high</option>
//                 <option value="price-high">Sort by: Price high to low</option>
//                 <option value="name">Sort by: Name</option>
//               </select>

//               {selectedItems.length > 0 && (
//                 <Button variant="outline" size="sm" onClick={removeSelected}>
//                   <Trash2 className="h-4 w-4 mr-2" />
//                   Remove ({selectedItems.length})
//                 </Button>
//               )}

//               {selectedInStockItems.length > 0 && (
//                 <Button size="sm" onClick={addAllToCart}>
//                   <ShoppingCart className="h-4 w-4 mr-2" />
//                   Add to cart ({selectedInStockItems.length})
//                 </Button>
//               )}
//             </div>
//           </CardContent>
//         </Card>

//         {/* Wishlist Items */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
//           {sortedItems.map(item => (
//             <Card key={item.productId} className="group hover:shadow-lg transition overflow-hidden">
//               <div className="h-48 bg-muted relative overflow-hidden">
//                 {item.productImage ? (
//                   <Image
//                     src={item.productImage}
//                     alt={item.productName}
//                     className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
//                     height={100}
//                     width={100}
//                   />
//                 ) : (
//                   <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
//                     <Package className="h-12 w-12" />
//                   </div>
//                 )}

//                 <div className="absolute top-2 right-2 flex flex-col gap-2">
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     className="h-8 w-8 bg-background/90 backdrop-blur-sm rounded-full hover:bg-background"
//                     onClick={() => setRemoveItemId(item.productId)}
//                   >
//                     <Trash2 className="h-4 w-4" />
//                   </Button>
//                 </div>

//                 {item.productStock === 0 && (
//                   <div className="absolute top-2 left-10">
//                     <Badge variant="destructive">Out of stock</Badge>
//                   </div>
//                 )}

//                 <div className="absolute top-2 left-2">
//                   <input
//                     type="checkbox"
//                     id={`select-${item.productId}`}
//                     checked={selectedItems.includes(item.productId)}
//                     onChange={() => toggleSelectItem(item.productId)}
//                     className="h-4 w-4 text-primary rounded bg-background"
//                   />
//                 </div>
//               </div>

//               <CardContent className="p-4">
//                 <Link href={`/products/${item.productSlug}`}>
//                   <h3 className="font-semibold text-lg hover:text-primary line-clamp-1">
//                     {item.productName}
//                   </h3>
//                 </Link>

//                 <p className="text-sm text-muted-foreground mb-2">
//                   By {item.creatorName}
//                 </p>

//                 <div className="flex justify-between items-center mb-4">
//                   <span className="font-bold text-lg text-primary">
//                     ₹{parseFloat(item.productPrice).toFixed(2)}
//                   </span>
//                   <div className="flex items-center gap-1">
//                     <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
//                     <span className="text-sm font-medium">
//                       {parseFloat(item.productRating).toFixed(1)}
//                     </span>
//                   </div>
//                 </div>

//                 <div className="flex gap-2">
//                   <Button asChild variant="outline" className="flex-1">
//                     <Link href={`/products/${item.productSlug}`}>
//                       <Eye className="h-4 w-4 mr-2" />
//                       View
//                     </Link>
//                   </Button>

//                   {item.productStock > 0 ? (
//                     <Button
//                       className="flex-1"
//                       onClick={() => handleAddToCart(item)}
//                     >
//                       <ShoppingCart className="h-4 w-4 mr-2" />
//                       Add to Cart
//                     </Button>
//                   ) : (
//                     <Button variant="outline" className="flex-1" disabled>
//                       Notify Me
//                     </Button>
//                   )}
//                 </div>

//                 <p className="text-xs text-muted-foreground text-center mt-3">
//                   Added {new Date(item.addedAt).toLocaleDateString('en-US', {
//                     month: 'short',
//                     day: 'numeric',
//                   })}
//                 </p>
//               </CardContent>
//             </Card>
//           ))}
//         </div>

//         {/* Bottom Actions */}
//         <Card>
//           <CardContent className="p-6">
//             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//               <div>
//                 <h3 className="font-semibold mb-1">Ready to purchase?</h3>
//                 <p className="text-sm text-muted-foreground">
//                   Add items to your cart to complete your purchase
//                 </p>
//               </div>

//               <div className="flex gap-2">
//                 <Button variant="outline" onClick={() => setShowClearDialog(true)}>
//                   <Trash2 className="h-4 w-4 mr-2" />
//                   Clear wishlist
//                 </Button>

//                 {inStockItems.length > 0 && (
//                   <Button onClick={addAllToCart}>
//                     <ShoppingCart className="h-4 w-4 mr-2" />
//                     Add all to cart ({inStockItems.length})
//                   </Button>
//                 )}
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </main>

//       {/* Remove Item Dialog */}
//       <AlertDialog open={!!removeItemId} onOpenChange={() => setRemoveItemId(null)}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Remove from Wishlist</AlertDialogTitle>
//             <AlertDialogDescription>
//               Are you sure you want to remove this item from your wishlist?
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction onClick={() => removeItemId && removeItem(removeItemId)}>
//               Remove
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>

//       {/* Clear Wishlist Dialog */}
//       <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Clear Wishlist</AlertDialogTitle>
//             <AlertDialogDescription>
//               Are you sure you want to remove all items from your wishlist? This action cannot be undone.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction onClick={clearWishlist} className="bg-destructive text-destructive-foreground">
//               Clear All
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// }

// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import Link from "next/link";
// import {
//   Heart,
//   ShoppingCart,
//   Trash2,
//   Share,
//   ArrowLeft,
//   Eye,
//   MoveHorizontal
// } from "lucide-react";

// // Sample wishlist data
// const wishlistItems = [
//   {
//     id: 1,
//     name: "Handcrafted Ceramic Mug",
//     price: 28.99,
//     creator: "Earth & Fire Pottery",
//     image: "/placeholder-mug.jpg",
//     rating: 4.8,
//     reviews: 42,
//     inStock: true,
//     dateAdded: "2023-10-15"
//   },
//   {
//     id: 2,
//     name: "Handwoven Wool Scarf",
//     price: 42.50,
//     creator: "Weaver's Studio",
//     image: "/placeholder-scarf.jpg",
//     rating: 4.6,
//     reviews: 28,
//     inStock: true,
//     dateAdded: "2023-10-10"
//   },
//   {
//     id: 3,
//     name: "Coastal Landscape Painting",
//     price: 120.00,
//     creator: "Seaside Art",
//     image: "/placeholder-painting.jpg",
//     rating: 4.7,
//     reviews: 19,
//     inStock: false,
//     dateAdded: "2023-10-05"
//   },
//   {
//     id: 4,
//     name: "Silver Leaf Earrings",
//     price: 56.00,
//     creator: "Silver Linings Jewelry",
//     image: "/placeholder-earrings.jpg",
//     rating: 4.9,
//     reviews: 67,
//     inStock: true,
//     dateAdded: "2023-09-28"
//   }
// ];

// export default function WishlistPage() {
//   const [items, setItems] = useState(wishlistItems);
//   const [cartItems, setCartItems] = useState([]);
//   const [sortBy, setSortBy] = useState("date-added");
//   const [selectedItems, setSelectedItems] = useState([]);

//   const removeItem = (id) => {
//     setItems(items.filter(item => item.id !== id));
//     setSelectedItems(selectedItems.filter(itemId => itemId !== id));
//   };

//   const addToCart = (item) => {
//     if (!cartItems.includes(item.id)) {
//       setCartItems([...cartItems, item.id]);
//     }
//   };

//   const addAllToCart = () => {
//     const inStockItems = items.filter(item => item.inStock);
//     const newCartItems = [...new Set([...cartItems, ...inStockItems.map(item => item.id)])];
//     setCartItems(newCartItems);
//   };

//   const toggleSelectItem = (id) => {
//     if (selectedItems.includes(id)) {
//       setSelectedItems(selectedItems.filter(itemId => itemId !== id));
//     } else {
//       setSelectedItems([...selectedItems, id]);
//     }
//   };

//   const toggleSelectAll = () => {
//     if (selectedItems.length === items.length) {
//       setSelectedItems([]);
//     } else {
//       setSelectedItems(items.map(item => item.id));
//     }
//   };

//   const removeSelected = () => {
//     setItems(items.filter(item => !selectedItems.includes(item.id)));
//     setSelectedItems([]);
//   };

//   const shareWishlist = () => {
//     // In a real app, this would implement actual sharing functionality
//     alert("Wishlist sharing feature would be implemented here!");
//   };

//   // Sort items based on selected option
//   const sortedItems = [...items].sort((a, b) => {
//     if (sortBy === "date-added") {
//       return new Date(b.dateAdded) - new Date(a.dateAdded);
//     } else if (sortBy === "price-low") {
//       return a.price - b.price;
//     } else if (sortBy === "price-high") {
//       return b.price - a.price;
//     } else if (sortBy === "name") {
//       return a.name.localeCompare(b.name);
//     }
//     return 0;
//   });

//   const inStockItems = items.filter(item => item.inStock);
//   const selectedInStockItems = selectedItems.filter(id => {
//     const item = items.find(item => item.id === id);
//     return item && item.inStock;
//   });

//   if (items.length === 0) {
//     return (
//       <div className="min-h-screen bg-background">
//         <main className="container mx-auto px-4 py-12">
//           <div className="text-center max-w-md mx-auto">
//             <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
//               <Heart className="h-12 w-12 text-muted-foreground" />
//             </div>
//             <h1 className="text-2xl font-bold mb-4">Your wishlist is empty</h1>
//             <p className="text-muted-foreground mb-6">
//               Save your favorite items here to easily find them later. Start browsing to discover amazing local products!
//             </p>
//             <div className="flex flex-col sm:flex-row gap-4 justify-center">
//               <Button asChild>
//                 <Link href="/shop">Start Shopping</Link>
//               </Button>
//               <Button variant="outline" asChild>
//                 <Link href="/creators">Discover Creators</Link>
//               </Button>
//             </div>
//           </div>
//         </main>
//       </div>
//     );
//   }

//     function removeAll(event: MouseEvent<HTMLButtonElement, MouseEvent>): void {
//         throw new Error("Function not implemented.");
//     }

//   return (
//     <div className="min-h-screen bg-background">
//       <main className="container mx-auto px-4 py-8">
//         <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
//           <div>
//             <h1 className="text-3xl font-bold mb-2">Your Wishlist</h1>
//             <p className="text-muted-foreground">
//               {items.length} {items.length === 1 ? 'item' : 'items'} saved for later
//             </p>
//           </div>

//           <div className="flex items-center gap-2 mt-4 sm:mt-0">
//             <Button variant="outline" size="sm" onClick={shareWishlist}>
//               <Share className="h-4 w-4 mr-2" />
//               Share
//             </Button>
//             <Button asChild variant="outline" size="sm">
//               <Link href="/shop">
//                 <ArrowLeft className="h-4 w-4 mr-2" />
//                 Continue Shopping
//               </Link>
//             </Button>
//           </div>
//         </div>

//         {/* Bulk Actions */}
//         <div className="bg-card rounded-lg border p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between">
//           <div className="flex items-center mb-3 sm:mb-0">
//             <input
//               type="checkbox"
//               id="select-all"
//               checked={selectedItems.length === items.length && items.length > 0}
//               onChange={toggleSelectAll}
//               className="h-4 w-4 text-primary rounded"
//             />
//             <label htmlFor="select-all" className="ml-2 text-sm">
//               Select all ({selectedItems.length} selected)
//             </label>
//           </div>

//           <div className="flex items-center gap-2">
//             <select
//               className="p-2 rounded-md border border-input bg-background text-sm"
//               value={sortBy}
//               onChange={(e) => setSortBy(e.target.value)}
//             >
//               <option value="date-added">Sort by: Date added</option>
//               <option value="price-low">Sort by: Price low to high</option>
//               <option value="price-high">Sort by: Price high to low</option>
//               <option value="name">Sort by: Name</option>
//             </select>

//             {selectedItems.length > 0 && (
//               <Button variant="outline" size="sm" onClick={removeSelected}>
//                 <Trash2 className="h-4 w-4 mr-2" />
//                 Remove ({selectedItems.length})
//               </Button>
//             )}

//             {selectedInStockItems.length > 0 && (
//               <Button size="sm" onClick={addAllToCart}>
//                 <ShoppingCart className="h-4 w-4 mr-2" />
//                 Add to cart ({selectedInStockItems.length})
//               </Button>
//             )}
//           </div>
//         </div>

//         {/* Wishlist Items */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
//           {sortedItems.map(item => (
//             <div key={item.id} className="bg-card rounded-lg border overflow-hidden hover:shadow-md transition">
//               <div className="h-48 bg-muted relative">
//                 <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
//                   Product Image
//                 </div>

//                 <div className="absolute top-2 right-2 flex flex-col gap-2">
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     className="h-8 w-8 bg-background/80 rounded-full"
//                     onClick={() => removeItem(item.id)}
//                   >
//                     <Trash2 className="h-4 w-4" />
//                   </Button>

//                   {item.inStock && (
//                     <Button
//                       variant="ghost"
//                       size="icon"
//                       className={`h-8 w-8 bg-background/80 rounded-full ${
//                         cartItems.includes(item.id) ? 'text-green-600' : ''
//                       }`}
//                       onClick={() => addToCart(item)}
//                     >
//                       <ShoppingCart className="h-4 w-4" />
//                     </Button>
//                   )}
//                 </div>

//                 {!item.inStock && (
//                   <div className="absolute top-2 left-2">
//                     <span className="bg-rose-100 text-rose-800 text-xs px-2 py-1 rounded">
//                       Out of stock
//                     </span>
//                   </div>
//                 )}

//                 <div className="absolute top-2 left-2">
//                   <input
//                     type="checkbox"
//                     id={`select-${item.id}`}
//                     checked={selectedItems.includes(item.id)}
//                     onChange={() => toggleSelectItem(item.id)}
//                     className="h-4 w-4 text-primary rounded bg-background"
//                   />
//                 </div>
//               </div>

//               <div className="p-4">
//                 <Link href={`/product/${item.id}`}>
//                   <h3 className="font-semibold text-lg hover:text-primary">{item.name}</h3>
//                 </Link>

//                 <Link href={`/creator/${item.creator.replace(/\s+/g, '-').toLowerCase()}`}>
//                   <p className="text-sm text-muted-foreground hover:text-primary">By {item.creator}</p>
//                 </Link>

//                 <div className="flex justify-between items-center mt-3">
//                   <span className="font-bold text-primary">${item.price}</span>
//                   <div className="flex items-center">
//                     <div className="flex items-center mr-2">
//                       {[...Array(5)].map((_, i) => (
//                         <span key={i} className="text-amber-500">
//                           {i < Math.floor(item.rating) ? '★' : '☆'}
//                         </span>
//                       ))}
//                     </div>
//                     <span className="text-sm text-muted-foreground">({item.reviews})</span>
//                   </div>
//                 </div>

//                 <div className="flex gap-2 mt-4">
//                   <Button asChild variant="outline" className="flex-1">
//                     <Link href={`/product/${item.id}`}>
//                       <Eye className="h-4 w-4 mr-2" />
//                       View
//                     </Link>
//                   </Button>

//                   {item.inStock ? (
//                     <Button
//                       className="flex-1"
//                       onClick={() => addToCart(item)}
//                       disabled={cartItems.includes(item.id)}
//                     >
//                       {cartItems.includes(item.id) ? "In Cart" : "Add to Cart"}
//                     </Button>
//                   ) : (
//                     <Button variant="outline" className="flex-1" disabled>
//                       Notify Me
//                     </Button>
//                   )}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Recommendations */}
//         <div className="mb-12">
//           <div className="flex items-center justify-between mb-6">
//             <h2 className="text-2xl font-bold">You might also like</h2>
//             <Button variant="ghost" asChild>
//               <Link href="/shop">
//                 View all
//                 <MoveHorizontal className="h-4 w-4 ml-2" />
//               </Link>
//             </Button>
//           </div>

//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//             {[1, 2, 3, 4].map(i => (
//               <div key={i} className="bg-muted/30 rounded-lg p-4 text-center">
//                 <div className="h-32 bg-muted/50 rounded-md flex items-center justify-center mb-3">
//                   <div className="text-muted-foreground">Product {i}</div>
//                 </div>
//                 <p className="text-sm font-medium">Recommended Item {i}</p>
//                 <p className="text-sm text-muted-foreground">$XX.XX</p>
//                 <Button variant="outline" size="sm" className="mt-3">
//                   <Heart className="h-4 w-4 mr-2" />
//                   Save
//                 </Button>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Bottom Actions */}
//         <div className="bg-card rounded-lg border p-6">
//           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//             <div>
//               <h3 className="font-semibold mb-1">Ready to purchase?</h3>
//               <p className="text-sm text-muted-foreground">
//                 Add items to your cart to complete your purchase
//               </p>
//             </div>

//             <div className="flex gap-2">
//               <Button variant="outline" onClick={removeAll}>
//                 <Trash2 className="h-4 w-4 mr-2" />
//                 Clear wishlist
//               </Button>

//               {inStockItems.length > 0 && (
//                 <Button onClick={addAllToCart}>
//                   <ShoppingCart className="h-4 w-4 mr-2" />
//                   Add all to cart ({inStockItems.length})
//                 </Button>
//               )}
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }
