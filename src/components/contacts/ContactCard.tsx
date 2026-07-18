"use client"

import { useState } from "react"
import { ExternalLink, Mail, BookmarkPlus, MessageSquare, Ban, ChevronDown, ChevronUp, Building2, MapPin } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ConfidenceBadge } from "@/components/badges/ConfidenceBadge"
import { VerificationBadge } from "@/components/badges/VerificationBadge"
import type { Contact } from "@/types/contact"
import Link from "next/link"

interface ContactCardProps {
  contact: Contact
  onSave?: (id: string) => void
  onSuppress?: (id: string) => void
}

export function ContactCard({ contact, onSave, onSuppress }: ContactCardProps) {
  const [showEvidence, setShowEvidence] = useState(false)

  const isDemoEmail = contact.email?.includes("example.com") || contact.email?.includes(".example.")

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <Link
              href={`/contacts/${contact.id}`}
              className="font-semibold text-base hover:underline truncate block"
            >
              {contact.fullName}
            </Link>
            <p className="text-sm text-muted-foreground truncate">
              {[contact.title, contact.organization].filter(Boolean).join(" · ")}
            </p>
          </div>
          <ConfidenceBadge score={contact.confidenceScore} className="shrink-0" />
        </div>

        <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
          {contact.organization && (
            <span className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {contact.organization}
            </span>
          )}
          {contact.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {contact.location}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-3 space-y-3">
        {contact.summary && (
          <p className="text-sm text-muted-foreground line-clamp-2">{contact.summary}</p>
        )}

        {contact.email && (
          <div className="flex items-center gap-2">
            <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            {isDemoEmail ? (
              <span className="text-sm font-mono">{contact.email}</span>
            ) : (
              <span className="text-sm font-mono text-muted-foreground italic">
                [email hidden in demo]
              </span>
            )}
            <VerificationBadge
              emailType={contact.emailType}
              verificationStatus={contact.verificationStatus}
            />
          </div>
        )}

        {contact.confidenceExplanation && (
          <button
            onClick={() => setShowEvidence(!showEvidence)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            aria-expanded={showEvidence}
          >
            {showEvidence ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
            Why this result?
          </button>
        )}

        {showEvidence && contact.confidenceExplanation && (
          <p className="text-xs text-muted-foreground bg-muted/50 rounded-md p-3 leading-relaxed">
            {contact.confidenceExplanation}
          </p>
        )}
      </CardContent>

      <CardFooter className="pt-0 gap-2 flex-wrap">
        {contact.profileUrl && (
          <Button variant="outline" size="sm" asChild>
            <a href={contact.profileUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5" />
              Profile
            </a>
          </Button>
        )}
        {contact.contactPageUrl && (
          <Button variant="outline" size="sm" asChild>
            <a href={contact.contactPageUrl} target="_blank" rel="noopener noreferrer">
              <Mail className="h-3.5 w-3.5" />
              Contact page
            </a>
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={() => onSave?.(contact.id)}>
          <BookmarkPlus className="h-3.5 w-3.5" />
          Save
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/contacts/${contact.id}#outreach`}>
            <MessageSquare className="h-3.5 w-3.5" />
            Draft message
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => onSuppress?.(contact.id)}
        >
          <Ban className="h-3.5 w-3.5" />
          Suppress
        </Button>
      </CardFooter>
    </Card>
  )
}
