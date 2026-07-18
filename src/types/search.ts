export type SearchStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED"

export type ContactType =
  | "RECRUITER"
  | "HIRING_MANAGER"
  | "ENGINEERING_MANAGER"
  | "FOUNDER"
  | "EXECUTIVE"
  | "PROFESSOR"
  | "RESEARCHER"
  | "ALUMNI"
  | "GENERAL_RECRUITING"
  | "OTHER"

export interface SearchFormValues {
  organization: string
  domain?: string
  targetRole?: string
  contactType?: ContactType
  department?: string
  location?: string
  keywords?: string
  maxResults?: number
  onlyPublicEmails?: boolean
  includeGeneralContacts?: boolean
}

export interface SearchRecord {
  id: string
  userId: string
  organization: string
  domain?: string | null
  targetRole?: string | null
  contactType?: ContactType | null
  department?: string | null
  location?: string | null
  keywords?: string | null
  provider: string
  status: SearchStatus
  resultCount: number
  errorMessage?: string | null
  durationMs?: number | null
  createdAt: string
  completedAt?: string | null
}

export interface SearchProgress {
  stage: "normalizing" | "generating" | "retrieving" | "extracting" | "ranking" | "done"
  message: string
  percent: number
}
