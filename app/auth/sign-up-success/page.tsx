"use client"

import Link from "next/link"
import { Icons } from "@/lib/icons"
import { useT } from "@/components/language-provider"

export default function SignUpSuccessPage() {
  const tr = useT()
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background/50 px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex justify-center">
          <div className="bg-primary/10 rounded-full p-4">
            <Icons.CheckCircle className="w-12 h-12 text-primary" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">{tr("auth.checkEmail")}</h1>
          <p className="text-muted-foreground">
            {tr("auth.checkEmailText")}
          </p>
        </div>

        <div className="bg-secondary border border-border rounded-lg p-4">
          <p className="text-sm text-secondary-foreground">
            <strong>{tr("auth.noEmailTitle")}</strong> {tr("auth.noEmailText")}
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{tr("auth.onceVerified")}</p>
          <Link
            href="/auth/login"
            className="inline-block w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition"
          >
            {tr("auth.backToLogin")}
          </Link>
        </div>
      </div>
    </div>
  )
}
