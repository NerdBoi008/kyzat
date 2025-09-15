"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Send,
  Phone,
  Video,
  Info,
  Paperclip,
  Smile,
  Clock,
  CheckCheck,
  User,
  Store,
  Plus,
} from "lucide-react";
import Link from "next/link";

// Types based on your schema
interface Conversation {
  id: string;
  creatorId: string;
  customerId: string;
  lastMessageAt: string;
  isActive: boolean;
  creator?: {
    id: string;
    name: string;
    image?: string;
    description?: string;
  };
  customer?: {
    id: string;
    name: string;
    image?: string;
  };
  lastMessage?: {
    message: string;
    createdAt: string;
    isRead: boolean;
    senderId: string;
  };
  unreadCount: number;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  attachments?: string[];
  sender?: {
    id: string;
    name: string;
    image?: string;
    role: string;
  };
}

export default function MessagesPage() {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isCreator =
    session?.user?.role === "creator" ||
    session?.user?.creatorStatus === "approved";

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch("/api/conversations");
      const data: { success: boolean; data: Conversation[] } =
        await response.json();

      if (data.success) {
        setConversations(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  // Fetch messages for a conversation
  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(
        `/api/conversations/${conversationId}/messages`
      );
      const data: { success: boolean; data: Message[] } = await response.json();

      if (data.success) {
        setMessages(data.data);

        // Mark messages as read
        await fetch(`/api/conversations/${conversationId}/read`, {
          method: "POST",
        });
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  // Send a new message
  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return;

    const messageToSend = newMessage.trim();
    setNewMessage("");

    try {
      const response = await fetch(
        `/api/conversations/${activeConversation.id}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: messageToSend,
          }),
        }
      );

      const data: { success: boolean; data: Message } = await response.json();

      if (data.success) {
        setMessages((prev) => [...prev, data.data]);
        // Refresh conversations to update last message
        fetchConversations();
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  // Handle conversation selection
  const handleSelectConversation = (conversation: Conversation) => {
    setActiveConversation(conversation);
    fetchMessages(conversation.id);
  };

  // Filter conversations based on search and tab
  const filteredConversations = conversations.filter((conversation) => {
    const otherUser = isCreator ? conversation.customer : conversation.creator;
    const matchesSearch = otherUser?.name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "unread" && conversation.unreadCount > 0);

    return matchesSearch && matchesTab;
  });

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // WebSocket or polling for real-time updates (simplified)
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeConversation) {
        fetchMessages(activeConversation.id);
      }
      fetchConversations();
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [activeConversation, fetchConversations]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const getOtherUser = (conversation: Conversation) => {
    return isCreator ? conversation.customer : conversation.creator;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto h-[calc(100vh-200px)]">
            <div className="grid grid-cols-1 lg:grid-cols-3 h-full gap-6">
              {/* Conversations Skeleton */}
              <Card className="lg:col-span-1 py-6">
                <CardHeader>
                  <div className="h-6 w-32 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 w-48 bg-muted rounded animate-pulse"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 animate-pulse"
                      >
                        <div className="h-12 w-12 bg-muted rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-32 bg-muted rounded"></div>
                          <div className="h-3 w-48 bg-muted rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Messages Skeleton */}
            <Card className="lg:col-span-2 py-6">
              <CardHeader>
                <div className="h-6 w-48 bg-muted rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`flex gap-3 animate-pulse ${
                        i % 2 === 0 ? "justify-start" : "justify-end"
                      }`}
                    >
                      <div
                        className={`h-8 w-8 bg-muted rounded-full ${
                          i % 2 === 0 ? "" : "order-2"
                        }`}
                      ></div>
                      <div
                        className={`max-w-xs bg-muted rounded-lg p-3 ${
                          i % 2 === 0 ? "" : "order-1"
                        }`}
                      >
                        <div className="h-4 w-32 bg-muted/50 rounded mb-2"></div>
                        <div className="h-3 w-24 bg-muted/50 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Messages</h1>
              <p className="text-muted-foreground">
                Communicate with {isCreator ? "customers" : "creators"}
              </p>
            </div>

            <Button asChild className="mt-4 sm:mt-0">
              <Link href={isCreator ? "/shop" : "/creators"}>
                <Plus className="h-4 w-4 mr-2" />
                Browse {isCreator ? "Products" : "Creators"}
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
            {/* Conversations List */}
            <Card className="lg:col-span-1 flex flex-col py-6">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle>Conversations</CardTitle>
                  <Badge variant="secondary">{conversations.length}</Badge>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Tabs */}
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="unread">
                      Unread
                      {conversations.filter((c) => c.unreadCount > 0).length >
                        0 && (
                        <Badge
                          variant="destructive"
                          className="ml-2 h-4 w-4 p-0 text-xs"
                        >
                          {
                            conversations.filter((c) => c.unreadCount > 0)
                              .length
                          }
                        </Badge>
                      )}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>

              <CardContent className="flex-1 p-0">
                <ScrollArea className="h-full">
                  <div className="space-y-1 p-2">
                    {filteredConversations.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                          <User className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground mb-2">
                          No conversations found
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {searchQuery
                            ? "Try adjusting your search"
                            : `Start a conversation with a ${
                                isCreator ? "customer" : "creator"
                              }`}
                        </p>
                      </div>
                    ) : (
                      filteredConversations.map((conversation) => {
                        const otherUser = getOtherUser(conversation);
                        const isActive =
                          activeConversation?.id === conversation.id;

                        return (
                          <div
                            key={conversation.id}
                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                              isActive
                                ? "bg-primary/10 border border-primary/20"
                                : "hover:bg-muted/50"
                            }`}
                            onClick={() =>
                              handleSelectConversation(conversation)
                            }
                          >
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={otherUser?.image} />
                              <AvatarFallback>
                                {getInitials(otherUser?.name || "U")}
                              </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="font-medium truncate">
                                  {otherUser?.name}
                                </p>
                                {conversation.lastMessage && (
                                  <span className="text-xs text-muted-foreground">
                                    {formatTime(
                                      conversation.lastMessage.createdAt
                                    )}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground truncate">
                                  {conversation.lastMessage?.message ||
                                    "No messages yet"}
                                </p>

                                {conversation.unreadCount > 0 && (
                                  <Badge
                                    variant="destructive"
                                    className="h-5 w-5 p-0 text-xs flex items-center justify-center"
                                  >
                                    {conversation.unreadCount}
                                  </Badge>
                                )}
                              </div>

                              {isCreator && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Store className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">
                                    Customer
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Messages Area */}
            <Card className="lg:col-span-2 flex flex-col py-6">
              {activeConversation ? (
                <>
                  <CardHeader className="pb-4 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={getOtherUser(activeConversation)?.image}
                          />
                          <AvatarFallback>
                            {getInitials(
                              getOtherUser(activeConversation)?.name || "U"
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">
                            {getOtherUser(activeConversation)?.name}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-1">
                            {isCreator ? (
                              <>
                                <Store className="h-3 w-3" />
                                Customer
                              </>
                            ) : (
                              <>
                                <User className="h-3 w-3" />
                                Creator
                              </>
                            )}
                            <span>•</span>
                            <span className="text-green-600 flex items-center gap-1">
                              <div className="h-2 w-2 bg-green-600 rounded-full"></div>
                              Online
                            </span>
                          </CardDescription>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Video className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Info className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 p-0">
                    <ScrollArea className="h-[400px] p-4">
                      <div className="space-y-4">
                        {messages.length === 0 ? (
                          <div className="text-center py-12">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                              <Send className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <p className="text-muted-foreground mb-2">
                              No messages yet
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Start the conversation by sending a message
                            </p>
                          </div>
                        ) : (
                          messages.map((message) => {
                            const isOwnMessage =
                              message.senderId === session?.user?.id;

                            return (
                              <div
                                key={message.id}
                                className={`flex gap-3 ${
                                  isOwnMessage ? "justify-end" : "justify-start"
                                }`}
                              >
                                {!isOwnMessage && (
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={message.sender?.image} />
                                    <AvatarFallback>
                                      {getInitials(message.sender?.name || "U")}
                                    </AvatarFallback>
                                  </Avatar>
                                )}

                                <div
                                  className={`max-w-xs lg:max-w-md ${
                                    isOwnMessage ? "order-1" : "order-2"
                                  }`}
                                >
                                  <div
                                    className={`rounded-lg p-3 ${
                                      isOwnMessage
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted"
                                    }`}
                                  >
                                    <p className="text-sm">{message.message}</p>
                                  </div>

                                  <div
                                    className={`flex items-center gap-2 mt-1 text-xs ${
                                      isOwnMessage
                                        ? "justify-end"
                                        : "justify-start"
                                    }`}
                                  >
                                    <span className="text-muted-foreground">
                                      {formatTime(message.createdAt)}
                                    </span>
                                    {isOwnMessage && (
                                      <span className="text-muted-foreground">
                                        {message.isRead ? (
                                          <CheckCheck className="h-3 w-3" />
                                        ) : (
                                          <Clock className="h-3 w-3" />
                                        )}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {isOwnMessage && (
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage
                                      src={
                                        session?.user?.image ??
                                        "/placeholder-image.png"
                                      }
                                    />
                                    <AvatarFallback>
                                      {getInitials(session?.user?.name || "U")}
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                              </div>
                            );
                          })
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>
                  </CardContent>

                  {/* Message Input */}
                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Paperclip className="h-4 w-4" />
                      </Button>

                      <Input
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                        className="flex-1"
                      />

                      <Button variant="ghost" size="icon">
                        <Smile className="h-4 w-4" />
                      </Button>

                      <Button
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        size="icon"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                  <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
                    <Send className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-muted-foreground text-center mb-6">
                    Choose a conversation from the list to start messaging
                  </p>
                  <Button asChild>
                    <Link href={isCreator ? "/orders" : "/creators"}>
                      {isCreator ? "View Customer Orders" : "Browse Creators"}
                    </Link>
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
