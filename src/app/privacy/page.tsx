import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/"><ArrowLeft className="h-4 w-4" />Home</Link>
          </Button>
          <span className="font-medium">Privacy Policy</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12 prose prose-sm dark:prose-invert">
        <h1>Privacy Policy</h1>
        <p className="lead">Last updated: {new Date().toLocaleDateString()}</p>

        <h2>What we collect</h2>
        <p>
          ReachScout collects only the information necessary to operate the service:
        </p>
        <ul>
          <li>Your email address for authentication (via Supabase magic-link)</li>
          <li>Search queries you submit</li>
          <li>Public professional information found on publicly accessible web pages</li>
          <li>Notes and tags you add to contacts</li>
          <li>Usage events (searches run, verifications requested, exports downloaded)</li>
        </ul>

        <h2>What we never collect</h2>
        <ul>
          <li>Home addresses, personal phone numbers, or personal social media accounts</li>
          <li>Information behind login walls, paywalls, or CAPTCHAs</li>
          <li>Sensitive personal data (health, financial, political, religious)</li>
          <li>Family or relationship information</li>
        </ul>

        <h2>How we use information</h2>
        <p>
          We use collected information to provide search results, generate outreach drafts, and
          display contact records. We do not sell your data or share it with third parties except
          as required to operate the service (e.g., Supabase for auth and storage).
        </p>

        <h2>Data retention</h2>
        <p>
          Your account data is retained until you delete your account. You may delete individual
          contacts and search records at any time from within the application.
        </p>

        <h2>Your responsibilities</h2>
        <p>
          You are solely responsible for how you use exported contact information. ReachScout does
          not send messages on your behalf. You must comply with:
        </p>
        <ul>
          <li>CAN-SPAM Act (USA)</li>
          <li>GDPR (European Union)</li>
          <li>CCPA (California)</li>
          <li>Platform terms of service (LinkedIn, email providers, etc.)</li>
          <li>Organizational policies at your company or institution</li>
        </ul>

        <h2>Contact</h2>
        <p>
          Questions? Reach us at{" "}
          <a href="mailto:dmeltonbusiness@gmail.com">dmeltonbusiness@gmail.com</a>.
        </p>
      </main>
    </div>
  )
}
