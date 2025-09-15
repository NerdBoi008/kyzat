import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createDB } from "@/lib/db/src";
import { users, creators } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

type NewCreator = typeof creators.$inferInsert;

const creatorApplicationSchema = z.object({
  shopName: z.string().min(2).max(255),
  category: z.string().min(1),
  description: z.string().min(50).max(2000),
  story: z.string().min(100).max(2000),
  location: z.string().min(1),
  experience: z.string().min(1),
  productTypes: z.array(z.string()).min(1),
  portfolio: z.url().optional().or(z.literal("")),
  businessModel: z.string().min(1),
  averagePrice: z.string().min(1),
  productionTime: z.string().min(1),
  socialLinks: z
    .object({
      instagram: z.url().optional().or(z.literal("")),
      facebook: z.url().optional().or(z.literal("")),
      twitter: z.url().optional().or(z.literal("")),
    })
    .optional(),
});

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

    const body = await request.json();

    // Validate application data
    const validationResult = creatorApplicationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    const db = await createDB();

    // Check if user already has a creator profile
    const existingCreator = await db.query.creators.findFirst({
      where: eq(creators.userId, session.user.id),
    });

    if (existingCreator) {
      return NextResponse.json(
        { success: false, error: "Creator profile already exists" },
        { status: 409 }
      );
    }

    // Check if user already applied
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (user?.creatorStatus === "pending") {
      return NextResponse.json(
        {
          success: false,
          error: "Application already submitted and pending review",
        },
        { status: 409 }
      );
    }

    // Update user status to pending review
    await db
      .update(users)
      .set({
        creatorStatus: "pending",
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));

    // Store application data temporarily (you can create a separate applications table)
    // For now, we'll create a pending creator profile

    const payload: NewCreator = {
      userId: session.user.id,
      image: user?.image || "",
      story: data.story,
      description: data.description,
      location: data.location,
      category: data.category,
      categories: data.productTypes,
      socialLinks: data.socialLinks || {},
      rating: "0",
      sales: 0,
      followers: 0,
      following: 0,
      isVerified: false,
      isFeatured: false,
      joined: new Date(),
      totalRevenue: "0",
      monthlyRevenue: "0",
      engagementScore: "0",
      responseTime: 0,
      completionRate: "0",
      topScore: "0",
      lastActiveAt: new Date(),
    };

    await db.insert(creators).values(payload);

    // TODO: Send notification to admin for review
    // TODO: Send confirmation email to applicant

    return NextResponse.json({
      success: true,
      message: "Creator application submitted successfully",
      status: "pending",
    });
  } catch (error) {
    console.error("Error submitting creator application:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit application" },
      { status: 500 }
    );
  }
}
