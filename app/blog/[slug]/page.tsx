import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { Navigation } from "@/components/navigation"
import { ContentBody } from "@/components/content-body"
import { CONTENT_KINDS } from "@/lib/content"

export const revalidate = 300

const client = () => createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

async function load(slug: string) {
  if (!/^[a-z0-9-]{1,100}$/.test(slug)) return null
  // RLS: published posts only.
  const { data } = await client()
    .from("content_items")
    .select("kind, slug, title, summary, body, cover_image_url, external_url, published_at")
    .eq("slug", slug)
    .maybeSingle()
  return data
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const post = await load((await props.params).slug)
  return post ? { title: `${post.title} | ANDA`, description: post.summary || undefined } : { title: "Not found | ANDA" }
}

export default async function PostPage(props: { params: Promise<{ slug: string }> }) {
  const post = await load((await props.params).slug)
  if (!post) notFound()
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto max-w-3xl px-4 sm:px-6 py-12 space-y-6">
        <Link href={`/blog?kind=${post.kind}`} className="text-sm text-primary underline">
          {CONTENT_KINDS[post.kind as keyof typeof CONTENT_KINDS]}
        </Link>
        <h1 className="text-4xl font-bold text-balance">{post.title}</h1>
        {post.published_at && (
          <p className="text-sm text-muted-foreground">
            {new Date(post.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        )}
        {post.cover_image_url && (
          // eslint-disable-next-line @next/next/no-img-element -- images are unoptimised site-wide
          <img src={post.cover_image_url} alt="" className="w-full rounded-xl" />
        )}
        {post.summary && <p className="text-lg text-muted-foreground">{post.summary}</p>}
        <ContentBody body={post.body} />
        {post.external_url && (
          <p>
            <a href={post.external_url} className="text-primary underline" rel="noopener noreferrer">Read more on the original site</a>
          </p>
        )}
      </main>
    </div>
  )
}
