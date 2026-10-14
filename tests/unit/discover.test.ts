import { describe, expect, it } from "vitest"
import { mapApp, mapBook } from "@/lib/discover"

describe("mapBook", () => {
  const doc = { key: "/works/OL1W", title: "Being Autistic", author_name: ["A. Writer"], first_publish_year: 2024, cover_i: 9, language: ["eng"] }
  it("maps recent English books with an author", () => {
    expect(mapBook(doc, 2016)).toMatchObject({
      kind: "book",
      url: "https://openlibrary.org/works/OL1W",
      image_url: "https://covers.openlibrary.org/b/id/9-M.jpg",
      published_on: "2024-01-01",
    })
  })
  it("drops old, non-English, untagged or authorless books", () => {
    expect(mapBook({ ...doc, first_publish_year: 2010 }, 2016)).toBeNull()
    expect(mapBook({ ...doc, language: ["spa"] }, 2016)).toBeNull()
    expect(mapBook({ ...doc, language: undefined }, 2016)).toBeNull()
    expect(mapBook({ ...doc, author_name: [] }, 2016)).toBeNull()
  })
})

describe("mapApp", () => {
  const cutoff = new Date("2021-10-14T00:00:00Z")
  const app = {
    trackName: "Autism Visual Schedule",
    trackViewUrl: "https://apps.apple.com/za/app/x/id1?uo=4",
    currentVersionReleaseDate: "2026-05-01T00:00:00Z",
    primaryGenreName: "Education",
    description: "Daily routines for autistic children",
  }
  it("keeps apps updated in the window and strips tracking from the link", () => {
    expect(mapApp(app, cutoff)).toMatchObject({ kind: "app", url: "https://apps.apple.com/za/app/x/id1", published_on: "2026-05-01" })
  })
  it("drops apps not updated in 5 years, or not about a neurodivergent condition", () => {
    expect(mapApp({ ...app, currentVersionReleaseDate: "2019-01-01T00:00:00Z" }, cutoff)).toBeNull()
    expect(mapApp({ ...app, trackName: "Photo Editor", description: "Filters and stickers" }, cutoff)).toBeNull()
    expect(mapApp({ ...app, trackName: "Puzzle Quest", primaryGenreName: "Games", description: "Great for autism" }, cutoff)).toBeNull()
  })
})
