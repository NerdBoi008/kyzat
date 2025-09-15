"use client";

import { useSession } from "@/lib/auth-client";
import useSWR from "swr";

export interface UserProfile {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    creatorStatus?: string;
    profileImage?: string;
    bio?: string;
    location?: string;
    phone?: string;
    website?: string;
    socialLinks?: Record<string, string>;
    emailVerified?: Date;
    createdAt: string;
    updatedAt: string;
    preferences?: {
      newsletter: boolean;
      notifications: boolean;
      darkMode: boolean;
      [key: string]: boolean | undefined;
    };
  };
  creatorProfile?: {
    id: string;
    followers: number;
    following: number;
    image?: string;
    coverImage?: string;
    story?: string;
    description?: string;
    rating: number;
    sales: number;
    isVerified: boolean;
    totalRevenue: number;
    location?: string;
    category?: string;
    categories?: string[];
    joined: string;
    isFeatured: boolean;
    socialLinks?: Record<string, string>;
    stats?: {
      creatorId: string;
      avgRating: number;
      totalReviews: number;
      totalOrders: number;
      completedOrders: number;
      avgResponseTime: number;
      lastUpdated: string;
    };
  };
  notifications?: {
    pendingOrders: number;
    newOrders: number;
    unreadMessages: number;
    newReviews: number;
    totalNotifications: number;
  };
  statistics: {
    productsCount: number;
    cartItems: number;
    favorites: number;
    savedItems: number;
    orders: number;
    reviews: number;
  };
  recentOrders: Array<{
    id: string;
    status: string;
    totalAmount: string;
    createdAt: string;
    completedAt?: string;
    user?: {
      name: string;
      email: string;
      image?: string;
    };
    creator?: {
      description: string;
      image?: string;
    };
    items: Array<{
      product: {
        name: string;
        image?: string;
      };
      quantity: number;
    }>;
  }>;
  creatorProducts: Array<{
    id: string;
    slug: string;
    name: string;
    stock: number | null;
    rating: string | null;
    image: string | null;
    price: string;
    isFeatured: boolean | null;
    isApproved: boolean;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    stock: number;
    rating: string;
    sales: number;
    revenue: number;
  }>;
}

interface APIResponse {
  success: boolean;
  data: UserProfile;
  error?: string;
}

const fetcher = async (url: string): Promise<APIResponse> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const useUserProfile = () => {
  const { data: session, isPending } = useSession();

  const {
    data: profileResponse,
    error,
    isLoading,
    mutate: refetchProfile,
  } = useSWR<APIResponse>(
    session?.user?.id ? "/api/user/profile" : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // Cache for 1 minute
    }
  );

  // Update profile function
  const updateProfile = async (updateData: Partial<UserProfile["user"]>) => {
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const result: { data: UserProfile["user"] } = await response.json();

      // Refresh the profile data
      await refetchProfile();

      return { success: true, data: result.data };
    } catch (error) {
      console.error("Error updating profile:", error);
      return { success: false, error: "Failed to update profile" };
    }
  };

  return {
    profile: profileResponse?.data,
    notifications: profileResponse?.data?.notifications,
    isLoading: isPending || isLoading,
    error,
    updateProfile,
    refetchProfile,
    isAuthenticated: !!session?.user,
  };
};
