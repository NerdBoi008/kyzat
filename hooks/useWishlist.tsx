import { WishlistContext } from "@/contexts/WishlistContext";
import { useContext } from "react";

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return context;
}
