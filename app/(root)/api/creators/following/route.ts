import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createDB } from "@/lib/db/src";
import { creatorFollowers } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const db = await createDB();

    // Get all creators this user is following
    const following = await db
      .select({
        creatorId: creatorFollowers.creatorId,
        followedAt: creatorFollowers.createdAt,
      })
      .from(creatorFollowers)
      .where(eq(creatorFollowers.followerId, session.user.id))
      .orderBy(desc(creatorFollowers.createdAt));

    return NextResponse.json({
      success: true,
      data: following,
    });
  } catch (error) {
    console.error("Error fetching following list:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch following list" },
      { status: 500 }
    );
  }
}
