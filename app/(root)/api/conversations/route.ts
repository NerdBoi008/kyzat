import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createDB } from "@/lib/db/src";
import { conversations, users, creators, messages } from "@/lib/db/schema";
import { eq, desc, and, or, ne } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const db = await createDB();

    // Get conversations where user is either creator or customer
    const userConversations = await db
      .select({
        id: conversations.id,
        creatorId: conversations.creatorId,
        customerId: conversations.customerId,
        lastMessageAt: conversations.lastMessageAt,
        isActive: conversations.isActive,
        creator: {
          id: creators.id,
          name: users.name,
          image: users.image,
          description: creators.description,
        },
        customer: {
          id: users.id,
          name: users.name,
          image: users.image,
        },
        lastMessage: {
          message: messages.message,
          createdAt: messages.createdAt,
          isRead: messages.isRead,
          senderId: messages.senderId,
        },
      })
      .from(conversations)
      .where(
        or(
          eq(conversations.creatorId, session.user.id),
          eq(conversations.customerId, session.user.id)
        )
      )
      .leftJoin(creators, eq(conversations.creatorId, creators.userId))
      .leftJoin(users, eq(creators.userId, users.id))
      .leftJoin(alias(users, 'customer'), eq(conversations.customerId, users.id))
      .leftJoin(
        messages,
        eq(conversations.id, messages.conversationId)
      )
      .orderBy(desc(conversations.lastMessageAt));

    // Calculate unread counts
    const conversationsWithUnread = await Promise.all(
      userConversations.map(async (conv) => {
        const unreadCount = await db
          .select({ count: messages.id })
          .from(messages)
          .where(
            and(
              eq(messages.conversationId, conv.id),
              eq(messages.isRead, false),
              ne(messages.senderId, session.user.id)
            )
          );

        return {
          ...conv,
          unreadCount: unreadCount[0]?.count || 0,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: conversationsWithUnread,
    });

  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}