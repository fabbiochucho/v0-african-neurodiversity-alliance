import type React from "react"
import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import { Suspense } from "react"
import "./globals.css"

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
    <html lang="en" className={poppins.variable}>
      <body className="font-sans antialiased">
        <Suspense fallback={null}>{children}</Suspense>
      </body>
    </html>
  )
}
