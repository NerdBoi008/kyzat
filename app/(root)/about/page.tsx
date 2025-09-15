import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Heart, Shield, ArrowRight, Target, Sparkles } from "lucide-react";

export default function AboutPage() {
  const teamMembers = [
    {
      name: "Alex Johnson",
      role: "Founder & CEO",
      image: "/team-alex.jpg",
      bio: "Passionate about supporting local economies and sustainable commerce."
    },
    {
      name: "Maria Chen",
      role: "Head of Creator Relations",
      image: "/team-maria.jpg",
      bio: "Former artisan with a deep understanding of creator needs and challenges."
    },
    {
      name: "David Kim",
      role: "Technology Director",
      image: "/team-david.jpg",
      bio: "Tech enthusiast focused on building platforms that empower small businesses."
    },
    {
      name: "Sarah Williams",
      role: "Community Manager",
      image: "/team-sarah.jpg",
      bio: "Dedicated to building and nurturing our creator community."
    }
  ];

  const values = [
    {
      icon: <Heart className="h-8 w-8 md:h-10 md:w-10 text-primary" />,
      title: "Community First",
      description: "We prioritize building strong connections between creators and customers."
    },
    {
      icon: <Shield className="h-8 w-8 md:h-10 md:w-10 text-primary" />,
      title: "Trust & Transparency",
      description: "We maintain clear policies and fair practices for all platform participants."
    },
    {
      icon: <Users className="h-8 w-8 md:h-10 md:w-10 text-primary" />,
      title: "Inclusivity",
      description: "We welcome creators from all backgrounds and celebrate diverse artistry."
    }
  ];

  const stats = [
    { number: "500+", label: "Local Creators" },
    { number: "10,000+", label: "Products Listed" },
    { number: "50,000+", label: "Happy Customers" },
    { number: "45", label: "Cities Served" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Hero Section */}
        <section className="text-center mb-12 md:mb-16">
          <Badge variant="secondary" className="mb-4 text-sm md:text-base">
            Since 2025
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">Our Story</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-6 md:mb-8">
            Kyzat was born from a simple idea: what if we could create a platform that 
            helps local artisans thrive in the digital age while maintaining the personal touch of 
            traditional craft markets?
          </p>
          <div className="w-16 md:w-24 h-1 bg-primary mx-auto"></div>
        </section>

        {/* Mission Section */}
        <section className="mb-12 md:mb-16">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Our Mission</h2>
              <p className="text-muted-foreground mb-4 md:mb-6">
                We&apos;re on a mission to revolutionize the way local artisans connect with customers. 
                In a world of mass production, we believe in the value of handmade, unique products 
                that tell a story and support local economies.
              </p>
              <p className="text-muted-foreground mb-6 md:mb-8">
                Our platform combines the reach of e-commerce with the personal connection of social 
                media, creating a space where creators can showcase their work, build a following, 
                and grow their businesses sustainably.
              </p>
              <Button asChild className="w-full md:w-auto">
                <Link href="/creators" className="flex items-center gap-2">
                  Meet Our Creators <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="order-1 md:order-2 bg-muted/50 h-60 md:h-80 rounded-xl flex items-center justify-center p-4">
              <div className="text-center text-muted-foreground">
                <Target className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-4 text-primary" />
                <p className="text-sm md:text-base">Mission Illustration</p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-primary/5 rounded-xl p-6 md:p-8 mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">By The Numbers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center border-0 bg-transparent shadow-none">
                <CardContent className="p-4 md:p-6">
                  <p className="text-2xl md:text-4xl font-bold text-primary mb-1 md:mb-2">{stat.number}</p>
                  <p className="text-sm md:text-base text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-md transition-shadow py-6">
                <CardHeader className="pb-4">
                  <div className="flex justify-center mb-2 md:mb-4">
                    {value.icon}
                  </div>
                  <CardTitle className="text-lg md:text-xl">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm md:text-base">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">Our Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="text-center group hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="w-20 h-20 md:w-24 md:h-24 mx-auto bg-muted rounded-full mb-4 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <div className="text-muted-foreground text-xs">Photo</div>
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold">{member.name}</h3>
                  <Badge variant="secondary" className="my-2">{member.role}</Badge>
                  <p className="text-muted-foreground text-sm mt-2">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary text-primary-foreground rounded-xl p-6 md:p-12 text-center">
          <div className="max-w-2xl mx-auto">
            <Sparkles className="h-8 w-8 md:h-12 md:w-12 mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Join Our Community</h2>
            <p className="text-lg md:text-xl mb-6 md:mb-8 opacity-90">
              Whether you&apos;re a creator looking to showcase your work or a customer who values handmade quality, 
              we&lsquo;d love to have you as part of our growing community.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4">
              <Button asChild size="lg" variant="secondary" className="bg-background text-foreground">
                <Link href="/sell">Start Selling</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-2 border-background bg-transparent text-background hover:bg-background hover:text-primary">
                <Link href="/contact">Get In Touch</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}