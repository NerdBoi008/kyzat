import { auth } from "@/lib/auth";
import { createDB } from "@/lib/db/src";
import { users, addresses } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

// Validation schemas
const personalInfoSchema = z.object({
  name: z.string().min(2).max(255),
  bio: z.string().max(500).optional(),
  website: z.url().optional().or(z.literal('')),
  location: z.string().max(255).optional(),
  socialLinks: z.object({
    twitter: z.url().optional().or(z.literal('')),
    instagram: z.url().optional().or(z.literal('')),
    facebook: z.url().optional().or(z.literal('')),
    linkedin: z.url().optional().or(z.literal('')),
    whatsapp: z.string().optional().or(z.literal('')),
  }).optional(),
});

const addressSchema = z.object({
  label: z.string().min(1).max(100),
  name: z.string().min(2).max(255),
  phone: z.string().min(7).max(15).optional().or(z.literal('')),
  street: z.string().min(1),
  apartment: z.string().optional().or(z.literal('')),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
  isDefault: z.boolean().optional(),
  type: z.enum(['home', 'work', 'other']).optional(),
});

// Define schemas with discriminator
const personalInfoRequestSchema = z.object({
  type: z.literal('personal'),
  data: personalInfoSchema,
});

const addressRequestSchema = z.object({
  type: z.literal('address'),
  data: addressSchema,
});

// Create discriminated union schema
const updateProfileRequestSchema = z.discriminatedUnion('type', [
  personalInfoRequestSchema,
  addressRequestSchema,
]);

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = updateProfileRequestSchema.parse(await request.json());
    const { type, data } = body;

    const db = await createDB();

    switch (type) {
      case 'personal': {
        // Validate personal info
        const validationResult = personalInfoSchema.safeParse(data);
        
        if (!validationResult.success) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'Validation failed',
              details: validationResult.error.issues 
            },
            { status: 400 }
          );
        }

        // Update user
        const [updatedUser] = await db
          .update(users)
          .set({
            name: data.name,
            bio: data.bio || null,
            website: data.website || null,
            location: data.location || null,
            socialLinks: data.socialLinks || {},
            updatedAt: new Date(),
          })
          .where(eq(users.id, session.user.id))
          .returning();

        return NextResponse.json({
          success: true,
          user: updatedUser,
          message: 'Personal information updated successfully',
        });
      }

      case 'address': {
        // Validate address
        const validationResult = addressSchema.safeParse(data);
        
        if (!validationResult.success) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'Validation failed',
              details: validationResult.error.issues
            },
            { status: 400 }
          );
        }

        // Update user address
        const [updatedUser] = await db
          .update(addresses)
          .set({
            ...data,
            updatedAt: new Date(),
          })
          .where(eq(addresses.userId, session.user.id))
          .returning();

        return NextResponse.json({
          success: true,
          user: updatedUser,
          message: 'Address updated successfully',
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid update type' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}