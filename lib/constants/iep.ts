// IEP Tracker Constants

export const SUBSCRIPTION_TIERS = {
  free: {
    name: "Free",
    price: 0,
    period: null as string | null,
    features: ["Basic screening and summary", "Single profile"],
  },
  premium: {
    name: "Premium",
    price: 4.99,
    period: "month",
    features: ["Full screening", "Basic IEP summary", "Email summary (limited)"],
  },
  pro: {
    name: "Pro",
    price: 9.99,
    period: "month",
    features: [
      "Dynamic IEP generator",
      "Full progress tracker",
      "Multi-user dashboard",
      "Automated branded reports with attachments",
    ],
  },
  institutional: {
    name: "Institutional",
    price: 99,
    period: "year",
    features: [
      "Bulk enrollment",
      "Multi-student dashboards",
      "Organization branding add-on",
      "Data export and analytics",
    ],
  },
}

export const GOAL_DOMAINS = ["communication", "sensory", "academic", "motor", "attention", "behavior"] as const

export const DIAGNOSIS_DOMAINS = ["ASD", "ADHD", "Dyslexia", "Dyspraxia", "Sensory", "Cognitive"] as const

export const USER_ROLES = ["parent", "teacher", "therapist", "clinician", "admin", "student"] as const

export const ADAPTIVE_GOALS = {
  ASD: [
    {
      domain: "communication",
      suggestion: "Improve social communication and interaction skills",
      metric: "Number of successful peer interactions per week",
    },
    {
      domain: "sensory",
      suggestion: "Develop sensory regulation strategies",
      metric: "Reduction in sensory meltdowns per week",
    },
    {
      domain: "behavior",
      suggestion: "Reduce repetitive behaviors and increase flexibility",
      metric: "Increase in adaptive behaviors by 20%",
    },
  ],
  ADHD: [
    {
      domain: "attention",
      suggestion: "Improve sustained attention and focus",
      metric: "Increase in task completion time by 30%",
    },
    {
      domain: "academic",
      suggestion: "Enhance organizational and planning skills",
      metric: "Improvement in assignment submission rate",
    },
    {
      domain: "behavior",
      suggestion: "Develop impulse control strategies",
      metric: "Reduction in disruptive behaviors by 25%",
    },
  ],
  Dyslexia: [
    {
      domain: "academic",
      suggestion: "Improve reading fluency and comprehension",
      metric: "Increase in reading speed by 15%",
    },
    {
      domain: "academic",
      suggestion: "Develop spelling and writing skills",
      metric: "Improvement in spelling accuracy by 20%",
    },
  ],
  Dyspraxia: [
    {
      domain: "motor",
      suggestion: "Improve fine and gross motor coordination",
      metric: "Increase in motor skill proficiency by 25%",
    },
    {
      domain: "academic",
      suggestion: "Develop handwriting and coordination skills",
      metric: "Improvement in handwriting legibility",
    },
  ],
}

export const EMAIL_TEMPLATE = {
  subject: "ANDA NeuroCare | Monthly IEP Progress Report for {childName}",
  signature: "Sent via ANDA NeuroCare – Empowering Neurodivergent Futures Across Africa",
}
