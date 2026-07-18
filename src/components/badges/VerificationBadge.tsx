import { Badge } from "@/components/ui/badge"
import type { EmailType, VerificationStatus } from "@/types/contact"

interface VerificationBadgeProps {
  emailType?: EmailType | null
  verificationStatus?: VerificationStatus
}

const EMAIL_TYPE_CONFIG: Record<
  string,
  { label: string; variant: "success" | "info" | "warning" | "outline" | "destructive" }
> = {
  PUBLICLY_LISTED: { label: "Public", variant: "success" },
  VERIFIED: { label: "Verified", variant: "success" },
  GENERAL_CONTACT: { label: "General contact", variant: "info" },
  PATTERN_ESTIMATE: { label: "Estimate", variant: "warning" },
  UNKNOWN: { label: "Unknown", variant: "outline" },
}

export function VerificationBadge({ emailType, verificationStatus }: VerificationBadgeProps) {
  if (!emailType) return null

  const config = EMAIL_TYPE_CONFIG[emailType] ?? { label: emailType, variant: "outline" as const }

  const tooltipText =
    emailType === "PATTERN_ESTIMATE"
      ? "This is a pattern estimate and has not been verified."
      : emailType === "VERIFIED" ||
          verificationStatus === "VERIFIED_DELIVERABLE"
        ? "This email was verified by a third-party provider."
        : "This email was found on a public page."

  return (
    <Badge variant={config.variant} title={tooltipText} className="cursor-help">
      {config.label}
    </Badge>
  )
}
