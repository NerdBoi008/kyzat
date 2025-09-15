import { FollowContext } from "@/contexts/FollowContext";
import { useContext } from "react";

export function useFollow() {
  const context = useContext(FollowContext);
  if (!context) {
    throw new Error("useFollow must be used within FollowProvider");
  }
  return context;
}
