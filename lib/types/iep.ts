// IEP Tracker Type Definitions
//
// These interfaces mirror the actual Supabase/Postgres schema defined in
// scripts/001_create_profiles.sql through scripts/007_create_profile_trigger.sql.
// Keep this file in sync with the SQL — do not add fields here that don't
// exist as real columns.

// ---- Shared enums / unions -------------------------------------------------

export type DiagnosisDomain = "ASD" | "ADHD" | "Dyslexia" | "Dyspraxia" | "Sensory" | "Cognitive"

export type GoalDomain = "communication" | "sensory" | "academic" | "motor" | "attention" | "behavior"

// public.iep_goals.status default 'in_progress'
export type GoalStatus = "in_progress" | "achieved" | "revised"

// public.ieps.status default 'draft'
export type IEPStatus = "draft" | "active" | "archived"

export type ReportPeriod = "monthly" | "quarterly"

// public.subscriptions.tier default 'free'
export type SubscriptionTier = "free" | "premium" | "pro" | "institutional"

// public.subscriptions.status default 'active' (also used as 'pending' while awaiting payment)
export type SubscriptionStatus = "pending" | "active" | "inactive" | "cancelled"

export type OrganizationType = "school" | "ngo" | "hr_unit" | "clinic"

// public.payment_transactions.status default 'pending'
export type PaymentStatus = "pending" | "successful" | "failed"

// public.payment_transactions.purpose (added in scripts/008_add_donation_purpose.sql)
export type PaymentPurpose = "subscription" | "donation"

// ---- public.profiles --------------------------------------------------------

export interface Profile {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  role: string
  organization_id: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

// ---- public.organizations ---------------------------------------------------

export interface Organization {
  id: string
  name: string
  country: string | null
  organization_type: OrganizationType | string | null
  subscription_tier: SubscriptionTier
  max_users: number
  created_at: string
  updated_at: string
}

// ---- public.learner_profiles -------------------------------------------------

export interface LearnerProfile {
  id: string
  user_id: string
  name: string
  age: number | null
  gender: string | null
  country: string | null
  diagnosis_domains: DiagnosisDomain[]
  created_at: string
  updated_at: string
}

// Shape of a single goal as it is generated client-side and stored inside
// ieps.adaptive_goals / ieps.custom_goals (jsonb arrays). When an IEP is
// created, app/api/iep/create copies these into normalized public.iep_goals
// rows (goal_text = goal_description, domain, status = 'in_progress').
export interface GeneratedGoal {
  domain: GoalDomain
  goal_description: string
  target_metric: string
  timeline: string
  notes?: string
}

// ---- public.ieps --------------------------------------------------------------

export interface IEP {
  id: string
  learner_id: string
  created_by: string
  title: string | null
  description: string | null
  status: IEPStatus
  adaptive_goals: GeneratedGoal[]
  custom_goals: GeneratedGoal[]
  ai_summary: string | null
  created_at: string
  updated_at: string
}

// ---- public.iep_goals (normalized, one row per goal) ---------------------------

export interface IEPGoal {
  id: string
  iep_id: string
  goal_text: string
  domain: GoalDomain | string | null
  status: GoalStatus
  target_completion_date: string | null
  created_at: string
  updated_at: string
}

// ---- public.progress_logs ------------------------------------------------------

export interface ProgressLog {
  id: string
  goal_id: string
  logged_by: string
  rating: number // 1-5
  notes: string | null
  logged_date: string
  created_at: string
}

// ---- public.progress_summaries -------------------------------------------------

export interface ProgressSummary {
  id: string
  learner_id: string
  week_start_date: string | null
  week_end_date: string | null
  summary_text: string | null
  domain_progress: Record<string, number>
  created_at: string
}

// ---- public.reports -------------------------------------------------------------

export interface Report {
  id: string
  learner_id: string
  generated_by: string
  report_type: string | null
  report_period: string | null
  content: string | null
  pdf_url: string | null
  email_sent: boolean
  email_sent_at: string | null
  created_at: string
}

// ---- public.subscriptions ---------------------------------------------------------

export interface Subscription {
  id: string
  user_id: string
  tier: SubscriptionTier
  status: SubscriptionStatus
  flutterwave_ref: string | null
  amount_paid: number | null
  payment_date: string | null
  renewal_date: string | null
  created_at: string
  updated_at: string
}

// ---- public.payment_transactions -----------------------------------------------------

export interface PaymentTransaction {
  id: string
  subscription_id: string | null
  transaction_id: string
  flutterwave_transaction_id: string | null
  amount: number | null
  currency: string
  status: PaymentStatus
  purpose: PaymentPurpose
  created_at: string
}
