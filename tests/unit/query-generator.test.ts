import { describe, it, expect } from "vitest"
import { generateSearchQueries } from "@/services/search/query-generator"
import type { NormalizedOrg } from "@/services/search/domain-normalizer"

const org: NormalizedOrg = {
  displayName: "Stripe",
  normalizedName: "stripe",
  domain: "stripe.com",
}

describe("generateSearchQueries", () => {
  it("returns at least one query", () => {
    const queries = generateSearchQueries(org, {})
    expect(queries.length).toBeGreaterThan(0)
  })

  it("includes a site-scoped query when domain is known", () => {
    const queries = generateSearchQueries(org, { targetRole: "recruiter" })
    expect(queries.some((q) => q.includes("site:stripe.com"))).toBe(true)
  })

  it("caps queries at 8", () => {
    const queries = generateSearchQueries(org, {
      targetRole: "recruiter",
      contactType: "RECRUITER",
      department: "Engineering",
      location: "San Francisco",
      keywords: "university campus",
    })
    expect(queries.length).toBeLessThanOrEqual(8)
  })

  it("never produces empty or very short queries", () => {
    const queries = generateSearchQueries(org, {})
    expect(queries.every((q) => q.length >= 3)).toBe(true)
  })

  it("does not include characters that form dangerous operators", () => {
    const maliciousOrg: NormalizedOrg = {
      displayName: 'Stripe" OR filetype:pdf',
      normalizedName: "stripe or filetypepdf",
      domain: null,
    }
    const queries = generateSearchQueries(maliciousOrg, {})
    expect(queries.every((q) => !q.includes('"') && !q.includes("filetype:"))).toBe(true)
  })
})
