"use client"

import { useEffect, useState } from "react"

/** Read text aloud with the device's own voice (speechSynthesis): no download, no vendor. */
export function useSpeech() {
  const [supported, setSupported] = useState(false)
  useEffect(() => setSupported(typeof window !== "undefined" && "speechSynthesis" in window), [])
  useEffect(() => () => (supported ? window.speechSynthesis.cancel() : undefined), [supported])
  const speak = (text: string) => {
    if (!supported) return
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text))
  }
  return { supported, speak }
}
