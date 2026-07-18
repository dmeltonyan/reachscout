import type { SearchProviderResult } from "@/types/provider"
import type { ExtractedProfessionalContact } from "@/types/provider"
import type { SourceType, EmailType } from "@/types/contact"

const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g
const NAME_PATTERNS = [
  /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\s*[-–|]/,
  /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3}),\s+[A-Z]/,
  /([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\s+[-–]\s+(?:Recruiter|Manager|Director|Professor|Engineer|Founder|CEO|CTO)/,
]

const PERSONAL_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "icloud.com",
  "protonmail.com",
  "aol.com",
])

function extractNameFromTitle(title: string): string | null {
  for (const pattern of NAME_PATTERNS) {
    const m = title.match(pattern)
    if (m) return m[1].trim()
  }
  return null
}

function extractEmails(text: string): { email: string; isPersonal: boolean }[] {
  const matches = text.match(EMAIL_REGEX) ?? []
  return matches.map((email) => ({
    email: email.toLowerCase(),
    isPersonal: PERSONAL_EMAIL_DOMAINS.has(email.split("@")[1]?.toLowerCase() ?? ""),
  }))
}

function inferSourceType(domain: string, url: string): SourceType {
  if (domain.includes("github.com")) return "GITHUB_PROFILE"
  if (domain.includes("linkedin.com")) return "LINKEDIN_PUBLIC"
  if (/\.(edu)$/.test(domain)) return "UNIVERSITY_FACULTY"
  if (url.includes("/team") || url.includes("/about") || url.includes("/leadership")) {
    return "COMPANY_TEAM_PAGE"
  }
  if (url.includes("/careers") || url.includes("/jobs")) return "JOB_POSTING"
  return "OTHER_PUBLIC"
}

export function extractContactsFromResults(
  results: SearchProviderResult[],
  org: { displayName: string; normalizedName: string; domain: string | null }
): ExtractedProfessionalContact[] {
  const contacts: ExtractedProfessionalContact[] = []

  for (const result of results) {
    const name = extractNameFromTitle(result.title)
    if (!name) continue

    const fullText = `${result.title} ${result.snippet}`
    const emails = extractEmails(fullText)
    const workEmail = emails.find((e) => !e.isPersonal)
    const generalEmail = emails.find(
      (e) => !e.isPersonal && /careers|recruiting|info|hello|contact/.test(e.email)
    )

    const titleMatch = result.title.match(/[-–|]\s*(.+?)(?:\s*[|]|$)/)
    const title = titleMatch?.[1]?.trim()

    const sourceType = inferSourceType(result.domain, result.url)

    let emailType: EmailType | undefined
    if (workEmail) {
      const isGeneralContact = Boolean(generalEmail && workEmail.email === generalEmail.email)
      emailType = isGeneralContact ? "GENERAL_CONTACT" : "PUBLICLY_LISTED"
    }

    contacts.push({
      fullName: name,
      title,
      organization: org.displayName,
      summary: result.snippet.slice(0, 500),
      profileUrl: result.url,
      email: workEmail?.email,
      emailType,
      sourceUrl: result.url,
      sourceDomain: result.domain,
      sourceTitle: result.title,
      sourceType,
    })
  }

  return contacts
}
