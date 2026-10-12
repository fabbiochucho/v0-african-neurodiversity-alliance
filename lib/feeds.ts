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
// French terms because allAfrica and GDELT carry francophone outlets.
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

// GDELT dates look like 20261010T120000Z.
export function parseGdeltDate(s: string | undefined): string | null {
  const m = s && /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/.exec(s)
  return m ? `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}.000Z` : null
}

const ALLAFRICA_FEEDS = ["health", "education", "children"].map(
  (c) => `https://allafrica.com/tools/headlines/rdf/${c}/headlines.rdf`,
)

export async function fetchAllAfricaNews(): Promise<NewsItem[]> {
  const out: NewsItem[] = []
  for (const url of ALLAFRICA_FEEDS) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": "ANDA-feed (anda.becomechange.institute)" }, cache: "no-store" })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      for (const item of parseRss(await res.text())) {
        if (!isNeuroHeadline(item.title)) continue
        out.push({
          title: item.title,
          url: item.link,
          source: "allAfrica",
          country: countryFromHeadline(item.title),
          published_at: toIso(item.pubDate),
        })
      }
    } catch (err) {
      console.error(`allAfrica feed failed (${url}):`, err)
    }
  }
  return out
}

// GDELT asks for at most one request every 5 seconds, so this is one query.
// ponytail: GDELT country names are passed as GDELT spells them; verify the
// multi-word ones (southafrica) against live results after the first run.
const GDELT_COUNTRIES = ["nigeria", "kenya", "southafrica", "ghana", "uganda", "tanzania", "ethiopia", "rwanda", "zambia", "zimbabwe", "egypt", "morocco"]

export async function fetchGdeltNews(): Promise<NewsItem[]> {
  const terms = '(autism OR autistic OR ADHD OR dyslexia OR neurodiversity OR neurodivergent OR "down syndrome" OR "cerebral palsy")'
  const countries = `(${GDELT_COUNTRIES.map((c) => `sourcecountry:${c}`).join(" OR ")})`
  const url =
    "https://api.gdeltproject.org/api/v2/doc/doc?" +
    new URLSearchParams({ query: `${terms} ${countries}`, mode: "artlist", format: "json", timespan: "3days", maxrecords: "100", sort: "datedesc" })
  try {
    const res = await fetch(url, { cache: "no-store" })
    const text = await res.text()
    if (!res.ok || !text.startsWith("{")) throw new Error(text.slice(0, 120))
    const data = JSON.parse(text) as { articles?: { url: string; title: string; seendate?: string; domain?: string; sourcecountry?: string }[] }
    return (data.articles ?? [])
      .filter((a) => a.title && a.url && isNeuroHeadline(a.title))
      .map((a) => ({
        title: a.title,
        url: a.url,
        source: a.domain ?? new URL(a.url).hostname,
        country: a.sourcecountry || null,
        published_at: parseGdeltDate(a.seendate),
      }))
  } catch (err) {
    console.error("GDELT fetch failed:", err)
    return []
  }
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

async function europePmcSearch(query: string, scope: ResearchItem["scope"]): Promise<ResearchItem[]> {
  const url =
    "https://www.ebi.ac.uk/europepmc/webservices/rest/search?" +
    new URLSearchParams({ query, format: "json", resultType: "lite", pageSize: "100", sort: "P_PDATE_D desc" })
  try {
    const res = await fetch(url, { cache: "no-store" })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = (await res.json()) as { resultList?: { result?: EuropePmcResult[] } }
    return (data.resultList?.result ?? []).map((r) => mapEuropePmc(r, scope)).filter((r): r is ResearchItem => r !== null)
  } catch (err) {
    console.error(`Europe PMC (${scope}) failed:`, err)
    return []
  }
}

// Open-access papers from the last `days` days: every paper with an
// African-affiliated author, plus reviews worldwide (the global firehose is
// hundreds of papers a week; reviews are what families and teachers can use).
const TOPIC_TERMS =
  'school OR classroom OR teacher* OR education OR literacy OR reading OR exercise OR "physical activity" OR sport* OR sleep OR melatonin OR diet* OR nutrition OR supplement* OR vitamin* OR omega OR iron OR probiotic* OR microbio* OR gut OR music OR yoga OR mindfulness OR massage OR acupuncture'

function dateRange(days: number): string {
  const to = new Date()
  const from = new Date(to.getTime() - days * 86400000)
  return `FIRST_PDATE:[${from.toISOString().slice(0, 10)} TO ${to.toISOString().slice(0, 10)}]`
}

// African-authored papers look back 30 days (they're scarce and Europe PMC
// indexes some late); the upsert skips ones already stored.
export async function fetchResearch(days = 7): Promise<ResearchItem[]> {
  const africa = await europePmcSearch(`${RESEARCH_TERMS} AND AFF:(${AFRICAN_AFFILIATIONS}) AND OPEN_ACCESS:y AND ${dateRange(Math.max(days, 30))}`, "africa")
  const reviews = await europePmcSearch(`${RESEARCH_TERMS} AND PUB_TYPE:"review" AND OPEN_ACCESS:y AND ${dateRange(days)}`, "global")
  // Randomised trials too, but only on everyday topics families ask about
  // (education, exercise, sleep, diet, supplements, gut, natural therapies).
  const trials = await europePmcSearch(
    `${RESEARCH_TERMS} AND TITLE_ABS:(${TOPIC_TERMS}) AND PUB_TYPE:"randomized controlled trial" AND OPEN_ACCESS:y AND ${dateRange(days)}`,
    "global",
  )
  const seen = new Set<string>()
  return [...africa, ...reviews, ...trials].filter((r) => !seen.has(r.url) && seen.add(r.url))
}
