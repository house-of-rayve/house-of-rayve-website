import { requireUser } from "@/lib/auth";
import ProfileForms from "@/components/account/ProfileForms";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await requireUser("/account/profile");
  return <ProfileForms user={{ name: user.name, email: user.email, phone: user.phone }} />;
}
