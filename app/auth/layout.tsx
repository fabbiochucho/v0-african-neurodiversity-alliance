import { DraftTranslationNotice } from "@/components/language-provider"

// The auth pages have no site header, so show the translation notice here.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DraftTranslationNotice />
      {children}
    </>
  )
}
