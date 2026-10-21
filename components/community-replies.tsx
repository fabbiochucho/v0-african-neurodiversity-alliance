"use client"

import { useCallback, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Trash2 } from "lucide-react"

interface Reply {
  id: string
  body: string
  created_at: string
  user_id: string
  profiles: { first_name: string | null; last_name: string | null } | null
}

const MAX_REPLY = 2000

export function CommunityReplies({
  postId,
  userId,
  onChange,
}: {
  postId: string
  userId: string | null
  onChange: () => void
}) {
  const [replies, setReplies] = useState<Reply[]>([])
  const [loading, setLoading] = useState(true)
  const [body, setBody] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const { data } = await createClient()
      .from("community_replies")
      .select("id, body, created_at, user_id, profiles(first_name, last_name)")
      .eq("post_id", postId)
      .order("created_at", { ascending: true })
    setReplies((data as unknown as Reply[]) || [])
    setLoading(false)
  }, [postId])

  useEffect(() => {
    load()
  }, [load])

  async function send() {
    if (!userId || !body.trim()) return
    setSending(true)
    setError(null)
    const { error } = await createClient()
      .from("community_replies")
      .insert({ post_id: postId, user_id: userId, body: body.trim() })
    setSending(false)
    if (error) {
      setError("Your reply didn't post. Try again.")
      return
    }
    setBody("")
    load()
    onChange()
  }

  async function remove(id: string) {
    await createClient().from("community_replies").delete().eq("id", id)
    load()
    onChange()
  }

  const fieldId = `reply-${postId}`

  return (
    <div className="mt-4 border-t pt-4 space-y-3">
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading replies...</p>
      ) : replies.length === 0 ? (
        <p className="text-sm text-muted-foreground">No replies yet.</p>
      ) : (
        <ul className="space-y-3">
          {replies.map((r) => (
            <li key={r.id} className="rounded-md bg-muted/40 p-3 text-sm">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-medium">
                  {[r.profiles?.first_name, r.profiles?.last_name].filter(Boolean).join(" ") || "Community member"}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <time dateTime={r.created_at}>{new Date(r.created_at).toLocaleDateString()}</time>
                  {userId === r.user_id && (
                    <Button size="sm" variant="ghost" aria-label="Delete your reply" onClick={() => remove(r.id)}>
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  )}
                </span>
              </div>
              <p className="whitespace-pre-wrap">{r.body}</p>
            </li>
          ))}
        </ul>
      )}

      {userId ? (
        <div className="space-y-2">
          <Label htmlFor={fieldId}>Your reply</Label>
          <Textarea
            id={fieldId}
            rows={3}
            maxLength={MAX_REPLY}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <Button size="sm" onClick={send} disabled={sending || !body.trim()}>
            {sending ? "Posting..." : "Reply"}
          </Button>
        </div>
      ) : (
        <p className="text-sm">
          <a href="/auth/login" className="underline">
            Sign in
          </a>{" "}
          to reply.
        </p>
      )}
    </div>
  )
}
