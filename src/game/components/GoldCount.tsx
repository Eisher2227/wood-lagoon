export function GoldCount({
  amount,
  className = "",
  compact = false,
}: {
  amount: number;
  className?: string;
  compact?: boolean;
}) {
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 text-gold ${className}`}>
      <GoldIcon className={compact ? "size-5" : "size-6 shrink-0"} />
      <span className={`font-sans font-bold tabular-nums leading-none ${compact ? "text-xl" : "text-2xl"}`}>
        {amount}
      </span>
    </span>
  );
}

export function GoldIcon({ className = "size-6 shrink-0" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <circle cx="16" cy="16" r="14" fill="#e0b13a" stroke="#f7e7b0" strokeWidth="1.7" />
      <circle cx="16" cy="16" r="10.2" fill="none" stroke="#8a6414" strokeWidth="1.15" opacity="0.55" />
      <circle cx="12" cy="11" r="4" fill="#ffe9a8" opacity="0.45" />
      <path
        d="M13.1 11.1c2.5-1.5 6-.5 6.5 2.3.4 2-1.2 3.2-3.3 3.6 2.5.3 4.1 1.6 3.6 3.8-.6 2.8-4.1 3.6-6.7 2.1"
        fill="none"
        stroke="#6d4b0e"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
