"use client"

import { useRef, useState } from "react"
import { ArrowRight } from "lucide-react"

export interface JourneyStep {
  name: string
  product: "NeuRafiki" | "ANDA"
  text: string
  href: string
  action: string
}

const SIZE = 400
const C = SIZE / 2
const R = 148
// Ink colours (not the lighter thread colours) so the step numbers on filled
// nodes keep AA contrast in light and dark themes.
const THREAD: Record<JourneyStep["product"], string> = { NeuRafiki: "var(--indigo)", ANDA: "var(--primary)" }

// Position of step i (0 at the top, clockwise) on the ring, in viewBox units.
function point(i: number, n: number, r = R) {
  const a = (-90 + (360 / n) * i) * (Math.PI / 180)
  return { x: C + r * Math.cos(a), y: C + r * Math.sin(a) }
}

// The support journey as a loop (brief §2): tap or arrow through the steps.
// The thread arc grows from Assess to the chosen step; the card below says
// what happens there and links to the real tool.
export function JourneyLoop({ steps }: { steps: JourneyStep[] }) {
  const [active, setActive] = useState(0)
  const buttons = useRef<(HTMLButtonElement | null)[]>([])
  const n = steps.length
  const step = steps[active]
  const circumference = 2 * Math.PI * R
  const progress = (active / n) * circumference

  function onKey(e: React.KeyboardEvent, i: number) {
    const delta = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0
    if (!delta) return
    e.preventDefault()
    const next = (i + delta + n) % n
    setActive(next)
    buttons.current[next]?.focus()
  }

  return (
    <div className="w-full max-w-[26rem] mx-auto">
      <div className="relative aspect-square">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
          {/* warp and weft of the ring */}
          <circle cx={C} cy={C} r={R} fill="none" stroke="var(--border)" strokeWidth="10" />
          <circle cx={C} cy={C} r={R} fill="none" stroke="var(--texture)" strokeWidth="10" strokeDasharray="2 6" />
          {/* the journey so far, drawn as a thread from Assess */}
          <circle
            cx={C}
            cy={C}
            r={R}
            fill="none"
            stroke={THREAD[step.product]}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${progress} ${circumference}`}
            transform={`rotate(-90 ${C} ${C})`}
            style={{ transition: "stroke-dasharray 600ms cubic-bezier(0.16, 1, 0.3, 1), stroke 300ms" }}
          />
          {/* inner mudcloth rings */}
          <circle cx={C} cy={C} r={92} fill="none" stroke="var(--texture)" strokeWidth="2" strokeDasharray="1 7" />
          <circle cx={C} cy={C} r={80} fill="none" stroke="var(--texture)" strokeWidth="1.5" />
        </svg>

        {/* centre: where you are in the loop */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center px-4 max-w-[11rem]" aria-live="polite">
            <p className="text-xs font-semibold" style={{ color: step.product === "NeuRafiki" ? "var(--indigo)" : "var(--primary)" }}>
              {step.product}
            </p>
            <p className="font-display text-3xl sm:text-4xl font-semibold leading-tight">{step.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {active === n - 1 ? "then reassess and go round again" : `then ${steps[active + 1].name.toLowerCase()}`}
            </p>
          </div>
        </div>

        {/* the steps, as real buttons placed on the ring */}
        <div role="radiogroup" aria-label="The support journey" className="absolute inset-0">
          {steps.map((s, i) => {
            const p = point(i, n)
            const selected = i === active
            const done = i < active
            return (
              <button
                key={s.name}
                ref={(el) => {
                  buttons.current[i] = el
                }}
                type="button"
                role="radio"
                aria-checked={selected}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(i)}
                onKeyDown={(e) => onKey(e, i)}
                className="group absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 focus-visible:outline-none"
                style={{ left: `${(p.x / SIZE) * 100}%`, top: `${(p.y / SIZE) * 100}%` }}
              >
                <span
                  className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full border-[3px] bg-card text-sm font-bold transition-[transform,background-color,color] duration-300 group-hover:scale-110 group-focus-visible:ring-4 group-focus-visible:ring-ring/40"
                  style={{
                    borderColor: THREAD[s.product],
                    backgroundColor: selected || done ? THREAD[s.product] : undefined,
                    color: selected || done ? "var(--card)" : THREAD[s.product],
                  }}
                >
                  {i + 1}
                </span>
                <span className={`rounded-full bg-background/90 px-2 text-xs sm:text-sm ${selected ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                  {s.name}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* what happens at this step */}
      <div className="relative -mt-2 rounded-2xl border bg-card p-5 shadow-[0_8px_24px_-12px_rgb(43_36_32/0.25)]">
        <p className="text-pretty">{step.text}</p>
        <a
          href={step.href}
          className="mt-3 inline-flex items-center gap-2 font-semibold underline decoration-2 underline-offset-4"
          style={{ color: step.product === "NeuRafiki" ? "var(--indigo)" : "var(--primary)" }}
        >
          {step.action} <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
    </div>
  )
}
