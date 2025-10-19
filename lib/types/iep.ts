// IEP Tracker Type Definitions

export type UserRole = "parent" | "teacher" | "therapist" | "clinician" | "admin" | "student"

export type DiagnosisDomain = "ASD" | "ADHD" | "Dyslexia" | "Dyspraxia" | "Sensory" | "Cognitive"

export type GoalDomain = "communication" | "sensory" | "academic" | "motor" | "attention" | "behavior"

export type GoalStatus = "ongoing" | "achieved" | "revised"

export type ReportPeriod = "monthly" | "quarterly"

export type SubscriptionTier = "free" | "premium" | "pro" | "institutional"

export type OrganizationType = "school" | "ngo" | "hr_unit" | "clinic"

// User & Access Control
export interface User {
  user_id: string
  role: UserRole
  email: string
  organization_id?: string
  linked_profiles: string[]
  permissions: ("view" | "edit" | "report" | "approve" | "export")[]
  created_at: Date
  updated_at: Date
}

export interface Profile {
  profile_id: string
  name: string
  age: number
  gender: string
  diagnosis_domains: DiagnosisDomain[]
  linked_users: string[]
  language_preference: string
  country: string
  ethnicity?: string
  religion?: string
  created_at: Date
  updated_at: Date
}

// IEP Management
export interface IEPGoal {
  goal_id: string
  domain: GoalDomain
  goal_description: string
  target_metric: string
  timeline: string
  status: GoalStatus
  notes: string
  created_at: Date
  updated_at: Date
}

export interface IEP {
  iep_id: string
  profile_id: string
  created_by: string
  created_date: Date
  goals: IEPGoal[]
  summary: string
  review_schedule: ReportPeriod
  next_review_date: Date
  updated_at: Date
}

// Progress Tracking
export interface ProgressLog {
  log_id: string
  profile_id: string
  goal_id: string
  submitted_by: string
  date: Date
  rating: number // 1-5
  comments: string
  attachments: string[]
}

// Reporting
export interface Report {
  report_id: string
  profile_id: string
  period: ReportPeriod
  generated_on: Date
  summary: string
  graph_data: Record<string, unknown>
  emailed_to: string[]
  email_body: string
  attachment_url: string
  status: "sent" | "pending"
}

// Organization
export interface Organization {
  organization_id: string
  name: string
  type: OrganizationType
  users: string[]
  profiles: string[]
  subscription_tier: SubscriptionTier
  branding_preferences: Record<string, unknown>
  created_at: Date
  updated_at: Date
}

// Subscription
export interface Subscription {
  subscription_id: string
  user_id: string
  organization_id?: string
  tier: SubscriptionTier
  status: "active" | "inactive" | "cancelled"
  start_date: Date
  end_date?: Date
  auto_renew: boolean
}
