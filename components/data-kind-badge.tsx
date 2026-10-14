import { DATA_KIND_LABELS, type DataKind } from "@/lib/learner-records"

/** Says where a piece of information came from (brief §12, §23). Neutral styling, no colour coding. */
export function DataKindBadge({ kind }: { kind: DataKind }) {
  const { label, description } = DATA_KIND_LABELS[kind]
  return (
    <span
      title={description}
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
        kind === "ai_interpretation" ? "border-dashed" : ""
      }`}
    >
      {label}
      <span className="sr-only">: {description}</span>
    </span>
  )
}
