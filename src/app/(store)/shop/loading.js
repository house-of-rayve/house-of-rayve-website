import { Bone, ProductGridSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <>
      <div className="bg-olive-900">
        <div className="container-x py-14 sm:py-20">
          <div className="h-3 w-24 animate-pulse bg-sand/20" />
          <div className="mt-5 h-10 w-72 animate-pulse bg-sand/20" />
        </div>
      </div>
      <div className="container-x py-12">
        <Bone className="mb-8 h-9 w-full" />
        <ProductGridSkeleton />
      </div>
    </>
  );
}
