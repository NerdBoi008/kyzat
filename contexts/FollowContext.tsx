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

interface FollowContextType {
  followedCreators: Set<string>;
  isFollowing: (creatorId: string) => boolean;
  toggleFollow: (creatorId: string, creatorName?: string) => Promise<boolean>;
  isLoading: boolean;
  loadingStates: Map<string, boolean>; // Track loading per creator
  isCreatorLoading: (creatorId: string) => boolean;
  refreshFollows: () => void;
}

interface FollowedCreatorsApiResponse {
  success: boolean;
  data: {
    creatorId: string;
    followedAt: string;
  }[];
}

export const FollowContext = createContext<FollowContextType | undefined>(
  undefined
);

const fetcher = (url: string): Promise<FollowedCreatorsApiResponse> =>
  fetch(url).then((res) => res.json());

export function FollowProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useSession();
  const [followedCreators, setFollowedCreators] = useState<Set<string>>(
    new Set()
  );
  const [loadingStates, setLoadingStates] = useState<Map<string, boolean>>(
    new Map()
  );
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch followed creators for authenticated users
  const {
    data,
    mutate,
    isLoading: swrLoading,
  } = useSWR<FollowedCreatorsApiResponse>(
    session?.user?.id ? `/api/creators/following` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  // Initialize followed creators
  useEffect(() => {
    if (isPending) return;

    if (session?.user?.id && data?.data) {
      const creatorIds = new Set(data.data.map((item) => item.creatorId));
      setFollowedCreators(creatorIds);
      setIsInitialized(true);
    } else if (!session?.user?.id) {
      // Guest: use localStorage
      try {
        const saved = localStorage.getItem("followedCreators");
        if (saved) {
          setFollowedCreators(new Set(JSON.parse(saved)));
        }
      } catch (error) {
        console.error("Error loading follows from localStorage:", error);
      }
      setIsInitialized(true);
    }
  }, [session, isPending, data]);

  // Save to localStorage for guests
  useEffect(() => {
    if (!session?.user?.id && isInitialized) {
      try {
        localStorage.setItem(
          "followedCreators",
          JSON.stringify(Array.from(followedCreators))
        );
      } catch (error) {
        console.error("Error saving follows to localStorage:", error);
      }
    }
  }, [followedCreators, session, isInitialized]);

  const isFollowing = useCallback(
    (creatorId: string) => {
      return followedCreators.has(creatorId);
    },
    [followedCreators]
  );

  const isCreatorLoading = useCallback(
    (creatorId: string) => {
      return loadingStates.get(creatorId) || false;
    },
    [loadingStates]
  );

  const setCreatorLoading = useCallback(
    (creatorId: string, loading: boolean) => {
      setLoadingStates((prev) => {
        const newMap = new Map(prev);
        if (loading) {
          newMap.set(creatorId, true);
        } else {
          newMap.delete(creatorId);
        }
        return newMap;
      });
    },
    []
  );

  const toggleFollow = useCallback(
    async (creatorId: string, creatorName = "Creator"): Promise<boolean> => {
      const currentlyFollowing = followedCreators.has(creatorId);

      // Set loading state for this specific creator
      setCreatorLoading(creatorId, true);

      try {
        if (session?.user?.id) {
          // Authenticated user: sync with server
          if (currentlyFollowing) {
            // Unfollow
            const response = await fetch(
              `/api/creators/follow?creatorId=${creatorId}`,
              {
                method: "DELETE",
              }
            );

            if (!response.ok) {
              const errorData: { error: string } = await response.json();
              throw new Error(errorData.error || "Failed to unfollow");
            }

            setFollowedCreators((prev) => {
              const newSet = new Set(prev);
              newSet.delete(creatorId);
              return newSet;
            });

            toast.success("Unfollowed", {
              description: creatorName,
            });
          } else {
            // Follow
            const response = await fetch("/api/creators/follow", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ creatorId }),
            });

            if (!response.ok) {
              const errorData: { error: string } = await response.json();
              if (response.status === 409) {
                // Already following
                setFollowedCreators((prev) => new Set(prev).add(creatorId));
                return true;
              }
              throw new Error(errorData.error || "Failed to follow");
            }

            setFollowedCreators((prev) => new Set(prev).add(creatorId));

            toast.success("Following", {
              description: creatorName,
            });
          }

          // Refresh server data
          await mutate();
          return true;
        } else {
          // Guest user: use localStorage
          if (currentlyFollowing) {
            setFollowedCreators((prev) => {
              const newSet = new Set(prev);
              newSet.delete(creatorId);
              return newSet;
            });
            toast.success("Unfollowed", {
              description: `${creatorName} (Sign in to sync)`,
            });
          } else {
            setFollowedCreators((prev) => new Set(prev).add(creatorId));
            toast.success("Following", {
              description: `${creatorName} (Sign in to sync)`,
            });
          }
          return true;
        }
      } catch (error) {
        console.error("Error toggling follow:", error);
        toast.error("Failed to update follow status", {
          description:
            error instanceof Error ? error.message : "Please try again",
        });
        return false;
      } finally {
        // Clear loading state
        setCreatorLoading(creatorId, false);
      }
    },
    [followedCreators, session, mutate, setCreatorLoading]
  );

  const refreshFollows = useCallback(() => {
    if (session?.user?.id) {
      mutate();
    }
  }, [session, mutate]);

  return (
    <FollowContext.Provider
      value={{
        followedCreators,
        isFollowing,
        toggleFollow,
        isLoading: swrLoading,
        loadingStates,
        isCreatorLoading,
        refreshFollows,
      }}
    >
      {children}
    </FollowContext.Provider>
  );
}
