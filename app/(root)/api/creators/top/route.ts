import { NextResponse } from "next/server";
import { createDB } from "@/lib/db/src";
import { creators, users } from "@/lib/db/schema";
import { eq, desc, and, gte } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const db = await createDB();
    const { searchParams } = new URL(req.url);

    const limit = parseInt(searchParams.get("limit") ?? "6", 10);
    const timeframe = searchParams.get("timeframe") ?? "overall";
    const verified = searchParams.get("verified") === "true";
    
    // Build where conditions
    const whereConditions = [];
    
    if (verified) {
      whereConditions.push(eq(creators.isVerified, true));
    }
    
    // Add minimum filters
    whereConditions.push(gte(creators.rating, "3.0"));
    whereConditions.push(gte(creators.sales, 1));

    // Build the base query first
    const baseQuery = db
      .select({
        // Creator fields
        id: creators.id,
        userId: creators.userId,
        followers: creators.followers,
        following: creators.following,
        image: creators.image,
        story: creators.story,
        description: creators.description,
        location: creators.location,
        category: creators.category,
        rating: creators.rating,
        sales: creators.sales,
        isVerified: creators.isVerified,
        isFeatured: creators.isFeatured,
        joined: creators.joined,
        categories: creators.categories,
        socialLinks: creators.socialLinks,
        createdAt: creators.createdAt,
        updatedAt: creators.updatedAt,
        
        // User fields
        userName: users.name,
        userEmail: users.email,
        userImage: users.image,
        userBio: users.bio,
        userLocation: users.location,
        userWebsite: users.website,
        userSocialLinks: users.socialLinks,
        userRole: users.role,
        userCreatorStatus: users.creatorStatus,
        userCreatedAt: users.createdAt,
        userUpdatedAt: users.updatedAt,
      })
      .from(creators)
      .leftJoin(users, eq(creators.userId, users.id));

    // Apply where conditions
    const queryWithWhere = whereConditions.length > 0 
      ? baseQuery.where(and(...whereConditions))
      : baseQuery;

    // Apply ordering based on timeframe - fix the chaining issue
    let finalQuery;
    
    switch (timeframe) {
      case "monthly":
        finalQuery = queryWithWhere
          .orderBy(
            desc(creators.isVerified),
            desc(creators.sales),
            desc(creators.rating),
            desc(creators.followers)
          )
          .limit(limit);
        break;
      case "weekly":
        finalQuery = queryWithWhere
          .orderBy(
            desc(creators.isVerified),
            desc(creators.rating),
            desc(creators.followers),
            desc(creators.sales)
          )
          .limit(limit);
        break;
      default: // overall
        finalQuery = queryWithWhere
          .orderBy(
            desc(creators.isVerified),
            desc(creators.rating),
            desc(creators.sales),
            desc(creators.followers)
          )
          .limit(limit);
    }

    const result = await finalQuery;

    // Transform the result
    const transformedResult = result.map(item => ({
      id: item.id,
      userId: item.userId,
      followers: item.followers,
      following: item.following,
      image: item.image,
      story: item.story,
      description: item.description,
      location: item.location,
      category: item.category,
      rating: item.rating,
      sales: item.sales,
      isVerified: item.isVerified,
      isFeatured: item.isFeatured,
      joined: item.joined,
      categories: item.categories,
      socialLinks: item.socialLinks,
      created_at: item.createdAt,
      updated_at: item.updatedAt,
      
      user: {
        name: item.userName,
        email: item.userEmail,
        image: item.userImage,
        bio: item.userBio,
        location: item.userLocation,
        website: item.userWebsite,
        socialLinks: item.userSocialLinks,
        role: item.userRole,
        creatorStatus: item.userCreatorStatus,
        created_at: item.userCreatedAt,
        updated_at: item.userUpdatedAt,
      }
    }));

    return NextResponse.json({
      success: true,
      timeframe,
      criteria: `Ranked by verification, rating, sales, and followers`,
      data: transformedResult,
    });

  } catch (error) {
    if (error instanceof Error) {
      console.error("❌ Error fetching top creators:", error);
  
      return NextResponse.json(
        { 
          success: false, 
          message: "Failed to fetch top creators",
          error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        },
        { status: 500 }
      );
    }
  }
}