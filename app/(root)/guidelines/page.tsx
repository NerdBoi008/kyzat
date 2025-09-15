"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, CreditCard, Download, HelpCircle, MessageCircle, Package, Shield, Star, Truck, Users, XCircle } from "lucide-react";

const guidelines = {
    overview: {
      title: "Overview",
      content: (
        <div>
          <p className="mb-4">
            Welcome to our creator community! These guidelines are designed to help you succeed on our platform 
            while maintaining a high standard of quality and trust for our customers.
          </p>
          <p className="mb-4">
            By joining our marketplace, you agree to follow these guidelines. We regularly update them to ensure 
            they reflect our community values and marketplace needs.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-6">
            <div className="flex items-start">
              <HelpCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
              <p className="text-blue-800">
                <strong>Need help?</strong> Contact our creator support team at{" "}
                <a href="mailto:creators@kyzat.com" className="underline">
                  creators@kyzat.com
                </a>{" "}
                for any questions about these guidelines.
              </p>
            </div>
          </div>
        </div>
      )
    },
    eligibility: {
      title: "Eligibility Requirements",
      content: (
        <div>
          <h3 className="text-xl font-semibold mb-4">Who Can Sell on Our Platform</h3>
          <p className="mb-4">
            To maintain quality and authenticity, we require all creators to meet certain criteria:
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-green-50 dark:bg-background border border-green-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <h4 className="font-semibold">What We Allow</h4>
              </div>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Handmade items created by you or your small team</li>
                <li>Original designs and artworks</li>
                <li>Vintage items (20+ years old)</li>
                <li>Craft supplies and tools</li>
                <li>Custom and made-to-order items</li>
                <li>Digital products (patterns, recipes, guides)</li>
              </ul>
            </div>
            
            <div className="bg-red-50 border dark:bg-background border-red-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <XCircle className="h-5 w-5 text-red-600 mr-2" />
                <h4 className="font-semibold">What We Don&apos;t Allow</h4>
              </div>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Mass-produced or resold items</li>
                <li>Counterfeit or unauthorized replicas</li>
                <li>Items that violate intellectual property rights</li>
                <li>Weapons, alcohol, tobacco, or drugs</li>
                <li>Hate speech or offensive materials</li>
                <li>Live animals or human remains</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
              <p className="text-amber-800">
                <strong>Important:</strong> All applicants undergo a review process. We may request additional 
                information or photos of your creative process to verify that your items meet our standards.
              </p>
            </div>
          </div>
        </div>
      )
    },
    product: {
      title: "Product Requirements",
      content: (
        <div>
          <h3 className="text-xl font-semibold mb-4">Quality Standards</h3>
          <p className="mb-4">
            To ensure customer satisfaction and maintain our marketplace reputation, all products must meet these standards:
          </p>
          
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2 flex items-center">
                <Package className="h-5 w-5 text-primary mr-2" />
                Product Quality
              </h4>
              <ul className="list-disc list-inside space-y-1 ml-7">
                <li>Items must be well-crafted with attention to detail</li>
                <li>Products should be free from defects and damage</li>
                <li>Materials should be of good quality and appropriate for the intended use</li>
                <li>Finished products should match their descriptions and photos</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2 flex items-center">
                <Shield className="h-5 w-5 text-primary mr-2" />
                Safety & Compliance
              </h4>
              <ul className="list-disc list-inside space-y-1 ml-7">
                <li>Items must comply with all applicable safety regulations</li>
                <li>Products for children must meet child safety standards</li>
                <li>Food items must follow proper packaging and labeling requirements</li>
                <li>All items must be accurately described regarding materials and care</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2 flex items-center">
                <Star className="h-5 w-5 text-primary mr-2" />
                Presentation & Packaging
              </h4>
              <ul className="list-disc list-inside space-y-1 ml-7">
                <li>Items should be professionally presented and packaged</li>
                <li>Include care instructions when appropriate</li>
                <li>Consider eco-friendly packaging options</li>
                <li>Branding materials should be tasteful and not overwhelming</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    listing: {
      title: "Listing Requirements",
      content: (
        <div>
          <h3 className="text-xl font-semibold mb-4">Creating Effective Listings</h3>
          <p className="mb-4">
            Great listings help customers understand your products and make informed purchasing decisions. 
            Follow these requirements for all your listings:
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-semibold mb-2">Photos & Media</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Minimum of 3 photos from different angles</li>
                <li>High-quality, well-lit images against neutral backgrounds</li>
                <li>Show scale (include something for size reference)</li>
                <li>Show product in use or context when helpful</li>
                <li>Accurately represent colors and details</li>
                <li>Videos are encouraged for complex items</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Descriptions & Details</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Clear, accurate, and detailed descriptions</li>
                <li>Include dimensions, materials, and care instructions</li>
                <li>Note any variations from item to item</li>
                <li>Be transparent about production time</li>
                <li>Use appropriate keywords without &quot;keyword stuffing&quot;</li>
                <li>Mention if item is made-to-order or ready to ship</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-background border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Pricing Guidelines</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Price items fairly based on materials, time, and market value</li>
              <li>Consider our 15% commission when setting prices</li>
              <li>Be consistent with pricing across platforms</li>
              <li>Clearly state what&apos;s included in the price</li>
              <li>Offer transparent shipping costs</li>
            </ul>
          </div>
        </div>
      )
    },
    shipping: {
      title: "Shipping & Fulfillment",
      content: (
        <div>
          <h3 className="text-xl font-semibold mb-4">Shipping Requirements</h3>
          <p className="mb-4">
            Timely shipping and careful packaging are essential for customer satisfaction. 
            Follow these guidelines for order fulfillment:
          </p>
          
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2 flex items-center">
                <Truck className="h-5 w-5 text-primary mr-2" />
                Processing Time
              </h4>
              <ul className="list-disc list-inside space-y-1 ml-7">
                <li>Clearly state your processing time in each listing</li>
                <li>Default processing time should not exceed 5 business days</li>
                <li>For made-to-order items, provide realistic timeframes</li>
                <li>Notify customers immediately if delays occur</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2 flex items-center">
                <Package className="h-5 w-5 text-primary mr-2" />
                Packaging & Shipping
              </h4>
              <ul className="list-disc list-inside space-y-1 ml-7">
                <li>Use appropriate packaging to prevent damage during transit</li>
                <li>Consider eco-friendly packaging options</li>
                <li>Provide tracking information for all orders</li>
                <li>Ship to the address provided by the customer</li>
                <li>Consider offering shipping insurance for high-value items</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2 flex items-center">
                <CreditCard className="h-5 w-5 text-primary mr-2" />
                International Shipping
              </h4>
              <ul className="list-disc list-inside space-y-1 ml-7">
                <li>Clearly state which countries you ship to</li>
                <li>Be aware of customs regulations and restrictions</li>
                <li>Clearly communicate any additional fees or taxes</li>
                <li>Consider using the Global Shipping Program for complex international shipping</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    communication: {
      title: "Customer Communication",
      content: (
        <div>
          <h3 className="text-xl font-semibold mb-4">Professional Communication</h3>
          <p className="mb-4">
            Building trust with customers through clear and professional communication is essential for success on our platform.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-semibold mb-2 flex items-center">
                <MessageCircle className="h-5 w-5 text-primary mr-2" />
                Response Times
              </h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Respond to customer messages within 24 hours</li>
                <li>Set clear expectations for response times in your shop policies</li>
                <li>Use our mobile app to stay connected while away from your studio</li>
                <li>Set vacation mode when you&apos;re unable to respond promptly</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2 flex items-center">
                <Users className="h-5 w-5 text-primary mr-2" />
                Customer Service
              </h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Be polite, professional, and helpful in all communications</li>
                <li>Address concerns and questions thoroughly</li>
                <li>Offer customization options when possible</li>
                <li>Resolve issues promptly and fairly</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-green-50 border dark:bg-background border-green-200 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Best Practices</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Send order confirmation messages promptly</li>
              <li>Notify customers when their order ships with tracking information</li>
              <li>Follow up after delivery to ensure satisfaction</li>
              <li>Personalize messages when appropriate</li>
              <li>Thank customers for their business</li>
            </ul>
          </div>
        </div>
      )
    },
    policies: {
      title: "Shop Policies",
      content: (
        <div>
          <h3 className="text-xl font-semibold mb-4">Required Shop Policies</h3>
          <p className="mb-4">
            Clear shop policies help manage customer expectations and protect both you and your customers. 
            All shops must have the following policies clearly stated:
          </p>
          
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2">Return & Exchange Policy</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Clearly state your return and exchange timeframe (minimum 14 days)</li>
                <li>Specify conditions for returns (unused, with original packaging, etc.)</li>
                <li>Note who pays for return shipping</li>
                <li>Explain any non-returnable items (custom orders, perishables, etc.)</li>
                <li>Describe your process for handling returns</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Shipping Policy</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>List all countries you ship to</li>
                <li>Specify processing times clearly</li>
                <li>Note any shipping upgrades available</li>
                <li>Explain how combined shipping works for multiple items</li>
                <li>Mention any shipping restrictions</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Custom Order Policy</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Explain your process for custom orders</li>
                <li>Note any non-refundable deposits required</li>
                <li>Describe your revision policy</li>
                <li>Set clear expectations about timelines</li>
                <li>Explain what happens if a custom order is canceled</li>
              </ul>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-amber-800">
                  <strong>Important:</strong> Your shop policies must comply with local consumer protection laws. 
                  We recommend consulting with a legal professional if you&apos;re unsure about your obligations.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    compliance: {
      title: "Legal Compliance",
      content: (
        <div>
          <h3 className="text-xl font-semibold mb-4">Legal Requirements</h3>
          <p className="mb-4">
            As a creator on our platform, you are responsible for complying with all applicable laws and regulations.
          </p>
          
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2">Intellectual Property</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Only sell items that you have the right to sell</li>
                <li>Do not infringe on others&apos; copyrights, trademarks, or patents</li>
                <li>Obtain proper licenses for any licensed characters or designs</li>
                <li>Respect brand guidelines when creating fan art or inspired works</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Business Regulations</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Obtain any required business licenses or permits</li>
                <li>Collect and remit sales tax according to local regulations</li>
                <li>Keep accurate financial records for tax purposes</li>
                <li>Comply with product safety standards for your items</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Privacy & Data Protection</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Protect customer data and use it only for order fulfillment</li>
                <li>Do not share customer information with third parties</li>
                <li>Clearly post your privacy policy if you collect customer data</li>
                <li>Comply with GDPR, CCPA, and other privacy regulations as applicable</li>
              </ul>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <XCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-red-800">
                  <strong>Warning:</strong> Failure to comply with these legal requirements may result in 
                  removal from our platform and could lead to legal action. When in doubt, consult with 
                  a legal professional.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    }
  };

export default function GuidelinesPage() {
  const [activeSection, setActiveSection] = useState<keyof typeof guidelines>("overview");
  const keys = Object.keys(guidelines) as (keyof typeof guidelines)[];
  const currentIndex = keys.indexOf(activeSection);

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-4">Creator Guidelines</h1>
            <p className="text-muted-foreground text-lg">
              Everything you need to know to succeed as a creator on our platform
            </p>
          </header>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Navigation */}
            <aside className="lg:w-1/4">
              <div className="sticky top-24 bg-card rounded-lg border p-4">
                <h2 className="font-semibold mb-4">Sections</h2>
                <nav className="space-y-2">
                  {keys.map((key) => (
                    <button
                      key={key}
                      onClick={() => setActiveSection(key)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                        activeSection === key
                          ? "bg-primary-100 text-primary-700 font-medium"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {guidelines[key].title}
                    </button>
                  ))}
                </nav>

                <div className="mt-8 pt-4 border-t">
                  <Button asChild variant="outline" className="w-full mb-2">
                    <Link href="/sell">Apply to Sell</Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.print()}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <section className="lg:w-3/4">
              <div className="bg-card rounded-lg border p-6">
                <h2 className="text-2xl font-bold mb-6">
                  {guidelines[activeSection].title}
                </h2>
                <div className="prose prose-primary max-w-none">
                  {guidelines[activeSection].content}
                </div>
              </div>

              {/* Prev/Next Navigation */}
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={() => setActiveSection(keys[currentIndex - 1])}
                  disabled={currentIndex === 0}
                >
                  Previous Section
                </Button>
                <Button
                  onClick={() => setActiveSection(keys[currentIndex + 1])}
                  disabled={currentIndex === keys.length - 1}
                >
                  Next Section
                </Button>
              </div>
            </section>
          </div>

          {/* Support Section */}
          <section className="bg-primary/5 rounded-lg p-8 mt-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Our creator support team is here to help you understand these guidelines 
              and succeed on our platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link href="/contact">Contact Support</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/help">Visit Help Center</Link>
              </Button>
            </div>
          </section>
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
//   CheckCircle, 
//   XCircle, 
//   AlertTriangle,
//   HelpCircle,
//   FileText,
//   Download,
//   Shield,
//   Star,
//   Users,
//   Package,
//   Truck,
//   CreditCard,
//   MessageCircle
// } from "lucide-react";

// export default function GuidelinesPage() {
//   const [activeSection, setActiveSection] = useState("overview");

//   const guidelines = {
//     overview: {
//       title: "Overview",
//       content: (
//         <div>
//           <p className="mb-4">
//             Welcome to our creator community! These guidelines are designed to help you succeed on our platform 
//             while maintaining a high standard of quality and trust for our customers.
//           </p>
//           <p className="mb-4">
//             By joining our marketplace, you agree to follow these guidelines. We regularly update them to ensure 
//             they reflect our community values and marketplace needs.
//           </p>
//           <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-6">
//             <div className="flex items-start">
//               <HelpCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
//               <p className="text-blue-800">
//                 <strong>Need help?</strong> Contact our creator support team at{" "}
//                 <a href="mailto:creators@kyzat.com" className="underline">
//                   creators@kyzat.com
//                 </a>{" "}
//                 for any questions about these guidelines.
//               </p>
//             </div>
//           </div>
//         </div>
//       )
//     },
//     eligibility: {
//       title: "Eligibility Requirements",
//       content: (
//         <div>
//           <h3 className="text-xl font-semibold mb-4">Who Can Sell on Our Platform</h3>
//           <p className="mb-4">
//             To maintain quality and authenticity, we require all creators to meet certain criteria:
//           </p>
          
//           <div className="grid md:grid-cols-2 gap-6 mb-6">
//             <div className="bg-green-50 border border-green-200 rounded-lg p-4">
//               <div className="flex items-center mb-2">
//                 <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
//                 <h4 className="font-semibold">What We Allow</h4>
//               </div>
//               <ul className="list-disc list-inside space-y-1 text-sm">
//                 <li>Handmade items created by you or your small team</li>
//                 <li>Original designs and artworks</li>
//                 <li>Vintage items (20+ years old)</li>
//                 <li>Craft supplies and tools</li>
//                 <li>Custom and made-to-order items</li>
//                 <li>Digital products (patterns, recipes, guides)</li>
//               </ul>
//             </div>
            
//             <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//               <div className="flex items-center mb-2">
//                 <XCircle className="h-5 w-5 text-red-600 mr-2" />
//                 <h4 className="font-semibold">What We Don't Allow</h4>
//               </div>
//               <ul className="list-disc list-inside space-y-1 text-sm">
//                 <li>Mass-produced or resold items</li>
//                 <li>Counterfeit or unauthorized replicas</li>
//                 <li>Items that violate intellectual property rights</li>
//                 <li>Weapons, alcohol, tobacco, or drugs</li>
//                 <li>Hate speech or offensive materials</li>
//                 <li>Live animals or human remains</li>
//               </ul>
//             </div>
//           </div>
          
//           <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
//             <div className="flex items-start">
//               <AlertTriangle className="h-5 w-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
//               <p className="text-amber-800">
//                 <strong>Important:</strong> All applicants undergo a review process. We may request additional 
//                 information or photos of your creative process to verify that your items meet our standards.
//               </p>
//             </div>
//           </div>
//         </div>
//       )
//     },
//     product: {
//       title: "Product Requirements",
//       content: (
//         <div>
//           <h3 className="text-xl font-semibold mb-4">Quality Standards</h3>
//           <p className="mb-4">
//             To ensure customer satisfaction and maintain our marketplace reputation, all products must meet these standards:
//           </p>
          
//           <div className="space-y-6">
//             <div>
//               <h4 className="font-semibold mb-2 flex items-center">
//                 <Package className="h-5 w-5 text-primary mr-2" />
//                 Product Quality
//               </h4>
//               <ul className="list-disc list-inside space-y-1 ml-7">
//                 <li>Items must be well-crafted with attention to detail</li>
//                 <li>Products should be free from defects and damage</li>
//                 <li>Materials should be of good quality and appropriate for the intended use</li>
//                 <li>Finished products should match their descriptions and photos</li>
//               </ul>
//             </div>
            
//             <div>
//               <h4 className="font-semibold mb-2 flex items-center">
//                 <Shield className="h-5 w-5 text-primary mr-2" />
//                 Safety & Compliance
//               </h4>
//               <ul className="list-disc list-inside space-y-1 ml-7">
//                 <li>Items must comply with all applicable safety regulations</li>
//                 <li>Products for children must meet child safety standards</li>
//                 <li>Food items must follow proper packaging and labeling requirements</li>
//                 <li>All items must be accurately described regarding materials and care</li>
//               </ul>
//             </div>
            
//             <div>
//               <h4 className="font-semibold mb-2 flex items-center">
//                 <Star className="h-5 w-5 text-primary mr-2" />
//                 Presentation & Packaging
//               </h4>
//               <ul className="list-disc list-inside space-y-1 ml-7">
//                 <li>Items should be professionally presented and packaged</li>
//                 <li>Include care instructions when appropriate</li>
//                 <li>Consider eco-friendly packaging options</li>
//                 <li>Branding materials should be tasteful and not overwhelming</li>
//               </ul>
//             </div>
//           </div>
//         </div>
//       )
//     },
//     listing: {
//       title: "Listing Requirements",
//       content: (
//         <div>
//           <h3 className="text-xl font-semibold mb-4">Creating Effective Listings</h3>
//           <p className="mb-4">
//             Great listings help customers understand your products and make informed purchasing decisions. 
//             Follow these requirements for all your listings:
//           </p>
          
//           <div className="grid md:grid-cols-2 gap-6 mb-6">
//             <div>
//               <h4 className="font-semibold mb-2">Photos & Media</h4>
//               <ul className="list-disc list-inside space-y-1">
//                 <li>Minimum of 3 photos from different angles</li>
//                 <li>High-quality, well-lit images against neutral backgrounds</li>
//                 <li>Show scale (include something for size reference)</li>
//                 <li>Show product in use or context when helpful</li>
//                 <li>Accurately represent colors and details</li>
//                 <li>Videos are encouraged for complex items</li>
//               </ul>
//             </div>
            
//             <div>
//               <h4 className="font-semibold mb-2">Descriptions & Details</h4>
//               <ul className="list-disc list-inside space-y-1">
//                 <li>Clear, accurate, and detailed descriptions</li>
//                 <li>Include dimensions, materials, and care instructions</li>
//                 <li>Note any variations from item to item</li>
//                 <li>Be transparent about production time</li>
//                 <li>Use appropriate keywords without "keyword stuffing"</li>
//                 <li>Mention if item is made-to-order or ready to ship</li>
//               </ul>
//             </div>
//           </div>
          
//           <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//             <h4 className="font-semibold mb-2">Pricing Guidelines</h4>
//             <ul className="list-disc list-inside space-y-1">
//               <li>Price items fairly based on materials, time, and market value</li>
//               <li>Consider our 15% commission when setting prices</li>
//               <li>Be consistent with pricing across platforms</li>
//               <li>Clearly state what's included in the price</li>
//               <li>Offer transparent shipping costs</li>
//             </ul>
//           </div>
//         </div>
//       )
//     },
//     shipping: {
//       title: "Shipping & Fulfillment",
//       content: (
//         <div>
//           <h3 className="text-xl font-semibold mb-4">Shipping Requirements</h3>
//           <p className="mb-4">
//             Timely shipping and careful packaging are essential for customer satisfaction. 
//             Follow these guidelines for order fulfillment:
//           </p>
          
//           <div className="space-y-6">
//             <div>
//               <h4 className="font-semibold mb-2 flex items-center">
//                 <Truck className="h-5 w-5 text-primary mr-2" />
//                 Processing Time
//               </h4>
//               <ul className="list-disc list-inside space-y-1 ml-7">
//                 <li>Clearly state your processing time in each listing</li>
//                 <li>Default processing time should not exceed 5 business days</li>
//                 <li>For made-to-order items, provide realistic timeframes</li>
//                 <li>Notify customers immediately if delays occur</li>
//               </ul>
//             </div>
            
//             <div>
//               <h4 className="font-semibold mb-2 flex items-center">
//                 <Package className="h-5 w-5 text-primary mr-2" />
//                 Packaging & Shipping
//               </h4>
//               <ul className="list-disc list-inside space-y-1 ml-7">
//                 <li>Use appropriate packaging to prevent damage during transit</li>
//                 <li>Consider eco-friendly packaging options</li>
//                 <li>Provide tracking information for all orders</li>
//                 <li>Ship to the address provided by the customer</li>
//                 <li>Consider offering shipping insurance for high-value items</li>
//               </ul>
//             </div>
            
//             <div>
//               <h4 className="font-semibold mb-2 flex items-center">
//                 <CreditCard className="h-5 w-5 text-primary mr-2" />
//                 International Shipping
//               </h4>
//               <ul className="list-disc list-inside space-y-1 ml-7">
//                 <li>Clearly state which countries you ship to</li>
//                 <li>Be aware of customs regulations and restrictions</li>
//                 <li>Clearly communicate any additional fees or taxes</li>
//                 <li>Consider using the Global Shipping Program for complex international shipping</li>
//               </ul>
//             </div>
//           </div>
//         </div>
//       )
//     },
//     communication: {
//       title: "Customer Communication",
//       content: (
//         <div>
//           <h3 className="text-xl font-semibold mb-4">Professional Communication</h3>
//           <p className="mb-4">
//             Building trust with customers through clear and professional communication is essential for success on our platform.
//           </p>
          
//           <div className="grid md:grid-cols-2 gap-6 mb-6">
//             <div>
//               <h4 className="font-semibold mb-2 flex items-center">
//                 <MessageCircle className="h-5 w-5 text-primary mr-2" />
//                 Response Times
//               </h4>
//               <ul className="list-disc list-inside space-y-1">
//                 <li>Respond to customer messages within 24 hours</li>
//                 <li>Set clear expectations for response times in your shop policies</li>
//                 <li>Use our mobile app to stay connected while away from your studio</li>
//                 <li>Set vacation mode when you're unable to respond promptly</li>
//               </ul>
//             </div>
            
//             <div>
//               <h4 className="font-semibold mb-2 flex items-center">
//                 <Users className="h-5 w-5 text-primary mr-2" />
//                 Customer Service
//               </h4>
//               <ul className="list-disc list-inside space-y-1">
//                 <li>Be polite, professional, and helpful in all communications</li>
//                 <li>Address concerns and questions thoroughly</li>
//                 <li>Offer customization options when possible</li>
//                 <li>Resolve issues promptly and fairly</li>
//               </ul>
//             </div>
//           </div>
          
//           <div className="bg-green-50 border border-green-200 rounded-lg p-4">
//             <h4 className="font-semibold mb-2">Best Practices</h4>
//             <ul className="list-disc list-inside space-y-1">
//               <li>Send order confirmation messages promptly</li>
//               <li>Notify customers when their order ships with tracking information</li>
//               <li>Follow up after delivery to ensure satisfaction</li>
//               <li>Personalize messages when appropriate</li>
//               <li>Thank customers for their business</li>
//             </ul>
//           </div>
//         </div>
//       )
//     },
//     policies: {
//       title: "Shop Policies",
//       content: (
//         <div>
//           <h3 className="text-xl font-semibold mb-4">Required Shop Policies</h3>
//           <p className="mb-4">
//             Clear shop policies help manage customer expectations and protect both you and your customers. 
//             All shops must have the following policies clearly stated:
//           </p>
          
//           <div className="space-y-6">
//             <div>
//               <h4 className="font-semibold mb-2">Return & Exchange Policy</h4>
//               <ul className="list-disc list-inside space-y-1">
//                 <li>Clearly state your return and exchange timeframe (minimum 14 days)</li>
//                 <li>Specify conditions for returns (unused, with original packaging, etc.)</li>
//                 <li>Note who pays for return shipping</li>
//                 <li>Explain any non-returnable items (custom orders, perishables, etc.)</li>
//                 <li>Describe your process for handling returns</li>
//               </ul>
//             </div>
            
//             <div>
//               <h4 className="font-semibold mb-2">Shipping Policy</h4>
//               <ul className="list-disc list-inside space-y-1">
//                 <li>List all countries you ship to</li>
//                 <li>Specify processing times clearly</li>
//                 <li>Note any shipping upgrades available</li>
//                 <li>Explain how combined shipping works for multiple items</li>
//                 <li>Mention any shipping restrictions</li>
//               </ul>
//             </div>
            
//             <div>
//               <h4 className="font-semibold mb-2">Custom Order Policy</h4>
//               <ul className="list-disc list-inside space-y-1">
//                 <li>Explain your process for custom orders</li>
//                 <li>Note any non-refundable deposits required</li>
//                 <li>Describe your revision policy</li>
//                 <li>Set clear expectations about timelines</li>
//                 <li>Explain what happens if a custom order is canceled</li>
//               </ul>
//             </div>
            
//             <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
//               <div className="flex items-start">
//                 <AlertTriangle className="h-5 w-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
//                 <p className="text-amber-800">
//                   <strong>Important:</strong> Your shop policies must comply with local consumer protection laws. 
//                   We recommend consulting with a legal professional if you're unsure about your obligations.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       )
//     },
//     compliance: {
//       title: "Legal Compliance",
//       content: (
//         <div>
//           <h3 className="text-xl font-semibold mb-4">Legal Requirements</h3>
//           <p className="mb-4">
//             As a creator on our platform, you are responsible for complying with all applicable laws and regulations.
//           </p>
          
//           <div className="space-y-6">
//             <div>
//               <h4 className="font-semibold mb-2">Intellectual Property</h4>
//               <ul className="list-disc list-inside space-y-1">
//                 <li>Only sell items that you have the right to sell</li>
//                 <li>Do not infringe on others&apos; copyrights, trademarks, or patents</li>
//                 <li>Obtain proper licenses for any licensed characters or designs</li>
//                 <li>Respect brand guidelines when creating fan art or inspired works</li>
//               </ul>
//             </div>
            
//             <div>
//               <h4 className="font-semibold mb-2">Business Regulations</h4>
//               <ul className="list-disc list-inside space-y-1">
//                 <li>Obtain any required business licenses or permits</li>
//                 <li>Collect and remit sales tax according to local regulations</li>
//                 <li>Keep accurate financial records for tax purposes</li>
//                 <li>Comply with product safety standards for your items</li>
//               </ul>
//             </div>
            
//             <div>
//               <h4 className="font-semibold mb-2">Privacy & Data Protection</h4>
//               <ul className="list-disc list-inside space-y-1">
//                 <li>Protect customer data and use it only for order fulfillment</li>
//                 <li>Do not share customer information with third parties</li>
//                 <li>Clearly post your privacy policy if you collect customer data</li>
//                 <li>Comply with GDPR, CCPA, and other privacy regulations as applicable</li>
//               </ul>
//             </div>
            
//             <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//               <div className="flex items-start">
//                 <XCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
//                 <p className="text-red-800">
//                   <strong>Warning:</strong> Failure to comply with these legal requirements may result in 
//                   removal from our platform and could lead to legal action. When in doubt, consult with 
//                   a legal professional.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       )
//     }
//   };

//   return (
//     <div className="min-h-screen bg-background">
//       <main className="container mx-auto px-4 py-8">
//         <div className="max-w-4xl mx-auto">
//           {/* Header */}
//           <div className="text-center mb-12">
//             <h1 className="text-3xl font-bold mb-4">Creator Guidelines</h1>
//             <p className="text-muted-foreground text-lg">
//               Everything you need to know to succeed as a creator on our platform
//             </p>
//           </div>

//           <div className="flex flex-col lg:flex-row gap-8">
//             {/* Sidebar Navigation */}
//             <div className="lg:w-1/4">
//               <div className="sticky top-24 bg-card rounded-lg border p-4">
//                 <h2 className="font-semibold mb-4">Sections</h2>
//                 <nav className="space-y-2">
//                   {Object.entries(guidelines).map(([key, section]) => (
//                     <button
//                       key={key}
//                       onClick={() => setActiveSection(key)}
//                       className={`w-full text-left px-3 py-2 rounded-md text-sm ${
//                         activeSection === key
//                           ? "bg-primary-100 text-primary-700 font-medium"
//                           : "text-muted-foreground hover:bg-muted"
//                       }`}
//                     >
//                       {section.title}
//                     </button>
//                   ))}
//                 </nav>
                
//                 <div className="mt-8 pt-4 border-t">
//                   <Button asChild variant="outline" className="w-full mb-2">
//                     <Link href="/sell">
//                       Apply to Sell
//                     </Link>
//                   </Button>
//                   <Button asChild variant="outline" className="w-full">
//                     <a href="#" onClick={(e) => {
//                       e.preventDefault();
//                       window.print();
//                     }}>
//                       <Download className="h-4 w-4 mr-2" />
//                       Download PDF
//                     </a>
//                   </Button>
//                 </div>
//               </div>
//             </div>

//             {/* Main Content */}
//             <div className="lg:w-3/4">
//               <div className="bg-card rounded-lg border p-6">
//                 <h2 className="text-2xl font-bold mb-6">
//                   {guidelines[activeSection].title}
//                 </h2>
                
//                 <div className="prose prose-primary max-w-none">
//                   {guidelines[activeSection].content}
//                 </div>
//               </div>
              
//               {/* Navigation between sections */}
//               <div className="flex justify-between mt-8">
//                 <Button 
//                   variant="outline" 
//                   onClick={() => {
//                     const keys = Object.keys(guidelines);
//                     const currentIndex = keys.indexOf(activeSection);
//                     if (currentIndex > 0) {
//                       setActiveSection(keys[currentIndex - 1]);
//                     }
//                   }}
//                   disabled={activeSection === "overview"}
//                 >
//                   Previous Section
//                 </Button>
                
//                 <Button 
//                   onClick={() => {
//                     const keys = Object.keys(guidelines);
//                     const currentIndex = keys.indexOf(activeSection);
//                     if (currentIndex < keys.length - 1) {
//                       setActiveSection(keys[currentIndex + 1]);
//                     }
//                   }}
//                   disabled={activeSection === "compliance"}
//                 >
//                   Next Section
//                 </Button>
//               </div>
//             </div>
//           </div>

//           {/* Support Section */}
//           <div className="bg-primary-50 rounded-lg p-8 mt-12 text-center">
//             <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
//             <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
//               Our creator support team is here to help you understand these guidelines 
//               and succeed on our platform.
//             </p>
//             <div className="flex flex-col sm:flex-row gap-4 justify-center">
//               <Button asChild>
//                 <Link href="/contact">
//                   Contact Support
//                 </Link>
//               </Button>
//               <Button variant="outline" asChild>
//                 <Link href="/help">
//                   Visit Help Center
//                 </Link>
//               </Button>
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }