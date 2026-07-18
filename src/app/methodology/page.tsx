import Link from "next/link"
import { ArrowLeft, Shield, Search, Layers, Database, Lock, TestTube } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/"><ArrowLeft className="h-4 w-4" />Home</Link>
          </Button>
          <span className="font-medium">Methodology</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12 space-y-12">
        <div>
          <h1 className="text-3xl font-bold mb-3">How ReachScout works</h1>
          <p className="text-muted-foreground leading-relaxed">
            ReachScout is built around responsible professional outreach. Every technical decision
            prioritizes transparency, data provenance, and user privacy.
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Layers className="h-4 w-4 text-primary" />
                Provider adapter pattern
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                Search, extraction, and email verification are each defined as TypeScript interfaces
                (<code className="font-mono bg-muted px-1 rounded">SearchProvider</code>,{" "}
                <code className="font-mono bg-muted px-1 rounded">ContactExtractor</code>,{" "}
                <code className="font-mono bg-muted px-1 rounded">EmailVerificationProvider</code>).
              </p>
              <p>
                Concrete implementations (Mock, Brave, Hunter) implement those interfaces. The
                orchestrator never depends on a specific provider — swapping one in requires only a
                single environment variable change.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Search className="h-4 w-4 text-primary" />
                5-stage search pipeline
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <ol className="space-y-1 list-decimal list-inside">
                <li><strong>Normalize</strong> — parse organization name and domain, validate it is a safe public host</li>
                <li><strong>Generate queries</strong> — build targeted public-web queries using role/department/domain context</li>
                <li><strong>Retrieve</strong> — call the configured search provider with rate limiting and caching</li>
                <li><strong>Extract</strong> — parse names, titles, emails, and source types from public snippets</li>
                <li><strong>Rank &amp; deduplicate</strong> — score each contact 0–100 with an explainable rubric; merge duplicates</li>
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Database className="h-4 w-4 text-primary" />
                Evidence-backed confidence scoring
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>Each contact receives a confidence score based on a weighted rubric:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>+30 — official team or faculty page</li>
                <li>+20 — source domain matches the organization</li>
                <li>+20 — title closely matches the target role</li>
                <li>+15 — public email address found on the source page</li>
                <li>+10 — location matches the search</li>
                <li>+5 — summary mentions relevant keywords</li>
              </ul>
              <p>The score and a plain-English explanation are always shown to the user.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-4 w-4 text-primary" />
                Email labeling policy
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>Every email is classified into one of four categories:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li><strong>Publicly listed</strong> — found verbatim on a public page</li>
                <li><strong>Verified</strong> — confirmed deliverable by a third-party API (not a send test)</li>
                <li><strong>Pattern estimate</strong> — inferred from common naming conventions; hidden by default</li>
                <li><strong>General contact</strong> — a catch-all address (careers@, info@, etc.)</li>
              </ul>
              <p>Pattern estimates are never labeled as verified and require an explicit user action to reveal.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Lock className="h-4 w-4 text-primary" />
                SSRF and security
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                Every URL submitted by the user or returned by a provider is validated against a
                blocklist before any outbound request is made. Blocked ranges include:
              </p>
              <ul className="space-y-1 list-disc list-inside font-mono text-xs">
                <li>127.0.0.0/8, ::1 (loopback)</li>
                <li>10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16 (RFC 1918)</li>
                <li>169.254.0.0/16 (link-local / cloud metadata)</li>
                <li>metadata.google.internal, 169.254.169.254</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TestTube className="h-4 w-4 text-primary" />
                Testing strategy
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                The mock provider makes the full search pipeline testable without any API keys.
                Critical test scenarios include: deduplication correctness, email label accuracy,
                SSRF URL rejection, rate-limit enforcement, and ownership checks on every API
                endpoint.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
