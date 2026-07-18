"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Search, Trash2, RefreshCw, Clock } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/shared/EmptyState"
import { Skeleton } from "@/components/ui/skeleton"
import type { SearchRecord } from "@/types/search"

const STATUS_BADGE: Record<string, "success" | "outline" | "destructive" | "warning"> = {
  COMPLETED: "success",
  RUNNING: "info" as any,
  FAILED: "destructive",
  PENDING: "outline",
  CANCELLED: "outline",
}

export default function HistoryPage() {
  const [searches, setSearches] = useState<SearchRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  async function loadSearches() {
    setIsLoading(true)
    try {
      const res = await fetch("/api/searches")
      if (!res.ok) throw new Error()
      const data = await res.json()
      setSearches(data.data ?? [])
    } catch {
      toast.error("Failed to load search history")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadSearches() }, [])

  async function deleteSearch(id: string) {
    const res = await fetch(`/api/searches/${id}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Search deleted")
      loadSearches()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/"><ArrowLeft className="h-4 w-4" />Home</Link>
            </Button>
            <span className="font-medium">Search History</span>
          </div>
          <Button size="sm" asChild>
            <Link href="/search"><Search className="h-4 w-4" />New search</Link>
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Search History</h1>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : searches.length === 0 ? (
          <EmptyState
            icon={<Clock className="h-6 w-6" />}
            title="No searches yet"
            description="Your search history will appear here."
            action={<Button asChild><Link href="/search">Run your first search</Link></Button>}
          />
        ) : (
          <div className="space-y-3">
            {searches.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-4 rounded-lg border p-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium truncate">{s.organization}</span>
                    <Badge variant={STATUS_BADGE[s.status] ?? "outline"} className="shrink-0">
                      {s.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {s.resultCount} results · {new Date(s.createdAt).toLocaleString()} · {s.provider}
                  </p>
                  {s.errorMessage && (
                    <p className="text-xs text-destructive mt-1">{s.errorMessage}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {s.status === "COMPLETED" && (
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/search/${s.id}`}><RefreshCw className="h-4 w-4" />View</Link>
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => deleteSearch(s.id)}>
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
