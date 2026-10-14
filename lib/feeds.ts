// Fetchers and parsers for the daily news and research cron
// (app/api/cron/fetch-feeds). Pure helpers are exported for tests.

export interface NewsItem {
  title: string
  url: string
  source: string
  country: string | null
  published_at: string | null
}

export interface ResearchItem {
  title: string
  url: string
  authors: string | null
  journal: string | null
  published_on: string | null
  scope: "africa" | "global"
  topics: string[]
}

// Topic tags for the research feed, matched on the paper title. A paper can
// have several. Order is the order shown on /news.
export const TOPICS: { name: string; pattern: RegExp }[] = [
  { name: "Education", pattern: /\b(school|classroom|teach\w*|educat\w*|literacy|reading|phonics|learning support|inclusive)/i },
  { name: "Exercise", pattern: /\b(exercise|physical activity|sport\w*|aerobic|motor (skill|training)|movement)/i },
  { name: "Sleep", pattern: /\b(sleep\w*|insomnia|melatonin)/i },
  { name: "Nutrition", pattern: /\b(diet\w*|nutri\w*|food\w*|eating|gluten|casein|ketogenic)/i },
  { name: "Supplements", pattern: /\b(supplement\w*|vitamin\w*|omega|fatty acid\w*|fish oil|iron|ferritin|zinc|magnesium|micronutrient\w*|folinic|sulforaphane)/i },
  { name: "Gut health", pattern: /\b(gut|microbio\w*|probiotic\w*|prebiotic\w*|gastrointestinal|faecal|fecal|constipation)/i },
  { name: "Natural therapies", pattern: /\b(music therap\w*|yoga|mindfulness|massage|acupuncture|animal[- ]assisted|equine|herbal|meditation)/i },
]

export function topicsFor(title: string): string[] {
  return TOPICS.filter((t) => t.pattern.test(title)).map((t) => t.name)
}

// Headline must mention a neurodivergent condition. Full-text matches are
// too noisy (an article mentioning autism once in passing). Includes the
// French terms because allAfrica carries francophone outlets.
const NEURO_TITLE =
  /\b(autis\w*|adhd|attention[- ]deficit|dyslex\w*|dyspraxi\w*|dyscalcul\w*|dysgraph\w*|neurodiver\w*|tourette\w*|learning (disabilit|difficult)\w*|special (needs|education)|developmental (disabilit|delay)\w*|down syndrome|cerebral palsy|intellectual disabilit\w*|tdah|dyslexie)/i

export function isNeuroHeadline(title: string): boolean {
  return NEURO_TITLE.test(title)
}

const AFRICAN_COUNTRIES = [
  "Algeria", "Angola", "Benin", "Botswana", "Burkina Faso", "Burundi", "Cameroon", "Cape Verde", "Chad",
  "Congo-Kinshasa", "Congo-Brazzaville", "Côte d'Ivoire", "Djibouti", "Egypt", "Eritrea", "Eswatini", "Ethiopia",
  "Gabon", "Gambia", "Ghana", "Guinea", "Kenya", "Lesotho", "Liberia", "Libya", "Madagascar", "Malawi", "Mali",
  "Mauritania", "Mauritius", "Morocco", "Mozambique", "Namibia", "Niger", "Nigeria", "Rwanda", "Senegal",
  "Sierra Leone", "Somalia", "South Africa", "South Sudan", "Sudan", "Tanzania", "Togo", "Tunisia", "Uganda",
  "Zambia", "Zimbabwe",
]

// allAfrica headlines start with the country: "Nigeria: Group Calls for ...".
export function countryFromHeadline(title: string): string | null {
  const m = /^([^:]{2,40}):\s/.exec(title)
  if (!m) return null
  return AFRICAN_COUNTRIES.find((c) => c.toLowerCase() === m[1].trim().toLowerCase()) ?? null
}

function decodeEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
}

function tag(item: string, name: string): string | null {
  const m = new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i").exec(item)
  if (!m) return null
  return decodeEntities(m[1].replace(/^<!\[CDATA\[([\s\S]*)\]\]>$/, "$1").trim())
}

// Minimal RSS 2.0 reader: title, link and pubDate per <item>.
export function parseRss(xml: string): { title: string; link: string; pubDate: string | null }[] {
  const items: { title: string; link: string; pubDate: string | null }[] = []
  for (const m of xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)) {
    const title = tag(m[1], "title")
    const link = tag(m[1], "link")
    if (title && link && /^https?:\/\//i.test(link)) items.push({ title, link, pubDate: tag(m[1], "pubDate") })
  }
  return items
}

function toIso(date: string | null): string | null {
  if (!date) return null
  const d = new Date(date)
  return isNaN(d.getTime()) ? null : d.toISOString()
}

interface FeedSource {
  url: string
  source: string
  // null = read the country from an allAfrica-style "Country: ..." headline
  country: string | null
}

const SEARCH_TERMS = ["autism", "ADHD", "dyslexia", "neurodiversity", "special needs", "down syndrome", "cerebral palsy"]

// WordPress sites return search results as RSS (?s=term&feed=rss2), which
// reaches past the latest-50 window of a general feed. Only these two allowed
// it when tested (Oct 2026); others returned 403 or empty results.
const searchFeeds = (base: string, source: string, country: string): FeedSource[] =>
  SEARCH_TERMS.map((t) => ({ url: `${base}/?s=${encodeURIComponent(t)}&feed=rss2`, source, country }))

// One inner array per site. Search feeds return older matches too; only the
// last NEWS_WINDOW_DAYS are kept.
// GDELT was dropped: it rate-limited every request from shared hosting IPs.
const NEWS_SITES: FeedSource[][] = [
  ["health", "education", "children"].map((c) => ({
    url: `https://allafrica.com/tools/headlines/rdf/${c}/headlines.rdf`,
    source: "allAfrica",
    country: null,
  })),
  searchFeeds("https://www.myjoyonline.com", "MyJoyOnline", "Ghana"),
  searchFeeds("https://www.sabcnews.com/sabcnews", "SABC News", "South Africa"),
  [{ url: "https://www.premiumtimesng.com/feed", source: "Premium Times", country: "Nigeria" }],
  [{ url: "https://punchng.com/feed/", source: "Punch", country: "Nigeria" }],
  [{ url: "https://nation.africa/kenya/rss.xml", source: "Nation", country: "Kenya" }],
  [{ url: "https://www.dailymaverick.co.za/dmrss/", source: "Daily Maverick", country: "South Africa" }],
]

async function fetchFeed(feed: FeedSource): Promise<NewsItem[]> {
  try {
    const res = await fetch(feed.url, {
      headers: { "User-Agent": "ANDA-feed (anda.becomechange.institute)" },
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return parseRss(await res.text())
      .filter((item) => isNeuroHeadline(item.title))
      .map((item) => ({
        title: item.title,
        url: item.link,
        source: feed.source,
        country: feed.country ?? countryFromHeadline(item.title),
        published_at: toIso(item.pubDate),
      }))
  } catch (err) {
    console.error(`News feed failed (${feed.url}):`, err)
    return []
  }
}

export const NEWS_WINDOW_DAYS = 365

// Headlines that name a neurodivergent condition, from African outlets, from
// the last year. Items without a date are dropped (they can't be placed in
// the window). Returns one entry per URL.
export async function fetchNews(): Promise<NewsItem[]> {
  // All feeds at once (at most 7 per outlet, once a day) so the run fits the
  // function time limit even when an outlet is slow.
  const all = (await Promise.all(NEWS_SITES.flat().map(fetchFeed))).flat()
  return keepRecentUnique(all, NEWS_WINDOW_DAYS)
}

export function keepRecentUnique(items: NewsItem[], windowDays: number, now = new Date()): NewsItem[] {
  const cutoff = now.getTime() - windowDays * 86400000
  const seen = new Set<string>()
  return items.filter((n) => {
    const t = n.published_at ? Date.parse(n.published_at) : NaN
    if (!(t >= cutoff) || seen.has(n.url)) return false
    seen.add(n.url)
    return true
  })
}

const CONDITION_TERMS =
  '(autism OR autistic OR ADHD OR "attention deficit" OR dyslexia OR dyspraxia OR dyscalculia OR dysgraphia OR neurodivers* OR tourette OR "developmental coordination disorder")'
// Condition must be in the title or abstract; matching full text pulls in
// papers that only mention ADHD in passing (tested: camel-milk reviews).
const RESEARCH_TERMS = `TITLE_ABS:${CONDITION_TERMS}`
const AFRICAN_AFFILIATIONS = AFRICAN_COUNTRIES.filter((c) => c !== "Niger") // "Niger" also matches Nigeria
  .map((c) => (/[\s'-]/.test(c) ? `"${c}"` : c))
  .join(" OR ")

interface EuropePmcResult {
  id: string
  source: string
  doi?: string
  title?: string
  authorString?: string
  journalTitle?: string
  firstPublicationDate?: string
  isOpenAccess?: string
}

export function mapEuropePmc(r: EuropePmcResult, scope: ResearchItem["scope"]): ResearchItem | null {
  if (!r.title || r.isOpenAccess !== "Y") return null
  const title = r.title.replace(/\.$/, "")
  return {
    title,
    // Europe PMC's own page shows the open-access full text.
    url: `https://europepmc.org/article/${r.source}/${r.id}`,
    authors: r.authorString?.replace(/\.$/, "") || null,
    journal: r.journalTitle || null,
    published_on: r.firstPublicationDate || null,
    scope,
    topics: topicsFor(title),
  }
}

// Pages through every result with Europe PMC's cursor (1,000 per page), so a
// multi-year backfill isn't cut off at the first page.
async function europePmcSearch(query: string, scope: ResearchItem["scope"], maxPages = 10): Promise<ResearchItem[]> {
  const out: ResearchItem[] = []
  let cursor = "*"
  try {
    for (let page = 0; page < maxPages; page++) {
      const url =
        "https://www.ebi.ac.uk/europepmc/webservices/rest/search?" +
        new URLSearchParams({ query, format: "json", resultType: "lite", pageSize: "1000", sort: "P_PDATE_D desc", cursorMark: cursor })
      const res = await fetch(url, { cache: "no-store" })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as { nextCursorMark?: string; resultList?: { result?: EuropePmcResult[] } }
      const results = data.resultList?.result ?? []
      for (const r of results) {
        const item = mapEuropePmc(r, scope)
        if (item) out.push(item)
      }
      if (!data.nextCursorMark || data.nextCursorMark === cursor || results.length < 1000) break
      cursor = data.nextCursorMark
    }
  } catch (err) {
    console.error(`Europe PMC (${scope}) failed:`, err)
  }
  return out
}

// Open-access papers from the last `days` days: every paper with an
// African-affiliated author, plus reviews worldwide (the global firehose is
// hundreds of papers a week; reviews are what families and teachers can use).
const TOPIC_TERMS =
  'school OR classroom OR teacher* OR education OR literacy OR reading OR exercise OR "physical activity" OR sport* OR sleep OR melatonin OR diet* OR nutrition OR supplement* OR vitamin* OR omega OR iron OR probiotic* OR microbio* OR gut OR music OR yoga OR mindfulness OR massage OR acupuncture'

const isoDay = (d: Date) => d.toISOString().slice(0, 10)
const daysAgo = (days: number) => new Date(Date.now() - days * 86400000)

// Research older than this isn't fetched (brief: the last 5 years).
export const RESEARCH_WINDOW_DAYS = 5 * 365

export interface DateRange {
  from: Date
  to: Date
}

// Daily runs use the last 7 days. Backfills pass an explicit range (the cron
// route accepts ?from=&to=), one year at a time to stay inside the function
// time limit. African-authored papers always look back at least 30 days:
// they're scarce and Europe PMC indexes some late. The upsert skips ones
// already stored.
export async function fetchResearch(range: DateRange = { from: daysAgo(7), to: new Date() }): Promise<ResearchItem[]> {
  const africaFrom = range.from < daysAgo(30) ? range.from : daysAgo(30)
  const between = (from: Date) => `FIRST_PDATE:[${isoDay(from)} TO ${isoDay(range.to)}]`
  const africa = await europePmcSearch(`${RESEARCH_TERMS} AND AFF:(${AFRICAN_AFFILIATIONS}) AND OPEN_ACCESS:y AND ${between(africaFrom)}`, "africa")
  const reviews = await europePmcSearch(`${RESEARCH_TERMS} AND PUB_TYPE:"review" AND OPEN_ACCESS:y AND ${between(range.from)}`, "global")
  // Randomised trials too, but only on everyday topics families ask about
  // (education, exercise, sleep, diet, supplements, gut, natural therapies).
  const trials = await europePmcSearch(
    `${RESEARCH_TERMS} AND TITLE_ABS:(${TOPIC_TERMS}) AND PUB_TYPE:"randomized controlled trial" AND OPEN_ACCESS:y AND ${between(range.from)}`,
    "global",
  )
  const seen = new Set<string>()
  return [...africa, ...reviews, ...trials].filter((r) => !seen.has(r.url) && seen.add(r.url))
}
