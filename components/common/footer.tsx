import Link from "next/link";
import { Facebook, Instagram, Twitter, Mail } from "lucide-react";
import { SITE_NAME } from "../../lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Footer = () => {
  return (
    <footer className="bg-background border-t border-border py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand and social */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                Kyz
              </div>
              <span className="text-xl font-bold">{SITE_NAME}</span>
            </div>
            <p className="text-muted-foreground mb-6">
              Connecting local creators with customers who value handmade
              quality and unique products.
            </p>

            {/* Newsletter signup - mobile first */}
            <div className="mb-6">
              <Label
                htmlFor="newsletter"
                className="text-sm font-medium mb-2 block"
              >
                Stay updated with our newsletter
              </Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  id="newsletter"
                  type="email"
                  placeholder="Your email address"
                  className="flex-1"
                />
                <Button className="whitespace-nowrap">Subscribe</Button>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Facebook className="h-4 w-4" />
                <span className="sr-only">Facebook</span>
              </Button>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Instagram className="h-4 w-4" />
                <span className="sr-only">Instagram</span>
              </Button>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Twitter className="h-4 w-4" />
                <span className="sr-only">Twitter</span>
              </Button>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Mail className="h-4 w-4" />
                <span className="sr-only">Email</span>
              </Button>
            </div>
          </div>

          {/* For Shoppers */}
          <div>
            <h3 className="font-bold text-lg mb-4">For Shoppers</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link
                  href="/shop"
                  className="hover:text-foreground transition-colors text-sm md:text-base"
                >
                  Browse Products
                </Link>
              </li>
              <li>
                <Link
                  href="/creators"
                  className="hover:text-foreground transition-colors text-sm md:text-base"
                >
                  Discover Creators
                </Link>
              </li>
              <li>
                <Link
                  href="/gift-cards"
                  className="hover:text-foreground transition-colors text-sm md:text-base"
                >
                  Gift Cards
                </Link>
              </li>
              <li>
                <Link
                  href="/offers"
                  className="hover:text-foreground transition-colors text-sm md:text-base"
                >
                  Weekly Offers
                </Link>
              </li>
            </ul>
          </div>

          {/* For Creators */}
          <div>
            <h3 className="font-bold text-lg mb-4">For Creators</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link
                  href="/sell"
                  className="hover:text-foreground transition-colors text-sm md:text-base"
                >
                  Sell on Kyzat
                </Link>
              </li>
              <li>
                <Link
                  href="/guidelines"
                  className="hover:text-foreground transition-colors text-sm md:text-base"
                >
                  Creator Guidelines
                </Link>
              </li>
              <li>
                <Link
                  href="/commission"
                  className="hover:text-foreground transition-colors text-sm md:text-base"
                >
                  Commission Rates
                </Link>
              </li>
              <li>
                <Link
                  href="/success-stories"
                  className="hover:text-foreground transition-colors text-sm md:text-base"
                >
                  Success Stories
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-bold text-lg mb-4">Company</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link
                  href="/about"
                  className="hover:text-foreground transition-colors text-sm md:text-base"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="hover:text-foreground transition-colors text-sm md:text-base"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-foreground transition-colors text-sm md:text-base"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-foreground transition-colors text-sm md:text-base"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-foreground transition-colors text-sm md:text-base"
                >
                  Terms & Conditions
                </Link>
              </li>
              
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
          <p className="text-sm">
            © {new Date().getFullYear()} Kyzat. All rights reserved.
          </p>
          <p className="text-xs">
            Designed by{" "}
            <Link
              href="https://github.com/TeamNextCraft"
              className="text-foreground hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              TeamNextCraft
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

// import Link from "next/link";
// import { Facebook, Instagram, Twitter, Mail } from "lucide-react";
// import { SITE_NAME } from '../../lib/constants';

// export const Footer = () => {
//   return (
//     <footer className="bg-gray-800 text-white py-12">
//       <div className="container mx-auto px-4">
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
//           <div>
//             <div className="flex items-center space-x-2 mb-4">
//               <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
//                 Kyz
//               </div>
//               <span className="text-xl font-bold">{SITE_NAME}</span>
//             </div>
//             <p className="text-gray-400 mb-4">
//               Connecting local creators with customers who value handmade quality and unique products.
//             </p>
//             <div className="flex space-x-4">
//               <a href="#" className="text-gray-400 hover:text-white transition">
//                 <Facebook className="h-5 w-5" />
//               </a>
//               <a href="#" className="text-gray-400 hover:text-white transition">
//                 <Instagram className="h-5 w-5" />
//               </a>
//               <a href="#" className="text-gray-400 hover:text-white transition">
//                 <Twitter className="h-5 w-5" />
//               </a>
//               <a href="#" className="text-gray-400 hover:text-white transition">
//                 <Mail className="h-5 w-5" />
//               </a>
//             </div>
//           </div>

//           <div>
//             <h3 className="font-bold text-lg mb-4">For Shoppers</h3>
//             <ul className="space-y-2 text-gray-400">
//               <li>
//                 <Link href="/shop" className="hover:text-white transition">Browse Products</Link>
//               </li>
//               <li>
//                 <Link href="/creators" className="hover:text-white transition">Discover Creators</Link>
//               </li>
//               <li>
//                 <Link href="/gift-cards" className="hover:text-white transition">Gift Cards</Link>
//               </li>
//               <li>
//                 <Link href="/offers" className="hover:text-white transition">Weekly Offers</Link>
//               </li>
//             </ul>
//           </div>

//           <div>
//             <h3 className="font-bold text-lg mb-4">For Creators</h3>
//             <ul className="space-y-2 text-gray-400">
//               <li>
//                 <Link href="/sell" className="hover:text-white transition">Sell on Kyzat</Link>
//               </li>
//               <li>
//                 <Link href="/guidelines" className="hover:text-white transition">Creator Guidelines</Link>
//               </li>
//               <li>
//                 <Link href="/commission" className="hover:text-white transition">Commission Rates</Link>
//               </li>
//               <li>
//                 <Link href="/success-stories" className="hover:text-white transition">Success Stories</Link>
//               </li>
//             </ul>
//           </div>

//           <div>
//             <h3 className="font-bold text-lg mb-4">Company</h3>
//             <ul className="space-y-2 text-gray-400">
//               <li>
//                 <Link href="/about" className="hover:text-white transition">About Us</Link>
//               </li>
//               <li>
//                 <Link href="/careers" className="hover:text-white transition">Careers</Link>
//               </li>
//               <li>
//                 <Link href="/contact" className="hover:text-white transition">Contact</Link>
//               </li>
//               <li>
//                 <Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link>
//               </li>
//             </ul>
//           </div>
//         </div>

//         <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
//           <p>© {new Date().getFullYear()} Kyzat. All rights reserved.</p>
//           <p className="text-xs">Designed by <Link href={"https://github.com/TeamNextCraft"} className="text-white hover:underline">TeamNextCraft</Link></p>
//         </div>
//       </div>
//     </footer>
//   );
// };
