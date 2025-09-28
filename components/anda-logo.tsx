interface AndaLogoProps {
  className?: string
  showText?: boolean
}

export function AndaLogo({ className = "", showText = true }: AndaLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Brain/Network Icon */}
      <div className="relative w-10 h-10">
        <svg viewBox="0 0 40 40" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Network nodes */}
          <circle cx="20" cy="8" r="2" fill="currentColor" className="text-primary" />
          <circle cx="32" cy="15" r="2" fill="currentColor" className="text-secondary" />
          <circle cx="8" cy="15" r="2" fill="currentColor" className="text-accent" />
          <circle cx="20" cy="20" r="3" fill="currentColor" className="text-primary" />
          <circle cx="30" cy="28" r="2" fill="currentColor" className="text-secondary" />
          <circle cx="10" cy="28" r="2" fill="currentColor" className="text-accent" />
          <circle cx="20" cy="32" r="2" fill="currentColor" className="text-primary" />

          {/* Connecting lines */}
          <path
            d="M20 8 L32 15 M20 8 L8 15 M32 15 L20 20 M8 15 L20 20 M20 20 L30 28 M20 20 L10 28 M30 28 L20 32 M10 28 L20 32"
            stroke="currentColor"
            strokeWidth="1"
            className="text-muted-foreground opacity-60"
          />

          {/* African pattern elements */}
          <path d="M15 12 L17 14 L15 16 L13 14 Z" fill="currentColor" className="text-accent opacity-30" />
          <path d="M25 24 L27 26 L25 28 L23 26 Z" fill="currentColor" className="text-secondary opacity-30" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="text-xl font-bold text-foreground">ANDA</span>
          <span className="text-xs text-muted-foreground leading-tight">African Neurodiversity Alliance</span>
        </div>
      )}
    </div>
  )
}
