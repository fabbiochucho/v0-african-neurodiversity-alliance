import type { MetadataRoute } from "next"
import { appUrl } from "@/lib/app-url"

const SITE = appUrl()

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/account", "/admin", "/dashboard", "/iep", "/export", "/people", "/learners", "/settings", "/team", "/team-dashboard", "/companion", "/connect", "/welcome"],
    },
    sitemap: `${SITE}/sitemap.xml`,
  }
}
