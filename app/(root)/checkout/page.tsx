"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  CreditCard,
  Truck,
  MapPin,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type CheckoutStep = "address" | "payment" | "review";

interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  type: "card" | "upi" | "netbanking" | "cod";
  icon: React.ReactNode;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: "card",
    name: "Credit/Debit Card",
    type: "card",
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    id: "upi",
    name: "UPI",
    type: "upi",
    icon: <span className="text-sm font-bold">₹</span>,
  },
  {
    id: "netbanking",
    name: "Net Banking",
    type: "netbanking",
    icon: <span className="text-sm font-bold">🏦</span>,
  },
  {
    id: "cod",
    name: "Cash on Delivery",
    type: "cod",
    icon: <span className="text-sm font-bold">💵</span>,
  },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const { cartItems, cartTotal, cartCount, clearCart } = useCart();

  const [currentStep, setCurrentStep] = useState<CheckoutStep>("address");
  const [isProcessing, setIsProcessing] = useState(false);

  // Shipping address state
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });

  // Payment state
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("card");
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);

  // Redirect if not authenticated
  useEffect(() => {
    if (!session) {
      router.push("/auth?redirect=/checkout");
    }
  }, [session, router]);

  // Redirect if cart is empty
  useEffect(() => {
    if (session && cartCount === 0) {
      router.push("/cart");
    }
  }, [cartCount, session, router]);

  // Calculate totals
  const subtotal = cartTotal;
  const shipping = subtotal > 500 ? 0 : 50;
  const tax = subtotal * 0.18; // 18% GST
  const total = subtotal + shipping + tax - discount;

  // Group cart items by creator
  // const itemsByCreator = useMemo(() => {
  //   const grouped = new Map<string, typeof cartItems>();
  //   cartItems.forEach((item) => {
  //     const creatorId = item.creator.id;
  //     if (!grouped.has(creatorId)) {
  //       grouped.set(creatorId, []);
  //     }
  //     grouped.get(creatorId)!.push(item);
  //   });
  //   return grouped;
  // }, [cartItems]);

  // Validate address
  const isAddressValid = () => {
    return (
      shippingAddress.fullName &&
      shippingAddress.phone &&
      shippingAddress.addressLine1 &&
      shippingAddress.city &&
      shippingAddress.state &&
      shippingAddress.pincode &&
      shippingAddress.pincode.length === 6
    );
  };

  // Handle address form change
  const handleAddressChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress((prev) => ({ ...prev, [field]: value }));
  };

  // Apply coupon
  const applyCoupon = () => {
    if (couponCode.toUpperCase() === "SAVE10") {
      setDiscount(subtotal * 0.1);
      toast.success("Coupon applied!", {
        description: "You saved 10% on your order",
      });
    } else {
      toast.error("Invalid coupon code");
    }
  };

  // Place order
  const placeOrder = async () => {
    setIsProcessing(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
            variantId: item.variantId,
          })),
          shippingAddress,
          paymentMethod: selectedPaymentMethod,
          subtotal,
          shipping,
          tax,
          discount,
          total,
          couponCode: discount > 0 ? couponCode : null,
        }),
      });

      if (!response.ok) throw new Error("Failed to create order");

      const data: { orderId: string } = await response.json();

      // Clear cart
      clearCart();

      // Redirect to success page
      router.push(`/orders/${data.orderId}?success=true`);

      toast.success("Order placed successfully!", {
        description: `Order ID: ${data.orderId}`,
      });
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Failed to place order", {
        description: "Please try again or contact support",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Loading state
  if (isPending) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <Skeleton className="h-8 w-64 mb-8" />
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-96" />
              </div>
              <div>
                <Skeleton className="h-96" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cartCount === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/cart">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Checkout</h1>
              <p className="text-muted-foreground">
                Complete your purchase securely
              </p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mb-14">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              {[
                { id: "address", label: "Address", icon: MapPin },
                { id: "payment", label: "Payment", icon: CreditCard },
                { id: "review", label: "Review", icon: CheckCircle2 },
              ].map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1 relative">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors",
                        currentStep === step.id
                          ? "bg-primary text-primary-foreground border-primary"
                          : index <
                            ["address", "payment", "review"].indexOf(
                              currentStep
                            )
                          ? "bg-primary/20 border-primary text-primary"
                          : "bg-muted border-muted-foreground/20"
                      )}
                    >
                      <step.icon className="h-5 w-5" />
                    </div>
                    <p
                      className={cn(
                        "text-sm mt-2 absolute -bottom-6",
                        currentStep === step.id
                          ? "font-semibold"
                          : "text-muted-foreground"
                      )}
                    >
                      {step.label}
                    </p>
                  </div>
                  {index < 2 && (
                    <div
                      className={cn(
                        "h-0.5 flex-1 mx-4",
                        index <
                          ["address", "payment", "review"].indexOf(currentStep)
                          ? "bg-primary"
                          : "bg-muted"
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Address Step */}
              {currentStep === "address" && (
                <Card className="py-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Shipping Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input
                          id="fullName"
                          value={shippingAddress.fullName}
                          onChange={(e) =>
                            handleAddressChange("fullName", e.target.value)
                          }
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={shippingAddress.phone}
                          onChange={(e) =>
                            handleAddressChange("phone", e.target.value)
                          }
                          placeholder="+91 9876543210"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="addressLine1">Address Line 1 *</Label>
                      <Input
                        id="addressLine1"
                        value={shippingAddress.addressLine1}
                        onChange={(e) =>
                          handleAddressChange("addressLine1", e.target.value)
                        }
                        placeholder="House no., Street name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="addressLine2">
                        Address Line 2 (Optional)
                      </Label>
                      <Input
                        id="addressLine2"
                        value={shippingAddress.addressLine2}
                        onChange={(e) =>
                          handleAddressChange("addressLine2", e.target.value)
                        }
                        placeholder="Apartment, suite, etc."
                      />
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          value={shippingAddress.city}
                          onChange={(e) =>
                            handleAddressChange("city", e.target.value)
                          }
                          placeholder="Mumbai"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State *</Label>
                        <Input
                          id="state"
                          value={shippingAddress.state}
                          onChange={(e) =>
                            handleAddressChange("state", e.target.value)
                          }
                          placeholder="Maharashtra"
                        />
                      </div>
                      <div>
                        <Label htmlFor="pincode">Pincode *</Label>
                        <Input
                          id="pincode"
                          value={shippingAddress.pincode}
                          onChange={(e) =>
                            handleAddressChange("pincode", e.target.value)
                          }
                          placeholder="400001"
                          maxLength={6}
                        />
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      onClick={() => setCurrentStep("payment")}
                      disabled={!isAddressValid()}
                    >
                      Continue to Payment
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Payment Step */}
              {currentStep === "payment" && (
                <Card className="py-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Payment Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <RadioGroup
                      value={selectedPaymentMethod}
                      onValueChange={setSelectedPaymentMethod}
                    >
                      {paymentMethods.map((method) => (
                        <div
                          key={method.id}
                          className={cn(
                            "flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-colors",
                            selectedPaymentMethod === method.id
                              ? "border-primary bg-primary/5"
                              : "border-input hover:border-primary/50"
                          )}
                          onClick={() => setSelectedPaymentMethod(method.id)}
                        >
                          <RadioGroupItem value={method.id} id={method.id} />
                          <Label
                            htmlFor={method.id}
                            className="flex items-center gap-3 cursor-pointer flex-1"
                          >
                            {method.icon}
                            <span className="font-medium">{method.name}</span>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>

                    {/* Coupon Code */}
                    <div>
                      <Label htmlFor="coupon">Coupon Code</Label>
                      <div className="flex gap-2">
                        <Input
                          id="coupon"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="Enter coupon code"
                        />
                        <Button variant="outline" onClick={applyCoupon}>
                          Apply
                        </Button>
                      </div>
                      {discount > 0 && (
                        <p className="text-sm text-green-600 mt-2">
                          ✓ Coupon applied! You saved ₹{discount.toFixed(2)}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentStep("address")}
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={() => setCurrentStep("review")}
                        className="flex-1"
                      >
                        Review Order
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Review Step */}
              {currentStep === "review" && (
                <>
                  <Card className="py-6">
                    <CardHeader>
                      <CardTitle>Review Your Order</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Shipping Address Review */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Shipping Address
                          </h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentStep("address")}
                          >
                            Edit
                          </Button>
                        </div>
                        <div className="bg-muted/50 p-4 rounded-lg text-sm space-y-1">
                          <p className="font-medium">
                            {shippingAddress.fullName}
                          </p>
                          <p>{shippingAddress.phone}</p>
                          <p>{shippingAddress.addressLine1}</p>
                          {shippingAddress.addressLine2 && (
                            <p>{shippingAddress.addressLine2}</p>
                          )}
                          <p>
                            {shippingAddress.city}, {shippingAddress.state} -{" "}
                            {shippingAddress.pincode}
                          </p>
                          <p>{shippingAddress.country}</p>
                        </div>
                      </div>

                      {/* Payment Method Review */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Payment Method
                          </h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentStep("payment")}
                          >
                            Edit
                          </Button>
                        </div>
                        <div className="bg-muted/50 p-4 rounded-lg">
                          <p className="font-medium">
                            {
                              paymentMethods.find(
                                (m) => m.id === selectedPaymentMethod
                              )?.name
                            }
                          </p>
                        </div>
                      </div>

                      <Button
                        className="w-full"
                        size="lg"
                        onClick={placeOrder}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-5 w-5 mr-2" />
                            Place Order - ₹{total.toFixed(2)}
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div>
              <Card className="sticky top-4 py-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    Order Summary ({cartCount} items)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Cart Items */}
                  <div className="space-y-3 max-h-64 overflow-y-auto py-5">
                    {cartItems.map((item) => (
                      <div
                        key={`${item.id}-${item.variantId}`}
                        className="flex gap-3"
                      >
                        <div className="relative w-16 h-16 bg-muted rounded shrink-0">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover rounded"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                              No image
                            </div>
                          )}
                          <Badge
                            variant="secondary"
                            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                          >
                            {item.quantity}
                          </Badge>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm line-clamp-1">
                            {item.name}
                          </p>
                          {item.variantName && (
                            <p className="text-xs text-muted-foreground">
                              {item.variantName}
                            </p>
                          )}
                          <p className="text-sm font-semibold mt-1">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Price Breakdown */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Tax (GST 18%)
                      </span>
                      <span>₹{tax.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-₹{discount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Total */}
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>

                  {/* Free shipping notice */}
                  {shipping > 0 && (
                    <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg flex items-start gap-2">
                      <Truck className="h-4 w-4 text-blue-600 mt-0.5" />
                      <p className="text-xs text-blue-900 dark:text-blue-100">
                        Add ₹{(500 - subtotal).toFixed(2)} more to get{" "}
                        <strong>FREE shipping</strong>
                      </p>
                    </div>
                  )}

                  {/* Security Notice */}
                  <div className="bg-muted/50 p-3 rounded-lg flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                      Your payment information is secure and encrypted
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
