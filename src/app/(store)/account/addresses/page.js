import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AddressBook from "@/components/account/AddressBook";

export const metadata = { title: "Addresses" };

export default async function AddressesPage() {
  const user = await requireUser("/account/addresses");
  const addresses = await prisma.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });
  return <AddressBook addresses={addresses.map(({ createdAt, updatedAt, ...a }) => a)} />;
}
