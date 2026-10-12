import { Inter, Michroma } from "next/font/google";
import { CartProvider } from "@/components/cart/CartProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { WishlistProvider } from "@/components/wishlist/WishlistProvider";
import "./globals.css";
import { siteUrl } from "@/lib/site";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const michroma = Michroma({ variable: "--font-michroma", subsets: ["latin"], weight: "400" });

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "RAYVE — Own the Energy", template: "%s · RAYVE" },
  description: "Premium eyewear for the everyday. Distinctive silhouettes, refined details and an elevated finish.",
  icons: { icon: "/brand/favicon.png" },
  // Default share preview (WhatsApp, Instagram, X…); product pages use their own photo
  openGraph: {
    type: "website",
    siteName: "RAYVE",
    title: "RAYVE — Own the Energy",
    description: "Premium eyewear for the everyday. Distinctive silhouettes, refined details and an elevated finish.",
    images: [{ url: "/images/campaign-matador.jpg", alt: "RAYVE" }],
    locale: "en_IN",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${michroma.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <ToastProvider>
          <WishlistProvider>
            <CartProvider>{children}</CartProvider>
          </WishlistProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
