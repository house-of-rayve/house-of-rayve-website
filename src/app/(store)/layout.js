import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";
import { getCurrentUser } from "@/lib/auth";
import SmoothScroll from "@/components/motion/SmoothScroll";
import CustomCursor from "@/components/motion/CustomCursor";
import IntroLoader from "@/components/motion/IntroLoader";
import NavProgress from "@/components/motion/NavProgress";
import HeadingReveal from "@/components/motion/HeadingReveal";
import { Suspense } from "react";

export default async function StoreLayout({ children }) {
  const user = await getCurrentUser();
  return (
    <>
      <SmoothScroll />
      <Suspense>
        <NavProgress />
      </Suspense>
      <IntroLoader />
      <CustomCursor />
      <HeadingReveal />
      <Header user={user && { name: user.name, role: user.role }} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
