import type { ExtractedProfessionalContact } from "@/types/provider"
import type { ContactType } from "@/types/search"

interface RankingContext {
  organization: string
  domain: string | null
  targetRole?: string
  contactType?: ContactType
  location?: string
}

interface ScoredContact {
  contact: ExtractedProfessionalContact
  relevanceScore: number
  confidenceScore: number
  confidenceExplanation: string
}

const OFFICIAL_SOURCE_TYPES = new Set([
  "COMPANY_TEAM_PAGE",
  "COMPANY_ABOUT_PAGE",
  "UNIVERSITY_FACULTY",
])

function normalizeText(s: string | null | undefined): string {
  return (s ?? "").toLowerCase()
}

function wordOverlap(a: string, b: string): number {
  if (!a || !b) return 0
  const wordsA = new Set(a.split(/\s+/).filter((w) => w.length > 2))
  const wordsB = b.split(/\s+/).filter((w) => w.length > 2)
  return wordsB.filter((w) => wordsA.has(w)).length / Math.max(wordsA.size, 1)
}

export function rankContacts(
  contacts: ExtractedProfessionalContact[],
  ctx: RankingContext
): ScoredContact[] {
  const orgLower = normalizeText(ctx.organization)
  const roleLower = normalizeText(ctx.targetRole)

  return contacts.map((c) => {
    const reasons: string[] = []
    let confidence = 0
    let relevance = 0

    // +30 official source
    if (OFFICIAL_SOURCE_TYPES.has(c.sourceType)) {
      confidence += 30
      reasons.push("listed on an official team or faculty page")
    } else {
      confidence += 10
    }

    // +20 name and org appear together
    const orgInSource = normalizeText(c.sourceDomain).includes(orgLower.split(" ")[0])
    if (orgInSource) {
      confidence += 20
      reasons.push("source domain matches the organization")
    }

    // +20 title matches target role
    if (roleLower && wordOverlap(roleLower, normalizeText(c.title)) > 0.3) {
      confidence += 20
      relevance += 40
      reasons.push("title closely matches your target role")
    }

    // +15 public email on official page
    if (c.email && (c.emailType === "PUBLICLY_LISTED" || c.emailType === "GENERAL_CONTACT")) {
      confidence += 15
      reasons.push("public email address found on the source page")
    }

    // +10 location match
    if (ctx.location && normalizeText(c.location).includes(normalizeText(ctx.location))) {
      confidence += 10
      relevance += 20
      reasons.push("location matches your search")
    }

    // +5 summary relevance
    if (roleLower && wordOverlap(roleLower, normalizeText(c.summary)) > 0.2) {
      confidence += 5
      relevance += 15
    }

    // +5 org name in contact organization field
    if (wordOverlap(orgLower, normalizeText(c.organization)) > 0.4) {
      confidence += 5
      relevance += 10
    }

    const explanation =
      reasons.length > 0
        ? `${confidence >= 70 ? "High" : confidence >= 40 ? "Medium" : "Low"} confidence because this contact is ${reasons.join(", and ")}.`
        : "Limited public information found for this contact."

    return {
      contact: c,
      confidenceScore: Math.min(100, confidence),
      relevanceScore: Math.min(100, relevance),
      confidenceExplanation: explanation,
    }
  })
}
