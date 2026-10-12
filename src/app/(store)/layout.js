import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";
import { getCurrentUser } from "@/lib/auth";
import SmoothScroll from "@/components/motion/SmoothScroll";
import IntroLoader from "@/components/motion/IntroLoader";
import NavProgress from "@/components/motion/NavProgress";
import HeadingReveal from "@/components/motion/HeadingReveal";
import { LiquidFilter } from "@/components/motion/liquid";
import PageCurtain from "@/components/motion/PageCurtain";
import MobileTabBar from "@/components/store/MobileTabBar";
import RevealImages from "@/components/motion/RevealImages";
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
      <HeadingReveal />
      <LiquidFilter />
      <PageCurtain />
      <RevealImages />
      <Header user={user && { name: user.name, role: user.role }} />
      <main className="flex-1">{children}</main>
      <Footer />
      <MobileTabBar />
    </>
  );
}
