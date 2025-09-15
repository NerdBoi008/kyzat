"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  Download,
  Eye,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  ArrowUpDown,
  Store,
  ShoppingBag,
  MapPin,
  MessageCircle,
  Star,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import Image from "next/image";

// Types based on your schema
interface Order {
  id: string;
  userId: string;
  creatorId: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  totalAmount: string;
  createdAt: string;
  completedAt?: string;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
  };
  trackingNumber?: string;
  items: OrderItem[];
  user?: {
    name: string;
    email: string;
    image?: string;
  };
  creator?: {
    description: string;
    image?: string;
  };
}

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  productSlug: string;
  variantId?: string;
  quantity: number;
  price: string;
  product?: {
    name: string;
    image: string;
    slug: string;
  };
}

interface OrdersResponse {
  success: boolean;
  orders: Order[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  filters: {
    type: string;
    status: string | null;
    dateFrom?: string;
    dateTo?: string;
    dateRange?: string;
  };
}

// Fetcher function for SWR
const fetcher = (url: string): Promise<OrdersResponse> =>
  fetch(url).then((res) => res.json());

export default function OrdersPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"purchases" | "sales">(
    "purchases"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const isCreator =
    session?.user?.role === "creator" ||
    session?.user?.creatorStatus === "approved";

  // Build URL for SWR
  const getUrl = () => {
    const params = new URLSearchParams({
      type: activeTab,
      page: currentPage.toString(),
      pageSize: "20",
    });

    // Only add status if it's not "all"
    if (statusFilter && statusFilter !== "all") {
      params.append("status", statusFilter);
    }

    // Only add dateRange if it's not "all"
    if (dateFilter && dateFilter !== "all") {
      params.append("dateRange", dateFilter);
    }

    return `/api/orders?${params.toString()}`;
  };

  // SWR hook with automatic caching and revalidation
  const { data, error, isLoading, mutate } = useSWR<OrdersResponse>(
    getUrl(),
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  );

  // Memoize orders array to prevent dependency issues
  const orders = useMemo(() => data?.orders || [], [data?.orders]);
  const pagination = data?.pagination;

  // Client-side search filtering (memoized for performance)
  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;

    const query = searchQuery.toLowerCase();
    return orders.filter(
      (order) =>
        order.items.some((item) =>
          item.product?.name?.toLowerCase().includes(query)
        ) ||
        order.id.toLowerCase().includes(query) ||
        order.shippingAddress.name.toLowerCase().includes(query)
    );
  }, [orders, searchQuery]);

  // Status configuration (memoized)
  const statusConfig = useMemo(
    () => ({
      pending: {
        label: "Pending",
        color: "bg-amber-100 text-amber-800",
        icon: Clock,
      },
      processing: {
        label: "Processing",
        color: "bg-blue-100 text-blue-800",
        icon: Package,
      },
      shipped: {
        label: "Shipped",
        color: "bg-purple-100 text-purple-800",
        icon: Truck,
      },
      delivered: {
        label: "Delivered",
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
      },
      cancelled: {
        label: "Cancelled",
        color: "bg-red-100 text-red-800",
        icon: XCircle,
      },
    }),
    []
  );

  const getStatusBadge = (status: Order["status"]) => {
    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge variant="secondary" className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTotalItems = (items: OrderItem[]) => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  // Handler for manual refresh
  const handleRefresh = () => {
    mutate();
  };

  // Handler for clearing filters
  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setDateFilter("all");
    setCurrentPage(1);
  };

  // Handler for tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value as "purchases" | "sales");
    setCurrentPage(1); // Reset to first page on tab change
  };

  // Calculate stats (memoized)
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const totalAmount = orders.reduce(
      (sum, order) => sum + parseFloat(order.totalAmount),
      0
    );
    const deliveredCount = orders.filter(
      (order) => order.status === "delivered"
    ).length;
    const pendingCount = orders.filter(
      (order) => order.status === "pending"
    ).length;

    return { totalOrders, totalAmount, deliveredCount, pendingCount };
  }, [orders]);

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <Card>
              <CardContent className="p-12 text-center">
                <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Failed to Load Orders
                </h3>
                <p className="text-muted-foreground mb-6">
                  There was an error loading your orders. Please try again.
                </p>
                <Button onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header Skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
              <div className="space-y-2">
                <div className="h-8 w-48 bg-muted rounded animate-pulse"></div>
                <div className="h-4 w-64 bg-muted rounded animate-pulse"></div>
              </div>
              <div className="h-9 w-32 bg-muted rounded animate-pulse mt-4 sm:mt-0"></div>
            </div>

            {/* Tabs Skeleton */}
            {isCreator && (
              <div className="mb-6">
                <div className="h-10 w-64 bg-muted rounded animate-pulse"></div>
              </div>
            )}

            {/* Filters Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-10 bg-muted rounded animate-pulse"
                ></div>
              ))}
            </div>

            {/* Orders Skeleton */}
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-card rounded-lg border p-6 animate-pulse"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-2">
                      <div className="h-5 w-32 bg-muted rounded"></div>
                      <div className="h-4 w-24 bg-muted rounded"></div>
                    </div>
                    <div className="h-6 w-20 bg-muted rounded"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-16 bg-muted rounded"></div>
                    <div className="h-4 w-48 bg-muted rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Orders</h1>
              <p className="text-muted-foreground">
                {activeTab === "purchases"
                  ? "Track your purchases and order history"
                  : "Manage your sales and customer orders"}
              </p>
            </div>

            <Button asChild className="mt-4 sm:mt-0">
              <Link href="/products">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Continue Shopping
              </Link>
            </Button>
          </div>

          {/* Tabs for Creator/Customer */}
          {isCreator && (
            <Tabs
              value={activeTab}
              onValueChange={handleTabChange}
              className="mb-6"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="purchases">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  My Purchases
                  {activeTab === "purchases" && pagination && (
                    <Badge variant="secondary" className="ml-2">
                      {pagination.totalCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="sales">
                  <Store className="h-4 w-4 mr-2" />
                  Sales Orders
                  {activeTab === "sales" && pagination && (
                    <Badge variant="secondary" className="ml-2">
                      {pagination.totalCount}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search orders..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Status Filter */}
                <Select
                  value={statusFilter || "all"}
                  onValueChange={(value) => {
                    setStatusFilter(value || "all");
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" defaultValue={"all"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                {/* Date Filter */}
                <Select
                  value={dateFilter}
                  onValueChange={(value) => {
                    setDateFilter(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger>
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                    <SelectItem value="month">Last 30 Days</SelectItem>
                    <SelectItem value="quarter">Last 3 Months</SelectItem>
                    <SelectItem value="year">Last Year</SelectItem>
                  </SelectContent>
                </Select>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleRefresh}
                    disabled={isLoading}
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                    />
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Active Filters Display */}
              {(searchQuery ||
                statusFilter !== "all" ||
                dateFilter !== "all") && (
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Active filters:
                  </span>
                  {searchQuery && (
                    <Badge variant="outline">Search: {searchQuery}</Badge>
                  )}
                  {statusFilter !== "all" && (
                    <Badge variant="outline">Status: {statusFilter}</Badge>
                  )}
                  {dateFilter !== "all" && (
                    <Badge variant="outline">Date: {dateFilter}</Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6"
                    onClick={handleClearFilters}
                  >
                    Clear all
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats Summary */}
          {filteredOrders.length > 0 && (
            <Card className="mb-8 py-6">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>
                  Overview of your{" "}
                  {activeTab === "purchases" ? "purchases" : "sales"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <p className="text-2xl font-bold text-primary">
                      {stats.totalOrders}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Total Orders
                    </p>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <p className="text-2xl font-bold text-primary">
                      ₹{stats.totalAmount.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Total Amount
                    </p>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <p className="text-2xl font-bold text-primary">
                      {stats.deliveredCount}
                    </p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <p className="text-2xl font-bold text-primary">
                      {stats.pendingCount}
                    </p>
                    <p className="text-sm text-muted-foreground">Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No orders found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery || statusFilter !== "all" || dateFilter !== "all"
                    ? "No orders match your current filters."
                    : activeTab === "purchases"
                    ? "You haven't placed any orders yet."
                    : "You haven't received any orders yet."}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {(searchQuery ||
                    statusFilter !== "all" ||
                    dateFilter !== "all") && (
                    <Button variant="outline" onClick={handleClearFilters}>
                      Clear Filters
                    </Button>
                  )}
                  <Button asChild>
                    <Link href="/products">
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Start Shopping
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <Card
                    key={order.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-6">
                      {/* Order Header */}
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="font-semibold">
                              Order #{order.id.slice(-8)}
                            </h3>
                            {getStatusBadge(order.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Placed on {formatDate(order.createdAt)}
                          </p>
                          {order.completedAt && (
                            <p className="text-sm text-muted-foreground">
                              Completed on {formatDate(order.completedAt)}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-4 lg:mt-0">
                          <span className="text-lg font-bold text-primary">
                            ₹{parseFloat(order.totalAmount).toFixed(2)}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            • {getTotalItems(order.items)} items
                          </span>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="space-y-3 mb-4">
                        {order.items.slice(0, 2).map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg"
                          >
                            <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                              {item.product?.image ? (
                                <Image
                                  src={item.product.image}
                                  alt={item.product.name}
                                  className="w-full h-full object-cover"
                                  height={40}
                                  width={40}
                                />
                              ) : (
                                <Package className="h-6 w-6 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">
                                {item.product?.name || "Product"}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                Qty: {item.quantity} × ₹
                                {parseFloat(item.price).toFixed(2)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">
                                ₹
                                {(
                                  item.quantity * parseFloat(item.price)
                                ).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <p className="text-xs text-muted-foreground text-center">
                            + {order.items.length - 2} more item(s)
                          </p>
                        )}
                      </div>

                      {/* Shipping Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              Shipping Address
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <p>{order.shippingAddress.name}</p>
                            <p>{order.shippingAddress.street}</p>
                            <p>
                              {order.shippingAddress.city},{" "}
                              {order.shippingAddress.state}{" "}
                              {order.shippingAddress.zipCode}
                            </p>
                            <p>{order.shippingAddress.country}</p>
                            {order.shippingAddress.phone && (
                              <p>{order.shippingAddress.phone}</p>
                            )}
                          </div>
                        </div>

                        {order.trackingNumber && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Truck className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">
                                Tracking Information
                              </span>
                            </div>
                            <div className="text-sm">
                              <p className="font-mono text-xs break-all">
                                {order.trackingNumber}
                              </p>
                              <Button
                                variant="link"
                                className="h-auto p-0 text-sm"
                              >
                                Track Package
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 pt-4 border-t">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/orders/${order.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </Button>

                        {activeTab === "purchases" &&
                          order.status === "delivered" && (
                            <Button variant="outline" size="sm">
                              <Star className="h-4 w-4 mr-2" />
                              Write Review
                            </Button>
                          )}

                        {activeTab === "sales" &&
                          order.status === "pending" && (
                            <Button size="sm">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Confirm Order
                            </Button>
                          )}

                        {activeTab === "sales" &&
                          order.status === "processing" && (
                            <Button size="sm">
                              <Truck className="h-4 w-4 mr-2" />
                              Mark as Shipped
                            </Button>
                          )}

                        <Button variant="outline" size="sm">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Contact Support
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    disabled={!pagination.hasPrevPage}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={!pagination.hasNextPage}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
