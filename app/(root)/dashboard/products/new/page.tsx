"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Plus,
  Loader2,
  ImageIcon,
  Trash2,
  PackageCheck,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import useSWR from "swr";
import imageCompression from "browser-image-compression";
import { CategoryApiResponse } from "@/app/(root)/api/categories/route";

// Product variant type
interface ProductVariant {
  name: string;
  price: string;
  stock: string;
}

// Custom attribute type
// interface CustomAttribute {
//   key: string;
//   value: string;
// }

// Updated schema to include variants and attributes
const productFormSchema = z.object({
  name: z
    .string()
    .min(2, "Product name must be at least 2 characters")
    .max(255, "Product name too long"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description too long"),
  categoryId: z.string().min(1, "Please select a category"),
  price: z
    .string()
    .min(1, "Price is required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Price must be a positive number",
    }),
  stock: z
    .string()
    .refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 0, {
      message: "Stock must be a non-negative number",
    }),
  image: z
    .url("Please enter a valid image URL")
    .min(1, "Product image is required"),
  otherImages: z.array(z.url()),
  materials: z.array(z.string().min(1, "Material cannot be empty")).optional(),
  highlights: z
    .array(z.string().min(1, "Highlight cannot be empty"))
    .optional(),
  care: z.string().optional(),
  shipping: z.string().optional(),
  returns: z.string().optional(),
  attributes: z.record(z.string(), z.string()).optional(),
  variants: z.array(
    z.object({
      name: z.string().min(1, "Variant name required"),
      price: z.string().min(1, "Variant price required"),
      stock: z.string().min(1, "Variant stock required"),
    })
  ).optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

// Keep your existing fetcher and interfaces
const fetcher = (url: string): Promise<CategoryApiResponse> => fetch(url).then((res) => res.json());

export default function CreateProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [newMaterial, setNewMaterial] = useState("");
  const [newHighlight, setNewHighlight] = useState("");
  const [mainImagePreview, setMainImagePreview] = useState("");
  const [isUploadingMain, setIsUploadingMain] = useState(false);
  const [isUploadingAdditional, setIsUploadingAdditional] = useState(false);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>([]);
  const [isDeletingImage, setIsDeletingImage] = useState<string | null>(null);

  // New state for attributes and variants
  const [newAttributeKey, setNewAttributeKey] = useState("");
  const [newAttributeValue, setNewAttributeValue] = useState("");
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [newVariant, setNewVariant] = useState<ProductVariant>({
    name: "",
    price: "",
    stock: "",
  });

  // Fetch categories
  const {
    data: categoriesData,
    error: categoriesError,
    isLoading: categoriesLoading,
  } = useSWR("/api/categories", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  const categories = categoriesData?.data || [];

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      categoryId: "",
      price: "",
      stock: "0",
      image: "",
      otherImages: [],
      materials: [],
      highlights: [],
      care: "",
      shipping: "",
      returns: "",
      attributes: {},
      variants: [],
    },
  });

  const { watch, setValue } = form;
  const materials = watch("materials");
  const highlights = watch("highlights");
  const otherImages = watch("otherImages");
  const attributes = watch("attributes") || {};

  // Keep your existing image upload handlers
  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setIsUploadingMain(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMainImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      const compressedBlob = await imageCompression(file, {
        maxSizeMB: 2,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        preserveExif: true,
        fileType: 'image/webp',
      });

      const compressedFile = new File([compressedBlob], file.name, {
        type: compressedBlob.type,
      });

      const formData = new FormData();
      formData.append("file", compressedFile);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data: { url: string } = await response.json();
      setValue("image", data.url);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
      setMainImagePreview("");
    } finally {
      setIsUploadingMain(false);
    }
  };

  const handleAdditionalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setIsUploadingAdditional(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdditionalImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);

      const compressedBlob = await imageCompression(file, {
        maxSizeMB: 2,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        preserveExif: true,
      });

      const compressedFile = new File([compressedBlob], file.name, {
        type: compressedBlob.type,
      });

      const formData = new FormData();
      formData.append("file", compressedFile);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data: { url: string } = await response.json();
      setValue("otherImages", [...otherImages, data.url]);
      toast.success("Additional image uploaded");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploadingAdditional(false);
      e.target.value = "";
    }
  };

  const removeAdditionalImage = async (index: number) => {
    const imageToDelete = otherImages[index];
    if (!imageToDelete) return;

    setIsDeletingImage(imageToDelete);
    try {
      const filename = imageToDelete.split("/").slice(-3).join("/");
      const response = await fetch(`/api/upload/${encodeURIComponent(filename)}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const updatedImages = otherImages.filter((_, i) => i !== index);
        const updatedPreviews = additionalImagePreviews.filter((_, i) => i !== index);
        setValue("otherImages", updatedImages);
        setAdditionalImagePreviews(updatedPreviews);
        toast.success("Image removed");
      } else {
        toast.error("Failed to remove image");
      }
    } catch (error) {
      console.error("Error removing image:", error);
      toast.error("Failed to remove image");
    } finally {
      setIsDeletingImage(null);
    }
  };

  const removeMainImage = async () => {
    const currentImage = form.getValues("image");
    if (!currentImage) return;

    setIsDeletingImage("main");
    try {
      const filename = currentImage.split("/").slice(-3).join("/");
      const response = await fetch(`/api/upload/${encodeURIComponent(filename)}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setValue("image", "");
        setMainImagePreview("");
        toast.success("Image removed");
      } else {
        toast.error("Failed to remove image");
      }
    } catch (error) {
      console.error("Error removing image:", error);
      toast.error("Failed to remove image");
    } finally {
      setIsDeletingImage(null);
    }
  };

  // Materials handlers
  const addMaterial = () => {
    if (newMaterial.trim() && !materials?.includes(newMaterial.trim())) {
      setValue("materials", [...(materials ?? []), newMaterial.trim()]);
      setNewMaterial("");
    }
  };

  const removeMaterial = (index: number) => {
    const updated = materials?.filter((_, i) => i !== index);
    setValue("materials", updated);
  };

  // Highlights handlers
  const addHighlight = () => {
    if (newHighlight.trim() && !highlights?.includes(newHighlight.trim())) {
      setValue("highlights", [...(highlights ?? []), newHighlight.trim()]);
      setNewHighlight("");
    }
  };

  const removeHighlight = (index: number) => {
    const updated = highlights?.filter((_, i) => i !== index);
    setValue("highlights", updated);
  };

  // Custom attributes handlers
  const addAttribute = () => {
    if (newAttributeKey.trim() && newAttributeValue.trim()) {
      setValue("attributes", {
        ...attributes,
        [newAttributeKey.trim()]: newAttributeValue.trim(),
      });
      setNewAttributeKey("");
      setNewAttributeValue("");
    }
  };

  const removeAttribute = (key: string) => {
    const updated = { ...attributes };
    delete updated[key];
    setValue("attributes", updated);
  };

  // Variant handlers
  const addVariant = () => {
    if (newVariant.name.trim() && newVariant.price && newVariant.stock) {
      setVariants([...variants, { ...newVariant }]);
      setValue("variants", [...variants, { ...newVariant }]);
      setNewVariant({ name: "", price: "", stock: "" });
    }
  };

  const removeVariant = (index: number) => {
    const updated = variants.filter((_, i) => i !== index);
    setVariants(updated);
    setValue("variants", updated);
  };

  const onSubmit = async (data: ProductFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          price: parseFloat(data.price),
          stock: parseInt(data.stock),
          slug: data.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, ""),
        }),
      });

      const result: { success?: boolean; error?: string } = await response.json();

      if (result.success) {
        toast.success("Product created successfully");
        router.push("/dashboard/products");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to create product");
      }
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Failed to create product");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <PackageCheck className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Add New Product
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Save Draft
            </Button>
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={isLoading}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </>
              )}
            </Button>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {/* Two Column Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left Column - Forms (2/3 width) */}
              <div className="lg:col-span-2 space-y-6">
                {/* General Information */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    General Information
                  </h2>
                  <div className="space-y-5">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Product Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Handmade Ceramic Coffee Mug"
                              className="bg-gray-50 border-gray-200"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Description
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your handmade product in detail..."
                              rows={4}
                              className="bg-gray-50 border-gray-200 resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Custom Attributes */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">
                    Product Attributes
                  </h2>
                  <p className="text-sm text-gray-500 mb-5">
                    Add custom properties like Size, Color, Material, Dimensions, Weight, etc.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Property name (e.g., Color)"
                        value={newAttributeKey}
                        onChange={(e) => setNewAttributeKey(e.target.value)}
                        className="bg-gray-50 border-gray-200"
                      />
                      <div className="flex gap-2">
                        <Input
                          placeholder="Value (e.g., Blue)"
                          value={newAttributeValue}
                          onChange={(e) => setNewAttributeValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addAttribute();
                            }
                          }}
                          className="bg-gray-50 border-gray-200"
                        />
                        <Button
                          type="button"
                          onClick={addAttribute}
                          variant="outline"
                          size="icon"
                          className="shrink-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {Object.keys(attributes).length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        {Object.entries(attributes).map(([key, value]) => (
                          <div
                            key={key}
                            className="flex items-center justify-between bg-white rounded-md p-3 border border-gray-200"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-gray-700">
                                {key}:
                              </span>
                              <span className="text-sm text-gray-600">{value}</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAttribute(key)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Variants */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">
                    Product Variants
                  </h2>
                  <p className="text-sm text-gray-500 mb-5">
                    Add different versions of this product (e.g., Small/Medium/Large, Different colors, etc.)
                  </p>

                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <Input
                        placeholder="Variant name (e.g., Small)"
                        value={newVariant.name}
                        onChange={(e) =>
                          setNewVariant({ ...newVariant, name: e.target.value })
                        }
                        className="bg-gray-50 border-gray-200"
                      />
                      <Input
                        type="number"
                        placeholder="Price"
                        value={newVariant.price}
                        onChange={(e) =>
                          setNewVariant({ ...newVariant, price: e.target.value })
                        }
                        className="bg-gray-50 border-gray-200"
                      />
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Stock"
                          value={newVariant.stock}
                          onChange={(e) =>
                            setNewVariant({ ...newVariant, stock: e.target.value })
                          }
                          className="bg-gray-50 border-gray-200"
                        />
                        <Button
                          type="button"
                          onClick={addVariant}
                          variant="outline"
                          size="icon"
                          className="shrink-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {variants.length > 0 && (
                      <div className="bg-gray-50 rounded-lg overflow-hidden">
                        <div className="grid grid-cols-4 gap-4 p-3 bg-gray-100 text-xs font-medium text-gray-600">
                          <div>Variant Name</div>
                          <div>Price</div>
                          <div>Stock</div>
                          <div>Action</div>
                        </div>
                        {variants.map((variant, index) => (
                          <div
                            key={index}
                            className="grid grid-cols-4 gap-4 p-3 border-t border-gray-200 items-center text-sm"
                          >
                            <div className="font-medium text-gray-700">{variant.name}</div>
                            <div className="text-gray-600">₹{variant.price}</div>
                            <div className="text-gray-600">{variant.stock} units</div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeVariant(index)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Pricing And Stock */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    Pricing And Stock
                  </h2>
                  <div className="grid md:grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Base Price (₹)
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="499.00"
                              className="bg-gray-50 border-gray-200"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="stock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Stock Quantity
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="10"
                              className="bg-gray-50 border-gray-200"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Product Details */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    Additional Details
                  </h2>
                  <div className="space-y-5">
                    {/* Materials */}
                    <div>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Materials Used
                      </FormLabel>
                      <p className="text-xs text-gray-500 mb-2">
                        List all materials used in making this product
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Input
                          placeholder="e.g., Ceramic, Cotton, Wood"
                          value={newMaterial}
                          onChange={(e) => setNewMaterial(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addMaterial();
                            }
                          }}
                          className="bg-gray-50 border-gray-200"
                        />
                        <Button
                          type="button"
                          onClick={addMaterial}
                          variant="outline"
                          size="icon"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {(materials?.length || 0) > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {materials?.map((material, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="pr-1"
                            >
                              {material}
                              <X
                                className="ml-2 h-3 w-3 cursor-pointer"
                                onClick={() => removeMaterial(index)}
                              />
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Highlights */}
                    <div>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Product Highlights
                      </FormLabel>
                      <p className="text-xs text-gray-500 mb-2">
                        Key features and unique selling points
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Input
                          placeholder="e.g., Handcrafted, Eco-friendly, Microwave safe"
                          value={newHighlight}
                          onChange={(e) => setNewHighlight(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addHighlight();
                            }
                          }}
                          className="bg-gray-50 border-gray-200"
                        />
                        <Button
                          type="button"
                          onClick={addHighlight}
                          variant="outline"
                          size="icon"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {(highlights?.length || 0) > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {highlights?.map((highlight, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="pr-1"
                            >
                              {highlight}
                              <X
                                className="ml-2 h-3 w-3 cursor-pointer"
                                onClick={() => removeHighlight(index)}
                              />
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Care Instructions */}
                    <FormField
                      control={form.control}
                      name="care"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Care Instructions (Optional)
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="How to care for this product..."
                              rows={3}
                              className="bg-gray-50 border-gray-200 resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Shipping Info */}
                    <FormField
                      control={form.control}
                      name="shipping"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Shipping Information (Optional)
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Shipping details, delivery time, packaging info..."
                              rows={3}
                              className="bg-gray-50 border-gray-200 resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Returns Policy */}
                    <FormField
                      control={form.control}
                      name="returns"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Return Policy (Optional)
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Your return and exchange policy..."
                              rows={3}
                              className="bg-gray-50 border-gray-200 resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column - Images & Category (1/3 width) */}
              <div className="space-y-6">
                {/* Upload Images */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    Product Images
                  </h2>

                  {/* Main Image Preview */}
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ }) => (
                      <FormItem>
                        <FormControl>
                          <div>
                            {!mainImagePreview ? (
                              <label className="block cursor-pointer">
                                <div className="aspect-square border-2 border-dashed border-gray-300 rounded-xl hover:border-green-500 transition-colors flex flex-col items-center justify-center bg-gray-50">
                                  {isUploadingMain ? (
                                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                                  ) : (
                                    <>
                                      <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
                                      <p className="text-sm font-medium text-gray-600">
                                        Click to upload
                                      </p>
                                      <p className="text-xs text-gray-500 mt-1">
                                        PNG, JPG, WEBP (max 5MB)
                                      </p>
                                    </>
                                  )}
                                </div>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleMainImageUpload}
                                  className="hidden"
                                  disabled={isUploadingMain}
                                />
                              </label>
                            ) : (
                              <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                                <Image
                                  src={mainImagePreview}
                                  alt="Main product"
                                  fill
                                  className="object-cover"
                                />
                                {isDeletingImage === "main" ? (
                                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={removeMainImage}
                                    className="absolute top-2 right-2 h-8 w-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Thumbnail Images */}
                  <div className="flex gap-2 mt-4 flex-wrap">
                    {additionalImagePreviews.map((preview, index) => (
                      <div
                        key={index}
                        className="relative h-20 w-20 rounded-lg overflow-hidden border-2 border-gray-200"
                      >
                        <Image
                          src={preview}
                          alt={`Product ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        {isDeletingImage === otherImages[index] ? (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Loader2 className="h-4 w-4 animate-spin text-white" />
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => removeAdditionalImage(index)}
                            className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ))}

                    {/* Add More Button */}
                    <label className="h-20 w-20 rounded-lg border-2 border-dashed border-gray-300 hover:border-green-500 transition-colors flex items-center justify-center cursor-pointer bg-gray-50">
                      {isUploadingAdditional ? (
                        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                      ) : (
                        <Plus className="h-6 w-6 text-gray-400" />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAdditionalImageUpload}
                        className="hidden"
                        disabled={isUploadingAdditional}
                      />
                    </label>
                  </div>
                </div>

                {/* Category */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    Category
                  </h2>
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Product Category
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-gray-50 border-gray-200">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categoriesLoading ? (
                              <SelectItem value="loading" disabled>
                                Loading...
                              </SelectItem>
                            ) : categories.length === 0 ? (
                              <SelectItem value="none" disabled>
                                No categories available
                              </SelectItem>
                            ) : (
                              categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                  {category.productCount !== undefined &&
                                    ` (${category.productCount})`}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                        {categoriesError ? (
                          <FormDescription className="text-red-500">Sorry, failed to load categories.</FormDescription>
                        ) : (
                          <FormDescription>Select the category that best fits your product.</FormDescription>
                        )}
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Form,
//   FormControl,
//   FormDescription,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Badge } from "@/components/ui/badge";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   ArrowLeft,
//   Save,
//   X,
//   Plus,
//   Loader2,
//   ImageIcon,
//   Upload,
// } from "lucide-react";
// import Link from "next/link";
// import Image from "next/image";
// import { toast } from "sonner";
// import useSWR from "swr";
// import imageCompression from "browser-image-compression";

// interface CategoryApiResonse {
//   success: boolean;
//   pagination: {
//     page: number;
//     limit: number;
//     total: number;
//     totalPages: number;
//   };
//   data: {
//     id: string;
//     name: string;
//     image?: string;
//     icon?: string;
//     slug: string;
//     description?: string;
//     productCount?: number;
//     featured?: boolean;
//   }[];
// }

// // Validation schema
// const productFormSchema = z.object({
//   // Basic Information
//   name: z
//     .string()
//     .min(2, "Product name must be at least 2 characters")
//     .max(255, "Product name too long"),
//   description: z
//     .string()
//     .min(10, "Description must be at least 10 characters")
//     .max(2000, "Description too long"),
//   categoryId: z.string().min(1, "Please select a category"),
//   price: z
//     .string()
//     .min(1, "Price is required")
//     .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
//       message: "Price must be a positive number",
//     }),

//   // Inventory
//   stock: z
//     .string()
//     .refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 0, {
//       message: "Stock must be a non-negative number",
//     }),

//   // Media
//   image: z
//     .url("Please enter a valid image URL")
//     .min(1, "Product image is required"),
//   otherImages: z.array(z.url()),

//   // Product Details
//   materials: z.array(z.string().min(1, "Material cannot be empty")).optional(),
//   highlights: z
//     .array(z.string().min(1, "Highlight cannot be empty"))
//     .optional(),

//   // Policies
//   care: z.string().optional(),
//   shipping: z.string().optional(),
//   returns: z.string().optional(),
// });

// type ProductFormValues = z.infer<typeof productFormSchema>;

// // Fetcher for SWR
// const fetcher = (url: string): Promise<CategoryApiResonse> =>
//   fetch(url).then((res) => res.json());

// export default function CreateProductPage() {
//   const router = useRouter();
//   const [isLoading, setIsLoading] = useState(false);
//   const [activeTab, setActiveTab] = useState("basic");
//   const [newMaterial, setNewMaterial] = useState("");
//   const [newHighlight, setNewHighlight] = useState("");
//   const [mainImagePreview, setMainImagePreview] = useState<string>("");
//   const [isUploadingMain, setIsUploadingMain] = useState(false);
//   const [isUploadingAdditional, setIsUploadingAdditional] = useState(false);
//   const [additionalImagePreviews, setAdditionalImagePreviews] = useState<
//     string[]
//   >([]);
//   const [isDeletingImage, setIsDeletingImage] = useState<string | null>(null);

//   // Fetch categories from API
//   const {
//     data: categoriesData,
//     error: categoriesError,
//     isLoading: categoriesLoading,
//   } = useSWR<CategoryApiResonse>("/api/categories", fetcher, {
//     revalidateOnFocus: false,
//     dedupingInterval: 60000, // Cache for 1 minute
//   });

//   const categories: CategoryApiResonse["data"] = categoriesData?.data || [];

//   const form = useForm<ProductFormValues>({
//     resolver: zodResolver(productFormSchema),
//     defaultValues: {
//       name: "",
//       description: "",
//       categoryId: "",
//       price: "",
//       stock: "0",
//       image: "",
//       otherImages: [],
//       materials: [],
//       highlights: [],
//       care: "",
//       shipping: "",
//       returns: "",
//     },
//   });

//   const { watch, setValue } = form;
//   const materials = watch("materials");
//   const highlights = watch("highlights");
//   const otherImages = watch("otherImages");

//   // Upload main image
//   const handleMainImageUpload = async (
//     e: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     // Validate file type
//     if (!file.type.startsWith("image/")) {
//       toast.error("Please upload an image file");
//       return;
//     }

//     // Validate file size (max 5MB)
//     if (file.size > 5 * 1024 * 1024) {
//       toast.error("Image size should be less than 5MB");
//       return;
//     }

//     setIsUploadingMain(true);

//     try {
//       // Create preview
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setMainImagePreview(reader.result as string);
//       };
//       reader.readAsDataURL(file);

//       // Compress image before uploading
//       const compressedBlob = await imageCompression(file, {
//         maxSizeMB: 2,
//         maxWidthOrHeight: 1920,
//         useWebWorker: true,
//         preserveExif: true,
//       });

//       // Create a new File object with the original filename
//       const compressedFile = new File([compressedBlob], file.name, {
//         type: compressedBlob.type,
//       });

//       // Upload to server
//       const formData = new FormData();
//       formData.append("file", compressedFile);

//       const response = await fetch("/api/upload", {
//         method: "POST",
//         body: formData,
//       });

//       if (!response.ok) throw new Error("Upload failed");

//       const data: { url: string } = await response.json();

//       setValue("image", data.url);
//       toast.success("Image uploaded successfully");
//     } catch (error) {
//       console.error("Error uploading image:", error);
//       toast.error("Failed to upload image");
//       setMainImagePreview("");
//     } finally {
//       setIsUploadingMain(false);
//     }
//   };

//   // Upload additional image
//   const handleAdditionalImageUpload = async (
//     e: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     if (!file.type.startsWith("image/")) {
//       toast.error("Please upload an image file");
//       return;
//     }

//     if (file.size > 5 * 1024 * 1024) {
//       toast.error("Image size should be less than 5MB");
//       return;
//     }

//     setIsUploadingAdditional(true);

//     try {
//       // Create preview
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setAdditionalImagePreviews((prev) => [
//           ...prev,
//           reader.result as string,
//         ]);
//       };
//       reader.readAsDataURL(file);

//       // Upload to server
//       const formData = new FormData();

//       // Compress image before uploading
//       const compressedBlob = await imageCompression(file, {
//         maxSizeMB: 2,
//         maxWidthOrHeight: 1920,
//         useWebWorker: true,
//         preserveExif: true,
//       });

//       // Create a new File object with the original filename
//       const compressedFile = new File([compressedBlob], file.name, {
//         type: compressedBlob.type,
//       });

//       formData.append("file", compressedFile);

//       const response = await fetch("/api/upload", {
//         method: "POST",
//         body: formData,
//       });

//       if (!response.ok) throw new Error("Upload failed");

//       const data: { url: string } = await response.json();
//       setValue("otherImages", [...otherImages, data.url]);
//       toast.success("Additional image uploaded");
//     } catch (error) {
//       console.error("Error uploading image:", error);
//       toast.error("Failed to upload image");
//     } finally {
//       setIsUploadingAdditional(false);
//       // Reset input
//       e.target.value = "";
//     }
//   };

//   // Remove additional image
//   const removeAdditionalImage = async (index: number) => {
//     const imageToDelete = otherImages[index];
//     if (!imageToDelete) return;

//     setIsDeletingImage(imageToDelete);

//     try {
//       // Extract filename from URL
//       const filename = imageToDelete.split("/").slice(-3).join("/");

//       const success = await deleteImageFromR2(filename);

//       if (success) {
//         const updatedImages = otherImages.filter((_, i) => i !== index);
//         const updatedPreviews = additionalImagePreviews.filter(
//           (_, i) => i !== index
//         );
//         setValue("otherImages", updatedImages);
//         setAdditionalImagePreviews(updatedPreviews);
//         toast.success("Image removed");
//       } else {
//         toast.error("Failed to remove image");
//       }
//     } catch (error) {
//       console.error("Error removing image:", error);
//       toast.error("Failed to remove image");
//     } finally {
//       setIsDeletingImage(null);
//     }
//   };

//   // Remove main image
//   const removeMainImage = async () => {
//     const currentImage = form.getValues("image");
//     if (!currentImage) return;

//     setIsDeletingImage("main");

//     try {
//       // Extract filename from URL
//       const filename = currentImage.split("/").slice(-3).join("/"); // Gets "products/userId/filename.jpg"

//       const success = await deleteImageFromR2(filename);

//       if (success) {
//         setValue("image", "");
//         setMainImagePreview("");
//         toast.success("Image removed");
//       } else {
//         toast.error("Failed to remove image");
//       }
//     } catch (error) {
//       console.error("Error removing image:", error);
//       toast.error("Failed to remove image");
//     } finally {
//       setIsDeletingImage(null);
//     }
//   };

//   const deleteImageFromR2 = async (filename: string) => {
//     try {
//       const response = await fetch(
//         `/api/upload/${encodeURIComponent(filename)}`,
//         {
//           method: "DELETE",
//         }
//       );

//       if (!response.ok) {
//         throw new Error("Failed to delete image");
//       }

//       return true;
//     } catch (error) {
//       console.error("Error deleting image:", error);
//       return false;
//     }
//   };

//   const addMaterial = () => {
//     if (newMaterial.trim() && !materials?.includes(newMaterial.trim())) {
//       setValue("materials", [...(materials ?? []), newMaterial.trim()]);
//       setNewMaterial("");
//     }
//   };

//   const removeMaterial = (index: number) => {
//     const updated = materials?.filter((_, i) => i !== index);
//     setValue("materials", updated);
//   };

//   const addHighlight = () => {
//     if (newHighlight.trim() && !highlights?.includes(newHighlight.trim())) {
//       setValue("highlights", [...(highlights ?? []), newHighlight.trim()]);
//       setNewHighlight("");
//     }
//   };

//   const removeHighlight = (index: number) => {
//     const updated = highlights?.filter((_, i) => i !== index);
//     setValue("highlights", updated);
//   };

//   // const addImage = () => {
//   //   if (newImage.trim() && !otherImages.includes(newImage.trim())) {
//   //     setValue("otherImages", [...otherImages, newImage.trim()]);
//   //     setNewImage("");
//   //   }
//   // };

//   // const removeImage = (index: number) => {
//   //   const updated = otherImages.filter((_, i) => i !== index);
//   //   setValue("otherImages", updated);
//   // };

//   const onSubmit = async (data: ProductFormValues) => {
//     setIsLoading(true);

//     console.log("form submit data: ", data);

//     try {
//       const response = await fetch("/api/products", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           ...data,
//           price: parseFloat(data.price),
//           stock: parseInt(data.stock),
//           // Generate slug from name
//           slug: data.name
//             .toLowerCase()
//             .replace(/[^a-z0-9]+/g, "-")
//             .replace(/(^-|-$)+/g, ""),
//         }),
//       });

//       const result: { success: boolean; error: string } = await response.json();

//       if (result.success) {
//         toast.success("Product created successfully");
//         router.push("/dashboard/products");
//         router.refresh();
//       } else {
//         toast.error(result.error || "Failed to create product");
//         console.error("Failed to create product:", result.error);
//       }
//     } catch (error) {
//       console.error("Error creating product:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="container mx-auto px-4 py-8">
//         <div className="max-w-4xl mx-auto">
//           {/* Header */}
//           <div className="flex items-center justify-between mb-8">
//             <div>
//               <div className="flex items-center gap-2 mb-2">
//                 <Link href="/dashboard/products">
//                   <Button variant="ghost" size="icon">
//                     <ArrowLeft className="h-4 w-4" />
//                   </Button>
//                 </Link>
//                 <h1 className="text-3xl font-bold">Create New Product</h1>
//               </div>
//               <p className="text-muted-foreground">
//                 Add a new product to your catalog
//               </p>
//             </div>
//           </div>

//           <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
//               <Tabs
//                 value={activeTab}
//                 onValueChange={setActiveTab}
//                 className="space-y-6"
//               >
//                 <TabsList className="grid w-full grid-cols-4">
//                   <TabsTrigger value="basic">Basic Info</TabsTrigger>
//                   <TabsTrigger value="media">Media</TabsTrigger>
//                   <TabsTrigger value="details">Details</TabsTrigger>
//                   <TabsTrigger value="policies">Policies</TabsTrigger>
//                 </TabsList>

//                 {/* Basic Information Tab */}
//                 <TabsContent value="basic" className="space-y-6">
//                   <Card className="py-6">
//                     <CardHeader>
//                       <CardTitle>Basic Information</CardTitle>
//                       <CardDescription>
//                         Essential details about your product
//                       </CardDescription>
//                     </CardHeader>
//                     <CardContent className="space-y-6">
//                       <FormField
//                         control={form.control}
//                         name="name"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel>Product Name *</FormLabel>
//                             <FormControl>
//                               <Input
//                                 placeholder="Enter product name"
//                                 {...field}
//                               />
//                             </FormControl>
//                             <FormDescription>
//                               A clear and descriptive name for your product
//                             </FormDescription>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />

//                       <FormField
//                         control={form.control}
//                         name="description"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel>Description *</FormLabel>
//                             <FormControl>
//                               <Textarea
//                                 placeholder="Describe your product in detail..."
//                                 className="min-h-32"
//                                 {...field}
//                               />
//                             </FormControl>
//                             <FormDescription>
//                               Include details about materials, dimensions, and
//                               unique features
//                             </FormDescription>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />

//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                         <FormField
//                           control={form.control}
//                           name="categoryId"
//                           render={({ field }) => (
//                             <FormItem>
//                               <FormLabel>Category *</FormLabel>
//                               <Select
//                                 onValueChange={field.onChange}
//                                 defaultValue={field.value}
//                                 disabled={
//                                   categoriesLoading || !!categoriesError
//                                 }
//                               >
//                                 <FormControl>
//                                   <SelectTrigger>
//                                     <SelectValue
//                                       placeholder={
//                                         categoriesLoading
//                                           ? "Loading categories..."
//                                           : categoriesError
//                                           ? "Error loading categories"
//                                           : "Select a category"
//                                       }
//                                     />
//                                   </SelectTrigger>
//                                 </FormControl>
//                                 <SelectContent>
//                                   {categories.length === 0 &&
//                                     !categoriesLoading && (
//                                       <SelectItem value="none" disabled>
//                                         No categories available
//                                       </SelectItem>
//                                     )}
//                                   {categories.map((category) => (
//                                     <SelectItem
//                                       key={category.id}
//                                       value={category.id}
//                                     >
//                                       {category.name}
//                                       {category.productCount !== undefined &&
//                                         ` (${category.productCount})`}
//                                       {category.featured && (
//                                         <Badge variant={"outline"}>
//                                           featured
//                                         </Badge>
//                                       )}
//                                     </SelectItem>
//                                   ))}
//                                 </SelectContent>
//                               </Select>
//                               <FormDescription>
//                                 Choose the most relevant category
//                               </FormDescription>
//                               <FormMessage />
//                             </FormItem>
//                           )}
//                         />

//                         <FormField
//                           control={form.control}
//                           name="price"
//                           render={({ field }) => (
//                             <FormItem>
//                               <FormLabel>Price (₹) *</FormLabel>
//                               <FormControl>
//                                 <Input
//                                   type="number"
//                                   step="0.01"
//                                   min="0"
//                                   placeholder="0.00"
//                                   {...field}
//                                 />
//                               </FormControl>
//                               <FormDescription>
//                                 Set the selling price in INR
//                               </FormDescription>
//                               <FormMessage />
//                             </FormItem>
//                           )}
//                         />
//                       </div>

//                       <FormField
//                         control={form.control}
//                         name="stock"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel>Stock Quantity</FormLabel>
//                             <FormControl>
//                               <Input
//                                 type="number"
//                                 min="0"
//                                 placeholder="0"
//                                 {...field}
//                               />
//                             </FormControl>
//                             <FormDescription>
//                               Number of items available for sale
//                             </FormDescription>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />

//                       {/* <FormField
//                         control={form.control}
//                         name="isFeatured"
//                         render={({ field }) => (
//                           <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
//                             <div className="space-y-0.5">
//                               <FormLabel className="text-base">Featured Product</FormLabel>
//                               <FormDescription>
//                                 Show this product in featured sections
//                               </FormDescription>
//                             </div>
//                             <FormControl>
//                               <Switch
//                                 checked={field.value}
//                                 onCheckedChange={field.onChange}
//                               />
//                             </FormControl>
//                           </FormItem>
//                         )}
//                       /> */}
//                     </CardContent>
//                   </Card>
//                 </TabsContent>

//                 {/* Media Tab */}
//                 {/* <TabsContent value="media" className="space-y-6">
//                   <Card className="py-6">
//                     <CardHeader>
//                       <CardTitle>Product Images</CardTitle>
//                       <CardDescription>
//                         Add high-quality images of your product
//                       </CardDescription>
//                     </CardHeader>
//                     <CardContent className="space-y-6">
//                       <FormField
//                         control={form.control}
//                         name="image"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel>Main Image URL *</FormLabel>
//                             <FormControl>
//                               <div className="space-y-4">
//                                 <Input
//                                   placeholder="https://example.com/image.jpg"
//                                   {...field}
//                                 />
//                                 {field.value && (
//                                   <div className="mt-2">
//                                     <p className="text-sm font-medium mb-2">Preview:</p>
//                                     <div className="w-32 h-32 border rounded-md overflow-hidden">
//                                       <Image
//                                         src={field.value}
//                                         alt="Product preview"
//                                         className="w-full h-full object-cover"
//                                         onError={(e) => {
//                                           (e.target as HTMLImageElement).style.display = 'none';
//                                         }}
//                                         height={100}
//                                         width={100}
//                                       />
//                                     </div>
//                                   </div>
//                                 )}
//                               </div>
//                             </FormControl>
//                             <FormDescription>
//                               URL of the main product image
//                             </FormDescription>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />

//                       <div>
//                         <FormLabel>Additional Images</FormLabel>
//                         <FormDescription className="mb-4">
//                           Add more images to showcase different angles
//                         </FormDescription>
                        
//                         <div className="space-y-4">
//                           <div className="flex gap-2">
//                             <Input
//                               placeholder="https://example.com/image2.jpg"
//                               value={newImage}
//                               onChange={(e) => setNewImage(e.target.value)}
//                             />
//                             <Button type="button" onClick={addImage} variant="outline">
//                               <Plus className="h-4 w-4" />
//                             </Button>
//                           </div>

//                           {otherImages.length > 0 && (
//                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                               {otherImages.map((image, index) => (
//                                 <div key={index} className="relative group">
//                                   <div className="w-full h-24 border rounded-md overflow-hidden">
//                                     <Image
//                                       src={image}
//                                       alt={`Additional view ${index + 1}`}
//                                       className="w-full h-full object-cover"
//                                       onError={(e) => {
//                                         (e.target as HTMLImageElement).style.display = 'none';
//                                       }}
//                                       height={100}
//                                       width={100}
//                                     />
//                                   </div>
//                                   <Button
//                                     type="button"
//                                     variant="destructive"
//                                     size="icon"
//                                     className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
//                                     onClick={() => removeImage(index)}
//                                   >
//                                     <X className="h-3 w-3" />
//                                   </Button>
//                                 </div>
//                               ))}
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 </TabsContent> */}
//                 <TabsContent value="media" className="space-y-6">
//                   <Card className="py-6">
//                     <CardHeader>
//                       <CardTitle>Product Images</CardTitle>
//                       <CardDescription>
//                         Upload high-quality images of your product (max 5MB
//                         each)
//                       </CardDescription>
//                     </CardHeader>
//                     <CardContent className="space-y-6">
//                       {/* Main Image Upload */}
//                       <FormField
//                         control={form.control}
//                         name="image"
//                         render={({}) => (
//                           <FormItem>
//                             <FormLabel>Main Product Image *</FormLabel>
//                             <FormControl>
//                               <div className="space-y-4">
//                                 {!mainImagePreview ? (
//                                   <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
//                                     <Input
//                                       type="file"
//                                       accept="image/*"
//                                       onChange={handleMainImageUpload}
//                                       disabled={isUploadingMain}
//                                       className="hidden"
//                                       id="main-image-upload"
//                                     />
//                                     <label
//                                       htmlFor="main-image-upload"
//                                       className="cursor-pointer flex flex-col items-center"
//                                     >
//                                       {isUploadingMain ? (
//                                         <>
//                                           <Loader2 className="h-12 w-12 text-muted-foreground animate-spin mb-4" />
//                                           <p className="text-sm text-muted-foreground">
//                                             Uploading...
//                                           </p>
//                                         </>
//                                       ) : (
//                                         <>
//                                           <Upload className="h-12 w-12 text-muted-foreground mb-4" />
//                                           <p className="text-sm font-medium mb-1">
//                                             Click to upload main image
//                                           </p>
//                                           <p className="text-xs text-muted-foreground">
//                                             PNG, JPG, WEBP up to 5MB
//                                           </p>
//                                         </>
//                                       )}
//                                     </label>
//                                   </div>
//                                 ) : (
//                                   <div className="relative w-full max-w-sm mx-auto">
//                                     <div className="relative w-full h-64 border rounded-lg overflow-hidden">
//                                       <Image
//                                         src={mainImagePreview}
//                                         alt="Main product preview"
//                                         fill
//                                         className="object-cover"
//                                       />
//                                     </div>
//                                     <Button
//                                       type="button"
//                                       variant="destructive"
//                                       size="icon"
//                                       className="absolute -top-2 -right-2"
//                                       onClick={removeMainImage}
//                                       disabled={isDeletingImage !== null}
//                                     >
//                                       <X className="h-4 w-4" />
//                                     </Button>
//                                   </div>
//                                 )}
//                               </div>
//                             </FormControl>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />

//                       {/* Additional Images Upload */}
//                       <div>
//                         <FormLabel>Additional Images (Optional)</FormLabel>
//                         <FormDescription className="mb-4">
//                           Upload more images to showcase different angles
//                         </FormDescription>

//                         <div className="space-y-4">
//                           <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
//                             <Input
//                               type="file"
//                               accept="image/*"
//                               onChange={handleAdditionalImageUpload}
//                               disabled={isUploadingAdditional}
//                               className="hidden"
//                               id="additional-image-upload"
//                             />
//                             <label
//                               htmlFor="additional-image-upload"
//                               className="cursor-pointer flex flex-col items-center"
//                             >
//                               {isUploadingAdditional ? (
//                                 <>
//                                   <Loader2 className="h-8 w-8 text-muted-foreground animate-spin mb-2" />
//                                   <p className="text-sm text-muted-foreground">
//                                     Uploading...
//                                   </p>
//                                 </>
//                               ) : (
//                                 <>
//                                   <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
//                                   <p className="text-sm font-medium">
//                                     Add more images
//                                   </p>
//                                 </>
//                               )}
//                             </label>
//                           </div>

//                           {additionalImagePreviews.length > 0 && (
//                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                               {additionalImagePreviews.map((preview, index) => (
//                                 <div key={index} className="relative group">
//                                   <div className="relative w-full h-32 border rounded-lg overflow-hidden">
//                                     <Image
//                                       src={preview}
//                                       alt={`Additional view ${index + 1}`}
//                                       fill
//                                       className="object-cover"
//                                     />
//                                   </div>
//                                   <Button
//                                     type="button"
//                                     variant="destructive"
//                                     size="icon"
//                                     className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
//                                     onClick={() => removeAdditionalImage(index)}
//                                     disabled={isDeletingImage !== null}
//                                   >
//                                     <X className="h-3 w-3" />
//                                   </Button>
//                                 </div>
//                               ))}
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 </TabsContent>

//                 {/* Product Details Tab */}
//                 <TabsContent value="details" className="space-y-6">
//                   <Card className="py-6">
//                     <CardHeader>
//                       <CardTitle>Product Details</CardTitle>
//                       <CardDescription>
//                         Additional information about your product
//                       </CardDescription>
//                     </CardHeader>
//                     <CardContent className="space-y-6">
//                       <div>
//                         <FormLabel>Materials Used</FormLabel>
//                         <FormDescription className="mb-4">
//                           List the materials used in this product
//                         </FormDescription>

//                         <div className="space-y-4">
//                           <div className="flex gap-2">
//                             <Input
//                               placeholder="e.g., Sterling Silver, Leather, etc."
//                               value={newMaterial}
//                               onChange={(e) => setNewMaterial(e.target.value)}
//                               onKeyDown={(e) => {
//                                 if (e.key === "Enter") {
//                                   e.preventDefault();
//                                   addMaterial();
//                                 }
//                               }}
//                             />
//                             <Button
//                               type="button"
//                               onClick={addMaterial}
//                               variant="outline"
//                             >
//                               <Plus className="h-4 w-4" />
//                             </Button>
//                           </div>

//                           {(materials?.length || 0) > 0 && (
//                             <div className="flex flex-wrap gap-2">
//                               {materials?.map((material, index) => (
//                                 <Badge
//                                   key={index}
//                                   variant="secondary"
//                                   className="flex items-center gap-1"
//                                 >
//                                   {material}
//                                   <Button
//                                     type="button"
//                                     variant="ghost"
//                                     size="icon"
//                                     className="h-3 w-3 p-0 hover:bg-transparent"
//                                     onClick={() => removeMaterial(index)}
//                                   >
//                                     <X className="h-3 w-3" />
//                                   </Button>
//                                 </Badge>
//                               ))}
//                             </div>
//                           )}
//                         </div>
//                       </div>

//                       <div>
//                         <FormLabel>Product Highlights</FormLabel>
//                         <FormDescription className="mb-4">
//                           Key features and selling points
//                         </FormDescription>

//                         <div className="space-y-4">
//                           <div className="flex gap-2">
//                             <Input
//                               placeholder="e.g., Handcrafted, Eco-friendly, etc."
//                               value={newHighlight}
//                               onChange={(e) => setNewHighlight(e.target.value)}
//                               onKeyDown={(e) => {
//                                 if (e.key === "Enter") {
//                                   e.preventDefault();
//                                   addHighlight();
//                                 }
//                               }}
//                             />
//                             <Button
//                               type="button"
//                               onClick={addHighlight}
//                               variant="outline"
//                             >
//                               <Plus className="h-4 w-4" />
//                             </Button>
//                           </div>

//                           {(highlights?.length || 0) > 0 && (
//                             <div className="space-y-2">
//                               {highlights?.map((highlight, index) => (
//                                 <div
//                                   key={index}
//                                   className="flex items-center justify-between p-3 border rounded-lg"
//                                 >
//                                   <span>{highlight}</span>
//                                   <Button
//                                     type="button"
//                                     variant="ghost"
//                                     size="icon"
//                                     onClick={() => removeHighlight(index)}
//                                   >
//                                     <X className="h-4 w-4" />
//                                   </Button>
//                                 </div>
//                               ))}
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 </TabsContent>

//                 {/* Policies Tab */}
//                 <TabsContent value="policies" className="space-y-6">
//                   <Card className="py-6">
//                     <CardHeader>
//                       <CardTitle>Product Policies</CardTitle>
//                       <CardDescription>
//                         Care instructions, shipping, and return policies
//                       </CardDescription>
//                     </CardHeader>
//                     <CardContent className="space-y-6">
//                       <FormField
//                         control={form.control}
//                         name="care"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel>Care Instructions</FormLabel>
//                             <FormControl>
//                               <Textarea
//                                 placeholder="How to care for and maintain this product..."
//                                 className="min-h-24"
//                                 {...field}
//                               />
//                             </FormControl>
//                             <FormDescription>
//                               Help customers keep your product in good condition
//                             </FormDescription>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />

//                       <FormField
//                         control={form.control}
//                         name="shipping"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel>Shipping Information</FormLabel>
//                             <FormControl>
//                               <Textarea
//                                 placeholder="Shipping times, packaging details, etc."
//                                 className="min-h-24"
//                                 {...field}
//                               />
//                             </FormControl>
//                             <FormDescription>
//                               What customers can expect for shipping
//                             </FormDescription>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />

//                       <FormField
//                         control={form.control}
//                         name="returns"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel>Return Policy</FormLabel>
//                             <FormControl>
//                               <Textarea
//                                 placeholder="Return conditions, timeframes, etc."
//                                 className="min-h-24"
//                                 {...field}
//                               />
//                             </FormControl>
//                             <FormDescription>
//                               Your policy for returns and exchanges
//                             </FormDescription>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />
//                     </CardContent>
//                   </Card>
//                 </TabsContent>
//               </Tabs>

//               {/* Form Actions */}
//               <div className="flex justify-between items-center pt-6 border-t">
//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={() => router.back()}
//                   disabled={isLoading}
//                 >
//                   Cancel
//                 </Button>

//                 <Button type="submit" disabled={isLoading}>
//                   {isLoading ? (
//                     <>
//                       <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
//                       Creating...
//                     </>
//                   ) : (
//                     <>
//                       <Save className="h-4 w-4 mr-2" />
//                       Create Product
//                     </>
//                   )}
//                 </Button>
//               </div>
//             </form>
//           </Form>
//         </div>
//       </div>
//     </div>
//   );
// }

