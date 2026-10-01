import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | Chef Apedo Foods",
    default: "Chef Apedo Foods - Premium Campus Delivery",
  },
  description: "Hot, premium meals delivered directly to your hostel at the University of Ghana.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://chefapedofoods.com"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "Chef Apedo Foods",
    description: "Hot, premium meals delivered directly to your hostel.",
    url: "/",
    siteName: "Chef Apedo Foods",
    locale: "en_GH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chef Apedo Foods",
    description: "Premium campus food delivery in Legon.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-bg text-ink font-sans">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
