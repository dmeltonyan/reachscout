import type { ContactType } from "./search"
import type { EmailType, VerificationStatus, SourceType } from "./contact"

export interface SearchProviderInput {
  queries: string[]
  maxResults: number
  organization: string
  domain?: string
  targetRole?: string
  contactType?: ContactType
}

export interface SearchProviderResult {
  url: string
  title: string
  snippet: string
  domain: string
}

export interface SearchProvider {
  name: string
  isAvailable(): boolean
  search(input: SearchProviderInput): Promise<SearchProviderResult[]>
}

export interface PublicPage {
  url: string
  domain: string
  title: string
  html: string
  text: string
  sourceType: SourceType
}

export interface ExtractedProfessionalContact {
  fullName: string
  title?: string
  organization?: string
  department?: string
  location?: string
  summary?: string
  profileUrl?: string
  contactPageUrl?: string
  email?: string
  emailType?: EmailType
  sourceUrl: string
  sourceDomain: string
  sourceTitle: string
  sourceType: SourceType
}

export interface ContactExtractor {
  extract(page: PublicPage): Promise<ExtractedProfessionalContact[]>
}

export interface EmailVerificationInput {
  email: string
}

export interface EmailVerificationResult {
  email: string
  status: VerificationStatus
  provider: string
  verifiedAt: string
  isDisposable: boolean
  isCatchAll: boolean
  riskLevel: "low" | "medium" | "high"
  message?: string
}

export interface EmailVerificationProvider {
  name: string
  isAvailable(): boolean
  verify(input: EmailVerificationInput): Promise<EmailVerificationResult>
}
