// The account password rule, matching the Supabase Auth policy (12+ characters with lower,
// upper, digit and symbol). Used by sign-up and by setting a new password.
export function isStrongPassword(password: string): boolean {
  return (
    password.length >= 12 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[!@#$%^&*()_+\-=[\]{};'\:"|<>?,./`~]/.test(password)
  )
}
