import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft, Package, Store, Users } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 - Page Not Found",
  description: "The page you are looking for does not exist.",
}

export default function NotFound() {
  const quickLinks = [
    {
      name: "Home",
      href: "/",
      icon: Home,
    },
    {
      name: "Shop",
      href: "/shop",
      icon: Package,
    },
    {
      name: "Creators",
      href: "/creators", 
      icon: Users,
    },
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Store,
    }
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full mx-auto text-center">
        {/* 404 Header */}
        <div className="mb-8">
          <div className="text-6xl font-bold text-primary/20 mb-2">404</div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Page not found
          </h1>
          <p className="text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center mb-8">
          <Button asChild>
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Home
            </Link>
          </Button>
          
          <Button asChild variant="outline">
            <Link href="javascript:history.back()">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
        </div>

        {/* Quick Links */}
        <Card className="border">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Quick Links
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {quickLinks.map((link) => (
                <Button
                  key={link.name}
                  asChild
                  variant="ghost"
                  size="sm"
                  className="h-10 justify-start"
                >
                  <Link href={link.href}>
                    <link.icon className="h-4 w-4 mr-2" />
                    {link.name}
                  </Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}