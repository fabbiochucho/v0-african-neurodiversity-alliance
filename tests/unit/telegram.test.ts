import { describe, expect, it } from "vitest"
import { answerMessage, clip, linkCodeHash, parseCommand, parseFeedback } from "@/lib/telegram"

describe("telegram bot", () => {
  it("treats plain text as a question and reads commands", () => {
    expect(parseCommand("How can we make bedtime calmer?")).toEqual({ name: "ask", arg: "How can we make bedtime calmer?" })
    expect(parseCommand("/start ABC123")).toEqual({ name: "start", arg: "ABC123" })
    expect(parseCommand("/ask@anda_bot sleep")).toEqual({ name: "ask", arg: "sleep" })
    expect(parseCommand("/MINE")).toEqual({ name: "mine", arg: "" })
    expect(parseCommand("/whatever x")).toEqual({ name: "help", arg: "" })
  })

  it("keeps feedback buttons inside Telegram's 64-byte limit and reads them back", () => {
    const id = "123e4567-e89b-12d3-a456-426614174000"
    const m = answerMessage({ id, question: "Q?", answer: "A.", sources: "", lang: "en" })
    for (const b of m.buttons.flat()) expect(new TextEncoder().encode(b.callback_data).length).toBeLessThanOrEqual(64)
    expect(parseFeedback(m.buttons[0][0].callback_data)).toEqual({ id, helpful: true })
    expect(parseFeedback(m.buttons[0][1].callback_data)).toEqual({ id, helpful: false })
    expect(parseFeedback("f:not-a-uuid:1")).toBeNull()
  })

  it("always says how an answer was checked and points to a professional, even for a long answer", () => {
    const m = answerMessage({ id: "x", question: "Q?", answer: "a".repeat(5000), sources: "s".repeat(1000), lang: "en" })
    expect(m.text).toContain("Not yet reviewed by a clinician")
    expect(m.text).toContain("not a diagnosis")
    expect(m.text.length).toBeLessThan(4096)
  })

  it("cuts long messages under Telegram's 4096 limit", () => {
    expect(clip("x".repeat(5000)).length).toBeLessThanOrEqual(3500)
    expect(clip("short")).toBe("short")
  })

  it("hashes link codes the same however they are typed", () => {
    expect(linkCodeHash(" abc ")).toBe(linkCodeHash("ABC"))
  })
})
