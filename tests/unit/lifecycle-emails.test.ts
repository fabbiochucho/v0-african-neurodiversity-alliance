import { describe, expect, it } from "vitest"
import { reminderEmail, welcomeEmail } from "@/lib/lifecycle-emails"

describe("lifecycle emails", () => {
  it("escapes the first name", () => {
    expect(welcomeEmail("<b>Ada</b>").html).toContain("Hello &lt;b&gt;Ada&lt;/b&gt;,")
    expect(welcomeEmail(null).html).toContain("Hello,")
  })

  it("puts the opt-out link in every reminder", () => {
    const url = "https://anda.becomechange.institute/api/email/reminders-off?token=abc"
    expect(reminderEmail("Ada", url).html).toContain(`href="${url}"`)
  })
})
