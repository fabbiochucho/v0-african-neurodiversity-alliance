import { describe, expect, it } from "vitest"
import { bodyToHtml, newsletterHtml, newsletterText } from "@/lib/newsletter"

describe("newsletter body", () => {
  it("escapes markup so an issue can't inject HTML", () => {
    const html = bodyToHtml('<script>alert(1)</script> "hi"')
    expect(html).not.toContain("<script>")
    expect(html).toContain("&lt;script&gt;")
  })

  it("turns paragraphs, headings, lists and links into email HTML", () => {
    const html = bodyToHtml("## Events\nJoin us.\n\n- One\n- Two\n\nSee https://anda.becomechange.institute/news.")
    expect(html).toContain(">Events</h2>")
    expect(html).toContain(">Join us.</p>")
    expect(html.match(/<li /g)).toHaveLength(2)
    expect(html).toContain('href="https://anda.becomechange.institute/news"')
    expect(html).not.toContain('news."') // trailing full stop isn't part of the link
  })

  it("puts the unsubscribe link in both versions", () => {
    const url = "https://anda.becomechange.institute/api/newsletter/unsubscribe?token=abc"
    expect(newsletterHtml("Hello", "Body", url)).toContain(url)
    expect(newsletterText("Hello", "Body", url)).toContain(`Unsubscribe: ${url}`)
  })
})
