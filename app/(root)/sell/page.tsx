"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  CheckCircle,
  Star,
  Users,
  DollarSign,
  Shield,
  Truck,
  HelpCircle,
  FileText,
  ArrowRight,
  Store,
  Sparkles,
  Target,
  Heart,
  Zap,
  BadgeCheck,
  Calendar,
  Clock,
  Mail
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SellPage() {
  const benefits = [
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Reach More Customers",
      description: "Connect with thousands of customers who value handmade, unique products."
    },
    {
      icon: <DollarSign className="h-8 w-8 text-primary" />,
      title: "Fair Commission",
      description: "Keep 85% of every sale with transparent pricing and no hidden fees."
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "Secure Payments",
      description: "Get paid securely and on time with our reliable payment system."
    },
    {
      icon: <Truck className="h-8 w-8 text-primary" />,
      title: "Shipping Support",
      description: "Access discounted shipping rates and simplified order fulfillment."
    }
  ];

  const steps = [
    {
      number: 1,
      title: "Apply from Your Profile",
      description: "Complete our simple application in your account settings"
    },
    {
      number: 2,
      title: "Quality Review",
      description: "We review your application to maintain our high standards"
    },
    {
      number: 3,
      title: "Setup Your Shop",
      description: "Create your storefront and add your products"
    },
    {
      number: 4,
      title: "Start Selling",
      description: "Begin connecting with customers who love handmade"
    }
  ];

  const stats = [
    { number: "500+", label: "Active Creators", icon: <Store className="h-6 w-6" /> },
    { number: "₹2.5M+", label: "Paid to Creators", icon: <DollarSign className="h-6 w-6" /> },
    { number: "95%", label: "Satisfaction Rate", icon: <Heart className="h-6 w-6" /> },
    { number: "48h", label: "Average Review Time", icon: <Clock className="h-6 w-6" /> }
  ];

  const successStories = [
    {
      quote: "Since joining Kyzat, my pottery business has grown by 200%. The platform is easy to use and the community support is incredible.",
      author: "Sarah Johnson",
      business: "Earth & Fire Pottery",
      highlight: "200% business growth"
    },
    {
      quote: "The exposure my jewelry business has received through this platform is unmatched. I've connected with customers who truly appreciate handmade quality.",
      author: "Michael Chen",
      business: "Silver Linings Jewelry",
      highlight: "Unmatched exposure"
    },
    {
      quote: "As a new creator, the guidance and support I received helped me set up my shop quickly. Now I'm making sales consistently every week!",
      author: "Jessica Williams",
      business: "Weaver's Studio",
      highlight: "Consistent weekly sales"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary to-purple-700 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="flex justify-center mb-6">
              <Sparkles className="h-12 w-12 text-amber-300" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Turn Your Passion Into Profit</h1>
            <p className="text-xl max-w-2xl mx-auto mb-8">
              Join our curated community of talented creators and reach customers who appreciate 
              handmade quality and unique products.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-background text-primary-700 hover:bg-gray-100" asChild>
                <Link href="/profile#creator-application">
                  Apply Now from Your Profile
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-background/10">
                <Mail className="h-5 w-5 mr-2" />
                Contact Support
              </Button>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Why Creators Love Our Platform</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                We&apos;ve built everything around helping you succeed as a creative entrepreneur
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow bg-muted">
                  <CardContent className="p-6">
                    <div className="flex justify-center mb-4">
                      {benefit.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                    <CardDescription>{benefit.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Join Our Thriving Community</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <Card key={index} className="text-center border-0 bg-muted shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex justify-center mb-4 text-primary">
                      {stat.icon}
                    </div>
                    <p className="text-4xl font-bold text-primary-700 mb-2">{stat.number}</p>
                    <CardDescription>{stat.label}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Simple Path to Success</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Our straightforward process helps you start selling quickly while maintaining quality standards
              </p>
            </div>
            <div className="grid md:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="text-center relative">
                  {/* Connecting line */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-1/2 right-0 h-0.5 bg-primary/20 -z-10"></div>
                  )}
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-background text-xl font-bold mx-auto mb-4 relative">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <CardDescription>{step.description}</CardDescription>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quality Standards Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Why We Have Standards</h2>
                <p className="text-xl text-muted-foreground">
                  We carefully review all applications to maintain the quality our customers expect
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <Card className="border-0 shadow-sm bg-muted py-6">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BadgeCheck className="h-6 w-6 text-green-600 mr-2" />
                      For Customers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Guaranteed quality and craftsmanship</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Authentic handmade products</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Reliable sellers and consistent experience</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm bg-muted py-6">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="h-6 w-6 text-blue-600 mr-2" />
                      For Creators
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Premium marketplace positioning</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Customers who value quality over price</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Reduced competition from mass-produced items</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <Alert className="mt-8 bg-muted border-blue-200">
                <AlertTitle>Our Review Process</AlertTitle>
                <AlertDescription className="text-blue-800">
                  Each application is personally reviewed by our team within 48 hours. 
                  We look for quality craftsmanship, unique designs, and alignment with 
                  our community values. Even if you&apos;re new to selling online, we welcome 
                  applications from dedicated artisans.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </section>

        {/* Commission Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">Transparent, Creator-Friendly Pricing</h2>
              <p className="text-xl text-muted-foreground mb-8">
                We believe creators should keep most of their earnings while we handle the complex parts
              </p>

              <Card className="shadow-lg border-0 bg-mute-gray/10">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row items-center justify-center mb-6 gap-8 ">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-primary-700">15%</div>
                      <CardDescription>Commission Fee</CardDescription>
                    </div>
                    <div className="text-3xl text-muted-foreground">→</div>
                    <div className="text-center">
                      <div className="text-5xl font-bold text-green-600">85%</div>
                      <CardDescription>You Keep</CardDescription>
                    </div>
                  </div>

                  <CardDescription className="mb-6">
                    * Includes payment processing fees. No listing fees, monthly subscriptions, or hidden costs.
                  </CardDescription>
                  
                  <div className="p-4 rounded-lg text-left max-w-md mx-auto bg-blue-50/5">
                    <h4 className="font-semibold mb-2 flex items-center">
                      <Zap className="h-5 w-5 text-amber-600 mr-2" />
                      Example Calculation
                    </h4>
                    <p className="text-sm">
                      Sell a product for <strong>₹50</strong> → You keep <strong>₹42.50</strong> after our commission
                    </p>
                    <p className="mt-2 text-center text-muted-foreground">or</p>
                    <p className="mt-2 text-xs text-center text-muted-foreground">Check <Link href={"/commission"} className="underline">here</Link> for more information on commission.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 bg-primary-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Success Stories from Our Creators</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Hear from artisans who have transformed their passion into thriving businesses
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {successStories.map((story, index) => (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-amber-500 fill-current" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4 italic">&quot;{story.quote}&quot;</p>
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary mr-3">
                        <span className="font-semibold">{story.author[0]}</span>
                      </div>
                      <div>
                        <p className="font-semibold">{story.author}</p>
                        <CardDescription>{story.business}</CardDescription>
                      </div>
                    </div>
                    <div className="mt-4 bg-green-50 text-green-800 text-sm px-3 py-1 rounded-full inline-block">
                      {story.highlight}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary to-purple-700 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Your Creator Journey?</h2>
            <p className="text-xl max-w-2xl mx-auto mb-8">
              Join hundreds of successful artisans who are growing their businesses with our support
            </p>
            
            <Alert className="max-w-2xl mx-auto mb-8 bg-background/10 border-white/20">
              <AlertTitle className="text-white">Apply from Your Profile</AlertTitle>
              <AlertDescription className="text-white/90">
                Existing customers can apply directly from their account profile page. 
                We&apos;ll guide you through our simple application process.
              </AlertDescription>
            </Alert>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-background text-primary-700 hover:bg-gray-100" asChild>
                <Link href="/profile#creator-application">
                  Apply Now from Your Profile
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-background/10">
                <HelpCircle className="h-5 w-5 mr-2" />
                Learn More
              </Button>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-white/80">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Application review within 48 hours</span>
              </div>
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                <span>Quality standards protect your brand</span>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
              
              <div className="space-y-6">
                <Card className="py-6">
                  <CardHeader>
                    <CardTitle>How do I apply to become a creator?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Simply go to your profile page and click &quot;Become a Creator&quot; to start the application process. 
                      You&apos;ll need to provide information about your craft, upload examples of your work, and agree to our quality standards.
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card className="py-6">
                  <CardHeader>
                    <CardTitle>What are the requirements to become a creator?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      We look for authentic handmade products, quality craftsmanship, and unique designs. 
                      You&apos;ll need to demonstrate your creative process and commitment to maintaining our quality standards.
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card className="py-6">
                  <CardHeader>
                    <CardTitle>How long does the application process take?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Most applications are reviewed within 48 hours. The initial application takes about 15-20 minutes to complete. 
                      Once approved, you can set up your shop and start listing products.
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card className="py-6">
                  <CardHeader>
                    <CardTitle>Do I need to have sold products before?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Not at all! We welcome both experienced sellers and new creators. What matters most is the quality 
                      of your work and your commitment to your craft.
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>

              {/* Support Info */}
              <div className="text-center mt-12">
                <p className="text-muted-foreground mb-4">
                  Still have questions about becoming a creator?
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="outline" asChild>
                    <Link href="/help/creators">
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Creator Help Center
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/contact">
                      <FileText className="h-4 w-4 mr-2" />
                      Contact Our Team
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import Link from "next/link";
// import {
//   CheckCircle,
//   Star,
//   Users,
//   DollarSign,
//   Shield,
//   Truck,
//   HelpCircle,
//   FileText,
//   ArrowRight,
//   Upload,
//   X
// } from "lucide-react";

// export default function SellPage() {
//   const [currentStep, setCurrentStep] = useState(1);
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     businessName: "",
//     location: "",
//     productCategory: "",
//     description: "",
//     website: "",
//     socialMedia: "",
//     images: []
//   });

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleImageUpload = (e) => {
//     const files = Array.from(e.target.files);
//     // In a real app, you would upload these to a server
//     // For now, we'll just store the file names
//     setFormData(prev => ({
//       ...prev,
//       images: [...prev.images, ...files.map(file => file.name)]
//     }));
//   };

//   const removeImage = (index) => {
//     setFormData(prev => ({
//       ...prev,
//       images: prev.images.filter((_, i) => i !== index)
//     }));
//   };

//   const nextStep = () => {
//     setCurrentStep(prev => prev + 1);
//   };

//   const prevStep = () => {
//     setCurrentStep(prev => prev - 1);
//   };

//   const submitApplication = (e) => {
//     e.preventDefault();
//     // In a real app, you would submit the form data to your backend
//     alert("Application submitted! We'll review your information and get back to you soon.");
//     // Reset form
//     setFormData({
//       name: "",
//       email: "",
//       businessName: "",
//       location: "",
//       productCategory: "",
//       description: "",
//       website: "",
//       socialMedia: "",
//       images: []
//     });
//     setCurrentStep(1);
//   };

//   const benefits = [
//     {
//       icon: <Users className="h-8 w-8 text-primary" />,
//       title: "Reach More Customers",
//       description: "Connect with thousands of customers who value handmade, unique products."
//     },
//     {
//       icon: <DollarSign className="h-8 w-8 text-primary" />,
//       title: "Fair Commission",
//       description: "Keep 85% of every sale with transparent pricing and no hidden fees."
//     },
//     {
//       icon: <Shield className="h-8 w-8 text-primary" />,
//       title: "Secure Payments",
//       description: "Get paid securely and on time with our reliable payment system."
//     },
//     {
//       icon: <Truck className="h-8 w-8 text-primary" />,
//       title: "Shipping Support",
//       description: "Access discounted shipping rates and simplified order fulfillment."
//     }
//   ];

//   const steps = [
//     {
//       number: 1,
//       title: "Apply",
//       description: "Fill out our simple application form"
//     },
//     {
//       number: 2,
//       title: "Review",
//       description: "We review your application within 48 hours"
//     },
//     {
//       number: 3,
//       title: "Onboard",
//       description: "Set up your shop and add your products"
//     },
//     {
//       number: 4,
//       title: "Sell",
//       description: "Start selling to our community of buyers"
//     }
//   ];

//   const stats = [
//     { number: "500+", label: "Active Creators" },
//     { number: "$2.5M+", label: "Paid to Creators" },
//     { number: "95%", label: "Satisfaction Rate" },
//     { number: "48h", label: "Average Approval Time" }
//   ];

//   return (
//     <div className="min-h-screen bg-background">
//       <main>
//         {/* Hero Section */}
//         <section className="bg-gradient-to-r from-primary to-purple-700 text-white py-16">
//           <div className="container mx-auto px-4 text-center">
//             <h1 className="text-4xl md:text-5xl font-bold mb-6">Sell Your Creations</h1>
//             <p className="text-xl max-w-2xl mx-auto mb-8">
//               Join our community of talented creators and reach customers who appreciate handmade quality and unique products.
//             </p>
//             <Button size="lg" className="bg-white text-primary-700 hover:bg-gray-100" onClick={() => document.getElementById("application").scrollIntoView()}>
//               Apply Now
//               <ArrowRight className="h-5 w-5 ml-2" />
//             </Button>
//           </div>
//         </section>

//         {/* Benefits Section */}
//         <section className="py-16 bg-white">
//           <div className="container mx-auto px-4">
//             <h2 className="text-3xl font-bold text-center mb-12">Why Sell With Us?</h2>
//             <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
//               {benefits.map((benefit, index) => (
//                 <div key={index} className="text-center">
//                   <div className="flex justify-center mb-4">
//                     {benefit.icon}
//                   </div>
//                   <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
//                   <p className="text-muted-foreground">{benefit.description}</p>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </section>

//         {/* Stats Section */}
//         <section className="py-16 bg-primary-50">
//           <div className="container mx-auto px-4">
//             <h2 className="text-3xl font-bold text-center mb-12">Our Creator Community</h2>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
//               {stats.map((stat, index) => (
//                 <div key={index} className="text-center">
//                   <p className="text-4xl font-bold text-primary-700 mb-2">{stat.number}</p>
//                   <p className="text-muted-foreground">{stat.label}</p>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </section>

//         {/* Process Section */}
//         <section className="py-16 bg-white">
//           <div className="container mx-auto px-4">
//             <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
//             <div className="grid md:grid-cols-4 gap-8">
//               {steps.map((step, index) => (
//                 <div key={index} className="text-center">
//                   <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary text-2xl font-bold mx-auto mb-4">
//                     {step.number}
//                   </div>
//                   <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
//                   <p className="text-muted-foreground">{step.description}</p>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </section>

//         {/* Commission Section */}
//         <section className="py-16 bg-primary-50">
//           <div className="container mx-auto px-4">
//             <div className="max-w-4xl mx-auto text-center">
//               <h2 className="text-3xl font-bold mb-6">Simple, Transparent Pricing</h2>
//               <p className="text-xl text-muted-foreground mb-8">
//                 We believe creators should keep most of their earnings. That's why we only charge a 15% commission on sales.
//               </p>

//               <div className="bg-white rounded-xl p-8 shadow-sm max-w-2xl mx-auto">
//                 <div className="flex items-center justify-center mb-6">
//                   <div className="text-center">
//                     <div className="text-5xl font-bold text-primary-700">15%</div>
//                     <div className="text-muted-foreground">Commission Fee</div>
//                   </div>
//                   <div className="mx-8 text-3xl text-muted-foreground">→</div>
//                   <div className="text-center">
//                     <div className="text-5xl font-bold text-green-600">85%</div>
//                     <div className="text-muted-foreground">You Keep</div>
//                   </div>
//                 </div>

//                 <div className="text-sm text-muted-foreground mb-6">
//                   * Includes payment processing fees. No listing fees or monthly subscriptions.
//                 </div>

//                 <div className="bg-primary-100 p-4 rounded-lg text-left">
//                   <h4 className="font-semibold mb-2">Example:</h4>
//                   <p>If you sell a product for $50, you'll receive $42.50 after our commission.</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Testimonials Section */}
//         <section className="py-16 bg-white">
//           <div className="container mx-auto px-4">
//             <h2 className="text-3xl font-bold text-center mb-12">Success Stories</h2>
//             <div className="grid md:grid-cols-3 gap-8">
//               <div className="bg-card rounded-xl border p-6">
//                 <div className="flex items-center mb-4">
//                   {[...Array(5)].map((_, i) => (
//                     <Star key={i} className="h-5 w-5 text-amber-500 fill-current" />
//                   ))}
//                 </div>
//                 <p className="text-muted-foreground mb-4">
//                   "Since joining Kyzat, my pottery business has grown by 200%. The platform is easy to use and the community support is incredible."
//                 </p>
//                 <div className="flex items-center">
//                   <div className="w-10 h-10 bg-muted rounded-full mr-3"></div>
//                   <div>
//                     <p className="font-semibold">Sarah Johnson</p>
//                     <p className="text-sm text-muted-foreground">Earth & Fire Pottery</p>
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-card rounded-xl border p-6">
//                 <div className="flex items-center mb-4">
//                   {[...Array(5)].map((_, i) => (
//                     <Star key={i} className="h-5 w-5 text-amber-500 fill-current" />
//                   ))}
//                 </div>
//                 <p className="text-muted-foreground mb-4">
//                   "The exposure my jewelry business has received through this platform is unmatched. I've connected with customers who truly appreciate handmade quality."
//                 </p>
//                 <div className="flex items-center">
//                   <div className="w-10 h-10 bg-muted rounded-full mr-3"></div>
//                   <div>
//                     <p className="font-semibold">Michael Chen</p>
//                     <p className="text-sm text-muted-foreground">Silver Linings Jewelry</p>
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-card rounded-xl border p-6">
//                 <div className="flex items-center mb-4">
//                   {[...Array(5)].map((_, i) => (
//                     <Star key={i} className="h-5 w-5 text-amber-500 fill-current" />
//                   ))}
//                 </div>
//                 <p className="text-muted-foreground mb-4">
//                   "As a new creator, the guidance and support I received helped me set up my shop quickly. Now I'm making sales consistently every week!"
//                 </p>
//                 <div className="flex items-center">
//                   <div className="w-10 h-10 bg-muted rounded-full mr-3"></div>
//                   <div>
//                     <p className="font-semibold">Jessica Williams</p>
//                     <p className="text-sm text-muted-foreground">Weaver's Studio</p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Application Form Section */}
//         <section id="application" className="py-16 bg-primary-50">
//           <div className="container mx-auto px-4">
//             <div className="max-w-3xl mx-auto">
//               <h2 className="text-3xl font-bold text-center mb-2">Apply to Become a Creator</h2>
//               <p className="text-muted-foreground text-center mb-8">
//                 Fill out the form below to apply. We'll review your application and get back to you within 48 hours.
//               </p>

//               <div className="bg-white rounded-xl border p-6">
//                 {/* Progress Steps */}
//                 <div className="flex justify-between mb-8 relative">
//                   <div className="absolute top-3 left-0 right-0 h-0.5 bg-muted -z-10"></div>
//                   {[1, 2, 3].map(step => (
//                     <div key={step} className="flex flex-col items-center">
//                       <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
//                         currentStep >= step ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
//                       }`}>
//                         {currentStep > step ? <CheckCircle className="h-5 w-5" /> : step}
//                       </div>
//                       <span className="text-sm mt-2">
//                         {step === 1 && 'Information'}
//                         {step === 2 && 'Products'}
//                         {step === 3 && 'Submit'}
//                       </span>
//                     </div>
//                   ))}
//                 </div>

//                 <form onSubmit={submitApplication}>
//                   {/* Step 1: Basic Information */}
//                   {currentStep === 1 && (
//                     <div className="space-y-6">
//                       <h3 className="text-xl font-semibold mb-4">Basic Information</h3>

//                       <div className="grid md:grid-cols-2 gap-6">
//                         <div>
//                           <label htmlFor="name" className="block text-sm font-medium mb-2">
//                             Your Name *
//                           </label>
//                           <Input
//                             id="name"
//                             name="name"
//                             value={formData.name}
//                             onChange={handleInputChange}
//                             required
//                           />
//                         </div>

//                         <div>
//                           <label htmlFor="email" className="block text-sm font-medium mb-2">
//                             Email Address *
//                           </label>
//                           <Input
//                             id="email"
//                             name="email"
//                             type="email"
//                             value={formData.email}
//                             onChange={handleInputChange}
//                             required
//                           />
//                         </div>
//                       </div>

//                       <div className="grid md:grid-cols-2 gap-6">
//                         <div>
//                           <label htmlFor="businessName" className="block text-sm font-medium mb-2">
//                             Business/Shop Name *
//                           </label>
//                           <Input
//                             id="businessName"
//                             name="businessName"
//                             value={formData.businessName}
//                             onChange={handleInputChange}
//                             required
//                           />
//                         </div>

//                         <div>
//                           <label htmlFor="location" className="block text-sm font-medium mb-2">
//                             Your Location *
//                           </label>
//                           <Input
//                             id="location"
//                             name="location"
//                             value={formData.location}
//                             onChange={handleInputChange}
//                             required
//                           />
//                         </div>
//                       </div>

//                       <div>
//                         <label htmlFor="productCategory" className="block text-sm font-medium mb-2">
//                           What do you create? *
//                         </label>
//                         <select
//                           id="productCategory"
//                           name="productCategory"
//                           value={formData.productCategory}
//                           onChange={handleInputChange}
//                           className="w-full p-2 border rounded-md"
//                           required
//                         >
//                           <option value="">Select a category</option>
//                           <option value="clothing">Clothing & Accessories</option>
//                           <option value="jewelry">Jewelry</option>
//                           <option value="crockery">Pottery & Ceramics</option>
//                           <option value="art">Art</option>
//                           <option value="home">Home Decor</option>
//                           <option value="other">Other</option>
//                         </select>
//                       </div>
//                     </div>
//                   )}

//                   {/* Step 2: Product Information */}
//                   {currentStep === 2 && (
//                     <div className="space-y-6">
//                       <h3 className="text-xl font-semibold mb-4">Tell Us About Your Work</h3>

//                       <div>
//                         <label htmlFor="description" className="block text-sm font-medium mb-2">
//                           Describe your products and creative process *
//                         </label>
//                         <Textarea
//                           id="description"
//                           name="description"
//                           value={formData.description}
//                           onChange={handleInputChange}
//                           rows={4}
//                           required
//                         />
//                       </div>

//                       <div className="grid md:grid-cols-2 gap-6">
//                         <div>
//                           <label htmlFor="website" className="block text-sm font-medium mb-2">
//                             Website (optional)
//                           </label>
//                           <Input
//                             id="website"
//                             name="website"
//                             type="url"
//                             value={formData.website}
//                             onChange={handleInputChange}
//                             placeholder="https://..."
//                           />
//                         </div>

//                         <div>
//                           <label htmlFor="socialMedia" className="block text-sm font-medium mb-2">
//                             Social Media (optional)
//                           </label>
//                           <Input
//                             id="socialMedia"
//                             name="socialMedia"
//                             value={formData.socialMedia}
//                             onChange={handleInputChange}
//                             placeholder="@username or URL"
//                           />
//                         </div>
//                       </div>

//                       <div>
//                         <label htmlFor="images" className="block text-sm font-medium mb-2">
//                           Upload photos of your work (optional)
//                         </label>
//                         <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
//                           <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
//                           <p className="text-sm text-muted-foreground mb-3">
//                             Drag & drop images here or click to browse
//                           </p>
//                           <input
//                             id="images"
//                             name="images"
//                             type="file"
//                             multiple
//                             accept="image/*"
//                             onChange={handleImageUpload}
//                             className="hidden"
//                           />
//                           <Button
//                             type="button"
//                             variant="outline"
//                             onClick={() => document.getElementById('images').click()}
//                           >
//                             Select Images
//                           </Button>
//                         </div>

//                         {formData.images.length > 0 && (
//                           <div className="mt-4">
//                             <p className="text-sm font-medium mb-2">Selected images:</p>
//                             <div className="flex flex-wrap gap-2">
//                               {formData.images.map((image, index) => (
//                                 <div key={index} className="relative">
//                                   <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
//                                     <span className="text-xs truncate px-1">{image}</span>
//                                   </div>
//                                   <button
//                                     type="button"
//                                     onClick={() => removeImage(index)}
//                                     className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
//                                   >
//                                     <X className="h-3 w-3" />
//                                   </button>
//                                 </div>
//                               ))}
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   )}

//                   {/* Step 3: Review and Submit */}
//                   {currentStep === 3 && (
//                     <div className="space-y-6">
//                       <h3 className="text-xl font-semibold mb-4">Review Your Information</h3>

//                       <div className="bg-muted/30 p-4 rounded-lg">
//                         <h4 className="font-semibold mb-3">Basic Information</h4>
//                         <div className="grid md:grid-cols-2 gap-4 text-sm">
//                           <div>
//                             <span className="text-muted-foreground">Name:</span>
//                             <p>{formData.name || "Not provided"}</p>
//                           </div>
//                           <div>
//                             <span className="text-muted-foreground">Email:</span>
//                             <p>{formData.email || "Not provided"}</p>
//                           </div>
//                           <div>
//                             <span className="text-muted-foreground">Business Name:</span>
//                             <p>{formData.businessName || "Not provided"}</p>
//                           </div>
//                           <div>
//                             <span className="text-muted-foreground">Location:</span>
//                             <p>{formData.location || "Not provided"}</p>
//                           </div>
//                           <div>
//                             <span className="text-muted-foreground">Product Category:</span>
//                             <p>{formData.productCategory || "Not provided"}</p>
//                           </div>
//                         </div>
//                       </div>

//                       <div className="bg-muted/30 p-4 rounded-lg">
//                         <h4 className="font-semibold mb-3">Product Information</h4>
//                         <div className="text-sm">
//                           <span className="text-muted-foreground">Description:</span>
//                           <p className="mt-1">{formData.description || "Not provided"}</p>
//                         </div>

//                         {(formData.website || formData.socialMedia) && (
//                           <div className="mt-4">
//                             <h4 className="font-semibold mb-2">Links</h4>
//                             <div className="text-sm">
//                               {formData.website && <p>Website: {formData.website}</p>}
//                               {formData.socialMedia && <p>Social Media: {formData.socialMedia}</p>}
//                             </div>
//                           </div>
//                         )}

//                         {formData.images.length > 0 && (
//                           <div className="mt-4">
//                             <h4 className="font-semibold mb-2">Images ({formData.images.length})</h4>
//                             <p className="text-sm">Images will be uploaded with your application</p>
//                           </div>
//                         )}
//                       </div>

//                       <div className="bg-primary-50 p-4 rounded-lg">
//                         <h4 className="font-semibold mb-2">Next Steps</h4>
//                         <p className="text-sm text-muted-foreground">
//                           After submitting your application, our team will review it within 48 hours.
//                           If approved, you'll receive an email with instructions to set up your shop.
//                         </p>
//                       </div>
//                     </div>
//                   )}

//                   {/* Navigation Buttons */}
//                   <div className="flex justify-between mt-8">
//                     {currentStep > 1 ? (
//                       <Button type="button" variant="outline" onClick={prevStep}>
//                         Back
//                       </Button>
//                     ) : (
//                       <div></div>
//                     )}

//                     {currentStep < 3 ? (
//                       <Button type="button" onClick={nextStep}>
//                         Continue
//                         <ArrowRight className="h-4 w-4 ml-2" />
//                       </Button>
//                     ) : (
//                       <Button type="submit">
//                         Submit Application
//                       </Button>
//                     )}
//                   </div>
//                 </form>
//               </div>

//               {/* Support Info */}
//               <div className="text-center mt-8">
//                 <p className="text-muted-foreground mb-4">
//                   Have questions about selling on our platform?
//                 </p>
//                 <div className="flex flex-col sm:flex-row gap-4 justify-center">
//                   <Button variant="outline" asChild>
//                     <Link href="/help">
//                       <HelpCircle className="h-4 w-4 mr-2" />
//                       Help Center
//                     </Link>
//                   </Button>
//                   <Button variant="outline" asChild>
//                     <Link href="/contact">
//                       <FileText className="h-4 w-4 mr-2" />
//                       Contact Support
//                     </Link>
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>
//       </main>
//     </div>
//   );
// }
