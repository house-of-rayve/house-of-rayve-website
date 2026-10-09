import { LogoMark } from "@/components/ui/Logo";

export default function Loading() {
  return (
    <div className="grid min-h-[60svh] place-items-center">
      <LogoMark className="h-8 w-14 animate-pulse text-olive-500" />
    </div>
  );
}
