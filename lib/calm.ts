// Calm error wording (brief §55-56). Never show raw errors, status codes
// or stack-ish messages to people.

export const CALM_SAVE_ERROR = "Something didn't save. Your information is still here. Try again."
export const CALM_LOAD_ERROR = "We couldn't load this just now. Your information is safe. Try again."

const RAW = /fetch|network|json|unexpected token|internal server|request failed|status code|\b5\d\d\b|typeerror|undefined|null/i

/** A message safe to show: our own API wording, or the calm fallback. */
export function calmMessage(err: unknown, fallback: string = CALM_SAVE_ERROR): string {
  const message = err instanceof Error ? err.message : typeof err === "string" ? err : ""
  return message && !RAW.test(message) ? message : fallback
}
