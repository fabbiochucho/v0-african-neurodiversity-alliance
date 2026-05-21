import type React from "react"
import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import { Suspense } from "react"
import { initializeSentry } from "@/lib/sentry/config"
import "./globals.css"

// Initialize Sentry error tracking
if (typeof window !== 'undefined') {
  initializeSentry()
}

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
})

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
  },
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="font-sans antialiased">
        <Suspense fallback={null}>{children}</Suspense>
      </body>
    </html>
  )
}
