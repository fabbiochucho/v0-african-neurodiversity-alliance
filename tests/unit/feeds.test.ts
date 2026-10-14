import { describe, expect, it } from "vitest"
import { countryFromHeadline, isNeuroHeadline, keepRecentUnique, mapEuropePmc, parseRss, topicsFor } from "@/lib/feeds"
import { digestHtml, escapeHtml, isDigestEmpty } from "@/lib/digest"

describe("isNeuroHeadline", () => {
  it("keeps headlines about neurodivergent conditions", () => {
    expect(isNeuroHeadline("Nigeria: Parents of Autistic Children Call for Support")).toBe(true)
    expect(isNeuroHeadline("Kenya: School Transforms Learning for Pupils With Dyslexia")).toBe(true)
    expect(isNeuroHeadline("ADHD diagnosis rises among adults")).toBe(true)
    expect(isNeuroHeadline("Sénégal: la journée de l'autisme")).toBe(true)
  })
  it("drops unrelated headlines", () => {
    expect(isNeuroHeadline("Uganda: Schools Get New Tips On Menstrual Hygiene")).toBe(false)
    expect(isNeuroHeadline("Gene clues to severe Covid-19 in children")).toBe(false)
  })
})

describe("countryFromHeadline", () => {
  it("reads allAfrica's country prefix", () => {
    expect(countryFromHeadline("South Africa: UCT Study Finds...")).toBe("South Africa")
    expect(countryFromHeadline("Nigeria: Group Calls for Autism Centres")).toBe("Nigeria")
  })
  it("ignores prefixes that aren't African countries", () => {
    expect(countryFromHeadline("Africa: Continent-wide report")).toBeNull()
    expect(countryFromHeadline("No prefix here")).toBeNull()
  })
})

describe("parseRss", () => {
  it("reads CDATA titles, links and dates, and skips items without a web link", () => {
    const xml = `<rss><channel><title>Feed</title>
      <item><title><![CDATA[Ghana: Autism &amp; Inclusion]]></title><link>https://allafrica.com/stories/1.html</link><pubDate>Fri, 09 Oct 2026 13:21:01 GMT</pubDate></item>
      <item><title>Bad link</title><link>javascript:alert(1)</link></item>
    </channel></rss>`
    expect(parseRss(xml)).toEqual([
      { title: "Ghana: Autism & Inclusion", link: "https://allafrica.com/stories/1.html", pubDate: "Fri, 09 Oct 2026 13:21:01 GMT" },
    ])
  })
})

describe("mapEuropePmc", () => {
  const base = { id: "PMC1", source: "PMC", title: "A review of ADHD.", authorString: "Ade O, Bello K.", journalTitle: "J X", firstPublicationDate: "2026-10-08" }
  it("maps open-access papers to a Europe PMC link", () => {
    expect(mapEuropePmc({ ...base, isOpenAccess: "Y" }, "africa")).toEqual({
      title: "A review of ADHD",
      url: "https://europepmc.org/article/PMC/PMC1",
      authors: "Ade O, Bello K",
      journal: "J X",
      published_on: "2026-10-08",
      scope: "africa",
      topics: [],
    })
  })
  it("drops papers that aren't open access", () => {
    expect(mapEuropePmc({ ...base, isOpenAccess: "N" }, "global")).toBeNull()
  })
})

describe("digest email", () => {
  it("escapes feed content and only links http(s) URLs", () => {
    const html = digestHtml(
      {
        news: [{ title: "<script>x</script>", url: "javascript:alert(1)", source: "a", country: null }],
        research: [],
        resources: [],
      },
      "https://anda.example/api/digest/unsubscribe?token=t",
    )
    expect(html).not.toContain("<script>x")
    expect(html).toContain(escapeHtml("<script>x</script>"))
    expect(html).not.toContain("javascript:")
    expect(html).toContain("Unsubscribe")
  })
  it("is empty only when every section is empty", () => {
    expect(isDigestEmpty({ news: [], research: [], resources: [] })).toBe(true)
    expect(isDigestEmpty({ news: [], research: [], resources: [{ name: "X", country: null, url: null }] })).toBe(false)
  })
})

describe("topicsFor", () => {
  it("tags papers by everyday topic, allowing several", () => {
    expect(topicsFor("Omega-3 supplementation and sleep in autistic children")).toEqual(["Sleep", "Supplements"])
    expect(topicsFor("Aerobic exercise and executive function in ADHD")).toEqual(["Exercise"])
    expect(topicsFor("Probiotics for gastrointestinal symptoms in autism")).toEqual(["Gut health"])
    expect(topicsFor("Structured phonics teaching for dyslexia in primary school")).toEqual(["Education"])
    expect(topicsFor("Music therapy for autistic people")).toEqual(["Natural therapies"])
  })
  it("doesn't match words that only contain a keyword", () => {
    expect(topicsFor("Environmental risk factors for ADHD")).toEqual([])
    expect(topicsFor("Genetic architecture of autism")).toEqual([])
  })
})

describe("keepRecentUnique", () => {
  const now = new Date("2026-10-14T00:00:00Z")
  const item = (url: string, published_at: string | null) => ({ title: "Autism", url, source: "x", country: null, published_at })
  it("keeps items inside the window once each and drops undated or old ones", () => {
    const out = keepRecentUnique(
      [item("a", "2026-09-01T00:00:00Z"), item("a", "2026-09-01T00:00:00Z"), item("b", "2025-10-01T00:00:00Z"), item("c", null)],
      365,
      now,
    )
    expect(out.map((i) => i.url)).toEqual(["a"])
  })
})
