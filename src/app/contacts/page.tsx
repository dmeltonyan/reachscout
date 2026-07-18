"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Download, Search, Users } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ContactCard } from "@/components/contacts/ContactCard"
import { EmptyState } from "@/components/shared/EmptyState"
import { SearchResultsSkeleton } from "@/components/shared/LoadingSkeleton"
import { ExportDialog } from "@/components/dialogs/ExportDialog"
import { SuppressionDialog } from "@/components/dialogs/SuppressionDialog"
import type { Contact } from "@/types/contact"

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [showExport, setShowExport] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [suppressTarget, setSuppressTarget] = useState<Contact | null>(null)

  async function loadContacts(q?: string) {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (q) params.set("search", q)
      const res = await fetch(`/api/contacts?${params}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setContacts(data.data ?? [])
      setTotal(data.total ?? 0)
    } catch {
      toast.error("Failed to load contacts")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadContacts()
  }, [])

  useEffect(() => {
    const t = setTimeout(() => loadContacts(search), 300)
    return () => clearTimeout(t)
  }, [search])

  async function handleExport() {
    setIsExporting(true)
    try {
      const res = await fetch("/api/contacts/export")
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `reachscout-export-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
      setShowExport(false)
      toast.success("Export downloaded")
    } catch {
      toast.error("Export failed")
    } finally {
      setIsExporting(false)
    }
  }

  async function handleSuppress(contactId: string, reason: string) {
    const res = await fetch(`/api/contacts/${contactId}/suppress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    })
    if (res.ok) {
      toast.success("Contact suppressed")
      setSuppressTarget(null)
      loadContacts(search)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-bold">ReachScout</Link>
            <span className="text-muted-foreground">/</span>
            <span className="font-medium">Saved Contacts</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowExport(true)}>
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button size="sm" asChild>
              <Link href="/search">
                <Search className="h-4 w-4" />
                New search
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">Saved Contacts</h1>
            <p className="text-sm text-muted-foreground">{total} total</p>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {isLoading ? (
          <SearchResultsSkeleton />
        ) : contacts.length === 0 ? (
          <EmptyState
            icon={<Users className="h-6 w-6" />}
            title="No saved contacts"
            description="Run a search to find and save professional contacts."
            action={
              <Button asChild>
                <Link href="/search">Start searching</Link>
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {contacts.map((c) => (
              <ContactCard
                key={c.id}
                contact={c}
                onSuppress={() => setSuppressTarget(c)}
              />
            ))}
          </div>
        )}
      </main>

      <ExportDialog
        open={showExport}
        contactCount={total}
        onConfirm={handleExport}
        onCancel={() => setShowExport(false)}
        isLoading={isExporting}
      />

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
