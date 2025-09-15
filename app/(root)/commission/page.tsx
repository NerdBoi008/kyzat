"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  DollarSign, 
  Calculator, 
  PieChart,
  TrendingUp,
  Shield,
  Zap,
  HelpCircle,
  CheckCircle,
  XCircle,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Types
interface SaleCalculation {
  amount: number;
  commission: number;
  earnings: number;
}

interface PricingExample {
  price: number;
  name: string;
}

interface ValueProp {
  icon: React.ReactNode;
  title: string;
  description: string;
}

// Calculate earnings based on sale amount
const calculateEarnings = (amount: number): SaleCalculation => {
  const commission = amount * 0.15;
  const earnings = amount - commission;
  return { amount, commission, earnings };
};

// Main component
export default function CommissionPage() {
  const [calculatorAmount, setCalculatorAmount] = useState<number>(50);

  const pricingExamples: PricingExample[] = [
    { price: 25, name: "Small Item" },
    { price: 50, name: "Medium Item" },
    { price: 100, name: "Large Item" },
    { price: 200, name: "Premium Item" }
  ];

  const valueProps: ValueProp[] = [
    {
      icon: <TrendingUp className="h-8 w-8 text-primary" />,
      title: "Growing Customer Base",
      description: "Access thousands of customers actively looking for handmade, unique products"
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "Secure Payment Processing",
      description: "We handle all payment security, fraud protection, and chargebacks"
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "Marketing & Exposure",
      description: "Featured in our newsletters, social media, and seasonal campaigns"
    }
  ];

  const whatIncluded = [
    "Payment processing fees",
    "Platform maintenance and updates",
    "Customer support",
    "Marketing and advertising",
    "Secure hosting and infrastructure",
    "Seller protection program"
  ];

  const whatNotIncluded = [
    "Shipping costs (set by you)",
    "Material costs",
    "Local taxes (your responsibility)",
    "Transaction fees from other payment methods"
  ];

  const calculatedSale = calculateEarnings(calculatorAmount);

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-4">Transparent Pricing</h1>
            <p className="text-muted-foreground text-lg">
              Simple, fair commission structure with no hidden fees
            </p>
          </div>

          {/* Hero Section */}
          <Card className="bg-gradient-to-r from-primary to-purple-700 text-white border-0 mb-12 text-center py-6">
            <CardHeader>
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-center mb-4">
                  <div className="text-center mr-6">
                    <div className="text-5xl font-bold">15%</div>
                    <div className="">Commission Fee</div>
                  </div>
                  <div className="text-3xl text-white opacity-50">→</div>
                  <div className="text-center ml-6">
                    <div className="text-5xl font-bold text-green-500">85%</div>
                    <div className="">You Keep</div>
                  </div>
                </div>
                
                <CardDescription className="text-white mb-6">
                  One simple fee covers everything. No listing fees, no monthly subscriptions, no surprises.
                </CardDescription>
                
                <Button asChild size="lg" className="bg-white font-semibold text-primary dark:text-background hover:bg-gray-100">
                  <Link href="/sell">
                    Start Selling
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Pricing Examples */}
          <Card className="mb-12 py-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="h-6 w-6 mr-3 text-primary" />
                Pricing Examples
              </CardTitle>
              <CardDescription>
                See how our commission structure works across different price points:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {pricingExamples.map((example, index) => {
                  const calculation = calculateEarnings(example.price);
                  return (
                    <Card key={index} className="text-center py-6">
                      <CardHeader className="pb-3">
                        <h3 className="font-semibold">{example.name}</h3>
                        <div className="text-2xl font-bold text-primary">${example.price}</div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>You earn:</span>
                            <span className="font-semibold">${calculation.earnings.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>Our fee:</span>
                            <span>${calculation.commission.toFixed(2)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
              <Alert>
                <HelpCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                <AlertTitle>Remember</AlertTitle>
                <AlertDescription className="text-blue-800">
                  You set your prices. Our commission is calculated on your 
                  total sale amount (excluding sales tax). We recommend factoring our commission into 
                  your pricing strategy.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Earnings Calculator */}
          <Card className="mb-12 py-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="h-6 w-6 mr-3 text-primary" />
                Earnings Calculator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8 items-start">
                <div>
                  <label htmlFor="sale-amount" className="block text-sm font-medium mb-2">
                    Enter your product price:
                  </label>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-2xl">$</span>
                    <Slider
                      min={5}
                      max={500}
                      step={5}
                      value={[calculatorAmount]}
                      onValueChange={([value]) => setCalculatorAmount(value)}
                      className="flex-1"
                    />
                  </div>
                  <Input
                    type="number"
                    min={5}
                    max={1000}
                    value={calculatorAmount}
                    onChange={(e) => setCalculatorAmount(Number(e.target.value))}
                    className="w-full"
                  />
                  
                  <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                    <p>Drag the slider or enter a specific amount to see your earnings.</p>
                  </div>
                </div>
                
                <Card className="bg-primary-50 border-primary/20 py-6">
                  <CardHeader>
                    <CardTitle className="text-center">Your Earnings Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Product Price:</span>
                        <span className="font-semibold">${calculatedSale.amount}</span>
                      </div>
                      <div className="flex justify-between items-center text-muted-foreground">
                        <span>Commission (15%):</span>
                        <span>-${calculatedSale.commission.toFixed(2)}</span>
                      </div>
                      <div className="border-t pt-3 mt-3">
                        <div className="flex justify-between items-center text-lg font-bold">
                          <span>You Earn:</span>
                          <span className="text-green-600">${calculatedSale.earnings.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* What's Included */}
          <Card className="mb-12 py-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-6 w-6 mr-3 text-primary" />
                What Your Commission Covers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold mb-4 flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    Included in Our 15% Fee
                  </h3>
                  <ul className="space-y-3">
                    {whatIncluded.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-4 flex items-center">
                    <XCircle className="h-5 w-5 text-red-600 mr-2" />
                    Not Included
                  </h3>
                  <ul className="space-y-3">
                    {whatNotIncluded.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <XCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <Alert className="mt-6 bg-amber-50 border-amber-200 text-amber-800">
                <HelpCircle className="h-5 w-5 text-amber-600" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  Payment processing fees are included in our 15% commission. 
                  This covers credit card processing, fraud protection, and secure transactions. 
                  You don&apos;t need to worry about additional payment processing fees.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Value Proposition */}
          <Card className="mb-12 py-6">
            <CardHeader>
              <CardTitle>More Than Just a Platform</CardTitle>
              <CardDescription>
                Your commission invests in tools and services that help your business grow:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                {valueProps.map((prop, index) => (
                  <Card key={index} className="text-center border-0 shadow-none">
                    <CardContent className="pt-6">
                      <div className="flex justify-center mb-4">
                        {prop.icon}
                      </div>
                      <h3 className="text-xl font-semibold mb-3">{prop.title}</h3>
                      <p className="text-muted-foreground">{prop.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Comparison Section */}
          <Card className="mb-12 py-6">
            <CardHeader>
              <CardTitle>How We Compare</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Platform</TableHead>
                      <TableHead className="text-center">Commission Fee</TableHead>
                      <TableHead className="text-center">Listing Fees</TableHead>
                      <TableHead className="text-center">Payment Processing</TableHead>
                      <TableHead className="text-center">Subscription</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-semibold">Kyzat</TableCell>
                      <TableCell className="text-center text-green-600 font-semibold">15%</TableCell>
                      <TableCell className="text-center">None</TableCell>
                      <TableCell className="text-center">Included</TableCell>
                      <TableCell className="text-center">None</TableCell>
                    </TableRow>
                    <TableRow className="bg-muted/30">
                      <TableCell>Etsy</TableCell>
                      <TableCell className="text-center">6.5%</TableCell>
                      <TableCell className="text-center">$0.20 per listing</TableCell>
                      <TableCell className="text-center">3% + $0.25</TableCell>
                      <TableCell className="text-center">Optional</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Amazon Handmade</TableCell>
                      <TableCell className="text-center">15%</TableCell>
                      <TableCell className="text-center">None</TableCell>
                      <TableCell className="text-center">Included</TableCell>
                      <TableCell className="text-center">$39.99/month</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Shopify</TableCell>
                      <TableCell className="text-center">0%*</TableCell>
                      <TableCell className="text-center">None</TableCell>
                      <TableCell className="text-center">2.9% + $0.30</TableCell>
                      <TableCell className="text-center">$29-$299/month</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              
              <div className="mt-4 text-sm text-muted-foreground">
                * Shopify charges monthly subscription fees instead of commission. Payment processing fees additional.
                Data based on standard plans as of 2023. Always check current rates before making decisions.
              </div>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <Card className="mb-12 py-6">
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">When do I get paid?</h3>
                <p className="text-muted-foreground">
                  We process payments every Tuesday and Friday. Once a customer&apos;s order is confirmed 
                  (after any clearance period), your earnings will be deposited to your bank account 
                  within 2-3 business days.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Are there any hidden fees?</h3>
                <p className="text-muted-foreground">
                  No hidden fees. Our 15% commission is all-inclusive. The only additional costs 
                  would be optional promoted listing fees if you choose to use our advertising features, 
                  and shipping costs which you set and collect from customers.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">What about sales tax?</h3>
                <p className="text-muted-foreground">
                  We handle sales tax collection and remittance for all orders where required by law. 
                  You don&apos;t need to worry about calculating, collecting, or remitting sales tax 
                  for orders through our platform.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Can I offer discounts or run sales?</h3>
                <p className="text-muted-foreground">
                  Yes! You can create discount codes and run sales anytime. Our commission is 
                  calculated on the actual sale price (after discounts), so you always keep 85% 
                  of what the customer actually pays.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* CTA Section */}
          <Card className="bg-primary/10 border-0 py-6">
            <CardHeader className="text-center">
              <CardTitle>Ready to Start Selling?</CardTitle>
              <CardDescription className="max-w-2xl mx-auto">
                Join hundreds of creators who are growing their businesses with our transparent 
                pricing and supportive community.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/sell">
                  Apply to Sell
                </Link>
              </Button>
              <Button variant="outline" asChild size="lg">
                <Link href="/contact">
                  Contact Support
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import Link from "next/link";
// import { 
//   DollarSign, 
//   Calculator, 
//   PieChart,
//   TrendingUp,
//   Shield,
//   Zap,
//   HelpCircle,
//   Download,
//   CheckCircle,
//   XCircle,
//   ArrowRight
// } from "lucide-react";

// export default function CommissionPage() {
//   const [saleAmount, setSaleAmount] = useState(100);
//   const [calculatorAmount, setCalculatorAmount] = useState(50);

//   // Calculate earnings based on sale amount
//   const calculateEarnings = (amount) => {
//     const commission = amount * 0.15;
//     const earnings = amount - commission;
//     return { amount, commission, earnings };
//   };

//   const exampleSale = calculateEarnings(saleAmount);
//   const calculatedSale = calculateEarnings(calculatorAmount);

//   const pricingExamples = [
//     { price: 25, name: "Small Item" },
//     { price: 50, name: "Medium Item" },
//     { price: 100, name: "Large Item" },
//     { price: 200, name: "Premium Item" }
//   ];

//   const valueProps = [
//     {
//       icon: <TrendingUp className="h-8 w-8 text-primary" />,
//       title: "Growing Customer Base",
//       description: "Access thousands of customers actively looking for handmade, unique products"
//     },
//     {
//       icon: <Shield className="h-8 w-8 text-primary" />,
//       title: "Secure Payment Processing",
//       description: "We handle all payment security, fraud protection, and chargebacks"
//     },
//     {
//       icon: <Zap className="h-8 w-8 text-primary" />,
//       title: "Marketing & Exposure",
//       description: "Featured in our newsletters, social media, and seasonal campaigns"
//     }
//   ];

//   const whatIncluded = [
//     "Payment processing fees",
//     "Platform maintenance and updates",
//     "Customer support",
//     "Marketing and advertising",
//     "Secure hosting and infrastructure",
//     "Seller protection program"
//   ];

//   const whatNotIncluded = [
//     "Shipping costs (set by you)",
//     "Material costs",
//     "Local taxes (your responsibility)",
//     "Transaction fees from other payment methods"
//   ];

//   return (
//     <div className="min-h-screen bg-background">
//       <main className="container mx-auto px-4 py-8">
//         <div className="max-w-4xl mx-auto">
//           {/* Header */}
//           <div className="text-center mb-12">
//             <h1 className="text-3xl font-bold mb-4">Transparent Pricing</h1>
//             <p className="text-muted-foreground text-lg">
//               Simple, fair commission structure with no hidden fees
//             </p>
//           </div>

//           {/* Hero Section */}
//           <div className="bg-gradient-to-r from-primary to-purple-700 text-white rounded-xl p-8 mb-12 text-center">
//             <div className="max-w-2xl mx-auto">
//               <div className="flex items-center justify-center mb-4">
//                 <div className="text-center mr-6">
//                   <div className="text-5xl font-bold">15%</div>
//                   <div className="">Commission Fee</div>
//                 </div>
//                 <div className="text-3xl text-white opacity-50">→</div>
//                 <div className="text-center ml-6">
//                   <div className="text-5xl font-bold text-green-500">85%</div>
//                   <div className="">You Keep</div>
//                 </div>
//               </div>
              
//               <p className=" mb-6">
//                 One simple fee covers everything. No listing fees, no monthly subscriptions, no surprises.
//               </p>
              
//               <Button asChild size="lg" className="bg-white font-semibold text-primary hover:bg-gray-100">
//                 <Link href="/sell">
//                   Start Selling
//                   <ArrowRight className="h-5 w-5 ml-2" />
//                 </Link>
//               </Button>
//             </div>
//           </div>

//           {/* Pricing Examples */}
//           <div className="bg-card rounded-lg border p-6 mb-12">
//             <h2 className="text-2xl font-bold mb-6 flex items-center">
//               <Calculator className="h-6 w-6 mr-3 text-primary" />
//               Pricing Examples
//             </h2>
            
//             <p className="text-muted-foreground mb-6">
//               See how our commission structure works across different price points:
//             </p>
            
//             <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//               {pricingExamples.map((example, index) => {
//                 const calculation = calculateEarnings(example.price);
//                 return (
//                   <div key={index} className="bg-muted/30 rounded-lg p-4 text-center">
//                     <h3 className="font-semibold mb-2">{example.name}</h3>
//                     <div className="text-2xl font-bold text-primary mb-3">${example.price}</div>
//                     <div className="space-y-1 text-sm">
//                       <div className="flex justify-between">
//                         <span>You earn:</span>
//                         <span className="font-semibold">${calculation.earnings.toFixed(2)}</span>
//                       </div>
//                       <div className="flex justify-between text-muted-foreground">
//                         <span>Our fee:</span>
//                         <span>${calculation.commission.toFixed(2)}</span>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
            
//             <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//               <div className="flex items-start">
//                 <HelpCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
//                 <p className="text-blue-800">
//                   <strong>Remember:</strong> You set your prices. Our commission is calculated on your 
//                   total sale amount (excluding sales tax). We recommend factoring our commission into 
//                   your pricing strategy.
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Earnings Calculator */}
//           <div className="bg-card rounded-lg border p-6 mb-12">
//             <h2 className="text-2xl font-bold mb-6 flex items-center">
//               <PieChart className="h-6 w-6 mr-3 text-primary" />
//               Earnings Calculator
//             </h2>
            
//             <div className="grid md:grid-cols-2 gap-8 items-start">
//               <div>
//                 <label htmlFor="sale-amount" className="block text-sm font-medium mb-2">
//                   Enter your product price:
//                 </label>
//                 <div className="flex items-center">
//                   <span className="text-2xl mr-2">$</span>
//                   <input
//                     type="range"
//                     min="5"
//                     max="500"
//                     step="5"
//                     value={calculatorAmount}
//                     onChange={(e) => setCalculatorAmount(Number(e.target.value))}
//                     className="flex-1 mr-4"
//                   />
//                   <input
//                     type="number"
//                     min="5"
//                     max="1000"
//                     value={calculatorAmount}
//                     onChange={(e) => setCalculatorAmount(Number(e.target.value))}
//                     className="w-20 p-2 border rounded"
//                   />
//                 </div>
                
//                 <div className="mt-4 space-y-2 text-sm">
//                   <p>Drag the slider or enter a specific amount to see your earnings.</p>
//                 </div>
//               </div>
              
//               <div className="bg-primary-50 rounded-lg p-6">
//                 <h3 className="font-semibold mb-4 text-center">Your Earnings Breakdown</h3>
//                 <div className="space-y-3">
//                   <div className="flex justify-between items-center">
//                     <span>Product Price:</span>
//                     <span className="font-semibold">${calculatedSale.amount}</span>
//                   </div>
//                   <div className="flex justify-between items-center text-muted-foreground">
//                     <span>Commission (15%):</span>
//                     <span>-${calculatedSale.commission.toFixed(2)}</span>
//                   </div>
//                   <div className="border-t pt-3 mt-3">
//                     <div className="flex justify-between items-center text-lg font-bold">
//                       <span>You Earn:</span>
//                       <span className="text-green-600">${calculatedSale.earnings.toFixed(2)}</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* What's Included */}
//           <div className="bg-card rounded-lg border p-6 mb-12">
//             <h2 className="text-2xl font-bold mb-6 flex items-center">
//               <DollarSign className="h-6 w-6 mr-3 text-primary" />
//               What Your Commission Covers
//             </h2>
            
//             <div className="grid md:grid-cols-2 gap-8">
//               <div>
//                 <h3 className="font-semibold mb-4 flex items-center">
//                   <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
//                   Included in Our 15% Fee
//                 </h3>
//                 <ul className="space-y-3">
//                   {whatIncluded.map((item, index) => (
//                     <li key={index} className="flex items-start">
//                       <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
//                       <span>{item}</span>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
              
//               <div>
//                 <h3 className="font-semibold mb-4 flex items-center">
//                   <XCircle className="h-5 w-5 text-red-600 mr-2" />
//                   Not Included
//                 </h3>
//                 <ul className="space-y-3">
//                   {whatNotIncluded.map((item, index) => (
//                     <li key={index} className="flex items-start">
//                       <XCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
//                       <span>{item}</span>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             </div>
            
//             <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-6">
//               <div className="flex items-start">
//                 <HelpCircle className="h-5 w-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
//                 <p className="text-amber-800">
//                   <strong>Important:</strong> Payment processing fees are included in our 15% commission. 
//                   This covers credit card processing, fraud protection, and secure transactions. 
//                   You don&apos;t need to worry about additional payment processing fees.
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Value Proposition */}
//           <div className="bg-card rounded-lg border p-6 mb-12">
//             <h2 className="text-2xl font-bold mb-6">More Than Just a Platform</h2>
//             <p className="text-muted-foreground mb-8">
//               Your commission invests in tools and services that help your business grow:
//             </p>
            
//             <div className="grid md:grid-cols-3 gap-6">
//               {valueProps.map((prop, index) => (
//                 <div key={index} className="text-center">
//                   <div className="flex justify-center mb-4">
//                     {prop.icon}
//                   </div>
//                   <h3 className="text-xl font-semibold mb-3">{prop.title}</h3>
//                   <p className="text-muted-foreground">{prop.description}</p>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Comparison Section */}
//           <div className="bg-card rounded-lg border p-6 mb-12">
//             <h2 className="text-2xl font-bold mb-6">How We Compare</h2>
            
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead>
//                   <tr className="border-b">
//                     <th className="text-left p-3">Platform</th>
//                     <th className="text-center p-3">Commission Fee</th>
//                     <th className="text-center p-3">Listing Fees</th>
//                     <th className="text-center p-3">Payment Processing</th>
//                     <th className="text-center p-3">Subscription</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   <tr className="border-b">
//                     <td className="p-3 font-semibold">Kyzat</td>
//                     <td className="p-3 text-center text-green-600 font-semibold">15%</td>
//                     <td className="p-3 text-center">None</td>
//                     <td className="p-3 text-center">Included</td>
//                     <td className="p-3 text-center">None</td>
//                   </tr>
//                   <tr className="border-b bg-muted/30">
//                     <td className="p-3">Etsy</td>
//                     <td className="p-3 text-center">6.5%</td>
//                     <td className="p-3 text-center">$0.20 per listing</td>
//                     <td className="p-3 text-center">3% + $0.25</td>
//                     <td className="p-3 text-center">Optional</td>
//                   </tr>
//                   <tr className="border-b">
//                     <td className="p-3">Amazon Handmade</td>
//                     <td className="p-3 text-center">15%</td>
//                     <td className="p-3 text-center">None</td>
//                     <td className="p-3 text-center">Included</td>
//                     <td className="p-3 text-center">$39.99/month</td>
//                   </tr>
//                   <tr>
//                     <td className="p-3">Shopify</td>
//                     <td className="p-3 text-center">0%*</td>
//                     <td className="p-3 text-center">None</td>
//                     <td className="p-3 text-center">2.9% + $0.30</td>
//                     <td className="p-3 text-center">$29-$299/month</td>
//                   </tr>
//                 </tbody>
//               </table>
//             </div>
            
//             <div className="mt-4 text-sm text-muted-foreground">
//               * Shopify charges monthly subscription fees instead of commission. Payment processing fees additional.
//               Data based on standard plans as of 2023. Always check current rates before making decisions.
//             </div>
//           </div>

//           {/* FAQ Section */}
//           <div className="bg-card rounded-lg border p-6 mb-12">
//             <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            
//             <div className="space-y-6">
//               <div>
//                 <h3 className="font-semibold mb-2">When do I get paid?</h3>
//                 <p className="text-muted-foreground">
//                   We process payments every Tuesday and Friday. Once a customer&apos;s order is confirmed 
//                   (after any clearance period), your earnings will be deposited to your bank account 
//                   within 2-3 business days.
//                 </p>
//               </div>
              
//               <div>
//                 <h3 className="font-semibold mb-2">Are there any hidden fees?</h3>
//                 <p className="text-muted-foreground">
//                   No hidden fees. Our 15% commission is all-inclusive. The only additional costs 
//                   would be optional promoted listing fees if you choose to use our advertising features, 
//                   and shipping costs which you set and collect from customers.
//                 </p>
//               </div>
              
//               <div>
//                 <h3 className="font-semibold mb-2">What about sales tax?</h3>
//                 <p className="text-muted-foreground">
//                   We handle sales tax collection and remittance for all orders where required by law. 
//                   You don&apos;t need to worry about calculating, collecting, or remitting sales tax 
//                   for orders through our platform.
//                 </p>
//               </div>
              
//               <div>
//                 <h3 className="font-semibold mb-2">Can I offer discounts or run sales?</h3>
//                 <p className="text-muted-foreground">
//                   Yes! You can create discount codes and run sales anytime. Our commission is 
//                   calculated on the actual sale price (after discounts), so you always keep 85% 
//                   of what the customer actually pays.
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* CTA Section */}
//           <div className="bg-primary/10 rounded-lg p-8 text-center">
//             <h2 className="text-2xl font-bold mb-4">Ready to Start Selling?</h2>
//             <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
//               Join hundreds of creators who are growing their businesses with our transparent 
//               pricing and supportive community.
//             </p>
//             <div className="flex flex-col sm:flex-row gap-4 justify-center">
//               <Button asChild size="lg">
//                 <Link href="/sell">
//                   Apply to Sell
//                 </Link>
//               </Button>
//               <Button variant="outline" asChild size="lg">
//                 <Link href="/contact">
//                   Contact Support
//                 </Link>
//               </Button>
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }