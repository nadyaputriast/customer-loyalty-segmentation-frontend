import type { Metadata } from "next";
import { Inter, Fira_Code } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-sans" 
});

const firaCode = Fira_Code({ 
  subsets: ["latin"], 
  variable: "--font-mono" 
});

export const metadata: Metadata = {
  title: "LoyalT Apps",
  description: "A demo app for customer loyalty segmentation built with Next.js and shadcn/ui.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      // Injecting the variables here makes them available globally.
      // We also add "font-sans" so Inter is the default everywhere.
      className={cn("h-full antialiased font-sans", inter.variable, firaCode.variable)}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}