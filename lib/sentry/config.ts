import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN
const ENVIRONMENT = process.env.NODE_ENV || 'development'
const RELEASE = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'

export function initializeSentry() {
  if (!SENTRY_DSN) {
    if (ENVIRONMENT !== 'development') {
      console.error('[v0] Sentry DSN not configured in production. Please add NEXT_PUBLIC_SENTRY_DSN to environment variables.')
    } else {
      console.info('[v0] Sentry DSN not configured. Error tracking disabled (dev mode).')
    }
    return
  }

  try {
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: ENVIRONMENT,
      release: RELEASE,
      tracesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,
      integrations: [
        new Sentry.Replay({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      replaysSessionSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,
      replaysOnErrorSampleRate: 1.0,
      beforeSend(event, hint) {
        // Filter out certain errors
        if (event.exception) {
          const error = hint.originalException
          // Don't send network errors in development
          if (
            ENVIRONMENT === 'development' &&
            error instanceof Error &&
            error.message.includes('Network')
          ) {
            return null
          }
        }
        return event
      },
    })

    console.log('[v0] Sentry initialized successfully with DSN:', SENTRY_DSN.split('@')[0] + '@...')
  } catch (error) {
    console.error('[v0] Failed to initialize Sentry:', error)
  }
}

export function captureException(error: Error, context?: Record<string, any>) {
  if (!SENTRY_DSN) return

  Sentry.captureException(error, {
    contexts: context ? { additional: context } : undefined,
  })
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (!SENTRY_DSN) return

  Sentry.captureMessage(message, level)
}

export function setUserContext(userId: string, email?: string, name?: string) {
  Sentry.setUser({
    id: userId,
    email,
    username: name,
  })
}

export function clearUserContext() {
  Sentry.setUser(null)
}
