"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Moon,
  Sun,
  User,
  Search,
  ShoppingCart,
  Menu,
  LogOut,
  LoaderCircle,
  Settings,
  Heart,
  Package,
  ShoppingBag,
  Sparkles,
  Store,
  MessageCircle,
  Star,
  Clock,
  User2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/useCart";
import { useUserProfile } from "@/hooks/useUserProfile";
import Image from "next/image";
import { useSession } from "@/lib/auth-client";
import { signOut } from "@/lib/auth-client";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Shop", href: "/shop" },
  { name: "Creators", href: "/creators" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  const { cartCount, isLoading: isCartLoading } = useCart();

  // Add scroll detection for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 bg-background/80 backdrop-blur-md transition-all duration-300 border-b",
        isScrolled && "bg-background/95 shadow-sm"
      )}
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo and mobile menu button */}
        <div className="flex items-center gap-2">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 sm:w-96 p-3">
              <SheetHeader className="text-left pb-6">
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={cn(
                      "px-3 py-2 rounded-md font-medium transition-colors",
                      pathname === link.href
                        ? "text-foreground bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                    onClick={() => {
                      setIsSheetOpen(false);
                    }}
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="pt-6 border-t">
                  <Link
                    href="/profile"
                    className="block px-3 py-2 text-muted-foreground hover:text-foreground"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/orders"
                    className="block px-3 py-2 text-muted-foreground hover:text-foreground"
                  >
                    Orders
                  </Link>
                  <Link
                    href="/wishlist"
                    className="block px-3 py-2 text-muted-foreground hover:text-foreground"
                  >
                    Wishlist
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Link
            href="/"
            className="flex items-center space-x-2"
            aria-label="Home"
          >
            <div className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
              Kyz
            </div>
            <span className="text-xl font-bold text-foreground hidden sm:block">
              Kyzat
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                pathname === link.href
                  ? "text-foreground bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Search bar - Desktop */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products, creators..."
              className="w-full pl-10 pr-4"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Right side icons */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Search icon - Mobile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80" asChild>
              <div className="p-2">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search products, creators..."
                    className="w-full pl-10 pr-4"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* Cart */}
          <Button variant="ghost" size="icon" className="relative" asChild>
            {isCartLoading ? (
              <LoaderCircle className="h-5 w-5 animate-spin" />
            ) : (
              <Link href="/cart" aria-label="Shopping cart">
                <ShoppingCart className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">
                  {cartCount}
                </Badge>
              </Link>
            )}
          </Button>

          {/* User dropdown */}
          <UserMenu />
        </div>
      </div>
    </nav>
  );
};

export default function UserMenu() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const { profile, notifications, isLoading } = useUserProfile();
  const [isOpen, setIsOpen] = useState(false);

  const isCreator = session?.user?.role === "creator";
  const hasNotifications = (notifications?.totalNotifications || 0) > 0;

  if (isPending || isLoading) {
    return <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />;
  }

  if (!session?.user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" asChild>
          <Link href="/auth">Sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative rounded-full focus-visible:ring-2 focus-visible:ring-offset-2 p-0"
        >
          {profile?.user?.profileImage || session.user.image ? (
            <Image
              src={profile?.user?.profileImage || session.user.image || ""}
              alt={session.user.name || "User"}
              height={48}
              width={48}
              className="size-9 rounded-full"
            />
          ) : (
            <User2 className="h-5 w-5" />
          )}

          {/* Notification Indicator Dot */}
          {hasNotifications && (
            <span className="absolute top-0 right-0 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-background"></span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-72" align="end" forceMount>
        {/* User Info */}
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {session.user.name}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {session.user.email}
            </p>
            {isCreator && (
              <div className="flex items-center gap-1 mt-1">
                <Badge variant="secondary" className="text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Creator
                </Badge>
              </div>
            )}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Notifications Summary (for creators) */}
        {isCreator && hasNotifications && notifications && (
          <>
            <div className="px-2 py-2">
              <div className="flex items-center justify-between text-xs font-medium mb-2">
                <span>Notifications</span>
                <Badge variant="destructive" className="h-5 text-xs">
                  {notifications.totalNotifications}
                </Badge>
              </div>

              <div className="space-y-1">
                {notifications.pendingOrders > 0 && (
                  <div className="flex items-center justify-between text-xs bg-amber-50 text-amber-900 p-2 rounded-md">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      <span>Pending orders</span>
                    </div>
                    <Badge variant="outline" className="h-5">
                      {notifications.pendingOrders}
                    </Badge>
                  </div>
                )}

                {notifications.newOrders > 0 && (
                  <div className="flex items-center justify-between text-xs bg-blue-50 text-blue-900 p-2 rounded-md">
                    <div className="flex items-center gap-2">
                      <Package className="h-3 w-3" />
                      <span>New orders (24h)</span>
                    </div>
                    <Badge variant="outline" className="h-5">
                      {notifications.newOrders}
                    </Badge>
                  </div>
                )}

                {notifications.unreadMessages > 0 && (
                  <div className="flex items-center justify-between text-xs bg-purple-50 text-purple-900 p-2 rounded-md">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-3 w-3" />
                      <span>Unread messages</span>
                    </div>
                    <Badge variant="outline" className="h-5">
                      {notifications.unreadMessages}
                    </Badge>
                  </div>
                )}

                {notifications.newReviews > 0 && (
                  <div className="flex items-center justify-between text-xs bg-green-50 text-green-900 p-2 rounded-md">
                    <div className="flex items-center gap-2">
                      <Star className="h-3 w-3" />
                      <span>New reviews (7d)</span>
                    </div>
                    <Badge variant="outline" className="h-5">
                      {notifications.newReviews}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile" className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href="/orders" className="cursor-pointer">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  <span>Orders</span>
                </div>
                {isCreator &&
                  notifications &&
                  notifications.pendingOrders > 0 && (
                    <Badge
                      variant="destructive"
                      className="ml-auto h-5 text-xs"
                    >
                      {notifications.pendingOrders}
                    </Badge>
                  )}
              </div>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href="/wishlist" className="cursor-pointer">
              <Heart className="mr-2 h-4 w-4" />
              <span>Wishlist</span>
            </Link>
          </DropdownMenuItem>

          {isCreator && (
            <>
              <DropdownMenuItem asChild>
                <Link href="/messages" className="cursor-pointer">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      <span>Messages</span>
                    </div>
                    {notifications && notifications.unreadMessages > 0 && (
                      <Badge
                        variant="destructive"
                        className="ml-auto h-5 text-xs"
                      >
                        {notifications.unreadMessages}
                      </Badge>
                    )}
                  </div>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="cursor-pointer">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Store className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </div>
                    {notifications && notifications.newOrders > 0 && (
                      <Badge
                        variant="secondary"
                        className="ml-auto h-5 text-xs"
                      >
                        {notifications.newOrders}
                      </Badge>
                    )}
                  </div>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href="/dashboard/products" className="cursor-pointer">
                  <Package className="mr-2 h-4 w-4" />
                  <span>My Products</span>
                </Link>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/settings" className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
          onClick={() =>
            signOut({
              fetchOptions: {
                onSuccess() {
                  router.push("/");
                },
              },
            })
          }
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
