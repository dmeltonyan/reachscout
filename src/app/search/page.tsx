"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { SearchForm } from "@/components/search/SearchForm"
import { SearchProgress } from "@/components/search/SearchProgress"
import { Button } from "@/components/ui/button"
import type { SearchFormSchema } from "@/validation/search"
import type { SearchProgress as SearchProgressType } from "@/types/search"

const STAGES: SearchProgressType[] = [
  { stage: "normalizing", message: "Normalizing organization…", percent: 10 },
  { stage: "generating", message: "Generating search queries…", percent: 25 },
  { stage: "retrieving", message: "Retrieving public results…", percent: 50 },
  { stage: "extracting", message: "Extracting professional profiles…", percent: 75 },
  { stage: "ranking", message: "Ranking and deduplicating…", percent: 90 },
  { stage: "done", message: "Done!", percent: 100 },
]

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState<SearchProgressType | null>(null)

  const prefillOrg = searchParams.get("q") ?? ""

  async function handleSearch(values: SearchFormSchema) {
    setIsLoading(true)
    setProgress(STAGES[0])

    // Animate stages
    let stageIdx = 0
    const interval = setInterval(() => {
      stageIdx = Math.min(stageIdx + 1, STAGES.length - 2)
      setProgress(STAGES[stageIdx])
    }, 700)

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      clearInterval(interval)

      if (!res.ok) {
        const err = await res.json()
        if (res.status === 401) {
          toast.error("Sign in required", { description: "Please sign in to run a search." })
          router.push("/auth/login")
          return
        }
        if (res.status === 429) {
          toast.error("Rate limit reached", { description: err.error?.message })
          return
        }
        throw new Error(err.error?.message ?? "Search failed")
      }

      const data = await res.json()
      setProgress(STAGES[STAGES.length - 1])

      await new Promise((r) => setTimeout(r, 500))
      router.push(`/search/${data.data.searchId}`)
    } catch (err) {
      clearInterval(interval)
      toast.error("Search failed", {
        description: err instanceof Error ? err.message : "Please try again.",
      })
    } finally {
      setIsLoading(false)
      setProgress(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Home
            </Link>
          </Button>
          <span className="font-semibold">New Search</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Find professional contacts</h1>
          <p className="text-muted-foreground">
            Search public web sources for recruiters, hiring managers, professors, and more.
          </p>
        </div>

        {isLoading && progress ? (
          <SearchProgress progress={progress} />
        ) : (
          <SearchForm
            onSubmit={handleSearch}
            isLoading={isLoading}
            defaultValues={prefillOrg ? { organization: prefillOrg } : undefined}
          />
        )}

        <p className="mt-8 text-xs text-muted-foreground">
          ReachScout only searches publicly available information. Pattern-estimate emails are
          disabled by default and never labeled as verified.
        </p>
      </main>
    </div>
  )
}
