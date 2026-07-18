import type { ExtractedProfessionalContact } from "@/types/provider"

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function jaccardSimilarity(a: string, b: string): number {
  const setA = new Set(a.split(" "))
  const setB = new Set(b.split(" "))
  const intersection = [...setA].filter((x) => setB.has(x)).length
  const union = new Set([...setA, ...setB]).size
  return union === 0 ? 0 : intersection / union
}

function isSameContact(a: ExtractedProfessionalContact, b: ExtractedProfessionalContact): boolean {
  // Exact URL match
  if (a.profileUrl && b.profileUrl && a.profileUrl === b.profileUrl) return true
  // Exact email match
  if (a.email && b.email && a.email === b.email) return true

  // High name + org similarity
  const nameSim = jaccardSimilarity(normalizeName(a.fullName), normalizeName(b.fullName))
  if (nameSim < 0.6) return false

  const orgA = (a.organization ?? "").toLowerCase()
  const orgB = (b.organization ?? "").toLowerCase()
  const orgSim = jaccardSimilarity(orgA, orgB)

  return orgSim > 0.5
}

function mergeContacts(
  primary: ExtractedProfessionalContact,
  duplicate: ExtractedProfessionalContact
): ExtractedProfessionalContact {
  return {
    ...primary,
    // Prefer the richer value for each field
    title: primary.title ?? duplicate.title,
    organization: primary.organization ?? duplicate.organization,
    department: primary.department ?? duplicate.department,
    location: primary.location ?? duplicate.location,
    summary:
      primary.summary && primary.summary.length > (duplicate.summary?.length ?? 0)
        ? primary.summary
        : duplicate.summary ?? primary.summary,
    profileUrl: primary.profileUrl ?? duplicate.profileUrl,
    email: primary.email ?? duplicate.email,
    emailType: primary.emailType ?? duplicate.emailType,
  }
}

export function deduplicateContacts(
  contacts: ExtractedProfessionalContact[]
): ExtractedProfessionalContact[] {
  const result: ExtractedProfessionalContact[] = []

  for (const contact of contacts) {
    const existingIdx = result.findIndex((r) => isSameContact(r, contact))
    if (existingIdx >= 0) {
      result[existingIdx] = mergeContacts(result[existingIdx], contact)
    } else {
      result.push(contact)
    }
  }

  return result
}
