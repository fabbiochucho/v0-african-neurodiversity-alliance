// Weekly discovery of books and apps about neurodivergence
// (app/api/cron/fetch-resources). Items publish straight away, labelled as
// found automatically; admins hide unsuitable ones at /admin/feeds.

import { isNeuroHeadline } from "@/lib/feeds"

export interface DiscoveredResource {
  kind: "book" | "story" | "app" | "video"
  title: string
  creator: string | null
  url: string
  image_url: string | null
  source: string
  published_on: string | null // books: first publication (Jan 1 of the year); apps: last update
  price: string | null
  description: string | null
}

const UA = { "User-Agent": "ANDA-resources (anda.becomechange.institute)" }

export const BOOK_WINDOW_YEARS = 10
export const APP_WINDOW_YEARS = 5

const BOOK_SUBJECTS = [
  "Autism",
  "Autistic children",
  "Asperger's syndrome",
  "Attention-deficit hyperactivity disorder",
  "Dyslexia",
  "Dyspraxia",
  "Tourette syndrome",
  "Learning disabilities",
  "Neurodiversity",
]

// Children's stories with neurodivergent characters: Open Library tags them
// with the condition plus "Juvenile fiction" (or "Fiction" for the
// autistic-children subject, which is already about children).
const STORY_QUERIES = [
  'subject:"Autism" subject:"Juvenile fiction"',
  'subject:"Autistic children" subject:"Fiction"',
  'subject:"Attention-deficit hyperactivity disorder" subject:"Juvenile fiction"',
  'subject:"Dyslexia" subject:"Juvenile fiction"',
  `subject:"Asperger's syndrome" subject:"Juvenile fiction"`,
  'subject:"Tourette syndrome" subject:"Juvenile fiction"',
]

interface OpenLibraryDoc {
  key?: string
  title?: string
  author_name?: string[]
  first_publish_year?: number
  cover_i?: number
  language?: string[]
}

export function mapBook(d: OpenLibraryDoc, minYear: number, kind: "book" | "story" = "book"): DiscoveredResource | null {
  if (!d.key || !d.title || !d.author_name?.length || !d.first_publish_year) return null
  if (d.first_publish_year < minYear) return null
  // English only for now (the site is English-only); untagged records are
  // skipped because Open Library leaves many translations untagged.
  if (!d.language?.includes("eng")) return null
  return {
    kind,
    title: d.title,
    creator: d.author_name.slice(0, 3).join(", "),
    url: `https://openlibrary.org${d.key}`,
    image_url: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg` : null,
    source: "Open Library",
    published_on: `${d.first_publish_year}-01-01`,
    price: null,
    description: null,
  }
}

// Books and children's story books from the last 10 years. Story queries run
// first so a story that also matches a general subject keeps the "story" kind.
export async function fetchBooks(now = new Date()): Promise<DiscoveredResource[]> {
  const minYear = now.getUTCFullYear() - BOOK_WINDOW_YEARS
  const queries = [
    ...STORY_QUERIES.map((q) => ({ q, kind: "story" as const })),
    ...BOOK_SUBJECTS.map((subject) => ({ q: `subject:"${subject}"`, kind: "book" as const })),
  ]
  const results = await Promise.all(
    queries.map(async ({ q, kind }) => {
      const url =
        "https://openlibrary.org/search.json?" +
        new URLSearchParams({
          q: `${q} first_publish_year:[${minYear} TO ${now.getUTCFullYear()}]`,
          sort: "new",
          limit: "100",
          fields: "key,title,author_name,first_publish_year,cover_i,language",
        })
      try {
        const res = await fetch(url, { headers: UA, cache: "no-store", signal: AbortSignal.timeout(20_000) })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = (await res.json()) as { docs?: OpenLibraryDoc[] }
        return (data.docs ?? []).map((d) => mapBook(d, minYear, kind)).filter((b): b is DiscoveredResource => b !== null)
      } catch (err) {
        console.error(`Open Library (${q}) failed:`, err)
        return []
      }
    }),
  )
  // The same book often has several Open Library works (editions, reprints).
  const seen = new Set<string>()
  return uniqueByUrl(results.flat()).filter((b) => {
    const k = `${b.title.toLowerCase().trim()}|${(b.creator ?? "").split(",")[0].toLowerCase()}`
    return !seen.has(k) && seen.add(k)
  })
}

const APP_TERMS = ["autism", "ADHD", "dyslexia", "neurodiversity", "AAC communication", "special needs"]
// Apple's search API allows about 20 requests a minute, so requests are spaced
// out. One store keeps the weekly run inside the 60-second function limit;
// South Africa is the largest African App Store and lists the same global apps.
const APP_COUNTRIES = ["za"]
const APPLE_GAP_MS = 3_500

interface ItunesApp {
  trackId?: number
  trackName?: string
  artistName?: string
  trackViewUrl?: string
  artworkUrl100?: string
  currentVersionReleaseDate?: string
  formattedPrice?: string
  primaryGenreName?: string
  description?: string
}

export function mapApp(a: ItunesApp, cutoff: Date): DiscoveredResource | null {
  if (!a.trackName || !a.trackViewUrl || !a.currentVersionReleaseDate) return null
  if (new Date(a.currentVersionReleaseDate) < cutoff) return null // not updated in 5 years
  if (a.primaryGenreName === "Games" && !isNeuroHeadline(a.trackName)) return null
  // Search matches keywords anywhere in the listing; require the name or the
  // start of the description to be about a neurodivergent condition.
  if (!isNeuroHeadline(a.trackName) && !isNeuroHeadline((a.description ?? "").slice(0, 400))) return null
  const url = a.trackViewUrl.split("?")[0]
  return {
    kind: "app",
    title: a.trackName,
    creator: a.artistName ?? null,
    url,
    image_url: a.artworkUrl100 ?? null,
    source: "App Store",
    published_on: a.currentVersionReleaseDate.slice(0, 10),
    price: a.formattedPrice ?? null,
    description: a.description ? a.description.replace(/\s+/g, " ").slice(0, 280) : null,
  }
}

export async function fetchApps(now = new Date()): Promise<DiscoveredResource[]> {
  const cutoff = new Date(now)
  cutoff.setUTCFullYear(cutoff.getUTCFullYear() - APP_WINDOW_YEARS)
  const out: DiscoveredResource[] = []
  let first = true
  for (const country of APP_COUNTRIES) {
    for (const term of APP_TERMS) {
      if (!first) await new Promise((r) => setTimeout(r, APPLE_GAP_MS))
      first = false
      const url =
        "https://itunes.apple.com/search?" +
        new URLSearchParams({ term, entity: "software", country, limit: "50" })
      try {
        const res = await fetch(url, { headers: UA, cache: "no-store", signal: AbortSignal.timeout(10_000) })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = (await res.json()) as { results?: ItunesApp[] }
        for (const a of data.results ?? []) {
          const app = mapApp(a, cutoff)
          if (app) out.push(app)
        }
      } catch (err) {
        console.error(`App Store (${country}, ${term}) failed:`, err)
      }
    }
  }
  return uniqueByUrl(out)
}

function uniqueByUrl(items: DiscoveredResource[]): DiscoveredResource[] {
  const seen = new Set<string>()
  return items.filter((i) => !seen.has(i.url) && seen.add(i.url))
}
