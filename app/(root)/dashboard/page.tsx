"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Package, 
  TrendingUp, 
  ShoppingCart, 
  Star, 
  Eye,
  Calendar,
  RefreshCw,
  Settings,
  Download,
  MessageCircle,
  Clock,
  IndianRupee,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useUserProfile } from "@/hooks/useUserProfile";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const { profile, notifications, isLoading: profileLoading, refetchProfile } = useUserProfile();

  const isLoading = profileLoading;
  const creator = profile?.creatorProfile;
  const stats = profile?.creatorProfile?.stats;
  const recentOrders = profile?.recentOrders || [];
  const topProducts = profile?.topProducts || [];

  // Calculate derived stats
  const derivedStats = useMemo(() => {
    if (!creator || !stats) return null;

    return {
      totalRevenue: parseFloat(String(creator.totalRevenue || 0)),
      monthlyRevenue: parseFloat(String(0)),
      // monthlyRevenue: parseFloat(String(creator.monthlyRevenue || 0)),
      totalOrders: stats.totalOrders || 0,
      completedOrders: stats.completedOrders || 0,
      pendingOrders: notifications?.pendingOrders || 0,
      averageRating: parseFloat(String(stats.avgRating || 0)),
      totalReviews: stats.totalReviews || 0,
      responseTime: stats.avgResponseTime || 0,
      completionRate: parseFloat((((creator.stats?.completedOrders || 0) / (creator.stats?.totalOrders || 0)) * 100).toFixed(2)),
    };
  }, [creator, stats, notifications]);

  const handleRefresh = () => {
    refetchProfile();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string }> = {
      pending: { label: "Pending", color: "bg-amber-100 text-amber-800" },
      processing: { label: "Processing", color: "bg-blue-100 text-blue-800" },
      shipped: { label: "Shipped", color: "bg-purple-100 text-purple-800" },
      delivered: { label: "Delivered", color: "bg-green-100 text-green-800" },
      cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800" },
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge variant="secondary" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  // Error state
  if (!profileLoading && !creator) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <Card className="py-6">
              <CardContent className="p-12 text-center">
                <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Creator Profile Not Found</h3>
                <p className="text-muted-foreground mb-6">
                  You need to set up your creator profile to access the dashboard.
                </p>
                <Button asChild>
                  <Link href="/become-creator">Set Up Creator Profile</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header Skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
              <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96" />
              </div>
              <div className="flex gap-2 mt-4 sm:mt-0">
                <Skeleton className="h-9 w-9" />
                <Skeleton className="h-9 w-9" />
              </div>
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>

            {/* Content Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[1, 2].map(i => (
                <Skeleton key={i} className="h-96" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {profile?.user?.name}! Here&apos;s what&apos;s happening with your business today.
              </p>
            </div>
            
            <div className="flex items-center gap-2 mt-4 sm:mt-0">
              <Button variant="outline" size="icon" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Notifications Alert */}
          {notifications && notifications.totalNotifications > 0 && (
            <Card className="mb-8 border-amber-200 bg-amber-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-amber-600" />
                  <div className="flex-1">
                    <p className="font-medium text-amber-900">
                      You have {notifications.totalNotifications} items needing attention
                    </p>
                    <p className="text-sm text-amber-700">
                      {notifications.pendingOrders > 0 && `${notifications.pendingOrders} pending orders • `}
                      {notifications.newOrders > 0 && `${notifications.newOrders} new orders • `}
                      {notifications.unreadMessages > 0 && `${notifications.unreadMessages} unread messages`}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/orders?status=pending">View Orders</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Revenue */}
            <Card className="py-6">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(derivedStats?.totalRevenue || 0)}
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span>From {stats?.totalOrders || 0} orders</span>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Revenue */}
            <Card className="py-6">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(derivedStats?.monthlyRevenue || 0)}
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                  <span>This month</span>
                </div>
              </CardContent>
            </Card>

            {/* Total Orders */}
            <Card className="py-6">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{derivedStats?.totalOrders || 0}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {derivedStats && derivedStats.pendingOrders > 0 ? (
                    <>
                      <Clock className="h-3 w-3 mr-1 text-amber-600" />
                      <span>{derivedStats.pendingOrders} pending</span>
                    </>
                  ) : (
                    <span>{derivedStats?.completedOrders || 0} completed</span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Average Rating */}
            <Card className="py-6">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {derivedStats?.averageRating?.toFixed(1) || '0.0'}
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span>From {derivedStats?.totalReviews || 0} reviews</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Creator Profile Stats */}
          <Card className="mb-8 py-6">
            <CardHeader>
              <CardTitle>Creator Performance</CardTitle>
              <CardDescription>Your business metrics and statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <p className="text-2xl font-bold text-primary">{creator?.sales || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Sales</p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <p className="text-2xl font-bold text-primary">{creator?.followers || 0}</p>
                  <p className="text-sm text-muted-foreground">Followers</p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <p className="text-2xl font-bold text-primary">
                    {derivedStats?.completionRate?.toFixed(0) || 100}%
                  </p>
                  <p className="text-sm text-muted-foreground">Completion Rate</p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <p className="text-2xl font-bold text-primary">
                    {derivedStats?.responseTime || 0}m
                  </p>
                  <p className="text-sm text-muted-foreground">Avg Response Time</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Orders */}
                <Card className="py-6">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Recent Orders</CardTitle>
                      <CardDescription>Latest customer orders</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/orders">View all</Link>
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentOrders.length > 0 ? (
                        recentOrders.slice(0, 5).map((order) => (
                          <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="space-y-1">
                              <p className="text-sm font-medium">
                                {order.user?.name || 'Customer'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {order.items?.[0]?.product?.name || 'Product'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(order.createdAt)}
                              </p>
                            </div>
                            <div className="text-right space-y-2">
                              <p className="text-sm font-medium">
                                {formatCurrency(parseFloat(String(order.totalAmount)))}
                              </p>
                              {getStatusBadge(order.status)}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <ShoppingCart className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                          <p className="text-muted-foreground">No recent orders</p>
                          <Button variant="outline" size="sm" className="mt-4" asChild>
                            <Link href="/products">View Products</Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Top Products */}
                <Card className="py-6">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Top Products</CardTitle>
                      <CardDescription>Best performing products</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/dashboard/products">View all</Link>
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {topProducts.length > 0 ? (
                        topProducts.slice(0, 5).map((product) => (
                          <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="space-y-1">
                              <p className="text-sm font-medium">{product.name}</p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>{product.sales} sales</span>
                                <span>Stock: {product.stock}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">
                                {formatCurrency(product.revenue)}
                              </p>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Star className="h-3 w-3 mr-1 text-amber-500 fill-amber-500" />
                                <span>{product.rating}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <Package className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                          <p className="text-muted-foreground">No products yet</p>
                          <Button variant="outline" size="sm" className="mt-4" asChild>
                            <Link href="/dashboard/products/new">Add Product</Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Products Tab */}
            <TabsContent value="products">
              <Card className="py-6">
                <CardHeader>
                  <CardTitle>Product Management</CardTitle>
                  <CardDescription>Manage your products and inventory</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <p className="text-2xl font-bold text-primary">
                          {profile?.statistics?.productsCount || 0}
                        </p>
                        <p className="text-sm text-muted-foreground">Total Products</p>
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <p className="text-2xl font-bold text-primary">
                          {topProducts.length}
                        </p>
                        <p className="text-sm text-muted-foreground">Top Products</p>
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <p className="text-2xl font-bold text-primary">
                          {derivedStats?.averageRating?.toFixed(1) || '0.0'}
                        </p>
                        <p className="text-sm text-muted-foreground">Avg Rating</p>
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <p className="text-2xl font-bold text-primary">
                          {creator?.sales || 0}
                        </p>
                        <p className="text-sm text-muted-foreground">Total Sales</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      <Button asChild>
                        <Link href="/dashboard/products/new">
                          <Package className="h-4 w-4 mr-2" />
                          Add New Product
                        </Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href="/dashboard/products">
                          <Eye className="h-4 w-4 mr-2" />
                          View All Products
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders">
              <Card className="py-6">
                <CardHeader>
                  <CardTitle>Order Management</CardTitle>
                  <CardDescription>Process and track customer orders</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <p className="text-2xl font-bold text-primary">
                          {derivedStats?.totalOrders || 0}
                        </p>
                        <p className="text-sm text-muted-foreground">Total Orders</p>
                      </div>
                      <div className="text-center p-4 bg-amber-50 rounded-lg">
                        <p className="text-2xl font-bold text-amber-600">
                          {derivedStats?.pendingOrders || 0}
                        </p>
                        <p className="text-sm text-amber-600">Pending</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">
                          {derivedStats?.completedOrders || 0}
                        </p>
                        <p className="text-sm text-green-600">Completed</p>
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <p className="text-2xl font-bold text-primary">
                          {derivedStats?.completionRate?.toFixed(0) || 100}%
                        </p>
                        <p className="text-sm text-muted-foreground">Success Rate</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      <Button asChild>
                        <Link href="/orders">
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          View All Orders
                        </Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href="/orders?status=pending">
                          <Clock className="h-4 w-4 mr-2" />
                          Pending Orders ({derivedStats?.pendingOrders || 0})
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Quick Actions */}
          <Card className="mt-8 py-6">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Frequently used tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-auto p-4 flex-col" asChild>
                  <Link href="/dashboard/products/new">
                    <Package className="h-6 w-6 mb-2" />
                    <span>Add Product</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex-col" asChild>
                  <Link href="/orders">
                    <ShoppingCart className="h-6 w-6 mb-2" />
                    <span>View Orders</span>
                    {notifications && notifications.pendingOrders > 0 && (
                      <Badge variant="destructive" className="mt-1">
                        {notifications.pendingOrders}
                      </Badge>
                    )}
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex-col" asChild>
                  <Link href="/messages">
                    <MessageCircle className="h-6 w-6 mb-2" />
                    <span>Messages</span>
                    {notifications && notifications.unreadMessages > 0 && (
                      <Badge variant="destructive" className="mt-1">
                        {notifications.unreadMessages}
                      </Badge>
                    )}
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex-col" asChild>
                  <Link href="/settings">
                    <Settings className="h-6 w-6 mb-2" />
                    <span>Settings</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// "use client";

// import { useState, useEffect, useCallback } from "react";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { 
//   Package, 
//   Users, 
//   TrendingUp, 
//   ShoppingCart, 
//   Star, 
//   Eye,
//   Calendar,
//   RefreshCw,
//   Settings,
//   Download,
//   MessageCircle,
//   Clock,
//   Truck,
//   IndianRupee
// } from "lucide-react";
// import Link from "next/link";
// import { useSession } from "next-auth/react";

// // Types based on your schema
// interface DashboardStats {
//   totalRevenue: number;
//   monthlyRevenue: number;
//   totalOrders: number;
//   pendingOrders: number;
//   totalProducts: number;
//   lowStockProducts: number;
//   totalCustomers: number;
//   newCustomers: number;
//   averageRating: number;
//   totalReviews: number;
// }

// interface RecentOrder {
//   id: string;
//   customerName: string;
//   productName: string;
//   amount: number;
//   status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
//   createdAt: string;
// }

// interface TopProduct {
//   id: string;
//   name: string;
//   sales: number;
//   revenue: number;
//   stock: number;
//   rating: number;
// }

// interface ActivityItem {
//   id: string;
//   type: 'order' | 'review' | 'message' | 'product';
//   title: string;
//   description: string;
//   timestamp: string;
//   user?: string;
// }

// export default function DashboardPage() {
//   const { data: session, status } = useSession();
//   const [activeTab, setActiveTab] = useState("overview");
//   const [stats, setStats] = useState<DashboardStats | null>(null);
//   const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
//   const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
//   const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [timeRange, setTimeRange] = useState("30d");

//   const isCreator = session?.user?.role === "creator" || session?.user?.creatorStatus === "approved";

//   const fetchDashboardData = useCallback(async () => {
//     if (!session?.user?.id) return;
    
//     setIsLoading(true);
//     try {
//       const [statsRes, ordersRes, productsRes, activityRes] = await Promise.all([
//         fetch(`/api/dashboard/stats?timeRange=${timeRange}`),
//         fetch('/api/dashboard/recent-orders?limit=5'),
//         fetch('/api/dashboard/top-products?limit=5'),
//         fetch('/api/dashboard/recent-activity?limit=10')
//       ]);

//       const [statsData, ordersData, productsData, activityData] = await Promise.all([
//         statsRes.json(),
//         ordersRes.json(),
//         productsRes.json(),
//         activityRes.json()
//       ]);

//       if (statsData.success) setStats(statsData.data);
//       if (ordersData.success) setRecentOrders(ordersData.data);
//       if (productsData.success) setTopProducts(productsData.data);
//       if (activityData.success) setRecentActivity(activityData.data);
//     } catch (error) {
//       console.error('Failed to fetch dashboard data:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [session?.user?.id, timeRange]);

//   useEffect(() => {
//     fetchDashboardData();
//   }, [fetchDashboardData]);

//   const getStatusBadge = (status: RecentOrder['status']) => {
//     const statusConfig = {
//       pending: { label: "Pending", color: "bg-amber-100 text-amber-800" },
//       confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-800" },
//       shipped: { label: "Shipped", color: "bg-purple-100 text-purple-800" },
//       delivered: { label: "Delivered", color: "bg-green-100 text-green-800" },
//       cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800" },
//     };
    
//     const config = statusConfig[status];
//     return (
//       <Badge variant="secondary" className={config.color}>
//         {config.label}
//       </Badge>
//     );
//   };

//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//     }).format(amount);
//   };

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       month: 'short',
//       day: 'numeric',
//       year: 'numeric'
//     });
//   };

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-background">
//         <div className="container mx-auto px-4 py-8">
//           <div className="max-w-7xl mx-auto">
//             {/* Header Skeleton */}
//             <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
//               <div className="space-y-2">
//                 <div className="h-8 w-64 bg-muted rounded animate-pulse"></div>
//                 <div className="h-4 w-96 bg-muted rounded animate-pulse"></div>
//               </div>
//               <div className="flex gap-2 mt-4 sm:mt-0">
//                 <div className="h-9 w-32 bg-muted rounded animate-pulse"></div>
//                 <div className="h-9 w-9 bg-muted rounded animate-pulse"></div>
//               </div>
//             </div>

//             {/* Stats Grid Skeleton */}
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//               {[1, 2, 3, 4].map(i => (
//                 <div key={i} className="bg-card rounded-lg border p-6 animate-pulse">
//                   <div className="flex items-center justify-between mb-4">
//                     <div className="h-4 w-24 bg-muted rounded"></div>
//                     <div className="h-6 w-6 bg-muted rounded"></div>
//                   </div>
//                   <div className="h-8 w-20 bg-muted rounded mb-2"></div>
//                   <div className="h-3 w-32 bg-muted rounded"></div>
//                 </div>
//               ))}
//             </div>

//             {/* Content Skeleton */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//               {[1, 2].map(i => (
//                 <div key={i} className="bg-card rounded-lg border p-6 animate-pulse">
//                   <div className="h-6 w-32 bg-muted rounded mb-4"></div>
//                   <div className="space-y-4">
//                     {[1, 2, 3, 4, 5].map(j => (
//                       <div key={j} className="flex items-center justify-between">
//                         <div className="space-y-2">
//                           <div className="h-4 w-40 bg-muted rounded"></div>
//                           <div className="h-3 w-24 bg-muted rounded"></div>
//                         </div>
//                         <div className="h-6 w-16 bg-muted rounded"></div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="container mx-auto px-4 py-8">
//         <div className="max-w-7xl mx-auto">
//           {/* Header */}
//           <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
//             <div>
//               <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
//               <p className="text-muted-foreground">
//                 Welcome back, {session?.user?.name}! Here&apos;s what&apos;s happening with your business today.
//               </p>
//             </div>
            
//             <div className="flex items-center gap-2 mt-4 sm:mt-0">
//               <select 
//                 value={timeRange}
//                 onChange={(e) => setTimeRange(e.target.value)}
//                 className="px-3 py-2 border border-input rounded-md bg-background text-sm"
//               >
//                 <option value="7d">Last 7 days</option>
//                 <option value="30d">Last 30 days</option>
//                 <option value="90d">Last 90 days</option>
//                 <option value="1y">Last year</option>
//               </select>
              
//               <Button variant="outline" size="icon" onClick={fetchDashboardData}>
//                 <RefreshCw className="h-4 w-4" />
//               </Button>
              
//               <Button variant="outline" size="icon">
//                 <Download className="h-4 w-4" />
//               </Button>
//             </div>
//           </div>

//           {/* Stats Grid */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//             {/* Total Revenue */}
//             <Card className="py-6">
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
//                 <IndianRupee className="h-4 w-4 text-muted-foreground" />
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold">
//                   {stats ? formatCurrency(stats.totalRevenue) : '₹0.00'}
//                 </div>
//                 <div className="flex items-center text-xs text-muted-foreground">
//                   <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
//                   <span>+12% from last month</span>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Monthly Revenue */}
//             <Card className="py-6">
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
//                 <Calendar className="h-4 w-4 text-muted-foreground" />
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold">
//                   {stats ? formatCurrency(stats.monthlyRevenue) : '₹0.00'}
//                 </div>
//                 <div className="flex items-center text-xs text-muted-foreground">
//                   <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
//                   <span>+8% from last month</span>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Total Orders */}
//             <Card className="py-6">
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
//                 <ShoppingCart className="h-4 w-4 text-muted-foreground" />
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
//                 <div className="flex items-center text-xs text-muted-foreground">
//                   <Clock className="h-3 w-3 mr-1 text-amber-600" />
//                   <span>{stats?.pendingOrders || 0} pending</span>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Average Rating */}
//             <Card className="py-6">
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
//                 <Star className="h-4 w-4 text-muted-foreground" />
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold">{stats?.averageRating?.toFixed(1) || '0.0'}</div>
//                 <div className="flex items-center text-xs text-muted-foreground">
//                   <span>Based on {stats?.totalReviews || 0} reviews</span>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Main Content */}
//           <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
//             <TabsList className="grid w-full grid-cols-4">
//               <TabsTrigger value="overview">Overview</TabsTrigger>
//               <TabsTrigger value="products">Products</TabsTrigger>
//               <TabsTrigger value="orders">Orders</TabsTrigger>
//               <TabsTrigger value="analytics">Analytics</TabsTrigger>
//             </TabsList>

//             {/* Overview Tab */}
//             <TabsContent value="overview" className="space-y-6">
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//                 {/* Recent Orders */}
//                 <Card className="py-6">
//                   <CardHeader className="flex flex-row items-center justify-between">
//                     <div>
//                       <CardTitle>Recent Orders</CardTitle>
//                       <CardDescription>Latest customer orders</CardDescription>
//                     </div>
//                     <Button variant="ghost" size="sm" asChild>
//                       <Link href="/dashboard/orders">
//                         View all
//                       </Link>
//                     </Button>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="space-y-4">
//                       {recentOrders.length > 0 ? (
//                         recentOrders.map((order) => (
//                           <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
//                             <div className="space-y-1">
//                               <p className="text-sm font-medium">{order.customerName}</p>
//                               <p className="text-xs text-muted-foreground">{order.productName}</p>
//                               <p className="text-xs text-muted-foreground">
//                                 {formatDate(order.createdAt)}
//                               </p>
//                             </div>
//                             <div className="text-right">
//                               <p className="text-sm font-medium">{formatCurrency(order.amount)}</p>
//                               {getStatusBadge(order.status)}
//                             </div>
//                           </div>
//                         ))
//                       ) : (
//                         <div className="text-center py-8">
//                           <ShoppingCart className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
//                           <p className="text-muted-foreground">No recent orders</p>
//                         </div>
//                       )}
//                     </div>
//                   </CardContent>
//                 </Card>

//                 {/* Top Products */}
//                 <Card className="py-6">
//                   <CardHeader className="flex flex-row items-center justify-between">
//                     <div>
//                       <CardTitle>Top Products</CardTitle>
//                       <CardDescription>Best performing products</CardDescription>
//                     </div>
//                     <Button variant="ghost" size="sm" asChild>
//                       <Link href="/dashboard/products">
//                         View all
//                       </Link>
//                     </Button>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="space-y-4">
//                       {topProducts.length > 0 ? (
//                         topProducts.map((product) => (
//                           <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
//                             <div className="space-y-1">
//                               <p className="text-sm font-medium">{product.name}</p>
//                               <div className="flex items-center gap-4 text-xs text-muted-foreground">
//                                 <span>{product.sales} sales</span>
//                                 <span>Stock: {product.stock}</span>
//                               </div>
//                             </div>
//                             <div className="text-right">
//                               <p className="text-sm font-medium">{formatCurrency(product.revenue)}</p>
//                               <div className="flex items-center text-xs text-muted-foreground">
//                                 <Star className="h-3 w-3 mr-1 text-amber-500" />
//                                 <span>{product.rating.toFixed(1)}</span>
//                               </div>
//                             </div>
//                           </div>
//                         ))
//                       ) : (
//                         <div className="text-center py-8">
//                           <Package className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
//                           <p className="text-muted-foreground">No products yet</p>
//                         </div>
//                       )}
//                     </div>
//                   </CardContent>
//                 </Card>
//               </div>

//               {/* Recent Activity */}
//               <Card className="py-6">
//                 <CardHeader>
//                   <CardTitle>Recent Activity</CardTitle>
//                   <CardDescription>Latest updates and notifications</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-4">
//                     {recentActivity.length > 0 ? (
//                       recentActivity.map((activity) => (
//                         <div key={activity.id} className="flex items-start gap-4 p-3 border rounded-lg">
//                           <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted mt-1">
//                             {activity.type === 'order' && <ShoppingCart className="h-4 w-4" />}
//                             {activity.type === 'review' && <Star className="h-4 w-4" />}
//                             {activity.type === 'message' && <MessageCircle className="h-4 w-4" />}
//                             {activity.type === 'product' && <Package className="h-4 w-4" />}
//                           </div>
//                           <div className="flex-1 space-y-1">
//                             <p className="text-sm font-medium">{activity.title}</p>
//                             <p className="text-sm text-muted-foreground">{activity.description}</p>
//                             <p className="text-xs text-muted-foreground">
//                               {formatDate(activity.timestamp)}
//                               {activity.user && ` • By ${activity.user}`}
//                             </p>
//                           </div>
//                         </div>
//                       ))
//                     ) : (
//                       <div className="text-center py-8">
//                         <Clock className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
//                         <p className="text-muted-foreground">No recent activity</p>
//                       </div>
//                     )}
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>

//             {/* Products Tab */}
//             <TabsContent value="products">
//               <Card className="py-6">
//                 <CardHeader>
//                   <CardTitle>Product Management</CardTitle>
//                   <CardDescription>Manage your products and inventory</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-6">
//                     {/* Quick Stats */}
//                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                       <div className="text-center p-4 bg-muted/30 rounded-lg">
//                         <p className="text-2xl font-bold text-primary">{stats?.totalProducts || 0}</p>
//                         <p className="text-sm text-muted-foreground">Total Products</p>
//                       </div>
//                       <div className="text-center p-4 bg-muted/30 rounded-lg">
//                         <p className="text-2xl font-bold text-primary">{stats?.lowStockProducts || 0}</p>
//                         <p className="text-sm text-muted-foreground">Low Stock</p>
//                       </div>
//                       <div className="text-center p-4 bg-muted/30 rounded-lg">
//                         <p className="text-2xl font-bold text-primary">{topProducts.length}</p>
//                         <p className="text-sm text-muted-foreground">Top Products</p>
//                       </div>
//                       <div className="text-center p-4 bg-muted/30 rounded-lg">
//                         <p className="text-2xl font-bold text-primary">{stats?.averageRating?.toFixed(1) || '0.0'}</p>
//                         <p className="text-sm text-muted-foreground">Avg Rating</p>
//                       </div>
//                     </div>

//                     {/* Actions */}
//                     <div className="flex flex-wrap gap-4">
//                       <Button asChild>
//                         <Link href="/dashboard/products/new">
//                           <Package className="h-4 w-4 mr-2" />
//                           Add New Product
//                         </Link>
//                       </Button>
//                       <Button variant="outline" asChild>
//                         <Link href="/dashboard/products">
//                           <Eye className="h-4 w-4 mr-2" />
//                           View All Products
//                         </Link>
//                       </Button>
//                       <Button variant="outline" asChild>
//                         <Link href="/dashboard/categories">
//                           <Settings className="h-4 w-4 mr-2" />
//                           Manage Categories
//                         </Link>
//                       </Button>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>

//             {/* Orders Tab */}
//             <TabsContent value="orders">
//               <Card className="py-6">
//                 <CardHeader>
//                   <CardTitle>Order Management</CardTitle>
//                   <CardDescription>Process and track customer orders</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-6">
//                     {/* Order Status Overview */}
//                     <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
//                       <div className="text-center p-4 bg-muted/30 rounded-lg">
//                         <p className="text-2xl font-bold text-primary">{stats?.totalOrders || 0}</p>
//                         <p className="text-sm text-muted-foreground">Total</p>
//                       </div>
//                       <div className="text-center p-4 bg-amber-50 rounded-lg">
//                         <p className="text-2xl font-bold text-amber-600">{stats?.pendingOrders || 0}</p>
//                         <p className="text-sm text-amber-600">Pending</p>
//                       </div>
//                       <div className="text-center p-4 bg-blue-50 rounded-lg">
//                         <p className="text-2xl font-bold text-blue-600">
//                           {recentOrders.filter(o => o.status === 'confirmed').length}
//                         </p>
//                         <p className="text-sm text-blue-600">Confirmed</p>
//                       </div>
//                       <div className="text-center p-4 bg-purple-50 rounded-lg">
//                         <p className="text-2xl font-bold text-purple-600">
//                           {recentOrders.filter(o => o.status === 'shipped').length}
//                         </p>
//                         <p className="text-sm text-purple-600">Shipped</p>
//                       </div>
//                       <div className="text-center p-4 bg-green-50 rounded-lg">
//                         <p className="text-2xl font-bold text-green-600">
//                           {recentOrders.filter(o => o.status === 'delivered').length}
//                         </p>
//                         <p className="text-sm text-green-600">Delivered</p>
//                       </div>
//                     </div>

//                     {/* Actions */}
//                     <div className="flex flex-wrap gap-4">
//                       <Button asChild>
//                         <Link href="/dashboard/orders">
//                           <ShoppingCart className="h-4 w-4 mr-2" />
//                           View All Orders
//                         </Link>
//                       </Button>
//                       <Button variant="outline" asChild>
//                         <Link href="/dashboard/orders?status=pending">
//                           <Clock className="h-4 w-4 mr-2" />
//                           Pending Orders
//                         </Link>
//                       </Button>
//                       <Button variant="outline" asChild>
//                         <Link href="/dashboard/shipping">
//                           <Truck className="h-4 w-4 mr-2" />
//                           Shipping Settings
//                         </Link>
//                       </Button>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>

//             {/* Analytics Tab */}
//             <TabsContent value="analytics">
//               <Card className="py-6">
//                 <CardHeader>
//                   <CardTitle>Business Analytics</CardTitle>
//                   <CardDescription>Detailed insights and performance metrics</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-6">
//                     {/* Performance Metrics */}
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                       <Card className="py-6">
//                         <CardHeader className="pb-2">
//                           <CardTitle className="text-sm">Revenue Growth</CardTitle>
//                         </CardHeader>
//                         <CardContent>
//                           <div className="text-2xl font-bold text-green-600">+12.5%</div>
//                           <p className="text-xs text-muted-foreground">vs previous period</p>
//                         </CardContent>
//                       </Card>
//                       <Card className="py-6">
//                         <CardHeader className="pb-2">
//                           <CardTitle className="text-sm">Order Conversion</CardTitle>
//                         </CardHeader>
//                         <CardContent>
//                           <div className="text-2xl font-bold text-blue-600">8.2%</div>
//                           <p className="text-xs text-muted-foreground">visitor to order rate</p>
//                         </CardContent>
//                       </Card>
//                       <Card className="py-6">
//                         <CardHeader className="pb-2">
//                           <CardTitle className="text-sm">Customer Satisfaction</CardTitle>
//                         </CardHeader>
//                         <CardContent>
//                           <div className="text-2xl font-bold text-amber-600">4.7/5</div>
//                           <p className="text-xs text-muted-foreground">average rating</p>
//                         </CardContent>
//                       </Card>
//                     </div>

//                     {/* Quick Links */}
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       <Button variant="outline" className="justify-start h-auto p-4" asChild>
//                         <Link href="/dashboard/analytics/revenue">
//                           <TrendingUp className="h-5 w-5 mr-3" />
//                           <div className="text-left">
//                             <div className="font-medium">Revenue Reports</div>
//                             <div className="text-sm text-muted-foreground">Detailed revenue analytics</div>
//                           </div>
//                         </Link>
//                       </Button>
//                       <Button variant="outline" className="justify-start h-auto p-4" asChild>
//                         <Link href="/dashboard/analytics/customers">
//                           <Users className="h-5 w-5 mr-3" />
//                           <div className="text-left">
//                             <div className="font-medium">Customer Insights</div>
//                             <div className="text-sm text-muted-foreground">Customer behavior analysis</div>
//                           </div>
//                         </Link>
//                       </Button>
//                       <Button variant="outline" className="justify-start h-auto p-4" asChild>
//                         <Link href="/dashboard/analytics/products">
//                           <Package className="h-5 w-5 mr-3" />
//                           <div className="text-left">
//                             <div className="font-medium">Product Performance</div>
//                             <div className="text-sm text-muted-foreground">Product sales analytics</div>
//                           </div>
//                         </Link>
//                       </Button>
//                       <Button variant="outline" className="justify-start h-auto p-4" asChild>
//                         <Link href="/dashboard/analytics/reviews">
//                           <Star className="h-5 w-5 mr-3" />
//                           <div className="text-left">
//                             <div className="font-medium">Review Analytics</div>
//                             <div className="text-sm text-muted-foreground">Customer feedback analysis</div>
//                           </div>
//                         </Link>
//                       </Button>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </TabsContent>
//           </Tabs>

//           {/* Quick Actions */}
//           <Card className="mt-8 py-6">
//             <CardHeader>
//               <CardTitle>Quick Actions</CardTitle>
//               <CardDescription>Frequently used tasks and shortcuts</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                 <Button variant="outline" className="h-auto p-4 flex-col" asChild>
//                   <Link href="/dashboard/products/new">
//                     <Package className="h-6 w-6 mb-2" />
//                     <span>Add Product</span>
//                   </Link>
//                 </Button>
//                 <Button variant="outline" className="h-auto p-4 flex-col" asChild>
//                   <Link href="/dashboard/orders">
//                     <ShoppingCart className="h-6 w-6 mb-2" />
//                     <span>View Orders</span>
//                   </Link>
//                 </Button>
//                 <Button variant="outline" className="h-auto p-4 flex-col" asChild>
//                   <Link href="/dashboard/messages">
//                     <MessageCircle className="h-6 w-6 mb-2" />
//                     <span>Messages</span>
//                   </Link>
//                 </Button>
//                 <Button variant="outline" className="h-auto p-4 flex-col" asChild>
//                   <Link href="/dashboard/settings">
//                     <Settings className="h-6 w-6 mb-2" />
//                     <span>Settings</span>
//                   </Link>
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// }