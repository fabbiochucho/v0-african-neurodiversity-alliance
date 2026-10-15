import type { MetadataRoute } from "next"

const SITE = (process.env.NEXT_PUBLIC_APP_URL || "https://anda.becomechange.institute").replace(/\/$/, "")

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
