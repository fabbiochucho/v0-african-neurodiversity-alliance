import { describe, expect, it } from "vitest"
import { DPO_CLAUSE } from "@/lib/dpo"

// The DPO clause must stay word for word as approved. Update this only with
// the DPO's sign-off.
const APPROVED = "Data Protection Officer (DPO) Appointment & Contact\nIn compliance with the Nigeria Data Protection Act (NDPA), the Di Badili Leadership Sustainability Initiative (Operating as DiBadili Institute, also known as Become Change Institute) has appointed a designated Data Protection Officer to oversee our data privacy strategy, monitor compliance across all our platforms (including becomechange.institute, anda.becomechange.institute, neurafiki.becomechange.institute, craftframework.becomechange.institute, devmapper.africa, abiolaoshunniyi.lovable.app, and paulineabioloshunniyi.lovable.app), and serve as the primary point of contact for data subjects and regulatory authorities.\nIf you have any questions about this Privacy Policy, wish to exercise your data privacy rights (such as data access, correction, restriction, or deletion), or have a complaint regarding how we handle your personal information, please contact our DPO directly:\nName of DPO: Abiola Oshunniyi\nDesignation: Data Protection Officer (DPO)\nMailing Address: P.O. Box 2550, Festac Town, Lagos, Nigeria.\nOfficial Contact Email: dpo@becomechange.institute\nContact Phone Number: +2348188466444\nOur DPO will review and respond to all valid requests, inquiries, or grievances within the statutory timelines provided under Nigerian data protection laws."

describe("DPO clause", () => {
  it("matches the approved wording exactly", () => {
    const rendered = [
      DPO_CLAUSE.heading,
      DPO_CLAUSE.intro,
      DPO_CLAUSE.lead,
      ...DPO_CLAUSE.details.map(([label, value]) => `${label}: ${value}`),
      DPO_CLAUSE.closing,
    ].join("\n")
    expect(rendered).toBe(APPROVED)
  })
})
