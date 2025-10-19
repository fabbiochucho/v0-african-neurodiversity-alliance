interface AndaLogoProps {
  className?: string
  showText?: boolean
}

export function AndaLogo({ className = "", showText = true }: AndaLogoProps) {
  // Rainbow colors for network nodes
  const rainbowColors = [
    "#FF0000", // Red
    "#FF7F00", // Orange
    "#FFFF00", // Yellow
    "#00FF00", // Green
    "#0000FF", // Blue
    "#4B0082", // Indigo
    "#9400D3", // Violet
  ]

  // African country coordinates (simplified for network visualization)
  // Normalized to fit in a 40x40 viewBox
  const africaNodes = [
    { id: 1, x: 20, y: 8, country: "Egypt", color: rainbowColors[0] },
    { id: 2, x: 28, y: 12, country: "Ethiopia", color: rainbowColors[1] },
    { id: 3, x: 32, y: 18, country: "Kenya", color: rainbowColors[2] },
    { id: 4, x: 30, y: 28, country: "South Africa", color: rainbowColors[3] },
    { id: 5, x: 18, y: 32, country: "Botswana", color: rainbowColors[4] },
    { id: 6, x: 8, y: 28, country: "Angola", color: rainbowColors[5] },
    { id: 7, x: 6, y: 18, country: "Nigeria", color: rainbowColors[6] },
    { id: 8, x: 10, y: 10, country: "Morocco", color: rainbowColors[0] },
    { id: 9, x: 20, y: 20, country: "Central Hub", color: rainbowColors[3] },
  ]

  // Define connections between nodes (representing pan-African network)
  const connections = [
    [0, 1],
    [1, 2],
    [2, 4],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 0], // Outer ring
    [0, 8],
    [1, 8],
    [2, 8],
    [3, 8],
    [4, 8],
    [5, 8],
    [6, 8],
    [7, 8], // Hub connections
    [2, 3],
    [3, 4], // Additional connections
  ]

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Africa Network Map Icon */}
      <div className="relative w-10 h-10">
        <svg viewBox="0 0 40 40" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Connecting lines (black) */}
          {connections.map((connection, idx) => {
            const fromNode = africaNodes[connection[0]]
            const toNode = africaNodes[connection[1]]
            return (
              <line
                key={`connection-${idx}`}
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke="#000000"
                strokeWidth="0.8"
                opacity="0.6"
              />
            )
          })}

          {/* Network nodes (rainbow colors) */}
          {africaNodes.map((node) => (
            <circle
              key={`node-${node.id}`}
              cx={node.x}
              cy={node.y}
              r={node.id === 8 ? 2.5 : 1.8}
              fill={node.color}
              opacity="0.9"
            />
          ))}

          {/* Subtle Africa continent outline for context */}
          <path
            d="M 8 8 Q 12 6 16 8 L 20 6 L 24 8 Q 28 6 32 10 L 34 16 Q 35 20 34 24 L 32 30 Q 28 34 24 32 L 20 34 L 16 32 Q 12 34 10 30 L 8 24 Q 6 20 8 16 Z"
            stroke="#00000015"
            strokeWidth="0.5"
            fill="none"
          />
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
