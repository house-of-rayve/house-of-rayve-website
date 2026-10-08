import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/products";
import PageHeader from "@/components/admin/PageHeader";
import ProductTable from "@/components/admin/ProductTable";

export const metadata = { title: "Products" };

export default async function AdminProductsPage() {
  const products = (await prisma.product.findMany({ orderBy: { createdAt: "desc" } })).map(serializeProduct);
  return (
    <>
      <PageHeader title="Products" description={`${products.length} products in your catalogue`}>
        <Link href="/admin/products/new" className="inline-flex h-9 items-center gap-2 rounded-md bg-olive-800 px-4 text-sm font-medium text-sand hover:bg-olive-950">
          <Plus className="size-4" /> Add product
        </Link>
      </PageHeader>
      <ProductTable products={products} />
    </>
  );
}
