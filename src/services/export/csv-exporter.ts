import Papa from "papaparse"
import type { Contact } from "@/types/contact"

const EMAIL_TYPE_LABELS: Record<string, string> = {
  PUBLICLY_LISTED: "Publicly listed",
  VERIFIED: "Verified",
  PATTERN_ESTIMATE: "Pattern estimate",
  GENERAL_CONTACT: "General contact",
  UNKNOWN: "Unknown",
}

export function exportContactsToCsv(contacts: Contact[]): string {
  const rows = contacts.map((c) => ({
    Name: c.fullName,
    Title: c.title ?? "",
    Organization: c.organization ?? "",
    Department: c.department ?? "",
    Location: c.location ?? "",
    "Public Email": c.emailType === "PATTERN_ESTIMATE" ? "" : (c.email ?? ""),
    "Email Status": c.emailType ? EMAIL_TYPE_LABELS[c.emailType] ?? c.emailType : "Unknown",
    "Profile URL": c.profileUrl ?? "",
    "Contact URL": c.contactPageUrl ?? "",
    "Source URL": c.sources?.[0]?.url ?? "",
    Confidence: Math.round(c.confidenceScore),
    Relevance: Math.round(c.relevanceScore),
    Status: c.status.replace(/_/g, " "),
    Notes: c.notes ?? "",
    Tags: c.tags?.map((t) => t.name).join("; ") ?? "",
    Discovered: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "",
    "Date Contacted": c.dateContacted ? new Date(c.dateContacted).toLocaleDateString() : "",
    "Follow-up Date": c.followUpDate ? new Date(c.followUpDate).toLocaleDateString() : "",
  }))

  return Papa.unparse(rows)
}
