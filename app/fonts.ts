import { Noto_Sans, Poppins, Khand } from "next/font/google";

export const primaryFont = Noto_Sans({
  variable: "--font-primary",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const secondaryFont = Poppins({
  variable: "--font-secondary",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const designFont = Khand({
  variable: "--font-design",
  subsets: ["latin"],
  weight: ["400"],
  
})
