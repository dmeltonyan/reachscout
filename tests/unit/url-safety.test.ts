import { describe, it, expect } from "vitest"
import { isPrivateHost, extractDomain } from "@/services/search/domain-normalizer"

const PRIVATE_HOSTS = [
  "localhost",
  "127.0.0.1",
  "127.0.0.2",
  "10.0.0.1",
  "10.255.255.255",
  "172.16.0.1",
  "172.31.255.255",
  "192.168.0.1",
  "192.168.255.255",
  "169.254.169.254",
  "169.254.0.1",
  "::1",
  "metadata.google.internal",
  "fe80::1",
]

const PUBLIC_HOSTS = [
  "stripe.com",
  "google.com",
  "stanford.edu",
  "github.com",
  "1.1.1.1",
  "8.8.8.8",
]

describe("SSRF URL safety", () => {
  PRIVATE_HOSTS.forEach((host) => {
    it(`blocks private host: ${host}`, () => {
      expect(isPrivateHost(host)).toBe(true)
    })
  })

  PUBLIC_HOSTS.forEach((host) => {
    it(`allows public host: ${host}`, () => {
      expect(isPrivateHost(host)).toBe(false)
    })
  })

  it("rejects URLs pointing to localhost", () => {
    expect(extractDomain("http://localhost:8080/admin")).toBeNull()
  })

  it("rejects URLs with internal IP", () => {
    expect(extractDomain("http://192.168.1.1/api")).toBeNull()
  })

  it("rejects cloud metadata endpoint", () => {
    expect(extractDomain("http://169.254.169.254/latest/meta-data/")).toBeNull()
  })

  it("allows normal public URLs", () => {
    expect(extractDomain("https://stripe.com/about/team")).toBe("stripe.com")
  })
})
