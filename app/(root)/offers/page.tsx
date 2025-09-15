"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { 
  Tag, 
  Clock, 
  Flame, 
  Star, 
  Calendar,
  ArrowRight,
  Shield,
  Truck,
  Gift,
  Sparkles,
  Zap,
  Mail
} from "lucide-react";

interface Offer {
  id: number;
  title: string;
  discount: string;
  code?: string;
  description: string;
  category: string;
  expires?: string;
  starts?: string;
  minPurchase: number;
  products: string[];
  featured: boolean;
}

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
}

export default function OffersPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [email, setEmail] = useState("");

  const currentOffers: Offer[] = [
    {
      id: 1,
      title: "Summer Collection Sale",
      discount: "25% OFF",
      code: "SUMMER25",
      description: "Get 25% off all summer-themed items. Perfect for beach days and outdoor adventures.",
      category: "seasonal",
      expires: "2023-08-31",
      minPurchase: 50,
      products: ["clothing", "accessories", "home"],
      featured: true
    },
    {
      id: 2,
      title: "Free Shipping Weekend",
      discount: "FREE SHIPPING",
      code: "SHIPFREE",
      description: "Enjoy free shipping on all orders with no minimum purchase required.",
      category: "shipping",
      expires: "2023-07-16",
      minPurchase: 0,
      products: ["all"],
      featured: true
    },
    {
      id: 3,
      title: "New Creator Welcome",
      discount: "15% OFF",
      code: "WELCOME15",
      description: "Welcome our newest creators with 15% off their debut collections.",
      category: "new",
      expires: "2023-07-31",
      minPurchase: 35,
      products: ["all"],
      featured: false
    },
    {
      id: 4,
      title: "Handmade Jewelry Event",
      discount: "30% OFF",
      code: "JEWEL30",
      description: "Sparkling deals on handcrafted jewelry from independent artisans.",
      category: "jewelry",
      expires: "2023-07-25",
      minPurchase: 75,
      products: ["jewelry"],
      featured: true
    }
  ];

  const upcomingOffers: Offer[] = [
    {
      id: 5,
      title: "Back to School Special",
      discount: "20% OFF",
      description: "Get ready for school with unique supplies and accessories.",
      category: "seasonal",
      starts: "2023-08-15",
      minPurchase: 0,
      products: ["stationery", "accessories"],
      featured: false
    },
    {
      id: 6,
      title: "Fall Home Decor Launch",
      discount: "BUY 1 GET 1 50% OFF",
      description: "Cozy up your space with new fall home collections.",
      category: "home",
      starts: "2023-09-01",
      minPurchase: 0,
      products: ["home"],
      featured: false
    }
  ];

  const categories: Category[] = [
    { id: "all", name: "All Offers", icon: <Tag className="h-4 w-4" /> },
    { id: "featured", name: "Featured", icon: <Star className="h-4 w-4" /> },
    { id: "seasonal", name: "Seasonal", icon: <Calendar className="h-4 w-4" /> },
    { id: "shipping", name: "Shipping", icon: <Truck className="h-4 w-4" /> },
    { id: "new", name: "New Arrivals", icon: <Sparkles className="h-4 w-4" /> }
  ];

  const filteredOffers = activeTab === "all" 
    ? currentOffers 
    : activeTab === "featured"
    ? currentOffers.filter(offer => offer.featured)
    : currentOffers.filter(offer => offer.category === activeTab);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-3">Special Offers & Promotions</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Discover amazing deals and limited-time promotions from our talented creators
          </p>
        </div>

        {/* Promo Banner */}
        <Card className="bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 mb-8">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center">
                <Zap className="h-6 w-6 md:h-8 md:w-8 mr-3 md:mr-4" />
                <div>
                  <h2 className="text-lg md:text-xl font-bold">Flash Sale happening now!</h2>
                  <p className="text-amber-100 text-sm md:text-base">Select items up to 50% off - ends tonight at midnight</p>
                </div>
              </div>
              <Button asChild variant="secondary" size="sm" className="text-sm md:text-base">
                <Link href="/flash-sale">
                  Shop Now
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Category Tabs */}
        <div className="mb-6 md:mb-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex flex-wrap h-auto p-1 bg-muted">
              {categories.map((category) => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id}
                  className="flex items-center text-xs md:text-sm px-3 py-2 data-[state=active]:bg-background"
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Current Offers Grid */}
        <div className="mb-12 md:mb-16">
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 flex items-center">
            <Flame className="h-5 w-5 md:h-6 md:w-6 mr-2 md:mr-3 text-orange-500" />
            Current Offers
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            {filteredOffers.map((offer) => (
              <Card key={offer.id} className={`group hover:shadow-lg transition h-fit ${
                offer.featured ? "ring-2 ring-amber-500" : ""
              }`}>
                <CardContent className="p-4 md:p-6">
                  {offer.featured && (
                    <Badge className="mb-3 bg-amber-500 text-amber-950">
                      <Star className="h-3 w-3 mr-1 fill-amber-950" />
                      Featured
                    </Badge>
                  )}
                  
                  <div className="flex items-start justify-between mb-3 md:mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg md:text-xl font-semibold mb-2 line-clamp-1">{offer.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge variant="default" className="text-sm">
                          {offer.discount}
                        </Badge>
                        {offer.code && (
                          <Badge variant="secondary" className="text-sm font-mono">
                            Code: {offer.code}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground text-sm md:text-base mb-4">{offer.description}</p>
                  
                  <div className="space-y-2 mb-4 md:mb-6 text-sm">
                    {offer.expires && (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                        <span>Expires: {formatDate(offer.expires)}</span>
                      </div>
                    )}
                    
                    {offer.minPurchase > 0 && (
                      <div className="text-muted-foreground">
                        Minimum purchase: ₹{offer.minPurchase}
                      </div>
                    )}
                    
                    <div className="flex items-center text-muted-foreground">
                      <span>Applies to: </span>
                      <span className="ml-1 font-medium">
                        {offer.products[0] === "all" ? "All products" : offer.products.join(", ")}
                      </span>
                    </div>
                  </div>
                  
                  <Button asChild className="w-full text-sm md:text-base">
                    <Link href={`/shop?promo=${offer.code}`}>
                      Shop This Offer
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Upcoming Offers */}
        <div className="mb-12 md:mb-16">
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 flex items-center">
            <Calendar className="h-5 w-5 md:h-6 md:w-6 mr-2 md:mr-3 text-primary" />
            Coming Soon
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            {upcomingOffers.map((offer) => (
              <Card key={offer.id} className="bg-muted/30 border-dashed">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-start justify-between mb-3 md:mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg md:text-xl font-semibold mb-2">{offer.title}</h3>
                      <Badge variant="outline" className="text-sm">
                        {offer.discount}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground text-sm md:text-base mb-4">{offer.description}</p>
                  
                  <div className="space-y-2 mb-4 md:mb-6 text-sm">
                    {offer.starts && (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                        <span>Starts: {formatDate(offer.starts)}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center text-muted-foreground">
                      <span>Applies to: </span>
                      <span className="ml-1 font-medium">{offer.products.join(", ")}</span>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full text-sm md:text-base" disabled>
                    <Clock className="h-4 w-4 mr-2" />
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* How to Use Offers */}
        <Card className="bg-muted/50 border-0 mb-12 md:mb-16">
          <CardContent className="p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-bold text-center mb-6 md:mb-8">How to Use Offers</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
              {[1, 2, 3].map((step) => (
                <div key={step} className="text-center">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-primary rounded-full flex items-center justify-center text-background mx-auto mb-3 md:mb-4">
                    <span className="font-bold text-sm md:text-base">{step}</span>
                  </div>
                  <h3 className="font-semibold text-sm md:text-base mb-2">
                    {step === 1 && "Shop Eligible Items"}
                    {step === 2 && "Enter Promo Code"}
                    {step === 3 && "Enjoy Your Savings"}
                  </h3>
                  <p className="text-muted-foreground text-xs md:text-sm">
                    {step === 1 && "Add products that qualify for the promotion to your cart"}
                    {step === 2 && "Apply the discount code at checkout before completing your purchase"}
                    {step === 3 && "See the discount applied instantly and complete your order"}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Terms & Benefits */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-8 mb-12 md:mb-16">
          <Card>
            <CardContent className="p-4 md:p-6">
              <h3 className="font-semibold text-base md:text-lg mb-3 md:mb-4 flex items-center">
                <Shield className="h-4 w-4 md:h-5 md:w-5 text-green-600 mr-2" />
                Offer Terms
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Offers cannot be combined with other promotions</li>
                <li>• Discounts apply to qualifying items only</li>
                <li>• Shipping offers may exclude certain locations</li>
                <li>• All offers are subject to expiration dates</li>
                <li>• Creators may opt out of specific promotions</li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 md:p-6">
              <h3 className="font-semibold text-base md:text-lg mb-3 md:mb-4 flex items-center">
                <Gift className="h-4 w-4 md:h-5 md:w-5 text-amber-600 mr-2" />
                Why Shop During Offers
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Support creators while enjoying great deals</li>
                <li>• Perfect time to try new artists and products</li>
                <li>• Seasonal collections at special prices</li>
                <li>• Limited edition items often available</li>
                <li>• Early access to new collections</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Newsletter Signup */}
        <Card className="bg-gradient-to-r from-primary to-purple-700 text-white border-0">
          <CardContent className="p-6 md:p-8 text-center">
            <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Never Miss a Deal</h2>
            <p className="text-sm md:text-base mb-4 md:mb-6 max-w-2xl mx-auto">
              Join our newsletter and be the first to know about new offers, flash sales, 
              and exclusive promotions from your favorite creators.
            </p>
            
            <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 text-white placeholder:text-white h-10 md:h-11 dark:bg-background/30"
              />
              <Button className="bg-white text-primary dark:text-black hover:bg-gray-100 whitespace-nowrap h-10 md:h-11 text-sm md:text-base">
                <Mail className="h-4 w-4 mr-2" />
                Subscribe
              </Button>
            </div>
            
            <p className="text-xs md:text-sm mt-3 md:mt-4">
              You can unsubscribe at any time. We respect your privacy.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import Link from "next/link";
// import { 
//   Tag, 
//   Clock, 
//   Flame, 
//   Star, 
//   Calendar,
//   ArrowRight,
//   Shield,
//   Truck,
//   Gift,
//   Sparkles,
//   Zap
// } from "lucide-react";

// export default function OffersPage() {
//   const [activeTab, setActiveTab] = useState("all");

//   const currentOffers = [
//     {
//       id: 1,
//       title: "Summer Collection Sale",
//       discount: "25% OFF",
//       code: "SUMMER25",
//       description: "Get 25% off all summer-themed items. Perfect for beach days and outdoor adventures.",
//       category: "seasonal",
//       expires: "2023-08-31",
//       minPurchase: 50,
//       products: ["clothing", "accessories", "home"],
//       featured: true
//     },
//     {
//       id: 2,
//       title: "Free Shipping Weekend",
//       discount: "FREE SHIPPING",
//       code: "SHIPFREE",
//       description: "Enjoy free shipping on all orders with no minimum purchase required.",
//       category: "shipping",
//       expires: "2023-07-16",
//       minPurchase: 0,
//       products: ["all"],
//       featured: true
//     },
//     {
//       id: 3,
//       title: "New Creator Welcome",
//       discount: "15% OFF",
//       code: "WELCOME15",
//       description: "Welcome our newest creators with 15% off their debut collections.",
//       category: "new",
//       expires: "2023-07-31",
//       minPurchase: 35,
//       products: ["all"],
//       featured: false
//     },
//     {
//       id: 4,
//       title: "Handmade Jewelry Event",
//       discount: "30% OFF",
//       code: "JEWEL30",
//       description: "Sparkling deals on handcrafted jewelry from independent artisans.",
//       category: "jewelry",
//       expires: "2023-07-25",
//       minPurchase: 75,
//       products: ["jewelry"],
//       featured: true
//     }
//   ];

//   const upcomingOffers = [
//     {
//       id: 5,
//       title: "Back to School Special",
//       discount: "20% OFF",
//       description: "Get ready for school with unique supplies and accessories.",
//       category: "seasonal",
//       starts: "2023-08-15",
//       products: ["stationery", "accessories"]
//     },
//     {
//       id: 6,
//       title: "Fall Home Decor Launch",
//       discount: "BUY 1 GET 1 50% OFF",
//       description: "Cozy up your space with new fall home collections.",
//       category: "home",
//       starts: "2023-09-01",
//       products: ["home"]
//     }
//   ];

//   const categories = [
//     { id: "all", name: "All Offers", icon: <Tag className="h-4 w-4" /> },
//     { id: "featured", name: "Featured", icon: <Star className="h-4 w-4" /> },
//     { id: "seasonal", name: "Seasonal", icon: <Calendar className="h-4 w-4" /> },
//     { id: "shipping", name: "Shipping", icon: <Truck className="h-4 w-4" /> },
//     { id: "new", name: "New Arrivals", icon: <Sparkles className="h-4 w-4" /> }
//   ];

//   const filteredOffers = activeTab === "all" 
//     ? currentOffers 
//     : activeTab === "featured"
//     ? currentOffers.filter(offer => offer.featured)
//     : currentOffers.filter(offer => offer.category === activeTab);

//   return (
//     <div className="min-h-screen bg-background">
//       <main className="container mx-auto px-4 py-8">
//         {/* Header */}
//         <div className="text-center mb-12">
//           <h1 className="text-3xl font-bold mb-4">Special Offers & Promotions</h1>
//           <p className="text-muted-foreground text-lg">
//             Discover amazing deals and limited-time promotions from our talented creators
//           </p>
//         </div>

//         {/* Promo Banner */}
//         <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl p-6 mb-12">
//           <div className="flex flex-col md:flex-row items-center justify-between">
//             <div className="flex items-center mb-4 md:mb-0">
//               <Zap className="h-8 w-8 mr-4" />
//               <div>
//                 <h2 className="text-xl font-bold">Flash Sale happening now!</h2>
//                 <p className="text-amber-100">Select items up to 50% off - ends tonight at midnight</p>
//               </div>
//             </div>
//             <Button asChild variant="secondary">
//               <Link href="/flash-sale">
//                 Shop Now
//                 <ArrowRight className="h-4 w-4 ml-2" />
//               </Link>
//             </Button>
//           </div>
//         </div>

//         {/* Category Tabs */}
//         <div className="mb-8">
//           <div className="flex flex-wrap gap-2">
//             {categories.map((category) => (
//               <Button
//                 key={category.id}
//                 variant={activeTab === category.id ? "default" : "outline"}
//                 onClick={() => setActiveTab(category.id)}
//                 className="flex items-center"
//               >
//                 {category.icon}
//                 <span className="ml-2">{category.name}</span>
//               </Button>
//             ))}
//           </div>
//         </div>

//         {/* Current Offers Grid */}
//         <div className="mb-16">
//           <h2 className="text-2xl font-bold mb-6 flex items-center">
//             <Flame className="h-6 w-6 mr-3 text-orange-500" />
//             Current Offers
//           </h2>
          
//           <div className="grid md:grid-cols-2 gap-6">
//             {filteredOffers.map((offer) => (
//               <div key={offer.id} className={`bg-card rounded-xl border p-6 group hover:shadow-lg transition ${
//                 offer.featured ? "ring-2 ring-amber-500" : ""
//               }`}>
//                 {offer.featured && (
//                   <div className="flex items-center text-amber-600 mb-3">
//                     <Star className="h-4 w-4 fill-amber-500 mr-1" />
//                     <span className="text-sm font-medium">Featured</span>
//                   </div>
//                 )}
                
//                 <div className="flex items-start justify-between mb-4">
//                   <div>
//                     <h3 className="text-xl font-semibold mb-2">{offer.title}</h3>
//                     <div className="flex items-center mb-3">
//                       <span className="bg-gradient-to-r from-primary to-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
//                         {offer.discount}
//                       </span>
//                       {offer.code && (
//                         <span className="ml-3 bg-muted px-3 py-1 rounded-full text-sm font-mono">
//                           Code: {offer.code}
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                 </div>
                
//                 <p className="text-muted-foreground mb-4">{offer.description}</p>
                
//                 <div className="space-y-2 mb-6">
//                   <div className="flex items-center text-sm">
//                     <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
//                     <span>Expires: {new Date(offer.expires).toLocaleDateString()}</span>
//                   </div>
                  
//                   {offer.minPurchase > 0 && (
//                     <div className="text-sm text-muted-foreground">
//                       Minimum purchase: ${offer.minPurchase}
//                     </div>
//                   )}
                  
//                   <div className="flex items-center text-sm text-muted-foreground">
//                     <span>Applies to: </span>
//                     <span className="ml-1 font-medium">
//                       {offer.products[0] === "all" ? "All products" : offer.products.join(", ")}
//                     </span>
//                   </div>
//                 </div>
                
//                 <Button asChild className="w-full">
//                   <Link href={`/shop?promo=${offer.code}`}>
//                     Shop This Offer
//                     <ArrowRight className="h-4 w-4 ml-2" />
//                   </Link>
//                 </Button>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Upcoming Offers */}
//         <div className="mb-16">
//           <h2 className="text-2xl font-bold mb-6 flex items-center">
//             <Calendar className="h-6 w-6 mr-3 text-primary" />
//             Coming Soon
//           </h2>
          
//           <div className="grid md:grid-cols-2 gap-6">
//             {upcomingOffers.map((offer) => (
//               <div key={offer.id} className="bg-muted/30 rounded-xl border border-dashed p-6">
//                 <div className="flex items-start justify-between mb-4">
//                   <div>
//                     <h3 className="text-xl font-semibold mb-2">{offer.title}</h3>
//                     <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
//                       {offer.discount}
//                     </span>
//                   </div>
//                 </div>
                
//                 <p className="text-muted-foreground mb-4">{offer.description}</p>
                
//                 <div className="space-y-2 mb-6">
//                   <div className="flex items-center text-sm">
//                     <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
//                     <span>Starts: {new Date(offer.starts).toLocaleDateString()}</span>
//                   </div>
                  
//                   <div className="flex items-center text-sm text-muted-foreground">
//                     <span>Applies to: </span>
//                     <span className="ml-1 font-medium">{offer.products.join(", ")}</span>
//                   </div>
//                 </div>
                
//                 <Button variant="outline" className="w-full" disabled>
//                   <Clock className="h-4 w-4 mr-2" />
//                   Coming Soon
//                 </Button>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* How to Use Offers */}
//         <div className="bg-primary-50 rounded-xl p-8 mb-16">
//           <h2 className="text-2xl font-bold text-center mb-8">How to Use Offers</h2>
          
//           <div className="grid md:grid-cols-3 gap-8">
//             <div className="text-center">
//               <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white mx-auto mb-4">
//                 <span className="font-bold">1</span>
//               </div>
//               <h3 className="font-semibold mb-2">Shop Eligible Items</h3>
//               <p className="text-muted-foreground text-sm">
//                 Add products that qualify for the promotion to your cart
//               </p>
//             </div>
            
//             <div className="text-center">
//               <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white mx-auto mb-4">
//                 <span className="font-bold">2</span>
//               </div>
//               <h3 className="font-semibold mb-2">Enter Promo Code</h3>
//               <p className="text-muted-foreground text-sm">
//                 Apply the discount code at checkout before completing your purchase
//               </p>
//             </div>
            
//             <div className="text-center">
//               <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white mx-auto mb-4">
//                 <span className="font-bold">3</span>
//               </div>
//               <h3 className="font-semibold mb-2">Enjoy Your Savings</h3>
//               <p className="text-muted-foreground text-sm">
//                 See the discount applied instantly and complete your order
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Terms & Benefits */}
//         <div className="grid md:grid-cols-2 gap-8 mb-16">
//           <div className="bg-card rounded-xl border p-6">
//             <h3 className="font-semibold mb-4 flex items-center">
//               <Shield className="h-5 w-5 text-green-600 mr-2" />
//               Offer Terms
//             </h3>
//             <ul className="space-y-2 text-sm text-muted-foreground">
//               <li>• Offers cannot be combined with other promotions</li>
//               <li>• Discounts apply to qualifying items only</li>
//               <li>• Shipping offers may exclude certain locations</li>
//               <li>• All offers are subject to expiration dates</li>
//               <li>• Creators may opt out of specific promotions</li>
//             </ul>
//           </div>
          
//           <div className="bg-card rounded-xl border p-6">
//             <h3 className="font-semibold mb-4 flex items-center">
//               <Gift className="h-5 w-5 text-amber-600 mr-2" />
//               Why Shop During Offers
//             </h3>
//             <ul className="space-y-2 text-sm text-muted-foreground">
//               <li>• Support creators while enjoying great deals</li>
//               <li>• Perfect time to try new artists and products</li>
//               <li>• Seasonal collections at special prices</li>
//               <li>• Limited edition items often available</li>
//               <li>• Early access to new collections</li>
//             </ul>
//           </div>
//         </div>

//         {/* Newsletter Signup */}
//         <div className="bg-gradient-to-r from-primary to-purple-700 text-white rounded-xl p-8 text-center">
//           <h2 className="text-2xl font-bold mb-4">Never Miss a Deal</h2>
//           <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
//             Join our newsletter and be the first to know about new offers, flash sales, 
//             and exclusive promotions from your favorite creators.
//           </p>
          
//           <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-2">
//             <input
//               type="email"
//               placeholder="Enter your email"
//               className="flex-1 px-4 py-2 rounded-lg text-gray-900"
//             />
//             <Button className="bg-white text-primary-700 hover:bg-gray-100 whitespace-nowrap">
//               Subscribe
//             </Button>
//           </div>
          
//           <p className="text-primary-200 text-sm mt-4">
//             You can unsubscribe at any time. We respect your privacy.
//           </p>
//         </div>
//       </main>
//     </div>
//   );
// }