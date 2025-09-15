"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import {
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  Shield,
  Heart,
  CreditCard,
  Lock,
  ShoppingCart,
  Tag,
  PackageCheck,
} from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { ShippingOption } from "@/lib/db/schema/index";

type ShippingOptionAlias = Omit<ShippingOption, "price"> & {
  price: number;
};

const shippingOptions: ShippingOptionAlias[] = [
  {
    id: "3e7106fb-17fe-4a8d-b848-df08cfdea9ab",
    name: "Standard Shipping",
    description: "5-7 business days",
    price: 4.99,
    duration: "7 days",
    isActive: false,
  },
  {
    id: "62440459-d1ae-42b5-a275-fbcfaf2aeecb",
    name: "Express Shipping",
    description: "2-3 business days",
    price: 9.99,
    duration: "4 days",
    isActive: false,
  },
  {
    id: "3e7106fb-17fe-4a8d-b848-9c5e5a5c79b1",
    name: "Priority Shipping",
    description: "1-2 business days",
    price: 14.99,
    duration: "2 days",
    isActive: false,
  },
];

export default function CartPage() {
  const {
    cartItems,
    savedItems,
    isLoading,
    removeFromCart,
    updateQuantity,
    moveToSaved,
    moveToCart,
    removeSaved,
  } = useCart();

  const [selectedShipping, setSelectedShipping] = useState("standard");
  const [giftWrap, setGiftWrap] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);

  // Calculate subtotal accounting for variants
  const subtotal = cartItems.reduce((sum, item) => {
    // Use the item's price which should already reflect the variant price
    return sum + item.price * item.quantity;
  }, 0);

  const shippingCost =
    shippingOptions.find((opt) => opt.id === selectedShipping)?.price || 0;
  const tax = subtotal * 0.18; // 18% GST
  const giftWrapCost = giftWrap ? 50 : 0;
  const total = subtotal + shippingCost + tax + giftWrapCost - discount;

  // Apply promo code
  const applyPromoCode = () => {
    if (promoCode.toUpperCase() === "SAVE10") {
      setDiscount(subtotal * 0.1);
      setAppliedPromoCode(promoCode);
    } else if (promoCode.toUpperCase() === "FLAT100") {
      setDiscount(100);
      setAppliedPromoCode(promoCode);
    } else {
      alert("Invalid promo code");
    }
  };

  // Remove promo code
  const removePromoCode = () => {
    setPromoCode("");
    setAppliedPromoCode(null);
    setDiscount(0);
  };

  // Get unique item identifier (combining product ID and variant ID)
  const getItemKey = (productId: string, variantId?: string) => {
    return variantId ? `${productId}-${variantId}` : productId;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <Skeleton className="h-10 w-48 mb-8" />
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
              <div>
                <Skeleton className="h-96" />
              </div>
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Shopping Cart</h1>
              <p className="text-muted-foreground">
                {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in
                your cart
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/products">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continue Shopping
              </Link>
            </Button>
          </div>

          {cartItems.length === 0 ? (
            // Empty Cart State
            <Card className="py-6">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
                <p className="text-muted-foreground mb-6 text-center max-w-md">
                  Looks like you haven&apos;t added anything to your cart yet. Start
                  shopping to find amazing local products!
                </p>
                <div className="flex gap-4">
                  <Button asChild>
                    <Link href="/products">Browse Products</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/creators">Discover Creators</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                <Card className="py-6">
                  <CardHeader>
                    <CardTitle>Cart Items</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {cartItems.map((item) => (
                      <div
                        key={getItemKey(item.id, item.variantId)}
                        className="flex gap-4 pb-4 border-b last:border-0"
                      >
                        {/* Product Image */}
                        <div className="relative w-24 h-24 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <PackageCheck className="h-8 w-8" />
                            </div>
                          )}
                          {item.stock === 0 && (
                            <Badge
                              variant="destructive"
                              className="absolute top-2 left-2"
                            >
                              Out of Stock
                            </Badge>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <Link
                                href={`/product/${item.slug}`}
                                className="font-semibold hover:text-primary line-clamp-1"
                              >
                                {item.name}
                              </Link>
                              <p className="text-sm text-muted-foreground">
                                By {item.creator.name || "Unknown Creator"}
                                {item.creator.isVerified && (
                                  <Badge variant="secondary" className="ml-2 text-xs">
                                    Verified
                                  </Badge>
                                )}
                              </p>
                              {/* Show variant information if exists */}
                              {item.variantName && (
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {item.variantName}
                                  </Badge>
                                </div>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFromCart(item.id, item.variantId)}
                              className="h-8 w-8"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Price and Quantity */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {/* Quantity Controls */}
                              <div className="flex items-center border rounded-lg">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    updateQuantity(
                                      item.id,
                                      item.quantity - 1,
                                      item.variantId
                                    )
                                  }
                                  disabled={item.quantity <= 1}
                                  className="h-8 w-8 rounded-r-none"
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <div className="px-3 text-sm font-medium min-w-[2rem] text-center">
                                  {item.quantity}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    updateQuantity(
                                      item.id,
                                      item.quantity + 1,
                                      item.variantId
                                    )
                                  }
                                  disabled={item.quantity >= item.stock}
                                  className="h-8 w-8 rounded-l-none"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>

                              {/* Stock info */}
                              {item.stock < 10 && item.stock > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  Only {item.stock} left
                                </Badge>
                              )}
                            </div>

                            {/* Total Price for this item */}
                            <div className="text-right">
                              <p className="font-bold text-lg">
                                ₹{(item.price * item.quantity).toFixed(2)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                ₹{item.price.toFixed(2)} each
                              </p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 mt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => moveToSaved(item)}
                              className="text-xs"
                            >
                              <Heart className="h-3 w-3 mr-1" />
                              Save for Later
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Saved Items */}
                {savedItems.length > 0 && (
                  <Card className="py-6">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Heart className="h-5 w-5" />
                        Saved for Later ({savedItems.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {savedItems.map((item) => (
                        <div
                          key={getItemKey(item.id, item.variantId)}
                          className="flex gap-4 pb-4 border-b last:border-0"
                        >
                          <div className="relative w-20 h-20 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <PackageCheck className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1">
                            <Link
                              href={`/product/${item.slug}`}
                              className="font-semibold hover:text-primary line-clamp-1 text-sm"
                            >
                              {item.name}
                            </Link>
                            <p className="text-xs text-muted-foreground">
                              By {item.creator.name || "Unknown Creator"}
                            </p>
                            {item.variantName && (
                              <Badge variant="outline" className="text-xs mt-1">
                                {item.variantName}
                              </Badge>
                            )}
                            <p className="font-bold text-sm mt-1">
                              ₹{item.price.toFixed(2)}
                            </p>

                            <div className="flex gap-2 mt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => moveToCart(item)}
                                disabled={item.stock === 0}
                                className="text-xs"
                              >
                                {item.stock === 0 ? "Out of Stock" : "Move to Cart"}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSaved(item.id, item.variantId)}
                                className="text-xs"
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4 py-6">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Promo Code */}
                    <div>
                      <Label htmlFor="promo" className="text-sm font-medium">
                        Promo Code
                      </Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          id="promo"
                          placeholder="Enter code"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          disabled={!!appliedPromoCode}
                        />
                        {appliedPromoCode ? (
                          <Button
                            variant="outline"
                            onClick={removePromoCode}
                            className="flex-shrink-0"
                          >
                            Remove
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            onClick={applyPromoCode}
                            className="flex-shrink-0"
                          >
                            Apply
                          </Button>
                        )}
                      </div>
                      {appliedPromoCode && (
                        <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          Promo code applied: {appliedPromoCode}
                        </p>
                      )}
                    </div>

                    <Separator />

                    {/* Shipping Options */}
                    <div>
                      <Label className="text-sm font-medium mb-3 block">
                        Shipping Method
                      </Label>
                      <RadioGroup
                        value={selectedShipping}
                        onValueChange={setSelectedShipping}
                      >
                        {shippingOptions.map((option) => (
                          <div
                            key={option.id}
                            className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:border-primary"
                            onClick={() => setSelectedShipping(option.id)}
                          >
                            <RadioGroupItem value={option.id} id={option.id} />
                            <Label
                              htmlFor={option.id}
                              className="flex-1 cursor-pointer"
                            >
                              <div className="flex justify-between items-center gap-3">
                                <div>
                                  <p className="font-medium text-sm">
                                    {option.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {option.duration}
                                  </p>
                                </div>
                                <p className="font-semibold">
                                  {option.price === 0
                                    ? "FREE"
                                    : `₹${option.price}`}
                                </p>
                              </div>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    <Separator />

                    {/* Gift Wrap */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="gift-wrap"
                          checked={giftWrap}
                          onCheckedChange={(checked) =>
                            setGiftWrap(checked as boolean)
                          }
                        />
                        <Label htmlFor="gift-wrap" className="text-sm cursor-pointer">
                          Add gift wrapping
                        </Label>
                      </div>
                      <span className="text-sm font-medium">₹50.00</span>
                    </div>

                    <Separator />

                    {/* Price Breakdown */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium">
                          ₹{subtotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Shipping</span>
                        <span className="font-medium">
                          {shippingCost === 0
                            ? "FREE"
                            : `₹${shippingCost.toFixed(2)}`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax (GST 18%)</span>
                        <span className="font-medium">₹{tax.toFixed(2)}</span>
                      </div>
                      {giftWrap && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Gift Wrap</span>
                          <span className="font-medium">₹{giftWrapCost.toFixed(2)}</span>
                        </div>
                      )}
                      {discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount</span>
                          <span className="font-medium">
                            -₹{discount.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* Total */}
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>₹{total.toFixed(2)}</span>
                    </div>

                    {/* Checkout Button */}
                    <Button className="w-full" size="lg" asChild>
                      <Link href="/checkout">
                        <Lock className="h-4 w-4 mr-2" />
                        Proceed to Checkout
                      </Link>
                    </Button>

                    {/* Trust Badges */}
                    <div className="space-y-3 pt-4 border-t">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Shield className="h-4 w-4" />
                        <span>Secure checkout</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CreditCard className="h-4 w-4" />
                        <span>Multiple payment options</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <PackageCheck className="h-4 w-4" />
                        <span>Easy returns within 7 days</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}


// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Checkbox } from "@/components/ui/checkbox";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import Link from "next/link";
// import {
//   Minus,
//   Plus,
//   Trash2,
//   ArrowLeft,
//   Shield,
//   Heart,
//   CreditCard,
//   Lock,
//   ShoppingCart,
// } from "lucide-react";
// import { shippingOptions } from "@/lib/mock-data";
// import { useCart } from "@/hooks/useCart";
// import { Skeleton } from "@/components/ui/skeleton";
// import Image from "next/image";

// export default function CartPage() {
//   const {
//     cartItems,
//     savedItems,
//     isLoading,
//     removeFromCart,
//     updateQuantity,
//     moveToSaved,
//     moveToCart,
//     removeSaved,
//   } = useCart();

//   const [selectedShipping, setSelectedShipping] = useState("standard");
//   const [giftWrap, setGiftWrap] = useState(false);
//   const [promoCode, setPromoCode] = useState("");

//   // Calculate totals
//   const subtotal = cartItems.reduce(
//     (sum, item) => sum + item.price * item.quantity,
//     0
//   );
//   const shippingCost =
//     shippingOptions.find((opt) => opt.id === selectedShipping)?.price || 0;
//   const tax = subtotal * 0.08; // Example tax calculation
//   const total = subtotal + shippingCost + tax + (giftWrap ? 5.99 : 0);

//   // Loading state
//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-background">
//         <main className="container mx-auto px-4 py-8 md:py-12">
//           <Skeleton className="h-10 w-48 mb-8" />
//           <div className="flex flex-col lg:flex-row gap-8">
//             <div className="lg:w-2/3 space-y-4">
//               {[...Array(3)].map((_, i) => (
//                 <Card key={i}>
//                   <CardContent className="p-4">
//                     <Skeleton className="h-24 w-full" />
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//             <div className="lg:w-1/3">
//               <Card>
//                 <CardContent className="p-6">
//                   <Skeleton className="h-64 w-full" />
//                 </CardContent>
//               </Card>
//             </div>
//           </div>
//         </main>
//       </div>
//     );
//   }

//   // Empty cart state
//   if (cartItems.length === 0 && savedItems.length === 0) {
//     return (
//       <div className="min-h-screen bg-background">
//         <main className="container mx-auto px-4 py-8 md:py-12">
//           <div className="text-center max-w-md mx-auto">
//             <div className="w-20 h-20 md:w-24 md:h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
//               <ShoppingCart className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground" />
//             </div>
//             <h1 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">
//               Your cart is empty
//             </h1>
//             <p className="text-muted-foreground mb-4 md:mb-6 text-sm md:text-base">
//               Looks like you haven&apos;t added anything to your cart yet. Start
//               shopping to find amazing local products!
//             </p>
//             <Button asChild size="lg">
//               <Link href="/products">Start Shopping</Link>
//             </Button>
//           </div>
//         </main>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-background">
//       <main className="container mx-auto px-4 py-6 md:py-8">
//         <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">
//           Shopping Cart
//         </h1>

//         <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
//           {/* Cart Items */}
//           <div className="lg:w-2/3">
//             {/* Cart Items */}
//             {cartItems.length > 0 && (
//               <Card className="mb-6 md:mb-8 py-6">
//                 <CardHeader className="pb-3 md:pb-4">
//                   <CardTitle className="text-lg md:text-xl">
//                     {cartItems.length} {cartItems.length === 1 ? "Item" : "Items"} in
//                     Your Cart
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent className="p-0">
//                   <div className="divide-y">
//                     {cartItems.map((item) => (
//                       <div
//                         key={item.id}
//                         className="p-4 flex flex-col sm:flex-row items-start"
//                       >
//                         <div className="w-16 h-16 md:w-20 md:h-20 bg-muted rounded-md flex items-center justify-center mr-4 mb-3 sm:mb-0 flex-shrink-0 overflow-hidden">
//                           {item.image ? (
//                             <Image
//                               src={item.image}
//                               alt={item.name}
//                               className="w-full h-full object-cover"
//                               width={64}
//                               height={64}
//                             />
//                           ) : (
//                             <div className="text-xs text-muted-foreground">
//                               No Image
//                             </div>
//                           )}
//                         </div>

//                         <div className="flex-1 min-w-0">
//                           <Link href={`/product/${item.slug || item.id}`}>
//                             <h3 className="font-semibold hover:text-primary text-base md:text-lg line-clamp-1">
//                               {item.name}
//                             </h3>
//                           </Link>
//                           <Link href={`/creator/${item.creator.id}`}>
//                             <p className="text-sm text-muted-foreground hover:text-primary mt-1">
//                               By {item.creator.name || "Unknown Creator"}
//                             </p>
//                           </Link>

//                           {!item.stock  && (
//                             <Badge variant="destructive" className="mt-2 text-xs">
//                               Out of stock
//                             </Badge>
//                           )}

//                           {item.variantName && (
//                             <p className="text-xs text-muted-foreground mt-1">
//                               Variant: {item.variantName}
//                             </p>
//                           )}

//                           <div className="flex items-center justify-between mt-3 md:mt-4">
//                             <div className="flex items-center border rounded-md">
//                               <Button
//                                 variant="ghost"
//                                 size="icon"
//                                 className="h-7 w-7 md:h-8 md:w-8"
//                                 onClick={() =>
//                                   updateQuantity(item.id, Math.max(1, item.quantity - 1))
//                                 }
//                                 disabled={item.quantity <= 1}
//                               >
//                                 <Minus className="h-3 w-3 md:h-4 md:w-4" />
//                               </Button>
//                               <span className="px-2 py-1 text-sm md:text-base min-w-[2rem] text-center">
//                                 {item.quantity}
//                               </span>
//                               <Button
//                                 variant="ghost"
//                                 size="icon"
//                                 className="h-7 w-7 md:h-8 md:w-8"
//                                 onClick={() =>
//                                   updateQuantity(item.id, item.quantity + 1)
//                                 }
//                                 disabled={item.quantity >= (item.stock || 99)}
//                               >
//                                 <Plus className="h-3 w-3 md:h-4 md:w-4" />
//                               </Button>
//                             </div>

//                             <p className="font-semibold text-base md:text-lg">
//                               ₹{(item.price * item.quantity).toFixed(2)}
//                             </p>
//                           </div>
//                         </div>

//                         <div className="flex flex-row sm:flex-col items-end justify-between gap-2 sm:gap-4 ml-4 mt-3 sm:mt-0 self-stretch">
//                           <Button
//                             variant="ghost"
//                             size="icon"
//                             onClick={() => removeFromCart(item.id)}
//                             className="h-8 w-8"
//                           >
//                             <Trash2 className="h-4 w-4" />
//                           </Button>

//                           <Button
//                             variant="outline"
//                             size="sm"
//                             onClick={() => moveToSaved(item)}
//                             className="text-xs h-8"
//                           >
//                             <Heart className="h-3 w-3 mr-1 md:mr-2" />
//                             Save
//                           </Button>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </CardContent>
//               </Card>
//             )}

//             {/* Saved for Later */}
//             {savedItems.length > 0 && (
//               <Card className="py-6">
//                 <CardHeader className="pb-3 md:pb-4">
//                   <CardTitle className="text-lg md:text-xl">
//                     Saved for Later ({savedItems.length})
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent className="p-0">
//                   <div className="divide-y">
//                     {savedItems.map((item) => (
//                       <div key={item.id} className="p-4 flex items-start">
//                         <div className="w-12 h-12 md:w-16 md:h-16 bg-muted rounded-md flex items-center justify-center mr-3 md:mr-4 flex-shrink-0 overflow-hidden">
//                           {item.image ? (
//                             <Image
//                               src={item.image}
//                               alt={item.name}
//                               className="w-full h-full object-cover"
//                               width={64}
//                               height={64}
//                             />
//                           ) : (
//                             <div className="text-xs text-muted-foreground">
//                               No Image
//                             </div>
//                           )}
//                         </div>

//                         <div className="flex-1 min-w-0">
//                           <Link href={`/products/${item.slug || item.id}`}>
//                             <h3 className="font-semibold hover:text-primary text-base md:text-lg line-clamp-1">
//                               {item.name}
//                             </h3>
//                           </Link>
//                           <Link href={`/creators/${item.creator.id}`}>
//                             <p className="text-sm text-muted-foreground hover:text-primary mt-1">
//                               By {item.creator.name || "Unknown Creator"}
//                             </p>
//                           </Link>

//                           <p className="font-semibold mt-2 text-base md:text-lg">
//                             ₹{item.price.toFixed(2)}
//                           </p>
//                         </div>

//                         <div className="flex flex-col items-end justify-between gap-2 ml-3 md:ml-4 self-stretch">
//                           <Button
//                             variant="ghost"
//                             size="icon"
//                             onClick={() => removeSaved(item.id)}
//                             className="h-8 w-8"
//                           >
//                             <Trash2 className="h-4 w-4" />
//                           </Button>

//                           <Button
//                             size="sm"
//                             onClick={() => moveToCart(item)}
//                             className="text-xs h-8"
//                           >
//                             Move to cart
//                           </Button>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </CardContent>
//               </Card>
//             )}

//             {/* Continue Shopping */}
//             <div className="mt-6">
//               <Button variant="outline" asChild className="w-full sm:w-auto">
//                 <Link href="/products">
//                   <ArrowLeft className="h-4 w-4 mr-2" />
//                   Continue Shopping
//                 </Link>
//               </Button>
//             </div>
//           </div>

//           {/* Order Summary */}
//           <div className="lg:w-1/3 mt-6 lg:mt-0">
//             <Card className="sticky top-6 py-6">
//               <CardHeader>
//                 <CardTitle className="text-lg md:text-xl">Order Summary</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 {/* Promo Code */}
//                 <div>
//                   <Label htmlFor="promo-code" className="mb-2 block">
//                     Promo Code
//                   </Label>
//                   <div className="flex gap-2">
//                     <Input
//                       id="promo-code"
//                       placeholder="Enter code"
//                       value={promoCode}
//                       onChange={(e) => setPromoCode(e.target.value)}
//                       className="flex-1"
//                     />
//                     <Button variant="outline" size="sm" className="whitespace-nowrap">
//                       Apply
//                     </Button>
//                   </div>
//                 </div>

//                 {/* Gift Wrap */}
//                 <div className="flex items-center space-x-2">
//                   <Checkbox
//                     id="gift-wrap"
//                     checked={giftWrap}
//                     onCheckedChange={(checked) => setGiftWrap(checked === true)}
//                   />
//                   <Label htmlFor="gift-wrap" className="text-sm cursor-pointer">
//                     Add gift wrap (+₹5.99)
//                   </Label>
//                 </div>

//                 {/* Shipping Options */}
//                 <div>
//                   <h3 className="font-medium mb-3 text-sm md:text-base">
//                     Shipping Options
//                   </h3>
//                   <RadioGroup
//                     value={selectedShipping}
//                     onValueChange={setSelectedShipping}
//                     className="space-y-2"
//                   >
//                     {shippingOptions.map((option) => (
//                       <div key={option.id} className="flex items-start space-x-2">
//                         <RadioGroupItem value={option.id} id={option.id} />
//                         <Label
//                           htmlFor={option.id}
//                           className="flex-1 cursor-pointer text-sm"
//                         >
//                           <div className="flex flex-col md:flex-row md:justify-between md:gap-2">
//                             <div className="flex justify-between items-start gap-3">
//                               <span className="font-medium">{option.name}</span>
//                               <span>₹{option.price.toFixed(2)}</span>
//                             </div>
//                             <p className="text-muted-foreground text-xs mt-1">
//                               {option.description}
//                             </p>
//                           </div>
//                         </Label>
//                       </div>
//                     ))}
//                   </RadioGroup>
//                 </div>

//                 {/* Order Totals */}
//                 <div className="space-y-3 border-t pt-4">
//                   <div className="flex justify-between text-sm">
//                     <span>Subtotal</span>
//                     <span>₹{subtotal.toFixed(2)}</span>
//                   </div>

//                   <div className="flex justify-between text-sm">
//                     <span>Shipping</span>
//                     <span>₹{shippingCost.toFixed(2)}</span>
//                   </div>

//                   <div className="flex justify-between text-sm">
//                     <span>Tax</span>
//                     <span>₹{tax.toFixed(2)}</span>
//                   </div>

//                   {giftWrap && (
//                     <div className="flex justify-between text-sm">
//                       <span>Gift Wrap</span>
//                       <span>₹5.99</span>
//                     </div>
//                   )}

//                   <div className="flex justify-between font-semibold text-lg pt-2 border-t">
//                     <span>Total</span>
//                     <span>₹{total.toFixed(2)}</span>
//                   </div>
//                 </div>

//                 {/* Checkout Button */}
//                 <Button className="w-full" size="lg" asChild>
//                   <Link href="/checkout">
//                     <Lock className="h-4 w-4 mr-2" />
//                     Proceed to Checkout
//                   </Link>
//                 </Button>

//                 {/* Security & Trust */}
//                 <div className="flex items-center justify-center text-sm text-muted-foreground">
//                   <Shield className="h-4 w-4 mr-1" />
//                   Secure checkout
//                 </div>

//                 {/* Payment Methods */}
//                 <div className="pt-4 border-t">
//                   <p className="text-sm text-muted-foreground mb-2">We accept:</p>
//                   <div className="flex items-center space-x-2">
//                     <div className="w-8 h-5 bg-muted rounded-sm flex items-center justify-center">
//                       <CreditCard className="h-3 w-3" />
//                     </div>
//                     <div className="text-xs text-muted-foreground">
//                       Credit Cards, PayPal, Apple Pay
//                     </div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Support Info */}
//             <Card className="mt-4 md:mt-6 bg-muted/50 border-0">
//               <CardContent className="p-4 md:p-6">
//                 <h3 className="font-medium mb-2 text-sm md:text-base">
//                   Need help with your order?
//                 </h3>
//                 <p className="text-muted-foreground text-xs md:text-sm mb-3">
//                   Our support team is here to help with any questions about
//                   products or shipping.
//                 </p>
//                 <Button variant="outline" size="sm" className="text-xs md:text-sm">
//                   Contact Support
//                 </Button>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }


// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Checkbox } from "@/components/ui/checkbox";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import Link from "next/link";
// import {
//   Minus,
//   Plus,
//   Trash2,
//   ArrowLeft,
//   Shield,
//   Heart,
//   CreditCard,
//   Lock,
//   ShoppingCart,
// } from "lucide-react";
// import { CartItem, SavedItem, } from "@/lib/types";
// import { shippingOptions } from "@/lib/mock-data";
// import { useCart } from "@/hooks/useCart";

// // interface ShippingOption {
// //   id: string;
// //   name: string;
// //   description: string;
// //   price: number;
// // }

// // Sample cart data
// const cartItems: CartItem[] = [
//   {
//     id: "1",
//     created_at: new Date().toISOString(),
//     updated_at: new Date().toISOString(),
//     name: "Handcrafted Ceramic Mug",
//     price: 28.99,
//     creator: "Earth & Fire Pottery",
//     image: "/placeholder-mug.jpg",
//     quantity: 2,
//     inStock: true,
//   },
//   {
//     id: "2",
//     created_at: new Date().toISOString(),
//     updated_at: new Date().toISOString(),
//     name: "Handwoven Wool Scarf",
//     price: 42.5,
//     creator: "Weaver's Studio",
//     image: "/placeholder-scarf.jpg",
//     quantity: 1,
//     inStock: true,
//   },
//   {
//     id: "3",
//     created_at: new Date().toISOString(),
//     updated_at: new Date().toISOString(),
//     name: "Silver Leaf Earrings",
//     price: 56.0,
//     creator: "Silver Linings Jewelry",
//     image: "/placeholder-earrings.jpg",
//     quantity: 1,
//     inStock: true,
//   },
// ];

// const savedForLater: SavedItem[] = [
//   {
//     id: "4",
//     name: "Coastal Landscape Painting",
//     price: 120.0,
//     creator: "Seaside Art",
//     image: "/placeholder-painting.jpg",
//   },
// ];

// // const shippingOptions: ShippingOption[] = [
// //   {
// //     id: "standard",
// //     name: "Standard Shipping",
// //     description: "5-7 business days",
// //     price: 4.99,
// //   },
// //   {
// //     id: "express",
// //     name: "Express Shipping",
// //     description: "2-3 business days",
// //     price: 9.99,
// //   },
// //   {
// //     id: "priority",
// //     name: "Priority Shipping",
// //     description: "1-2 business days",
// //     price: 14.99,
// //   },
// // ];

// export default function CartPage() {
//   const [items, setItems] = useState<CartItem[]>(cartItems);
//   const [savedItems, setSavedItems] = useState<SavedItem[]>(savedForLater);
//   const [selectedShipping, setSelectedShipping] = useState("standard");
//   const [giftWrap, setGiftWrap] = useState(false);
//   const [promoCode, setPromoCode] = useState("");

//   const { cartItems, addToCart, removeFromCart, updateQuantity } = useCart();


//   const removeItem = (id: string) => {
//     setItems(items.filter((item) => item.id !== id));
//   };

//   const moveToSaved = (item: CartItem) => {
//     const { quantity, inStock, ...savedItem } = item;
//     setItems(items.filter((i) => i.id !== item.id));
//     setSavedItems([...savedItems, savedItem]);
//   };

//   const moveToCart = (item: SavedItem) => {
//     setSavedItems(savedItems.filter((i) => i.id !== item.id));
//     setItems([...items, {
//       ...item, quantity: 1, inStock: true,
//       created_at: "",
//       updated_at: ""
//     }]);
//   };

//   const removeSaved = (id: string) => {
//     setSavedItems(savedItems.filter((item) => item.id !== id));
//   };

//   // Calculate totals
//   const subtotal = items.reduce(
//     (sum, item) => sum + item.price * item.quantity,
//     0
//   );
//   const shippingCost =
//     shippingOptions.find((opt) => opt.id === selectedShipping)?.price || 0;
//   const tax = subtotal * 0.08; // Example tax calculation
//   const total = subtotal + shippingCost + tax + (giftWrap ? 5.99 : 0);

//   if (items.length === 0 && savedItems.length === 0) {
//     return (
//       <div className="min-h-screen bg-background">
//         <main className="container mx-auto px-4 py-8 md:py-12">
//           <div className="text-center max-w-md mx-auto">
//             <div className="w-20 h-20 md:w-24 md:h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
//               <ShoppingCart className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground" />
//             </div>
//             <h1 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Your cart is empty</h1>
//             <p className="text-muted-foreground mb-4 md:mb-6 text-sm md:text-base">
//               Looks like you haven&apos;t added anything to your cart yet. Start
//               shopping to find amazing local products!
//             </p>
//             <Button asChild size="lg">
//               <Link href="/shop">Start Shopping</Link>
//             </Button>
//           </div>
//         </main>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-background">
//       <main className="container mx-auto px-4 py-6 md:py-8">
//         <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Shopping Cart</h1>

//         <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
//           {/* Cart Items */}
//           <div className="lg:w-2/3">
//             {/* Cart Items */}
//             {items.length > 0 && (
//               <Card className="mb-6 md:mb-8 py-6">
//                 <CardHeader className="pb-3 md:pb-4">
//                   <CardTitle className="text-lg md:text-xl">
//                     {items.length} {items.length === 1 ? "Item" : "Items"} in Your Cart
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent className="p-0">
//                   <div className="divide-y">
//                     {items.map((item) => (
//                       <div
//                         key={item.id}
//                         className="p-4 flex flex-col sm:flex-row items-start"
//                       >
//                         <div className="w-16 h-16 md:w-20 md:h-20 bg-muted rounded-md flex items-center justify-center mr-4 mb-3 sm:mb-0 flex-shrink-0">
//                           <div className="text-xs text-muted-foreground">
//                             Image
//                           </div>
//                         </div>

//                         <div className="flex-1 min-w-0">
//                           <Link href={`/product/${item.id}`}>
//                             <h3 className="font-semibold hover:text-primary text-base md:text-lg line-clamp-1">
//                               {item.name}
//                             </h3>
//                           </Link>
//                           <Link
//                             href={`/creator/${item.creator
//                               .replace(/\s+/g, "-")
//                               .toLowerCase()}`}
//                           >
//                             <p className="text-sm text-muted-foreground hover:text-primary mt-1">
//                               By {item.creator}
//                             </p>
//                           </Link>

//                           {!item.inStock && (
//                             <Badge variant="destructive" className="mt-2 text-xs">
//                               Out of stock
//                             </Badge>
//                           )}

//                           <div className="flex items-center justify-between mt-3 md:mt-4">
//                             <div className="flex items-center border rounded-md">
//                               <Button
//                                 variant="ghost"
//                                 size="icon"
//                                 className="h-7 w-7 md:h-8 md:w-8"
//                                 onClick={() =>
//                                   updateQuantity(item.id, item.quantity - 1)
//                                 }
//                               >
//                                 <Minus className="h-3 w-3 md:h-4 md:w-4" />
//                               </Button>
//                               <span className="px-2 py-1 text-sm md:text-base min-w-[2rem] text-center">
//                                 {item.quantity}
//                               </span>
//                               <Button
//                                 variant="ghost"
//                                 size="icon"
//                                 className="h-7 w-7 md:h-8 md:w-8"
//                                 onClick={() =>
//                                   updateQuantity(item.id, item.quantity + 1)
//                                 }
//                               >
//                                 <Plus className="h-3 w-3 md:h-4 md:w-4" />
//                               </Button>
//                             </div>

//                             <p className="font-semibold text-base md:text-lg">
//                               ₹{(item.price * item.quantity).toFixed(2)}
//                             </p>
//                           </div>
//                         </div>

//                         <div className="flex flex-row sm:flex-col items-end justify-between gap-2 sm:gap-4 ml-4 mt-3 sm:mt-0 self-stretch">
//                           <Button
//                             variant="ghost"
//                             size="icon"
//                             onClick={() => removeItem(item.id)}
//                             className="h-8 w-8"
//                           >
//                             <Trash2 className="h-4 w-4" />
//                           </Button>

//                           <Button
//                             variant="outline"
//                             size="sm"
//                             onClick={() => moveToSaved(item)}
//                             className="text-xs h-8"
//                           >
//                             <Heart className="h-3 w-3 mr-1 md:mr-2" />
//                             Save
//                           </Button>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </CardContent>
//               </Card>
//             )}

//             {/* Saved for Later */}
//             {savedItems.length > 0 && (
//               <Card className="py-6">
//                 <CardHeader className="pb-3 md:pb-4">
//                   <CardTitle className="text-lg md:text-xl">
//                     Saved for Later ({savedItems.length})
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent className="p-0">
//                   <div className="divide-y">
//                     {savedItems.map((item) => (
//                       <div key={item.id} className="p-4 flex items-start">
//                         <div className="w-12 h-12 md:w-16 md:h-16 bg-muted rounded-md flex items-center justify-center mr-3 md:mr-4 flex-shrink-0">
//                           <div className="text-xs text-muted-foreground">
//                             Image
//                           </div>
//                         </div>

//                         <div className="flex-1 min-w-0">
//                           <Link href={`/product/${item.id}`}>
//                             <h3 className="font-semibold hover:text-primary text-base md:text-lg line-clamp-1">
//                               {item.name}
//                             </h3>
//                           </Link>
//                           <Link
//                             href={`/creator/${item.creator
//                               .replace(/\s+/g, "-")
//                               .toLowerCase()}`}
//                           >
//                             <p className="text-sm text-muted-foreground hover:text-primary mt-1">
//                               By {item.creator}
//                             </p>
//                           </Link>

//                           <p className="font-semibold mt-2 text-base md:text-lg">
//                             ₹{item.price.toFixed(2)}
//                           </p>
//                         </div>

//                         <div className="flex flex-col items-end justify-between gap-2 ml-3 md:ml-4 self-stretch">
//                           <Button
//                             variant="ghost"
//                             size="icon"
//                             onClick={() => removeSaved(item.id)}
//                             className="h-8 w-8"
//                           >
//                             <Trash2 className="h-4 w-4" />
//                           </Button>

//                           <Button 
//                             size="sm" 
//                             onClick={() => moveToCart(item)}
//                             className="text-xs h-8"
//                           >
//                             Move to cart
//                           </Button>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </CardContent>
//               </Card>
//             )}

//             {/* Continue Shopping */}
//             <div className="mt-6">
//               <Button variant="outline" asChild className="w-full sm:w-auto">
//                 <Link href="/shop">
//                   <ArrowLeft className="h-4 w-4 mr-2" />
//                   Continue Shopping
//                 </Link>
//               </Button>
//             </div>
//           </div>

//           {/* Order Summary */}
//           <div className="lg:w-1/3 mt-6 lg:mt-0">
//             <Card className="sticky top-6 py-6">
//               <CardHeader>
//                 <CardTitle className="text-lg md:text-xl">Order Summary</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 {/* Promo Code */}
//                 <div>
//                   <Label htmlFor="promo-code" className="mb-2 block">
//                     Promo Code
//                   </Label>
//                   <div className="flex gap-2">
//                     <Input
//                       id="promo-code"
//                       placeholder="Enter code"
//                       value={promoCode}
//                       onChange={(e) => setPromoCode(e.target.value)}
//                       className="flex-1"
//                     />
//                     <Button variant="outline" size="sm" className="whitespace-nowrap">
//                       Apply
//                     </Button>
//                   </div>
//                 </div>

//                 {/* Gift Wrap */}
//                 <div className="flex items-center space-x-2">
//                   <Checkbox
//                     id="gift-wrap"
//                     checked={giftWrap}
//                     onCheckedChange={(checked) => setGiftWrap(checked === true)}
//                   />
//                   <Label htmlFor="gift-wrap" className="text-sm cursor-pointer">
//                     Add gift wrap (+₹5.99)
//                   </Label>
//                 </div>

//                 {/* Shipping Options */}
//                 <div>
//                   <h3 className="font-medium mb-3 text-sm md:text-base">Shipping Options</h3>
//                   <RadioGroup
//                     value={selectedShipping}
//                     onValueChange={setSelectedShipping}
//                     className="space-y-2"
//                   >
//                     {shippingOptions.map((option) => (
//                       <div
//                         key={option.id}
//                         className="flex items-start space-x-2"
//                       >
//                         <RadioGroupItem value={option.id} id={option.id} />
//                         <Label htmlFor={option.id} className="flex-1 cursor-pointer text-sm">
//                           <div className="flex flex-col md:flex-row md:justify-between md:gap-2">
//                             <div className="flex justify-between items-start gap-3">
//                               <span className="font-medium">{option.name}</span>
//                               <span>₹{option.price.toFixed(2)}</span>
//                             </div>
//                             <p className="text-muted-foreground text-xs mt-1">
//                               {option.description}
//                             </p>
//                           </div>
//                         </Label>
//                       </div>
//                     ))}
//                   </RadioGroup>
//                 </div>

//                 {/* Order Totals */}
//                 <div className="space-y-3 border-t pt-4">
//                   <div className="flex justify-between text-sm">
//                     <span>Subtotal</span>
//                     <span>₹{subtotal.toFixed(2)}</span>
//                   </div>

//                   <div className="flex justify-between text-sm">
//                     <span>Shipping</span>
//                     <span>₹{shippingCost.toFixed(2)}</span>
//                   </div>

//                   <div className="flex justify-between text-sm">
//                     <span>Tax</span>
//                     <span>₹{tax.toFixed(2)}</span>
//                   </div>

//                   {giftWrap && (
//                     <div className="flex justify-between text-sm">
//                       <span>Gift Wrap</span>
//                       <span>₹5.99</span>
//                     </div>
//                   )}

//                   <div className="flex justify-between font-semibold text-lg pt-2 border-t">
//                     <span>Total</span>
//                     <span>₹{total.toFixed(2)}</span>
//                   </div>
//                 </div>

//                 {/* Checkout Button */}
//                 <Button className="w-full" size="lg">
//                   <Lock className="h-4 w-4 mr-2" />
//                   Proceed to Checkout
//                 </Button>

//                 {/* Security & Trust */}
//                 <div className="flex items-center justify-center text-sm text-muted-foreground">
//                   <Shield className="h-4 w-4 mr-1" />
//                   Secure checkout
//                 </div>

//                 {/* Payment Methods */}
//                 <div className="pt-4 border-t">
//                   <p className="text-sm text-muted-foreground mb-2">We accept:</p>
//                   <div className="flex items-center space-x-2">
//                     <div className="w-8 h-5 bg-muted rounded-sm flex items-center justify-center">
//                       <CreditCard className="h-3 w-3" />
//                     </div>
//                     <div className="text-xs text-muted-foreground">
//                       Credit Cards, PayPal, Apple Pay
//                     </div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Support Info */}
//             <Card className="mt-4 md:mt-6 bg-muted/50 border-0">
//               <CardContent className="p-4 md:p-6">
//                 <h3 className="font-medium mb-2 text-sm md:text-base">Need help with your order?</h3>
//                 <p className="text-muted-foreground text-xs md:text-sm mb-3">
//                   Our support team is here to help with any questions about
//                   products or shipping.
//                 </p>
//                 <Button variant="outline" size="sm" className="text-xs md:text-sm">
//                   Contact Support
//                 </Button>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }