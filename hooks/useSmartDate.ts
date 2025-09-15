"use client";

import { formatSmartDate } from "@/lib/utils";
import { useEffect, useState } from "react";

/**
 * Formats a given date into a human-friendly, dynamic string.
 *
 * 💡 Automatically updates every minute to stay fresh.
 * 
 * Examples:
 * - "Just now" → For under 1 minute
 * - "3 minutes ago" / "5 hours ago" → For recent times
 * - "Yesterday" / "4 days ago" → For this week
 * - "2 weeks ago" / "3 months ago" → For older dates
 * - "12th May 2025" → For very old timestamps
 *
 * @param dateInput - The date or ISO string to format.
 * @returns A string like "3 hours ago" or "12th May 2025".
 *
 * @example
 * ```tsx
 * const updatedAt = useSmartDate(user.updatedAt);
 * return <p>Last updated: {updatedAt}</p>;
 * ```
 */
export function useSmartDate(dateInput: string | Date) {
  const [formattedDate, setFormattedDate] = useState(() =>
    formatSmartDate(dateInput)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setFormattedDate(formatSmartDate(dateInput));
    }, 60 * 1000); // ⏱ Refresh every minute

    return () => clearInterval(interval);
  }, [dateInput]);

  return formattedDate;
}