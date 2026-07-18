import { describe, it, expect } from "vitest"
import { searchFormSchema } from "@/validation/search"
import { suppressContactSchema, generateOutreachSchema } from "@/validation/contact"

describe("searchFormSchema", () => {
  it("accepts a minimal valid search", () => {
    const result = searchFormSchema.safeParse({ organization: "Stripe" })
    expect(result.success).toBe(true)
  })

  it("rejects empty organization", () => {
    const result = searchFormSchema.safeParse({ organization: "" })
    expect(result.success).toBe(false)
  })

  it("applies maxResults default of 10", () => {
    const result = searchFormSchema.safeParse({ organization: "Stripe" })
    expect(result.success && result.data.maxResults).toBe(10)
  })

  it("rejects maxResults > 50", () => {
    const result = searchFormSchema.safeParse({ organization: "Stripe", maxResults: 100 })
    expect(result.success).toBe(false)
  })
})

describe("suppressContactSchema", () => {
  it("accepts a valid reason", () => {
    const result = suppressContactSchema.safeParse({ reason: "Already contacted" })
    expect(result.success).toBe(true)
  })

  it("rejects empty reason", () => {
    const result = suppressContactSchema.safeParse({ reason: "" })
    expect(result.success).toBe(false)
  })
})

describe("generateOutreachSchema", () => {
  it("accepts a valid generate request", () => {
    const result = generateOutreachSchema.safeParse({ channel: "EMAIL", goal: "Learn about open roles" })
    expect(result.success).toBe(true)
  })

  it("rejects invalid channel", () => {
    const result = generateOutreachSchema.safeParse({ channel: "FAX", goal: "test" })
    expect(result.success).toBe(false)
  })
})
