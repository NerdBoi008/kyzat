"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Upload,
  Star,
  CheckCircle,
  XCircle,
  IndianRupee,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { useUserProfile } from "@/hooks/useUserProfile";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// Types based on your schema
interface Product {
  id: string;
  name: string;
  price: number;
  slug: string;
  creatorId: string;
  image: string;
  categoryId: string;
  description?: string; // Make optional
  materials?: string[];
  rating: number;
  stock: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  category?: {
    name: string;
  };
  variants?: ProductVariant[];
}

interface ProductVariant {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

// http://localhost:3000/api/products?creator=af63d6a1-8d6e-4851-a237-bd23e50cb533

export default function ProductsManagementPage() {
  const { data: session } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const { profile } = useUserProfile();

  const isCreator =
    session?.user?.role === "creator" ||
    session?.user?.creatorStatus === "approved";

  // Fetch products and categories
  const fetchProducts = useCallback(async () => {
    if (!session?.user?.id) return;

    setIsLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        profile?.creatorProfile
          ? fetch(`/api/products?creator=${profile?.creatorProfile.id}`)
          : Response.json({}),
        fetch("/api/categories"),
      ]);

      const [productsData, categoriesData] = await Promise.all([
        productsRes.json() as Promise<ApiResponse<{ product: Product }[]>>,
        categoriesRes.json() as Promise<ApiResponse<Category[]>>,
      ]);

      console.log("productsData: ", productsData.data);

      if (productsData.success) {
        // Ensure all products have required fields with fallbacks
        const safeProducts = productsData.data.map((data) => {
          const { product } = data;
          return {
            ...product,
            name: product.name || "Unnamed Product",
            description: product.description || "",
            stock: product.stock || 0,
            price: product.price || 0,
            rating: product.rating || 0,
            isFeatured: product.isFeatured || false,
          };
        });
        setProducts(safeProducts);
      }
      if (categoriesData.success) setCategories(categoriesData.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setProducts([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  }, [profile?.creatorProfile, session?.user?.id]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Safe string comparison with null/undefined checks
  const safeStringCompare = (
    str: string | undefined | null,
    query: string
  ): boolean => {
    if (!str) return false;
    return str.toLowerCase().includes(query.toLowerCase());
  };

  // Filter products based on search and filters
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      searchQuery === "" ||
      safeStringCompare(product.name, searchQuery) ||
      safeStringCompare(product.description, searchQuery);

    const matchesCategory =
      categoryFilter === "all" || product.categoryId === categoryFilter;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "in-stock" && product.stock > 0) ||
      (statusFilter === "out-of-stock" && product.stock === 0) ||
      (statusFilter === "low-stock" &&
        product.stock > 0 &&
        product.stock <= 10) ||
      (statusFilter === "featured" && product.isFeatured);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Delete product
  const deleteProduct = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setProducts(products.filter((p) => p.id !== productId));
        setIsDeleteModalOpen(false);
        setProductToDelete(null);
      } else {
        console.error("Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  // Bulk actions
  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;

    try {
      const response = await fetch("/api/products/bulk", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productIds: selectedProducts }),
      });

      if (response.ok) {
        setProducts(products.filter((p) => !selectedProducts.includes(p.id)));
        setSelectedProducts([]);
      }
    } catch (error) {
      console.error("Error bulk deleting products:", error);
    }
  };

  const handleBulkFeatured = async (featured: boolean) => {
    if (selectedProducts.length === 0) return;

    try {
      const response = await fetch("/api/products/bulk", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productIds: selectedProducts,
          isFeatured: featured,
        }),
      });

      if (response.ok) {
        setProducts(
          products.map((p) =>
            selectedProducts.includes(p.id) ? { ...p, isFeatured: featured } : p
          )
        );
        setSelectedProducts([]);
      }
    } catch (error) {
      console.error("Error bulk updating products:", error);
    }
  };

  // Select all products
  const toggleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map((p) => p.id));
    }
  };

  // Toggle single product selection
  const toggleProductSelection = (productId: string) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) {
      return { label: "Out of Stock", color: "destructive" as const };
    } else if (stock <= 10) {
      return { label: "Low Stock", color: "warning" as const };
    } else {
      return { label: "In Stock", color: "success" as const };
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Calculate safe average price
  const calculateAveragePrice = () => {
    if (products.length === 0) return 0;
    const total = products.reduce((acc, p) => acc + (p.price || 0), 0);
    return total / products.length;
  };

  if (!isCreator) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Creator Access Required</h2>
          <p className="text-muted-foreground mb-6">
            You need to be an approved creator to manage products.
          </p>
          <Button asChild>
            <Link href="/profile">Become a Creator</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header Skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
              <div className="space-y-2">
                <div className="h-8 w-64 bg-muted rounded animate-pulse"></div>
                <div className="h-4 w-96 bg-muted rounded animate-pulse"></div>
              </div>
              <div className="h-9 w-32 bg-muted rounded animate-pulse mt-4 sm:mt-0"></div>
            </div>

            {/* Filters Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-10 bg-muted rounded animate-pulse"
                ></div>
              ))}
            </div>

            {/* Table Skeleton */}
            <div className="bg-card rounded-lg border animate-pulse">
              <div className="p-4 border-b">
                <div className="h-6 w-32 bg-muted rounded"></div>
              </div>
              <div className="p-4 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-muted rounded"></div>
                      <div className="space-y-2">
                        <div className="h-4 w-40 bg-muted rounded"></div>
                        <div className="h-3 w-24 bg-muted rounded"></div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-8 w-16 bg-muted rounded"></div>
                      <div className="h-8 w-8 bg-muted rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
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
              <h1 className="text-3xl font-bold mb-2">Product Management</h1>
              <p className="text-muted-foreground">
                Manage your products, inventory, and pricing
              </p>
            </div>

            <div className="flex gap-2 mt-4 sm:mt-0">
              <Button variant="outline" asChild>
                <Link href="/dashboard/products/import">
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Link>
              </Button>
              <Button asChild>
                <Link href="/dashboard/products/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="py-6">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Products
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{products.length}</div>
                <p className="text-xs text-muted-foreground">
                  {products.filter((p) => p.isFeatured).length} featured
                </p>
              </CardContent>
            </Card>

            <Card className="py-6">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Stock</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {products.filter((p) => p.stock > 0).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {products.filter((p) => p.stock > 0 && p.stock <= 10).length}{" "}
                  low stock
                </p>
              </CardContent>
            </Card>

            <Card className="py-6">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Out of Stock
                </CardTitle>
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {products.filter((p) => p.stock === 0).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Needs restocking
                </p>
              </CardContent>
            </Card>

            <Card className="py-6">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg. Price
                </CardTitle>
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(calculateAveragePrice())}
                </div>
                <p className="text-xs text-muted-foreground">
                  Average product price
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Bulk Actions */}
          <Card className="mb-6 py-3">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <div className="relative flex-1 sm:max-w-xs">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search products..."
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* Category Filter */}
                  <Select
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Status Filter */}
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="in-stock">In Stock</SelectItem>
                      <SelectItem value="low-stock">Low Stock</SelectItem>
                      <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                      <SelectItem value="featured">Featured</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Bulk Actions */}
                {selectedProducts.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {selectedProducts.length} selected
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkFeatured(true)}
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Feature
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkFeatured(false)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Unfeature
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleBulkDelete}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Products Table */}
          <Card className="py-6">
            <CardHeader>
              <CardTitle>Products</CardTitle>
              <CardDescription>
                Manage your product catalog and inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No products found
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {searchQuery ||
                    categoryFilter !== "all" ||
                    statusFilter !== "all"
                      ? "No products match your current filters."
                      : "You haven't added any products yet."}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {(searchQuery ||
                      categoryFilter !== "all" ||
                      statusFilter !== "all") && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchQuery("");
                          setCategoryFilter("all");
                          setStatusFilter("all");
                        }}
                      >
                        Clear Filters
                      </Button>
                    )}
                    <Button asChild>
                      <Link href="/dashboard/products/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Product
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <input
                            type="checkbox"
                            checked={
                              selectedProducts.length ===
                                filteredProducts.length &&
                              filteredProducts.length > 0
                            }
                            onChange={toggleSelectAll}
                            className="h-4 w-4"
                          />
                        </TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => {
                        const stockStatus = getStockStatus(product.stock);
                        return (
                          <TableRow key={product.id}>
                            <TableCell>
                              <input
                                type="checkbox"
                                checked={selectedProducts.includes(product.id)}
                                onChange={() =>
                                  toggleProductSelection(product.id)
                                }
                                className="h-4 w-4"
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-muted rounded-md flex items-center justify-center">
                                  <Package className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                  <div className="font-medium">
                                    {product.name || "Unnamed Product"}
                                  </div>
                                  <div className="text-sm text-muted-foreground line-clamp-1">
                                    {product.description || "No description"}
                                  </div>
                                </div>
                                {product.isFeatured && (
                                  <Badge
                                    variant="secondary"
                                    className="bg-amber-100 text-amber-800"
                                  >
                                    Featured
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {product.category?.name || "Uncategorized"}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">
                              {formatCurrency(product.price || 0)}
                            </TableCell>
                            <TableCell>{product.stock || 0}</TableCell>
                            <TableCell>
                              <Badge variant={stockStatus.color}>
                                {stockStatus.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDate(product.createdAt)}
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" asChild>
                                  <Link href={`/products/${product.slug}`}>
                                    <Eye className="h-4 w-4" />
                                  </Link>
                                </Button>
                                <Button variant="ghost" size="icon" asChild>
                                  <Link
                                    href={`/dashboard/products/${product.id}/edit`}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Link>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setProductToDelete(product.id);
                                    setIsDeleteModalOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Delete Confirmation Modal */}
          {isDeleteModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="w-full max-w-md py-6">
                <CardHeader>
                  <CardTitle>Delete Product</CardTitle>
                  <CardDescription>
                    Are you sure you want to delete this product? This action
                    cannot be undone.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsDeleteModalOpen(false);
                        setProductToDelete(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() =>
                        productToDelete && deleteProduct(productToDelete)
                      }
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
