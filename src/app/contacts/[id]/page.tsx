"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ExternalLink, Mail, MessageSquare, Ban, Edit2, Check, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { ConfidenceBadge } from "@/components/badges/ConfidenceBadge"
import { VerificationBadge } from "@/components/badges/VerificationBadge"
import { ErrorState } from "@/components/shared/ErrorState"
import { Skeleton } from "@/components/ui/skeleton"
import type { Contact } from "@/types/contact"

const STATUS_LABELS: Record<string, string> = {
  NOT_CONTACTED: "Not contacted",
  DRAFTED: "Drafted",
  CONTACTED: "Contacted",
  REPLIED: "Replied",
  FOLLOW_UP_NEEDED: "Follow-up needed",
  CLOSED: "Closed",
  DO_NOT_CONTACT: "Do not contact",
}

export default function ContactDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [contact, setContact] = useState<Contact | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingNotes, setEditingNotes] = useState(false)
  const [notes, setNotes] = useState("")

  async function loadContact() {
    try {
      const res = await fetch(`/api/contacts/${id}`)
      if (!res.ok) throw new Error("Contact not found")
      const data = await res.json()
      setContact(data.data)
      setNotes(data.data?.notes ?? "")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load contact")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadContact() }, [id])

  async function saveNotes() {
    const res = await fetch(`/api/contacts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    })
    if (res.ok) {
      toast.success("Notes saved")
      setEditingNotes(false)
      loadContact()
    }
  }

  async function updateStatus(status: string) {
    const res = await fetch(`/api/contacts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      toast.success("Status updated")
      loadContact()
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (error || !contact) {
    return <div className="max-w-3xl mx-auto px-4 py-10"><ErrorState message={error ?? "Contact not found"} /></div>
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/contacts"><ArrowLeft className="h-4 w-4" />Contacts</Link>
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{contact.fullName}</h1>
              <p className="text-muted-foreground">
                {[contact.title, contact.organization].filter(Boolean).join(" · ")}
              </p>
            </div>
            <ConfidenceBadge score={contact.confidenceScore} />
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="outline">{STATUS_LABELS[contact.status] ?? contact.status}</Badge>
            {contact.emailType && (
              <VerificationBadge emailType={contact.emailType} verificationStatus={contact.verificationStatus} />
            )}
          </div>
        </div>

        <Separator />

        {/* Summary */}
        {contact.summary && (
          <div>
            <h2 className="font-semibold mb-2">Public bio</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{contact.summary}</p>
          </div>
        )}

        {/* Contact info */}
        <div>
          <h2 className="font-semibold mb-3">Contact information</h2>
          <div className="space-y-2 text-sm">
            {contact.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono">{contact.email}</span>
                <VerificationBadge emailType={contact.emailType} verificationStatus={contact.verificationStatus} />
              </div>
            )}
            {contact.profileUrl && (
              <div className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                <a href={contact.profileUrl} target="_blank" rel="noopener noreferrer" className="underline text-primary">
                  Profile
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Confidence explanation */}
        {contact.confidenceExplanation && (
          <div className="bg-muted/40 rounded-lg p-4">
            <h2 className="font-semibold text-sm mb-1">Why this confidence score?</h2>
            <p className="text-sm text-muted-foreground">{contact.confidenceExplanation}</p>
          </div>
        )}

        {/* Sources */}
        {contact.sources && contact.sources.length > 0 && (
          <div>
            <h2 className="font-semibold mb-3">Sources</h2>
            <ul className="space-y-2 text-sm">
              {contact.sources.map((src) => (
                <li key={src.id} className="flex items-center gap-2">
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                  <a href={src.url} target="_blank" rel="noopener noreferrer" className="underline text-primary truncate">
                    {src.title ?? src.url}
                  </a>
                  <Badge variant="outline" className="text-xs">{src.sourceType.replace(/_/g, " ")}</Badge>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Separator />

        {/* Status update */}
        <div>
          <h2 className="font-semibold mb-3">Update status</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(STATUS_LABELS).map(([val, label]) => (
              <Button
                key={val}
                variant={contact.status === val ? "default" : "outline"}
                size="sm"
                onClick={() => updateStatus(val)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold">Notes</h2>
            {editingNotes ? (
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={saveNotes}><Check className="h-4 w-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingNotes(false)}><X className="h-4 w-4" /></Button>
              </div>
            ) : (
              <Button size="sm" variant="ghost" onClick={() => setEditingNotes(true)}>
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          {editingNotes ? (
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} placeholder="Add notes…" />
          ) : (
            <p className="text-sm text-muted-foreground min-h-[2rem]">
              {contact.notes || "No notes yet."}
            </p>
          )}
        </div>

        {/* Outreach */}
        <div id="outreach">
          <h2 className="font-semibold mb-3">Generate outreach</h2>
          <Button asChild>
            <Link href={`/drafts?contactId=${contact.id}`}>
              <MessageSquare className="h-4 w-4" />
              Draft a message
            </Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
