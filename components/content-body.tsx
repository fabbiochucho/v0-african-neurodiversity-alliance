import { linkParts, parseBody } from "@/lib/content"

function Linked({ text }: { text: string }) {
  return (
    <>
      {linkParts(text).map((p, i) =>
        p.href ? (
          <a key={i} href={p.href} className="text-primary underline break-words" rel="noopener noreferrer">
            {p.text}
          </a>
        ) : (
          <span key={i}>{p.text}</span>
        ),
      )}
    </>
  )
}

/** Renders an admin-written body as React elements, so nothing in it is treated as HTML. */
export function ContentBody({ body }: { body: string }) {
  return (
    <div className="space-y-4 leading-relaxed">
      {parseBody(body).map((b, i) =>
        b.type === "heading" ? (
          <h2 key={i} className="text-xl font-semibold pt-2">
            <Linked text={b.text} />
          </h2>
        ) : b.type === "list" ? (
          <ul key={i} className="list-disc pl-6 space-y-1">
            {b.items.map((item, j) => (
              <li key={j}>
                <Linked text={item} />
              </li>
            ))}
          </ul>
        ) : (
          <p key={i}>
            {b.lines.map((l, j) => (
              <span key={j}>
                {j > 0 && <br />}
                <Linked text={l} />
              </span>
            ))}
          </p>
        ),
      )}
    </div>
  )
}
