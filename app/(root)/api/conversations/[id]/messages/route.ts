import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createDB } from "@/lib/db/src";
import { messages, conversations, users } from "@/lib/db/schema";
import { eq, desc, and, or } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const db = await createDB();

    // Verify user has access to this conversation
    const conversation = await db.query.conversations.findFirst({
      where: and(
        eq(conversations.id, id),
        or(
          eq(conversations.creatorId, session.user.id),
          eq(conversations.customerId, session.user.id)
        )
      ),
    });

    if (!conversation) {
      return NextResponse.json({ success: false, error: 'Conversation not found' }, { status: 404 });
    }

    // Fetch messages
    const messagesData = await db
      .select({
        id: messages.id,
        conversationId: messages.conversationId,
        senderId: messages.senderId,
        message: messages.message,
        isRead: messages.isRead,
        createdAt: messages.createdAt,
        attachments: messages.attachments,
        sender: {
          id: users.id,
          name: users.name,
          image: users.image,
          role: users.role,
        },
      })
      .from(messages)
      .where(eq(messages.conversationId, id))
      .leftJoin(users, eq(messages.senderId, users.id))
      .orderBy(desc(messages.createdAt))
      .limit(100);

    return NextResponse.json({
      success: true,
      data: messagesData.reverse(), // Reverse to show oldest first
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body: { message: string } = await request.json();
    const { id } = await params;
    const db = await createDB();

    // Verify user has access to this conversation
    const conversation = await db.query.conversations.findFirst({
      where: and(
        eq(conversations.id, id),
        or(
          eq(conversations.creatorId, session.user.id),
          eq(conversations.customerId, session.user.id)
        )
      ),
    });

    if (!conversation) {
      return NextResponse.json({ success: false, error: 'Conversation not found' }, { status: 404 });
    }

    // Create message
    const [message] = await db.insert(messages).values({
      conversationId: id,
      senderId: session.user.id,
      message: body.message,
      isRead: false,
    }).returning();

    // Update conversation last message time
    await db.update(conversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(conversations.id, id));

    // Get sender info
    const messageWithSender = await db
      .select({
        id: messages.id,
        conversationId: messages.conversationId,
        senderId: messages.senderId,
        message: messages.message,
        isRead: messages.isRead,
        createdAt: messages.createdAt,
        attachments: messages.attachments,
        sender: {
          id: users.id,
          name: users.name,
          image: users.image,
          role: users.role,
        },
      })
      .from(messages)
      .where(eq(messages.id, message.id))
      .leftJoin(users, eq(messages.senderId, users.id))
      .then(result => result[0]);

    return NextResponse.json({
      success: true,
      data: messageWithSender,
    });

  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    );
  }
}