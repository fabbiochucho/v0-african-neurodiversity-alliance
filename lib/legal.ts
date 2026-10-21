// Shared legal details for the footer, privacy policy and terms.
export const LEGAL_ENTITY = "Di Badili Leadership Sustainability Initiative"
export const LEGAL_BRAND = "Become Change Institute"
// Registered name with trading names, for copyright lines and policy intros.
export const LEGAL_OWNER = `${LEGAL_ENTITY} (Operating as DiBadili Institute, also known as ${LEGAL_BRAND})`
// Name in footer copyright lines (owner decision: "© <year> DiBadili Institute").
export const COPYRIGHT_HOLDER = "DiBadili Institute"
// Postal address for marketing-email footers (same as the DPO mailing address).
export const LEGAL_POSTAL_ADDRESS = "P.O. Box 2550, Festac Town, Lagos, Nigeria"
export const LEGAL_CONTACT_EMAIL = "privacy@becomechange.institute"
export const BECOMECHANGE_URL = "https://becomechange.institute"
export const LEGAL_UPDATED = "21 October 2026"
// General enquiries (volunteering, partnerships, campaigns).
export const ANDA_CONTACT_EMAIL = "anda@becomechange.institute"

/** mailto: link to ANDA_CONTACT_EMAIL with a subject and starter text. */
export function contactHref(subject: string, body = ""): string {
  return `mailto:${ANDA_CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
