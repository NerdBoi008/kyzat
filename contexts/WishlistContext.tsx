"use client";

import {
  createContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";

interface WishlistContextType {
  wishlistItems: string[]; // Array of product IDs
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string, productName?: string) => Promise<void>;
  isLoading: boolean;
  refreshWishlist: () => void;
}

interface WishlistApiResponse {
  success: boolean;
  data: {
    items: {
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
    }[];
    pagination: {
      hasNextPage: boolean;
      hasPrevPage: boolean;
      page: number;
      pageSize: number;
      totalCount: number;
      totalPages: number;
    };
  };
}

export const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

const fetcher = (url: string): Promise<WishlistApiResponse> =>
  fetch(url).then((res) => res.json());

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useSession();
  const [localWishlist, setLocalWishlist] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch wishlist for authenticated users
  const {
    data,
    mutate,
    isLoading: swrLoading,
  } = useSWR<WishlistApiResponse>(
    session?.user?.id
      ? `/api/wishlist?userId=${session.user.id}&pageSize=50`
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  // Initialize wishlist
  useEffect(() => {
    if (isPending) return;

    if (session?.user?.id && data?.data?.items) {
      // Authenticated: use server data
      const productIds = data.data.items.map((item) => item.productId);
      setLocalWishlist(productIds);
      setIsInitialized(true);
    } else if (!session?.user?.id) {
      // Guest: use localStorage
      try {
        const saved = localStorage.getItem("wishlist");
        if (saved) {
          setLocalWishlist(JSON.parse(saved));
        }
      } catch (error) {
        console.error("Error loading wishlist from localStorage:", error);
      }
      setIsInitialized(true);
    }
  }, [session, isPending, data]);

  // Save to localStorage for guests
  useEffect(() => {
    if (!session?.user?.id && isInitialized) {
      try {
        localStorage.setItem("wishlist", JSON.stringify(localWishlist));
      } catch (error) {
        console.error("Error saving wishlist to localStorage:", error);
      }
    }
  }, [localWishlist, session, isInitialized]);

  const isInWishlist = useCallback(
    (productId: string) => {
      return localWishlist.includes(productId);
    },
    [localWishlist]
  );

  const toggleWishlist = useCallback(
    async (productId: string, productName = "Product") => {
      const isCurrentlyInWishlist = localWishlist.includes(productId);

      if (session?.user?.id) {
        // Authenticated user: sync with server
        try {
          if (isCurrentlyInWishlist) {
            // Remove from wishlist
            const response = await fetch(`/api/wishlist/${productId}`, {
              method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to remove from wishlist");

            setLocalWishlist((prev) => prev.filter((id) => id !== productId));
            toast.success("Removed from wishlist", {
              description: productName,
            });
          } else {
            // Add to wishlist
            const response = await fetch("/api/wishlist", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ productId }),
            });

            if (!response.ok) {
              const error: { error: string } = await response.json();
              if (response.status === 409) {
                // Already in wishlist
                setLocalWishlist((prev) => [...prev, productId]);
                return;
              }
              throw new Error(error.error || "Failed to add to wishlist");
            }

            setLocalWishlist((prev) => [...prev, productId]);
            toast.success("Added to wishlist", {
              description: productName,
            });
          }

          // Refresh server data
          await mutate();
        } catch (error) {
          console.error("Error toggling wishlist:", error);
          toast.error("Failed to update wishlist", {
            description: "Please try again",
          });
        }
      } else {
        // Guest user: use localStorage
        if (isCurrentlyInWishlist) {
          setLocalWishlist((prev) => prev.filter((id) => id !== productId));
          toast.success("Removed from wishlist", {
            description: productName,
          });
        } else {
          setLocalWishlist((prev) => [...prev, productId]);
          toast.success("Added to wishlist", {
            description: productName,
          });
        }
      }
    },
    [localWishlist, session, mutate]
  );

  const refreshWishlist = useCallback(() => {
    if (session?.user?.id) {
      mutate();
    }
  }, [session, mutate]);

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems: localWishlist,
        isInWishlist,
        toggleWishlist,
        isLoading: swrLoading,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}
