import Link from "next/link";
import PageHeader from "@/components/admin/PageHeader";
import ProductForm from "@/components/admin/ProductForm";

export const metadata = { title: "New product" };

export default function NewProductPage() {
  return (
    <>
      <Link href="/admin/products" className="mb-3 inline-block text-xs text-muted hover:text-ink">← Products</Link>
      <PageHeader title="New product" />
      <ProductForm />
    </>
  );
}
