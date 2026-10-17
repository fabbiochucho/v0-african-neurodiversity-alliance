import type { MetadataRoute } from "next"

const SITE = (process.env.NEXT_PUBLIC_APP_URL || "https://anda.becomechange.institute").replace(/\/$/, "")

const PUBLIC_PAGES = [
  "",
  "/about",
  "/self-test",
  "/screening",
  "/directory",
  "/apps-tools",
  "/learning",
  "/learning/what-works",
  "/news",
  "/news/research",
  "/research",
  "/community",
  "/advocacy",
  "/donate",
  "/privacy",
  "/terms",
  "/accessibility",
  "/guidelines",
]

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PAGES.map((p) => ({ url: `${SITE}${p}` }))
}
