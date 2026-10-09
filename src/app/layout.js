import { Inter, Michroma } from "next/font/google";
import { CartProvider } from "@/components/cart/CartProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { WishlistProvider } from "@/components/wishlist/WishlistProvider";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const michroma = Michroma({ variable: "--font-michroma", subsets: ["latin"], weight: "400" });

export const metadata = {
  title: { default: "RAYVE — Own the Energy", template: "%s · RAYVE" },
  description: "Premium eyewear for the everyday. Distinctive silhouettes, refined details and an elevated finish.",
  icons: { icon: "/brand/favicon.png" },
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
