import { describe, it, expect } from "vitest"
import { extractDomain, normalizeOrganizationName, isPrivateHost, normalizeOrg } from "@/services/search/domain-normalizer"

describe("isPrivateHost", () => {
  it("blocks localhost", () => expect(isPrivateHost("localhost")).toBe(true))
  it("blocks 127.0.0.1", () => expect(isPrivateHost("127.0.0.1")).toBe(true))
  it("blocks 10.x.x.x", () => expect(isPrivateHost("10.0.0.1")).toBe(true))
  it("blocks 192.168.x.x", () => expect(isPrivateHost("192.168.1.1")).toBe(true))
  it("blocks 172.16-31.x.x", () => expect(isPrivateHost("172.20.0.1")).toBe(true))
  it("blocks 169.254.x.x (link-local)", () => expect(isPrivateHost("169.254.169.254")).toBe(true))
  it("blocks cloud metadata endpoint", () => expect(isPrivateHost("metadata.google.internal")).toBe(true))
  it("allows public hosts", () => expect(isPrivateHost("stripe.com")).toBe(false))
})

describe("extractDomain", () => {
  it("extracts from a full URL", () => expect(extractDomain("https://stripe.com/careers")).toBe("stripe.com"))
  it("strips www prefix", () => expect(extractDomain("www.stripe.com")).toBe("stripe.com"))
  it("returns null for private hosts", () => expect(extractDomain("http://localhost")).toBeNull())
  it("handles bare domain input", () => expect(extractDomain("example.com")).toBe("example.com"))
})

describe("normalizeOrganizationName", () => {
  it("strips Inc.", () => expect(normalizeOrganizationName("Stripe Inc.")).toBe("Stripe"))
  it("strips LLC", () => expect(normalizeOrganizationName("Acme LLC")).toBe("Acme"))
  it("strips Corp", () => expect(normalizeOrganizationName("First American Corp")).toBe("First American"))
  it("preserves multi-word names", () => expect(normalizeOrganizationName("Space Exploration Technologies Corp")).toBe("Space Exploration Technologies"))
})

describe("normalizeOrg", () => {
  it("uses provided domain over inferred", () => {
    const result = normalizeOrg("Stripe Inc.", "stripe.com")
    expect(result.domain).toBe("stripe.com")
  })
  it("returns null domain for private input", () => {
    const result = normalizeOrg("Stripe", "localhost")
    expect(result.domain).toBeNull()
  })
})
