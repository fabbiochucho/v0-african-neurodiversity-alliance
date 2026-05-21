'use client'

import { useEffect } from 'react'
import { initializeSentry } from '@/lib/sentry/config'

export function SentryInitializer() {
  useEffect(() => {
    // Initialize Sentry on client side
    initializeSentry()
  }, [])

  return null
}
