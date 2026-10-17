import type { MetadataRoute } from "next"
import { appUrl } from "@/lib/app-url"

const SITE = appUrl()

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
