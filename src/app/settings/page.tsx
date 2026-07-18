"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"

interface ProviderStatus {
  searchProvider: string
  verificationProvider: string
  outreachProvider: string
  anthropicConfigured: boolean
  braveConfigured: boolean
}

export default function SettingsPage() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [providerStatus, setProviderStatus] = useState<ProviderStatus | null>(null)
  const [isSigningOut, setIsSigningOut] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null)
    })

    fetch("/api/providers/status")
      .then((r) => r.json())
      .then((d) => setProviderStatus(d.data))
      .catch(() => {})
  }, [])

  async function handleSignOut() {
    setIsSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success("Signed out")
    router.push("/")
    router.refresh()
  }

  function StatusIcon({ ok }: { ok: boolean }) {
    return ok ? (
      <CheckCircle2 className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-muted-foreground" />
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/search">
              <ArrowLeft className="h-4 w-4" />
              Search
            </Link>
          </Button>
          <span className="font-medium">Settings</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Account */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Account</h2>
          <div className="rounded-lg border divide-y">
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{email ?? "Loading…"}</p>
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium">Sign out</p>
                <p className="text-sm text-muted-foreground">Sign out of all sessions</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                disabled={isSigningOut}
              >
                {isSigningOut ? "Signing out…" : "Sign out"}
              </Button>
            </div>
          </div>
        </section>

        <Separator />

        {/* Provider status */}
        <section>
          <h2 className="text-lg font-semibold mb-1">Integrations</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Configure these in your{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">.env.local</code> file.
          </p>

          <div className="rounded-lg border divide-y">
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium">Search provider</p>
                <p className="text-sm text-muted-foreground">
                  Active:{" "}
                  <Badge variant="outline" className="text-xs ml-1">
                    {providerStatus?.searchProvider ?? "—"}
                  </Badge>
                </p>
              </div>
              <StatusIcon ok={Boolean(providerStatus)} />
            </div>

            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium">Brave Search API</p>
                <p className="text-sm text-muted-foreground">
                  For real web search results (set BRAVE_SEARCH_API_KEY)
                </p>
              </div>
              <StatusIcon ok={providerStatus?.braveConfigured ?? false} />
            </div>

            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium">Claude / Anthropic</p>
                <p className="text-sm text-muted-foreground">
                  For AI-generated outreach drafts (set ANTHROPIC_API_KEY)
                </p>
              </div>
              <StatusIcon ok={providerStatus?.anthropicConfigured ?? false} />
            </div>

            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium">Email verification</p>
                <p className="text-sm text-muted-foreground">
                  Active:{" "}
                  <Badge variant="outline" className="text-xs ml-1">
                    {providerStatus?.verificationProvider ?? "—"}
                  </Badge>
                </p>
              </div>
              <StatusIcon ok={Boolean(providerStatus)} />
            </div>
          </div>
        </section>

        <Separator />

        {/* Data & privacy */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Data &amp; Privacy</h2>
          <div className="rounded-lg border divide-y text-sm">
            <div className="px-4 py-3 text-muted-foreground">
              ReachScout stores only publicly available professional information. Personal emails,
              home addresses, and unrelated personal data are never collected.
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span>How search results are generated</span>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/methodology">Read →</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
