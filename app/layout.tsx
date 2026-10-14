import type React from "react"
import type { Metadata } from "next"
import { Fraunces, Source_Sans_3 } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { SiteFooter } from "@/components/site-footer"
import { PreferencesSync } from "@/components/preferences-sync"
import { PREFERENCES_BOOT_SCRIPT } from "@/lib/preferences"
import "./globals.css"

// Variable fonts, self-hosted by next/font (no third-party request at
// runtime), latin subset only, swap so text is readable before they load.
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap" })
const sourceSans = Source_Sans_3({ subsets: ["latin"], variable: "--font-source-sans", display: "swap" })

export const metadata: Metadata = {
  title: "African Neurodiversity Alliance (ANDA)",
  description:
    "Empowering neurodivergent individuals across Africa through awareness, education, and inclusive support systems.",
  keywords: "neurodiversity, autism, ADHD, dyslexia, Africa, support, education, awareness",
  authors: [{ name: "African Neurodiversity Alliance" }],
  openGraph: {
    title: "African Neurodiversity Alliance (ANDA)",
    description:
      "Empowering neurodivergent individuals across Africa through awareness, education, and inclusive support systems.",
    type: "website",
    siteName: "African Neurodiversity Alliance",
    images: [{ url: "/apple-icon.png", width: 180, height: 180, alt: "African Neurodiversity Alliance" }],
  },
  twitter: {
    card: "summary",
    title: "African Neurodiversity Alliance (ANDA)",
    description:
      "Empowering neurodivergent individuals across Africa through awareness, education, and inclusive support systems.",
    images: ["/apple-icon.png"],
  },
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${sourceSans.variable}`} suppressHydrationWarning>
      <head>
        {/* Applies saved display preferences before first paint (no flash). */}
        <script dangerouslySetInnerHTML={{ __html: PREFERENCES_BOOT_SCRIPT }} />
      </head>
      <body className="font-sans antialiased">
        <PreferencesSync />
        {/* System preference by default; the header toggle persists light/dark/system. */}
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Suspense fallback={null}>{children}</Suspense>
          <SiteFooter />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
