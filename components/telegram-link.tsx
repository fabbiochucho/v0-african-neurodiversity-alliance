"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { calmMessage } from "@/lib/calm"

// Account → Telegram. Only rendered when the bot is configured (app/account/page.tsx).
export function TelegramLink() {
  const [linked, setLinked] = useState<number | null>(null)
  const [link, setLink] = useState<{ url: string; minutes: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/telegram/link")
      .then((r) => r.json())
      .then((d) => setLinked(typeof d.linked === "number" ? d.linked : 0))
      .catch(() => setLinked(0))
  }, [])

  async function call(method: "POST" | "DELETE") {
    setError(null)
    try {
      const res = await fetch("/api/telegram/link", { method })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || "Something went wrong")
      if (method === "POST") setLink(data)
      else {
        setLinked(0)
        setLink(null)
      }
    } catch (err) {
      setError(calmMessage(err))
    }
  }

  return (
    <div className="space-y-3 text-sm">
      <p>
        Search ANDA&apos;s reviewed answers and get expert replies in Telegram, which works well on a slow connection.
        Messages pass through Telegram&apos;s servers, so ANDA only sends answers there, never your plans, records or
        reports. Please don&apos;t send names or health records.
      </p>
      {linked ? <p>Linked to {linked === 1 ? "one chat" : `${linked} chats`}.</p> : null}
      {link && (
        <p role="status">
          <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-primary underline">
            Open ANDA in Telegram
          </a>{" "}
          and press Start. This link works once, for {link.minutes} minutes.
        </p>
      )}
      {error && (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => call("POST")}>
          Link Telegram
        </Button>
        {linked ? (
          <Button type="button" variant="outline" onClick={() => call("DELETE")}>
            Unlink Telegram
          </Button>
        ) : null}
      </div>
    </div>
  )
}
