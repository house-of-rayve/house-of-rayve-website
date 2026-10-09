import { Bone } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="container-x pb-16 pt-8">
      <Bone className="mb-6 h-3 w-48" />
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
        <Bone className="aspect-[4/5] lg:col-span-7" />
        <div className="space-y-4 lg:col-span-5">
          <Bone className="h-3 w-24" />
          <Bone className="h-10 w-2/3" />
          <Bone className="h-4 w-1/2" />
          <Bone className="h-8 w-32" />
          <Bone className="mt-8 h-12 w-full" />
          <Bone className="h-24 w-full" />
        </div>
      </div>
    </div>
  );
}
