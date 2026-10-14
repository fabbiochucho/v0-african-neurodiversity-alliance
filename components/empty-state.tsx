import Link from "next/link"
import { Button } from "@/components/ui/button"

/** Calm, shared empty state (brief §55-56): says what's missing and the next step. */
export function EmptyState({
  title,
  description,
  actions = [],
}: {
  title: string
  description?: string
  actions?: { label: string; href: string; external?: boolean }[]
}) {
  return (
    <div role="status" className="rounded-xl border border-dashed p-8 sm:p-12 text-center space-y-4">
      <h2 className="text-xl font-semibold text-balance">{title}</h2>
      {description && <p className="text-muted-foreground max-w-prose mx-auto">{description}</p>}
      {actions.length > 0 && (
        <div className="flex flex-wrap justify-center gap-3">
          {actions.map((a, i) => (
            <Button key={a.href + a.label} asChild variant={i === 0 ? "default" : "outline"}>
              {a.external ? <a href={a.href}>{a.label}</a> : <Link href={a.href}>{a.label}</Link>}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
