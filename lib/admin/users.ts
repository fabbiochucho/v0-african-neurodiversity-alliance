// User search for /admin/users, its CSV export and bulk actions (admin_user_search, scripts/060).
import { TIER_RANK } from "@/lib/entitlements"

export const PAGE = 50
export const SORTS = { signed_up_desc: "Newest", signed_up_asc: "Oldest", last_active_desc: "Last active", email_asc: "Email A–Z" }
export const STATUSES = { active: "Active", unconfirmed: "Email not confirmed", suspended: "Suspended", deleted: "Deleted (restorable)" }
export type UserParams = { q?: string; status?: string; plan?: string; tag?: string; sort?: string; page?: string; reveal?: string }

export interface UserRow {
  user_id: string
  email: string
  first_name: string | null
  last_name: string | null
  signed_up_at: string
  last_sign_in_at: string | null
  email_confirmed_at: string | null
  plan: string
  suspended_at: string | null
  deleted_at: string | null
  tags: string[]
  total: number
}

export function searchArgs(p: UserParams, page = 0, limit = PAGE) {
  return {
    p_q: p.q?.trim().slice(0, 100) || null,
    p_status: p.status && p.status in STATUSES ? p.status : null,
    p_plan: p.plan && p.plan in TIER_RANK ? p.plan : null,
    p_tag: p.tag?.trim().toLowerCase() || null,
    p_sort: p.sort && p.sort in SORTS ? p.sort : "signed_up_desc",
    p_limit: limit,
    p_offset: page * limit,
  }
}

