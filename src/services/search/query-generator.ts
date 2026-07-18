import type { NormalizedOrg } from "./domain-normalizer"
import type { ContactType } from "@/types/search"

const CONTACT_TYPE_LABELS: Record<ContactType, string[]> = {
  RECRUITER: ["recruiter", "talent acquisition", "university recruiter"],
  HIRING_MANAGER: ["hiring manager", "engineering manager"],
  ENGINEERING_MANAGER: ["engineering manager", "tech lead", "staff engineer"],
  FOUNDER: ["founder", "co-founder", "ceo"],
  EXECUTIVE: ["ceo", "cto", "vp engineering", "director"],
  PROFESSOR: ["professor", "faculty", "associate professor"],
  RESEARCHER: ["researcher", "research scientist", "phd"],
  ALUMNI: ["alumni", "alum"],
  GENERAL_RECRUITING: ["recruiting", "careers", "jobs", "talent"],
  OTHER: ["contact", "team"],
}

const SAFE_OPERATORS = /^[\w\s\-\.:\/]+$/
// Dangerous search operators that must not appear in queries
const BLOCKED_OPERATORS = /\b(filetype|inurl|intitle|intext|cache|ext|OR|AND|NOT)\b\s*:/gi

function safeQuery(...parts: (string | undefined)[]): string {
  const joined = parts.filter(Boolean).join(" ")
  return joined
    .replace(BLOCKED_OPERATORS, " ")
    .replace(/[^a-zA-Z0-9 \-_.:\/]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

export function generateSearchQueries(
  org: NormalizedOrg,
  options: {
    targetRole?: string
    contactType?: ContactType
    department?: string
    location?: string
    keywords?: string
  }
): string[] {
  const queries: string[] = []
  const { targetRole, contactType, department, location, keywords } = options

  const roleLabels = contactType ? CONTACT_TYPE_LABELS[contactType] : []
  const primaryRole = roleLabels[0] ?? targetRole ?? "contact"

  // Site-scoped queries (highest signal)
  if (org.domain) {
    queries.push(safeQuery(`site:${org.domain}`, primaryRole, department))
    queries.push(safeQuery(`site:${org.domain}`, "team", targetRole))
    queries.push(safeQuery(`site:${org.domain}`, "leadership", "engineering"))
    if (contactType === "RECRUITER" || contactType === "GENERAL_RECRUITING") {
      queries.push(safeQuery(`site:${org.domain}`, "careers", "recruiter"))
    }
    if (contactType === "PROFESSOR" || contactType === "RESEARCHER") {
      queries.push(safeQuery(`site:${org.domain}`, "faculty", "research", targetRole))
    }
  }

  // General queries
  queries.push(safeQuery(org.displayName, primaryRole, targetRole, location))
  queries.push(safeQuery(org.displayName, "recruiting", targetRole))

  if (department) {
    queries.push(safeQuery(org.displayName, department, primaryRole))
  }

  if (keywords) {
    queries.push(safeQuery(org.displayName, keywords, primaryRole))
  }

  // Extra role variants
  for (const label of roleLabels.slice(1, 2)) {
    queries.push(safeQuery(org.displayName, label, department, location))
  }

  // Validate every query against the safe pattern (double-safety)
  return queries
    .map((q) => q.trim())
    .filter((q) => q.length >= 3 && SAFE_OPERATORS.test(q))
    .slice(0, 8)
}
