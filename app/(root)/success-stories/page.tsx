"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { 
  Star, 
  Quote,
  Award,
  Calendar,
  MapPin,
  ShoppingBag,
  ArrowRight,
  Play,
} from "lucide-react";

interface SuccessStory {
  id: number;
  name: string;
  business: string;
  category: string;
  location: string;
  joined: string;
  story: string;
  stats: {
    sales: string;
    products: number;
    followers: string;
  };
  image: string;
  featured: boolean;
  video: boolean;
}

interface Category {
  id: string;
  name: string;
}

interface Testimonial {
  rating: number;
  content: string;
  author: string;
  business: string;
}

export default function SuccessStoriesPage() {
  const [activeCategory, setActiveCategory] = useState("all");

  const successStories: SuccessStory[] = [
    {
      id: 1,
      name: "Sarah Johnson",
      business: "Earth & Fire Pottery",
      category: "pottery",
      location: "Portland, OR",
      joined: "March 2022",
      story: "From hobbyist to full-time ceramic artist, Sarah now supports her family through her pottery business.",
      stats: {
        sales: "45K+",
        products: 28,
        followers: "12.4K"
      },
      image: "/creator-1.jpg",
      featured: true,
      video: true
    },
    {
      id: 2,
      name: "Michael Chen",
      business: "Silver Linings Jewelry",
      category: "jewelry",
      location: "Santa Fe, NM",
      joined: "January 2021",
      story: "Michael left his corporate job to pursue jewelry making full-time and hasn't looked back.",
      stats: {
        sales: "32K+",
        products: 42,
        followers: "15.7K"
      },
      image: "/creator-2.jpg",
      featured: true,
      video: false
    },
    {
      id: 3,
      name: "Jessica Williams",
      business: "Weaver's Studio",
      category: "textiles",
      location: "Asheville, NC",
      joined: "August 2020",
      story: "Jessica revived traditional weaving techniques and now teaches workshops alongside her product sales.",
      stats: {
        sales: "28K+",
        products: 15,
        followers: "9.8K"
      },
      image: "/creator-3.jpg",
      featured: false,
      video: true
    },
    {
      id: 4,
      name: "David Kim",
      business: "Woodcraft by James",
      category: "woodworking",
      location: "Denver, CO",
      joined: "November 2021",
      story: "David turned his garage workshop into a thriving business selling handcrafted wooden home goods.",
      stats: {
        sales: "38K+",
        products: 24,
        followers: "11.2K"
      },
      image: "/creator-4.jpg",
      featured: false,
      video: false
    },
    {
      id: 5,
      name: "Maria Rodriguez",
      business: "Coastal Art Designs",
      category: "art",
      location: "San Diego, CA",
      joined: "June 2022",
      story: "Maria's ocean-inspired artwork found its perfect audience through our platform.",
      stats: {
        sales: "22K+",
        products: 19,
        followers: "8.5K"
      },
      image: "/creator-5.jpg",
      featured: false,
      video: true
    },
    {
      id: 6,
      name: "Alex Thompson",
      business: "Threads of Tradition",
      category: "textiles",
      location: "Santa Fe, NM",
      joined: "February 2021",
      story: "Preserving cultural heritage through contemporary textile arts while building a sustainable business.",
      stats: {
        sales: "41K+",
        products: 17,
        followers: "13.1K"
      },
      image: "/creator-6.jpg",
      featured: true,
      video: false
    }
  ];

  const categories: Category[] = [
    { id: "all", name: "All Stories" },
    { id: "pottery", name: "Pottery" },
    { id: "jewelry", name: "Jewelry" },
    { id: "textiles", name: "Textiles" },
    { id: "woodworking", name: "Woodworking" },
    { id: "art", name: "Art" }
  ];

  const testimonials: Testimonial[] = [
    {
      rating: 5,
      content: "This platform changed everything for my small business. The community support and exposure helped me go full-time within a year.",
      author: "Michael Chen",
      business: "Silver Linings Jewelry"
    },
    {
      rating: 5,
      content: "I've tried other platforms, but the commission structure and customer quality here are unmatched. This feels like a true partnership.",
      author: "Maria Rodriguez",
      business: "Coastal Art Designs"
    },
    {
      rating: 5,
      content: "The educational resources and supportive community made all the difference. I never felt alone in my entrepreneurial journey.",
      author: "Alex Thompson",
      business: "Threads of Tradition"
    }
  ];

  const filteredStories = activeCategory === "all" 
    ? successStories 
    : successStories.filter(story => story.category === activeCategory);

  const featuredStories = successStories.filter(story => story.featured);

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-3">Success Stories</h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto">
            Discover how talented creators are building thriving businesses on our platform
          </p>
        </div>

        {/* Hero Section */}
        <Card className="bg-gradient-to-r from-primary to-purple-700 text-primary-foreground border-0 mb-8 md:mb-12">
          <CardContent className="p-6 md:p-8 text-center">
            <div className="flex justify-center mb-4 md:mb-6">
              <Award className="h-8 w-8 md:h-12 md:w-12 text-amber-400" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Real Creators, Real Success</h2>
            <p className="text-primary-foreground/90 mb-4 md:mb-6 text-sm md:text-base">
              Join over 500 creators who are turning their passion into profit. Our platform has helped 
              artisans generate <span className="font-semibold">₹2.5M+</span> in sales and 
              connect with customers who truly appreciate handmade quality.
            </p>
            <Button asChild size="lg" className="bg-background text-foreground hover:bg-background/90">
              <Link href="/sell">
                Start Your Journey
                <ArrowRight className="h-4 w-4 md:h-5 md:w-5 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Featured Stories */}
        <div className="mb-12 md:mb-16">
          <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8 flex items-center">
            <Star className="h-5 w-5 md:h-6 md:w-6 mr-2 md:mr-3 text-amber-500" />
            Featured Stories
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {featuredStories.map((story) => (
              <Card key={story.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                <div className="h-40 md:h-48 bg-gradient-to-br from-primary/10 to-purple-100 dark:from-primary/20 dark:to-purple-900/20 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-primary rounded-full flex items-center justify-center text-white">
                      {story.video ? (
                        <Play className="h-5 w-5 md:h-6 md:w-6 ml-0.5" />
                      ) : (
                        <Quote className="h-5 w-5 md:h-6 md:w-6" />
                      )}
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 md:p-4">
                    <h3 className="font-semibold text-white text-sm md:text-base">{story.business}</h3>
                    <p className="text-primary-200 text-xs md:text-sm">{story.name}</p>
                  </div>
                </div>
                
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center text-xs md:text-sm text-muted-foreground mb-2 md:mb-3">
                    <MapPin className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                    {story.location}
                  </div>
                  
                  <p className="text-muted-foreground text-sm md:text-base mb-3 md:mb-4 line-clamp-3">{story.story}</p>
                  
                  <div className="grid grid-cols-3 gap-2 md:gap-4 text-center mb-3 md:mb-4">
                    <div>
                      <div className="font-bold text-primary text-sm md:text-base">{story.stats.sales}</div>
                      <div className="text-xs text-muted-foreground">Sales</div>
                    </div>
                    <div>
                      <div className="font-bold text-primary text-sm md:text-base">{story.stats.products}</div>
                      <div className="text-xs text-muted-foreground">Products</div>
                    </div>
                    <div>
                      <div className="font-bold text-primary text-sm md:text-base">{story.stats.followers}</div>
                      <div className="text-xs text-muted-foreground">Followers</div>
                    </div>
                  </div>
                  
                  <Button asChild variant="outline" className="w-full text-xs md:text-sm h-8 md:h-9">
                    <Link href={`/success-stories/${story.id}`}>
                      Read Full Story
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Category Filters */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Browse by Category</h2>
          <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
            <TabsList className="flex flex-wrap h-auto p-1 bg-muted">
              {categories.map((category) => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id}
                  className="flex-1 md:flex-none text-xs md:text-sm px-2 md:px-3 py-1.5 md:py-2 data-[state=active]:bg-background"
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* All Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
          {filteredStories.map((story) => (
            <Card key={story.id} className="group hover:shadow-md transition-shadow">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-start mb-3 md:mb-4">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-primary/10 to-purple-100 dark:from-primary/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mr-3 md:mr-4 flex-shrink-0">
                    <div className="text-lg md:text-xl font-bold text-primary">
                      {story.name.charAt(0)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm md:text-base">{story.business}</h3>
                    <p className="text-muted-foreground text-xs md:text-sm">by {story.name}</p>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {story.location}
                    </div>
                  </div>
                </div>
                
                <p className="text-muted-foreground text-sm md:text-base mb-3 md:mb-4 line-clamp-3">{story.story}</p>
                
                <div className="flex items-center justify-between mb-3 md:mb-4 text-xs md:text-sm">
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 md:h-4 md:w-4 mr-1 text-muted-foreground" />
                    Joined {story.joined}
                  </div>
                  <div className="flex items-center">
                    <ShoppingBag className="h-3 w-3 md:h-4 md:w-4 mr-1 text-muted-foreground" />
                    {story.stats.products} products
                  </div>
                </div>
                
                <Button asChild variant="outline" className="w-full text-xs md:text-sm h-8 md:h-9">
                  <Link href={`/success-stories/${story.id}`}>
                    Read Story
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <Card className="bg-muted/50 border-0 mb-12 md:mb-16">
          <CardContent className="p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-bold text-center mb-8 md:mb-12">By The Numbers</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              <div className="text-center">
                <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary-700 mb-1 md:mb-2">500+</div>
                <p className="text-muted-foreground text-sm md:text-base">Active Creators</p>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary-700 mb-1 md:mb-2">₹2.5M+</div>
                <p className="text-muted-foreground text-sm md:text-base">Total Sales</p>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary-700 mb-1 md:mb-2">95%</div>
                <p className="text-muted-foreground text-sm md:text-base">Satisfaction Rate</p>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary-700 mb-1 md:mb-2">48h</div>
                <p className="text-muted-foreground text-sm md:text-base">Avg. Approval Time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Video Testimonials */}
        <div className="mb-12 md:mb-16">
          <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8 flex items-center">
            <Play className="h-5 w-5 md:h-6 md:w-6 mr-2 md:mr-3 text-primary" />
            Creator Spotlights
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <Card className="bg-gradient-to-br from-primary/10 to-purple-100 dark:from-primary/20 dark:to-purple-900/20 border-0">
              <CardContent className="p-4 md:p-6 aspect-video flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <Play className="h-5 w-5 md:h-6 md:w-6 text-white ml-0.5" />
                  </div>
                  <h3 className="font-semibold text-sm md:text-base mb-1 md:mb-2">Sarah&apos;s Pottery Journey</h3>
                  <p className="text-muted-foreground text-xs md:text-sm">From hobby to full-time business</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 border-0">
              <CardContent className="p-4 md:p-6 aspect-video flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <Play className="h-5 w-5 md:h-6 md:w-6 text-white ml-0.5" />
                  </div>
                  <h3 className="font-semibold text-sm md:text-base mb-1 md:mb-2">Weaving Success</h3>
                  <p className="text-muted-foreground text-xs md:text-sm">Jessica&apos;s textile revolution</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Community Love */}
        <Card className="mb-12 md:mb-16">
          <CardContent className="p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-bold text-center mb-8 md:mb-12">What Our Creators Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-3 md:mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 md:h-5 md:w-5 text-amber-500 fill-current" />
                    ))}
                  </div>
                  <Quote className="h-6 w-6 md:h-8 md:w-8 text-primary-300 mx-auto mb-3 md:mb-4" />
                  <p className="text-muted-foreground text-sm md:text-base mb-3 md:mb-4">
                    &quot;{testimonial.content}&quot;
                  </p>
                  <p className="font-semibold text-sm md:text-base">— {testimonial.author}</p>
                  <p className="text-muted-foreground text-xs md:text-sm">{testimonial.business}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-primary to-purple-700 text-primary-foreground border-0">
          <CardContent className="p-6 md:p-8 lg:p-12 text-center">
            <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Ready to Write Your Success Story?</h2>
            <p className="text-primary-foreground/90 mb-4 md:mb-8 max-w-2xl mx-auto text-sm md:text-base">
              Join our community of talented creators and start building the business of your dreams. 
              We provide the platform, tools, and support you need to succeed.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="bg-background text-foreground hover:bg-background/90 text-sm md:text-base">
                <Link href="/sell">
                  Apply to Sell
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="bg-transparent border-background text-background hover:bg-background hover:text-primary text-sm md:text-base">
                <Link href="/creators">
                  Meet More Creators
                </Link>
              </Button>
            </div>
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
//   Star, 
//   Users, 
//   TrendingUp, 
//   Heart,
//   Quote,
//   Award,
//   Calendar,
//   MapPin,
//   ShoppingBag,
//   ArrowRight,
//   Play
// } from "lucide-react";

// export default function SuccessStoriesPage() {
//   const [activeCategory, setActiveCategory] = useState("all");

//   const successStories = [
//     {
//       id: 1,
//       name: "Sarah Johnson",
//       business: "Earth & Fire Pottery",
//       category: "pottery",
//       location: "Portland, OR",
//       joined: "March 2022",
//       story: "From hobbyist to full-time ceramic artist, Sarah now supports her family through her pottery business.",
//       stats: {
//         sales: "45K+",
//         products: 28,
//         followers: "12.4K"
//       },
//       image: "/creator-1.jpg",
//       featured: true,
//       video: true
//     },
//     {
//       id: 2,
//       name: "Michael Chen",
//       business: "Silver Linings Jewelry",
//       category: "jewelry",
//       location: "Santa Fe, NM",
//       joined: "January 2021",
//       story: "Michael left his corporate job to pursue jewelry making full-time and hasn't looked back.",
//       stats: {
//         sales: "32K+",
//         products: 42,
//         followers: "15.7K"
//       },
//       image: "/creator-2.jpg",
//       featured: true,
//       video: false
//     },
//     {
//       id: 3,
//       name: "Jessica Williams",
//       business: "Weaver's Studio",
//       category: "textiles",
//       location: "Asheville, NC",
//       joined: "August 2020",
//       story: "Jessica revived traditional weaving techniques and now teaches workshops alongside her product sales.",
//       stats: {
//         sales: "28K+",
//         products: 15,
//         followers: "9.8K"
//       },
//       image: "/creator-3.jpg",
//       featured: false,
//       video: true
//     },
//     {
//       id: 4,
//       name: "David Kim",
//       business: "Woodcraft by James",
//       category: "woodworking",
//       location: "Denver, CO",
//       joined: "November 2021",
//       story: "David turned his garage workshop into a thriving business selling handcrafted wooden home goods.",
//       stats: {
//         sales: "38K+",
//         products: 24,
//         followers: "11.2K"
//       },
//       image: "/creator-4.jpg",
//       featured: false,
//       video: false
//     },
//     {
//       id: 5,
//       name: "Maria Rodriguez",
//       business: "Coastal Art Designs",
//       category: "art",
//       location: "San Diego, CA",
//       joined: "June 2022",
//       story: "Maria's ocean-inspired artwork found its perfect audience through our platform.",
//       stats: {
//         sales: "22K+",
//         products: 19,
//         followers: "8.5K"
//       },
//       image: "/creator-5.jpg",
//       featured: false,
//       video: true
//     },
//     {
//       id: 6,
//       name: "Alex Thompson",
//       business: "Threads of Tradition",
//       category: "textiles",
//       location: "Santa Fe, NM",
//       joined: "February 2021",
//       story: "Preserving cultural heritage through contemporary textile arts while building a sustainable business.",
//       stats: {
//         sales: "41K+",
//         products: 17,
//         followers: "13.1K"
//       },
//       image: "/creator-6.jpg",
//       featured: true,
//       video: false
//     }
//   ];

//   const categories = [
//     { id: "all", name: "All Stories" },
//     { id: "pottery", name: "Pottery" },
//     { id: "jewelry", name: "Jewelry" },
//     { id: "textiles", name: "Textiles" },
//     { id: "woodworking", name: "Woodworking" },
//     { id: "art", name: "Art" }
//   ];

//   const filteredStories = activeCategory === "all" 
//     ? successStories 
//     : successStories.filter(story => story.category === activeCategory);

//   const featuredStories = successStories.filter(story => story.featured);

//   return (
//     <div className="min-h-screen bg-background">
//       <main className="container mx-auto px-4 py-8">
//         {/* Header */}
//         <div className="text-center mb-12">
//           <h1 className="text-3xl font-bold mb-4">Success Stories</h1>
//           <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
//             Discover how talented creators are building thriving businesses on our platform
//           </p>
//         </div>

//         {/* Hero Section */}
//         <div className="bg-gradient-to-r from-primary to-purple-700 text-white rounded-xl p-8 mb-12">
//           <div className="max-w-4xl mx-auto text-center">
//             <div className="flex justify-center mb-6">
//               <Award className="h-12 w-12 text-amber-400" />
//             </div>
//             <h2 className="text-2xl font-bold mb-4">Real Creators, Real Success</h2>
//             <p className="text-primary-100 mb-6">
//               Join over 500 creators who are turning their passion into profit. Our platform has helped 
//               artisans generate <span className="font-semibold text-white">$2.5M+</span> in sales and 
//               connect with customers who truly appreciate handmade quality.
//             </p>
//             <Button asChild size="lg" className="bg-white text-primary-700 hover:bg-gray-100">
//               <Link href="/sell">
//                 Start Your Journey
//                 <ArrowRight className="h-5 w-5 ml-2" />
//               </Link>
//             </Button>
//           </div>
//         </div>

//         {/* Featured Stories */}
//         <div className="mb-16">
//           <h2 className="text-2xl font-bold mb-8 flex items-center">
//             <Star className="h-6 w-6 mr-3 text-amber-500" />
//             Featured Stories
//           </h2>
          
//           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
//             {featuredStories.map((story) => (
//               <div key={story.id} className="bg-card rounded-xl border overflow-hidden group hover:shadow-lg transition">
//                 <div className="h-48 bg-gradient-to-br from-primary-100 to-purple-100 relative overflow-hidden">
//                   <div className="absolute inset-0 flex items-center justify-center">
//                     <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white">
//                       {story.video ? (
//                         <Play className="h-8 w-8 ml-1" />
//                       ) : (
//                         <Quote className="h-8 w-8" />
//                       )}
//                     </div>
//                   </div>
//                   <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
//                     <h3 className="font-semibold text-white">{story.business}</h3>
//                     <p className="text-primary-200 text-sm">{story.name}</p>
//                   </div>
//                 </div>
                
//                 <div className="p-6">
//                   <div className="flex items-center text-sm text-muted-foreground mb-3">
//                     <MapPin className="h-4 w-4 mr-1" />
//                     {story.location}
//                   </div>
                  
//                   <p className="text-muted-foreground mb-4 line-clamp-3">{story.story}</p>
                  
//                   <div className="grid grid-cols-3 gap-4 text-center mb-4">
//                     <div>
//                       <div className="font-bold text-primary">{story.stats.sales}</div>
//                       <div className="text-xs text-muted-foreground">Sales</div>
//                     </div>
//                     <div>
//                       <div className="font-bold text-primary">{story.stats.products}</div>
//                       <div className="text-xs text-muted-foreground">Products</div>
//                     </div>
//                     <div>
//                       <div className="font-bold text-primary">{story.stats.followers}</div>
//                       <div className="text-xs text-muted-foreground">Followers</div>
//                     </div>
//                   </div>
                  
//                   <Button asChild variant="outline" className="w-full">
//                     <Link href={`/success-stories/${story.id}`}>
//                       Read Full Story
//                     </Link>
//                   </Button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Category Filters */}
//         <div className="mb-8">
//           <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
//           <div className="flex flex-wrap gap-2">
//             {categories.map((category) => (
//               <Button
//                 key={category.id}
//                 variant={activeCategory === category.id ? "default" : "outline"}
//                 onClick={() => setActiveCategory(category.id)}
//               >
//                 {category.name}
//               </Button>
//             ))}
//           </div>
//         </div>

//         {/* All Stories Grid */}
//         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
//           {filteredStories.map((story) => (
//             <div key={story.id} className="bg-card rounded-lg border p-6 group hover:shadow-md transition">
//               <div className="flex items-start mb-4">
//                 <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-purple-100 rounded-full flex items-center justify-center mr-4">
//                   <div className="text-2xl font-bold text-primary">
//                     {story.name.charAt(0)}
//                   </div>
//                 </div>
//                 <div>
//                   <h3 className="font-semibold">{story.business}</h3>
//                   <p className="text-sm text-muted-foreground">by {story.name}</p>
//                   <div className="flex items-center text-xs text-muted-foreground mt-1">
//                     <MapPin className="h-3 w-3 mr-1" />
//                     {story.location}
//                   </div>
//                 </div>
//               </div>
              
//               <p className="text-muted-foreground mb-4 line-clamp-3">{story.story}</p>
              
//               <div className="flex items-center justify-between mb-4">
//                 <div className="flex items-center text-sm">
//                   <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
//                   Joined {story.joined}
//                 </div>
//                 <div className="flex items-center text-sm">
//                   <ShoppingBag className="h-4 w-4 mr-1 text-muted-foreground" />
//                   {story.stats.products} products
//                 </div>
//               </div>
              
//               <Button asChild variant="outline" className="w-full">
//                 <Link href={`/success-stories/${story.id}`}>
//                   Read Story
//                 </Link>
//               </Button>
//             </div>
//           ))}
//         </div>

//         {/* Stats Section */}
//         <div className="bg-primary-50 rounded-xl p-8 mb-16">
//           <h2 className="text-2xl font-bold text-center mb-12">By The Numbers</h2>
//           <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
//             <div className="text-center">
//               <div className="text-4xl font-bold text-primary-700 mb-2">500+</div>
//               <p className="text-muted-foreground">Active Creators</p>
//             </div>
//             <div className="text-center">
//               <div className="text-4xl font-bold text-primary-700 mb-2">$2.5M+</div>
//               <p className="text-muted-foreground">Total Sales</p>
//             </div>
//             <div className="text-center">
//               <div className="text-4xl font-bold text-primary-700 mb-2">95%</div>
//               <p className="text-muted-foreground">Satisfaction Rate</p>
//             </div>
//             <div className="text-center">
//               <div className="text-4xl font-bold text-primary-700 mb-2">48h</div>
//               <p className="text-muted-foreground">Avg. Approval Time</p>
//             </div>
//           </div>
//         </div>

//         {/* Video Testimonials */}
//         <div className="mb-16">
//           <h2 className="text-2xl font-bold mb-8 flex items-center">
//             <Play className="h-6 w-6 mr-3 text-primary" />
//             Creator Spotlights
//           </h2>
          
//           <div className="grid md:grid-cols-2 gap-8">
//             <div className="bg-gradient-to-br from-primary-100 to-purple-100 rounded-xl p-6 aspect-video flex items-center justify-center">
//               <div className="text-center">
//                 <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
//                   <Play className="h-8 w-8 text-white ml-1" />
//                 </div>
//                 <h3 className="font-semibold mb-2">Sarah's Pottery Journey</h3>
//                 <p className="text-muted-foreground text-sm">From hobby to full-time business</p>
//               </div>
//             </div>
            
//             <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl p-6 aspect-video flex items-center justify-center">
//               <div className="text-center">
//                 <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
//                   <Play className="h-8 w-8 text-white ml-1" />
//                 </div>
//                 <h3 className="font-semibold mb-2">Weaving Success</h3>
//                 <p className="text-muted-foreground text-sm">Jessica's textile revolution</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Community Love */}
//         <div className="bg-card rounded-xl border p-8 mb-16">
//           <h2 className="text-2xl font-bold text-center mb-12">What Our Creators Say</h2>
//           <div className="grid md:grid-cols-3 gap-8">
//             <div className="text-center">
//               <div className="flex justify-center mb-4">
//                 {[...Array(5)].map((_, i) => (
//                   <Star key={i} className="h-5 w-5 text-amber-500 fill-current" />
//                 ))}
//               </div>
//               <Quote className="h-8 w-8 text-primary-300 mx-auto mb-4" />
//               <p className="text-muted-foreground mb-4">
//                 "This platform changed everything for my small business. The community support and exposure 
//                 helped me go full-time within a year."
//               </p>
//               <p className="font-semibold">— Michael Chen</p>
//               <p className="text-sm text-muted-foreground">Silver Linings Jewelry</p>
//             </div>
            
//             <div className="text-center">
//               <div className="flex justify-center mb-4">
//                 {[...Array(5)].map((_, i) => (
//                   <Star key={i} className="h-5 w-5 text-amber-500 fill-current" />
//                 ))}
//               </div>
//               <Quote className="h-8 w-8 text-primary-300 mx-auto mb-4" />
//               <p className="text-muted-foreground mb-4">
//                 "I've tried other platforms, but the commission structure and customer quality here are 
//                 unmatched. This feels like a true partnership."
//               </p>
//               <p className="font-semibold">— Maria Rodriguez</p>
//               <p className="text-sm text-muted-foreground">Coastal Art Designs</p>
//             </div>
            
//             <div className="text-center">
//               <div className="flex justify-center mb-4">
//                 {[...Array(5)].map((_, i) => (
//                   <Star key={i} className="h-5 w-5 text-amber-500 fill-current" />
//                 ))}
//               </div>
//               <Quote className="h-8 w-8 text-primary-300 mx-auto mb-4" />
//               <p className="text-muted-foreground mb-4">
//                 "The educational resources and supportive community made all the difference. I never felt 
//                 alone in my entrepreneurial journey."
//               </p>
//               <p className="font-semibold">— Alex Thompson</p>
//               <p className="text-sm text-muted-foreground">Threads of Tradition</p>
//             </div>
//           </div>
//         </div>

//         {/* CTA Section */}
//         <div className="bg-gradient-to-r from-primary to-purple-700 text-white rounded-xl p-12 text-center">
//           <h2 className="text-2xl font-bold mb-4">Ready to Write Your Success Story?</h2>
//           <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
//             Join our community of talented creators and start building the business of your dreams. 
//             We provide the platform, tools, and support you need to succeed.
//           </p>
//           <div className="flex flex-col sm:flex-row gap-4 justify-center">
//             <Button asChild size="lg" className="bg-white text-primary-700 hover:bg-gray-100">
//               <Link href="/sell">
//                 Apply to Sell
//               </Link>
//             </Button>
//             <Button asChild variant="outline" size="lg" className="bg-transparent border-white text-white hover:bg-white hover:text-primary">
//               <Link href="/creators">
//                 Meet More Creators
//               </Link>
//             </Button>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }