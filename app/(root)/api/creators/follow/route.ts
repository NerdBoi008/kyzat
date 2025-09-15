import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createDB } from "@/lib/db/src";
import { creatorFollowers, creators } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

// Follow a creator
export async function POST(request: NextRequest) {
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

    const body: { creatorId: string } = await request.json();
    const { creatorId } = body;

    if (!creatorId) {
      return NextResponse.json(
        { success: false, error: "Creator ID is required" },
        { status: 400 }
      );
    }

    const db = await createDB();

    // Check if already following
    const existing = await db.query.creatorFollowers.findFirst({
      where: (followers, { and, eq }) =>
        and(
          eq(followers.creatorId, creatorId),
          eq(followers.followerId, session.user.id)
        ),
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Already following this creator" },
        { status: 409 }
      );
    }

    // Check if the follower is also a creator
    const followerCreatorProfile = await db.query.creators.findFirst({
      where: eq(creators.userId, session.user.id),
    });

    // Add follow relationship
    await db.insert(creatorFollowers).values({
      creatorId,
      followerId: session.user.id,
    });

    // Update the creator being followed (increase followers count)
    await db
      .update(creators)
      .set({
        followers: sql`${creators.followers} + 1`,
      })
      .where(eq(creators.id, creatorId));

    // If the follower is also a creator, update their following count
    if (followerCreatorProfile) {
      await db
        .update(creators)
        .set({
          following: sql`${creators.following} + 1`,
        })
        .where(eq(creators.id, followerCreatorProfile.id));
    }

    return NextResponse.json({
      success: true,
      message: "Successfully followed creator",
      followerIsCreator: !!followerCreatorProfile,
    });
  } catch (error) {
    console.error("Error following creator:", error);
    return NextResponse.json(
      { success: false, error: "Failed to follow creator" },
      { status: 500 }
    );
  }
}

// Unfollow a creator
export async function DELETE(request: NextRequest) {
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
    const creatorId = searchParams.get("creatorId");

    if (!creatorId) {
      return NextResponse.json(
        { success: false, error: "Creator ID is required" },
        { status: 400 }
      );
    }

    const db = await createDB();

    // Check if the follower is also a creator
    const followerCreatorProfile = await db.query.creators.findFirst({
      where: eq(creators.userId, session.user.id),
    });

    // Remove follow relationship
    const result = await db
      .delete(creatorFollowers)
      .where(
        and(
          eq(creatorFollowers.creatorId, creatorId),
          eq(creatorFollowers.followerId, session.user.id)
        )
      )
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: "Not following this creator" },
        { status: 404 }
      );
    }

    // Update the creator being unfollowed (decrease followers count)
    await db
      .update(creators)
      .set({
        followers: sql`GREATEST(${creators.followers} - 1, 0)`, // Prevent negative
      })
      .where(eq(creators.id, creatorId));

    // If the follower is also a creator, update their following count
    if (followerCreatorProfile) {
      await db
        .update(creators)
        .set({
          following: sql`GREATEST(${creators.following} - 1, 0)`, // Prevent negative
        })
        .where(eq(creators.id, followerCreatorProfile.id));
    }

    return NextResponse.json({
      success: true,
      message: "Successfully unfollowed creator",
      followerIsCreator: !!followerCreatorProfile,
    });
  } catch (error) {
    console.error("Error unfollowing creator:", error);
    return NextResponse.json(
      { success: false, error: "Failed to unfollow creator" },
      { status: 500 }
    );
  }
}
