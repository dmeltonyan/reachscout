import { describe, it, expect } from "vitest"
import { deduplicateContacts } from "@/services/search/deduplicator"
import type { ExtractedProfessionalContact } from "@/types/provider"

const base: ExtractedProfessionalContact = {
  fullName: "Sarah Chen",
  title: "Engineering Recruiter",
  organization: "Acme Robotics",
  email: "s.chen@acme.example.com",
  emailType: "PUBLICLY_LISTED",
  sourceUrl: "https://acme.example.com/team/sarah",
  sourceDomain: "acme.example.com",
  sourceTitle: "Sarah Chen - Acme Robotics",
  sourceType: "COMPANY_TEAM_PAGE",
}

describe("deduplicateContacts", () => {
  it("keeps a single unique contact", () => {
    expect(deduplicateContacts([base])).toHaveLength(1)
  })

  it("merges contacts with the same profile URL", () => {
    const dup: ExtractedProfessionalContact = { ...base, title: undefined }
    const result = deduplicateContacts([base, dup])
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe("Engineering Recruiter")
  })

  it("merges contacts with the same email", () => {
    const dup: ExtractedProfessionalContact = {
      ...base,
      profileUrl: undefined,
      sourceUrl: "https://other.example.com/page",
    }
    const result = deduplicateContacts([base, dup])
    expect(result).toHaveLength(1)
  })

  it("keeps contacts with different names", () => {
    const other: ExtractedProfessionalContact = {
      ...base,
      fullName: "Marcus Okonkwo",
      email: "m.okonkwo@acme.example.com",
      sourceUrl: "https://acme.example.com/team/marcus",
    }
    const result = deduplicateContacts([base, other])
    expect(result).toHaveLength(2)
  })

  it("prefers richer summary on merge", () => {
    const thin: ExtractedProfessionalContact = { ...base, summary: "Short" }
    const rich: ExtractedProfessionalContact = {
      ...base,
      summary: "A very long and descriptive summary that has more content",
    }
    const result = deduplicateContacts([thin, rich])
    expect(result[0].summary).toBe(rich.summary)
  })
})
