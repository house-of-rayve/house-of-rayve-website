import WishlistView from "@/components/wishlist/WishlistView";

export const metadata = { title: "Wishlist" };

export default function WishlistPage() {
  return (
    <div className="container-x py-12 sm:py-16">
      <p className="eyebrow">Saved for later</p>
      <h1 className="display-title mt-3 text-3xl sm:text-4xl">Wishlist</h1>
      <WishlistView />
    </div>
  );
}
