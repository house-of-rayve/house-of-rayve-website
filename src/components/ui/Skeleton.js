export function Bone({ className = "" }) {
  return <div className={`animate-pulse bg-mist ${className}`} />;
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i}>
          <Bone className="aspect-[4/5]" />
          <Bone className="mt-4 h-3 w-1/2" />
          <Bone className="mt-2 h-3 w-1/3" />
        </div>
      ))}
    </div>
  );
}
