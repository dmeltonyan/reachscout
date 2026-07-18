import { describe, it, expect } from "vitest"
import { rankContacts } from "@/services/search/ranker"
import type { ExtractedProfessionalContact } from "@/types/provider"

const officialContact: ExtractedProfessionalContact = {
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

const weakContact: ExtractedProfessionalContact = {
  fullName: "John Doe",
  organization: "Acme Robotics",
  sourceUrl: "https://news.example.com/article",
  sourceDomain: "news.example.com",
  sourceTitle: "Acme Robotics in the news",
  sourceType: "NEWS_ARTICLE",
}

describe("rankContacts", () => {
  const ctx = { organization: "Acme Robotics", domain: "acme.example.com", targetRole: "recruiter" }

  it("gives higher confidence to official source contacts", () => {
    const [official] = rankContacts([officialContact], ctx)
    const [weak] = rankContacts([weakContact], ctx)
    expect(official.confidenceScore).toBeGreaterThan(weak.confidenceScore)
  })

  it("confidence score is capped at 100", () => {
    const results = rankContacts([officialContact], ctx)
    expect(results[0].confidenceScore).toBeLessThanOrEqual(100)
  })

  it("boosts relevance when title matches target role", () => {
    const results = rankContacts([officialContact], ctx)
    expect(results[0].relevanceScore).toBeGreaterThan(0)
  })

  it("includes a plain-English explanation", () => {
    const results = rankContacts([officialContact], ctx)
    expect(results[0].confidenceExplanation).toMatch(/confidence/)
  })
})
