const BLOCKED_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "metadata.google.internal",
  "169.254.169.254",
])

const PRIVATE_CIDR = [
  /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
  /^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/,
  /^192\.168\.\d{1,3}\.\d{1,3}$/,
  /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
  /^169\.254\.\d{1,3}\.\d{1,3}$/,
]

export function isPrivateHost(host: string): boolean {
  if (BLOCKED_HOSTS.has(host.toLowerCase())) return true
  if (PRIVATE_CIDR.some((re) => re.test(host))) return true
  // IPv6 loopback / link-local
  if (host.startsWith("::") || host.toLowerCase().startsWith("fe80")) return true
  return false
}

export function extractDomain(input: string): string | null {
  try {
    const raw = input.includes("://") ? input : `https://${input}`
    const url = new URL(raw)
    const host = url.hostname.toLowerCase().replace(/^www\./, "")
    if (isPrivateHost(host)) return null
    return host
  } catch {
    return null
  }
}

export function normalizeOrganizationName(name: string): string {
  return name
    .trim()
    .replace(/\b(Inc\.?|LLC\.?|Ltd\.?|Corp\.?|Co\.?|Company|Corporation)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim()
}

export interface NormalizedOrg {
  displayName: string
  normalizedName: string
  domain: string | null
}

export function normalizeOrg(organization: string, domainInput?: string): NormalizedOrg {
  const displayName = organization.trim()
  const normalizedName = normalizeOrganizationName(displayName).toLowerCase()

  let domain: string | null = null

  if (domainInput) {
    domain = extractDomain(domainInput)
  }

  if (!domain) {
    // Attempt to infer a domain from org name (simple heuristic)
    const slug = normalizedName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
      .substring(0, 30)
    domain = slug ? `${slug}.com` : null
  }

  return { displayName, normalizedName, domain }
}
