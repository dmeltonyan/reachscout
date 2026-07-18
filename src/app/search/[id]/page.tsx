"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, RefreshCw, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ContactCard } from "@/components/contacts/ContactCard"
import { EmptyState } from "@/components/shared/EmptyState"
import { ErrorState } from "@/components/shared/ErrorState"
import { SearchResultsSkeleton } from "@/components/shared/LoadingSkeleton"
import { SuppressionDialog } from "@/components/dialogs/SuppressionDialog"
import type { Contact } from "@/types/contact"

interface SearchDetail {
  id: string
  organization: string
  targetRole?: string | null
  status: string
  resultCount: number
  createdAt: string
  contacts: Contact[]
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  COMPLETED: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  RUNNING: <Loader2 className="h-4 w-4 animate-spin text-blue-500" />,
  FAILED: <XCircle className="h-4 w-4 text-red-500" />,
  PENDING: <Clock className="h-4 w-4 text-yellow-500" />,
}

export default function SearchResultsPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [search, setSearch] = useState<SearchDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [suppressTarget, setSuppressTarget] = useState<Contact | null>(null)

  async function loadSearch() {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/searches/${id}`)
      if (!res.ok) throw new Error("Failed to load search")
      const data = await res.json()
      setSearch(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load search results")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSearch()
  }, [id])

  async function handleSuppress(contactId: string, reason: string) {
    const res = await fetch(`/api/contacts/${contactId}/suppress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    })
    if (res.ok) {
      toast.success("Contact suppressed")
      setSuppressTarget(null)
      loadSearch()
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <SearchResultsSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <ErrorState message={error} retry={loadSearch} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/search">
                <ArrowLeft className="h-4 w-4" />
                New search
              </Link>
            </Button>
            {search && (
              <>
                <span className="text-muted-foreground">/</span>
                <span className="font-medium truncate max-w-xs">{search.organization}</span>
                {STATUS_ICONS[search.status]}
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={loadSearch}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/contacts">Saved contacts</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {search && (
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">
                {search.targetRole
                  ? `${search.targetRole} at ${search.organization}`
                  : search.organization}
              </h1>
              <p className="text-sm text-muted-foreground">
                {search.resultCount} contact{search.resultCount !== 1 ? "s" : ""} found ·{" "}
                {new Date(search.createdAt).toLocaleString()}
              </p>
            </div>
            <Badge variant={search.status === "COMPLETED" ? "success" : "outline"}>
              {search.status}
            </Badge>
          </div>
        )}

        {!search?.contacts?.length ? (
          <EmptyState
            title="No contacts found"
            description="Try broadening your search or using different keywords."
            action={
              <Button asChild>
                <Link href="/search">New search</Link>
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {search.contacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onSuppress={() => setSuppressTarget(contact)}
              />
            ))}
          </div>
        )}
      </main>

      {suppressTarget && (
        <SuppressionDialog
          open
          contactName={suppressTarget.fullName}
          onConfirm={(reason) => handleSuppress(suppressTarget.id, reason)}
          onCancel={() => setSuppressTarget(null)}
        />
      )}
    </div>
  )
}
