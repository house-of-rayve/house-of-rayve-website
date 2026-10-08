import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/products";
import PageHeader from "@/components/admin/PageHeader";
import ProductForm from "@/components/admin/ProductForm";

export const metadata = { title: "Edit product" };

export default async function EditProductPage({ params }) {
  const { id } = await params;
  const product = serializeProduct(await prisma.product.findUnique({ where: { id } }));
  if (!product) notFound();
  return (
    <>
      <Link href="/admin/products" className="mb-3 inline-block text-xs text-muted hover:text-ink">← Products</Link>
      <PageHeader title={product.name} description={`/product/${product.slug}`} />
      <ProductForm key={product.updatedAt} product={product} />
    </>
  );
}
