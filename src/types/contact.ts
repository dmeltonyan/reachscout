export type EmailType =
  | "PUBLICLY_LISTED"
  | "VERIFIED"
  | "PATTERN_ESTIMATE"
  | "GENERAL_CONTACT"
  | "UNKNOWN"

export type VerificationStatus =
  | "UNVERIFIED"
  | "VERIFIED_DELIVERABLE"
  | "VERIFIED_RISKY"
  | "VERIFIED_UNDELIVERABLE"
  | "CATCH_ALL"
  | "DISPOSABLE"

export type ContactStatus =
  | "NOT_CONTACTED"
  | "DRAFTED"
  | "CONTACTED"
  | "REPLIED"
  | "FOLLOW_UP_NEEDED"
  | "CLOSED"
  | "DO_NOT_CONTACT"

export type SourceType =
  | "COMPANY_TEAM_PAGE"
  | "COMPANY_ABOUT_PAGE"
  | "UNIVERSITY_FACULTY"
  | "LINKEDIN_PUBLIC"
  | "GITHUB_PROFILE"
  | "PERSONAL_WEBSITE"
  | "NEWS_ARTICLE"
  | "JOB_POSTING"
  | "OTHER_PUBLIC"

export type OutreachChannel = "EMAIL" | "LINKEDIN" | "ALUMNI_NETWORK" | "OTHER"

export interface ContactSource {
  id: string
  contactId: string
  url: string
  domain?: string | null
  title?: string | null
  sourceType: SourceType
  retrievedAt: string
  supportsName: boolean
  supportsTitle: boolean
  supportsOrganization: boolean
  supportsEmail: boolean
}

export interface ContactTag {
  id: string
  userId: string
  name: string
}

export interface Contact {
  id: string
  userId: string
  searchId?: string | null
  fullName: string
  normalizedName: string
  title?: string | null
  organization?: string | null
  department?: string | null
  location?: string | null
  summary?: string | null
  profileUrl?: string | null
  contactPageUrl?: string | null
  companyDomain?: string | null
  relevanceScore: number
  confidenceScore: number
  confidenceExplanation?: string | null
  email?: string | null
  emailType?: EmailType | null
  verificationStatus: VerificationStatus
  verificationProvider?: string | null
  verifiedAt?: string | null
  status: ContactStatus
  suppressionReason?: string | null
  notes?: string | null
  dateContacted?: string | null
  followUpDate?: string | null
  createdAt: string
  updatedAt: string
  sources?: ContactSource[]
  tags?: ContactTag[]
}

export interface OutreachDraft {
  id: string
  userId: string
  contactId: string
  channel: OutreachChannel
  goal?: string | null
  subject?: string | null
  body: string
  tone?: string | null
  createdAt: string
  updatedAt: string
}

export interface ContactFilters {
  status?: ContactStatus[]
  emailType?: EmailType[]
  verificationStatus?: VerificationStatus[]
  organization?: string
  location?: string
  confidenceMin?: number
  hasEmail?: boolean
  tags?: string[]
  search?: string
}

export type ContactSortField =
  | "relevanceScore"
  | "confidenceScore"
  | "createdAt"
  | "fullName"
  | "organization"

export type SortDirection = "asc" | "desc"
