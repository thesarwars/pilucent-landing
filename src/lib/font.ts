import { Lexend, Manrope, Poppins } from "next/font/google";
import { Inter } from "next/font/google";

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-lexend",
});

export const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins", // optional, for CSS variable usage
  weight: ["400", "600", "700"], // optional, define weights you need
});
export const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
});
