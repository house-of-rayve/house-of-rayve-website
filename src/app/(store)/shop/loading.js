import { Bone, ProductGridSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="container-x pb-16 pt-10 sm:pt-16">
      <div className="flex flex-col items-center">
        <Bone className="h-3 w-24" />
        <Bone className="mt-6 h-10 w-72" />
        <Bone className="mt-4 h-3 w-80" />
      </div>
      <Bone className="mb-8 mt-14 h-9 w-full" />
      <ProductGridSkeleton />
    </div>
  );
}
