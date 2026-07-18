import Link from "next/link"
import { Search, Shield, Zap, ArrowRight, Github } from "lucide-react"
import { Button } from "@/components/ui/button"

const EXAMPLE_SEARCHES = [
  "Software engineering recruiters at Stripe",
  "Engineering managers at SpaceX",
  "ML professors at Stanford",
  "Founders at Sacramento AI startups",
  "University recruiters at Deloitte",
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-bold text-lg tracking-tight">ReachScout</span>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/methodology"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Methodology
            </Link>
            <Link
              href="/privacy"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Button asChild size="sm">
              <Link href="/search">Get started</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground mb-6">
            <Shield className="h-3 w-3" />
            Public information only · No private data · No spam
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Find the right professional contact.{" "}
            <span className="text-muted-foreground">Write a better introduction.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            ReachScout searches publicly available professional information to help you identify
            recruiters, hiring managers, professors, and founders — and craft genuine outreach.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/search">
                <Search className="h-4 w-4" />
                Start searching
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a
                href="https://github.com/dmeltonyan/SearchMelt"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-4 w-4" />
                View on GitHub
              </a>
            </Button>
          </div>
        </section>

        {/* Example searches */}
        <section className="border-t border-b bg-muted/30">
          <div className="max-w-5xl mx-auto px-4 py-12">
            <p className="text-sm font-medium text-muted-foreground mb-4">Example searches</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_SEARCHES.map((q) => (
                <Link
                  key={q}
                  href={`/search?q=${encodeURIComponent(q)}`}
                  className="inline-flex items-center gap-1.5 rounded-full border bg-background px-4 py-2 text-sm hover:bg-accent transition-colors"
                >
                  {q}
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <div className="grid sm:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Search className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Evidence-backed results</h3>
              <p className="text-sm text-muted-foreground">
                Every contact shows exactly which public source supports each data point.
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Privacy-first design</h3>
              <p className="text-sm text-muted-foreground">
                Only public information. Emails clearly labeled as confirmed vs estimated.
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">AI outreach drafts</h3>
              <p className="text-sm text-muted-foreground">
                Generate context-aware messages grounded in the contact&apos;s public professional
                information.
              </p>
            </div>
          </div>
        </section>

        {/* Ethics disclaimer */}
        <section className="border-t">
          <div className="max-w-5xl mx-auto px-4 py-8">
            <p className="text-xs text-muted-foreground text-center max-w-2xl mx-auto">
              ReachScout is a professional research assistant, not a private-email scraper or
              bulk-spam tool. Users are responsible for compliance with CAN-SPAM, GDPR, CCPA, and
              applicable platform terms.{" "}
              <Link href="/privacy" className="underline">
                Privacy policy
              </Link>{" "}
              ·{" "}
              <Link href="/methodology" className="underline">
                Methodology
              </Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}
