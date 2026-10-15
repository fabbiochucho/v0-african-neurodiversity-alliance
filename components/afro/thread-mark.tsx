// A small woven block: a square of thread colour crossed by gold weft lines,
// cut from the same cloth as KenteStrip. Marks list entries in place of
// icon tiles. Decorative only.
export function ThreadMark({ color, className = "" }: { color: string; className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 20 20" className={`h-5 w-5 shrink-0 ${className}`}>
      <rect width="20" height="20" rx="3" fill={color} />
      <path d="M0 6h20M0 10h20M0 14h20" stroke="var(--thread-gold)" strokeWidth="1.2" />
      <path d="M7 0v20M13 0v20" stroke="rgb(255 255 255 / 0.35)" strokeWidth="1" />
    </svg>
  )
}
