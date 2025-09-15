import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createDB } from "@/lib/db/src";
import { creatorFollowers } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const creatorIds = searchParams.get("creatorIds")?.split(",") || [];

    if (creatorIds.length === 0) {
      return NextResponse.json({ success: true, data: {} });
    }

    const db = await createDB();

    // Get all follow relationships for these creators
    const follows = await db
      .select({
        creatorId: creatorFollowers.creatorId,
      })
      .from(creatorFollowers)
      .where(
        and(
          eq(creatorFollowers.followerId, session.user.id),
          inArray(creatorFollowers.creatorId, creatorIds)
        )
      );

    // Convert to a map for easy lookup
    const followStatus = creatorIds.reduce((acc, id) => {
      acc[id] = follows.some((f) => f.creatorId === id);
      return acc;
    }, {} as Record<string, boolean>);

    return NextResponse.json({
      success: true,
      data: followStatus,
    });
  } catch (error) {
    console.error("Error checking follow status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check follow status" },
      { status: 500 }
    );
  }
}
