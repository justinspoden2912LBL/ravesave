export function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-white/[0.04] ${className}`}
    >
      <div className="absolute inset-0 animate-shimmer" />
    </div>
  );
}
