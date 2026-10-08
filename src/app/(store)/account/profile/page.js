import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfileForms from "@/components/account/ProfileForms";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await requireUser("/account/profile");
  const record = await prisma.user.findUnique({ where: { id: user.id }, select: { passwordHash: true, googleId: true } });
  return (
    <ProfileForms
      user={{ name: user.name, email: user.email, phone: user.phone }}
      hasPassword={Boolean(record.passwordHash)}
      googleLinked={Boolean(record.googleId)}
    />
  );
}
