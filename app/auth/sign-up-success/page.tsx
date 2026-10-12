"use client"

import Link from "next/link"
import { Icons } from "@/lib/icons"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background/50 px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex justify-center">
          <div className="bg-primary/10 rounded-full p-4">
            <Icons.CheckCircle className="w-12 h-12 text-primary" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Check Your Email</h1>
          <p className="text-muted-foreground">
            We&apos;ve sent a confirmation link to your email address. Please click the link to verify your account.
          </p>
        </div>

        <div className="bg-secondary border border-border rounded-lg p-4">
          <p className="text-sm text-secondary-foreground">
            <strong>Didn&apos;t receive an email?</strong> Check your spam folder or contact our support team.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Once verified, you can sign in to your account</p>
          <Link
            href="/auth/login"
            className="inline-block w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
