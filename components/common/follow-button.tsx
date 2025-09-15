"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useFollow } from "@/hooks/useFollow";
import { useSession } from "@/lib/auth-client";

interface FollowButtonProps {
  creatorId: string;
  creatorName?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  showIcon?: boolean;
  className?: string;
  onFollowChange?: (isFollowing: boolean) => void;
}

export function FollowButton({
  creatorId,
  creatorName = "Creator",
  variant = "default",
  size = "default",
  showIcon = true,
  className,
  onFollowChange,
}: FollowButtonProps) {
  const { isFollowing, toggleFollow } = useFollow();
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const following = isFollowing(creatorId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user?.id) {
      router.push("/auth");
      return;
    }

    if (isLoading) return; // Prevent multiple clicks

    setIsLoading(true);

    try {
      await toggleFollow(creatorId, creatorName);

      // Callback for parent component if needed
      if (onFollowChange) {
        onFollowChange(!following);
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={following ? "outline" : variant}
      size={size}
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        following && "border-primary text-primary hover:bg-primary/10",
        className
      )}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          {following ? "Unfollowing..." : "Following..."}
        </>
      ) : (
        <>
          {showIcon &&
            (following ? (
              <UserCheck className="h-4 w-4 mr-2" />
            ) : (
              <UserPlus className="h-4 w-4 mr-2" />
            ))}
          {following ? "Following" : "Follow"}
        </>
      )}
    </Button>
  );
}
