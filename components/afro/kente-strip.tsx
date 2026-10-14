// A strip-woven band in the spirit of kente and aso-oke: blocks of thread
// colour with weft lines, zigzags, checks and dots, repeating across the
// width. Used for the header edge and as seams between page sections.
// Decorative only. Calm mode quietens it (see .kente-strip in globals.css).
export function KenteStrip({ height = 10, className = "" }: { height?: number; className?: string }) {
  // Same-height strips share identical pattern definitions, so a fixed id is
  // safe and keeps this a server component (no hooks).
  const id = String(height).replace(".", "-")
  const scale = height / 12
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className={`kente-strip block w-full ${className}`}
      height={height}
    >
      <defs>
        <pattern id={`k${id}`} width="120" height="12" patternUnits="userSpaceOnUse" patternTransform={`scale(${scale})`}>
          {/* teal block with gold weft */}
          <rect x="0" y="0" width="20" height="12" fill="var(--thread-teal)" />
          <path d="M0 3.5h20M0 6h20M0 8.5h20" stroke="var(--thread-gold)" strokeWidth="0.8" />
          <rect x="20" y="0" width="4" height="12" fill="var(--thread-gold)" />
          {/* charcoal block with a gold zigzag */}
          <rect x="24" y="0" width="20" height="12" fill="var(--thread-charcoal)" />
          <path d="M24 9l4-6 4 6 4-6 4 6 4-6" fill="none" stroke="var(--thread-gold)" strokeWidth="1.2" />
          <rect x="44" y="0" width="4" height="12" fill="var(--thread-terracotta)" />
          {/* gold block with an indigo check */}
          <rect x="48" y="0" width="20" height="12" fill="var(--thread-gold)" />
          <path d="M48 0h4v4h-4zM56 0h4v4h-4zM64 0h4v4h-4zM52 4h4v4h-4zM60 4h4v4h-4zM48 8h4v4h-4zM56 8h4v4h-4zM64 8h4v4h-4z" fill="var(--thread-indigo)" />
          <rect x="68" y="0" width="4" height="12" fill="var(--thread-teal)" />
          {/* terracotta block with charcoal warp stripes */}
          <rect x="72" y="0" width="20" height="12" fill="var(--thread-terracotta)" />
          <path d="M76 0v12M80 0v12M84 0v12M88 0v12" stroke="var(--thread-charcoal)" strokeWidth="1" />
          <rect x="92" y="0" width="4" height="12" fill="var(--thread-indigo)" />
          {/* indigo block with gold dots */}
          <rect x="96" y="0" width="20" height="12" fill="var(--thread-indigo)" />
          <g fill="var(--thread-gold)">
            <circle cx="100" cy="4" r="1.2" />
            <circle cx="106" cy="8" r="1.2" />
            <circle cx="112" cy="4" r="1.2" />
          </g>
          <rect x="116" y="0" width="4" height="12" fill="var(--thread-green)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#k${id})`} />
    </svg>
  )
}
