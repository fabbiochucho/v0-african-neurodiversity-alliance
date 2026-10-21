"use client"

import { AFRICA_COUNTRIES, AFRICA_VIEWBOX } from "@/lib/africa-map"
import { useT } from "@/components/language-provider"

// Self-drawn SVG (no map tiles, no third party). Countries with listings are
// shaded by how many they have and can be clicked or reached with Tab; the
// country list next to it is the text alternative.
export function AfricaMap({
  counts,
  selected,
  onSelect,
}: {
  counts: Record<string, number>
  selected: string | null
  onSelect: (country: string) => void
}) {
  const tr = useT()
  const max = Math.max(1, ...Object.values(counts))
  const label = (name: string, n: number) =>
    tr("map.count", { name, count: tr(n === 1 ? "dir.oneResource" : "dir.resources", { n }) })

  return (
    <svg viewBox={AFRICA_VIEWBOX} role="group" aria-label={tr("map.label")} className="w-full h-auto max-h-[36rem]">
      {AFRICA_COUNTRIES.map((c) => {
        const n = counts[c.name] ?? 0
        const isSelected = selected === c.name
        const fillOpacity = n ? 0.35 + 0.65 * (n / max) : 1
        const shape = c.d ? (
          <path d={c.d} />
        ) : (
          <circle cx={c.cx} cy={c.cy} r={5} />
        )
        if (!n) {
          return (
            <g key={c.name} aria-hidden="true" className="fill-muted stroke-background" strokeWidth={0.8}>
              <title>{tr("map.none", { name: c.name })}</title>
              {shape}
            </g>
          )
        }
        return (
          <g
            key={c.name}
            role="button"
            tabIndex={0}
            aria-label={label(c.name, n)}
            aria-pressed={isSelected}
            className={`fill-primary cursor-pointer outline-none focus-visible:stroke-foreground hover:stroke-foreground ${isSelected ? "stroke-foreground" : "stroke-background"}`}
            fillOpacity={fillOpacity}
            strokeWidth={isSelected ? 2.5 : 0.8}
            onClick={() => onSelect(c.name)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onSelect(c.name)
              }
            }}
          >
            <title>{label(c.name, n)}</title>
            {shape}
            {c.small && c.d && <circle cx={c.cx} cy={c.cy} r={5} />}
          </g>
        )
      })}
    </svg>
  )
}
