"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Copy, Loader2, MessageSquare } from "lucide-react"
import { toast } from "sonner"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { generateOutreachSchema } from "@/validation/contact"
import type { z } from "zod"

type GenerateForm = z.infer<typeof generateOutreachSchema>

export default function DraftsPage() {
  const searchParams = useSearchParams()
  const contactId = searchParams.get("contactId")

  const [contact, setContact] = useState<{ fullName: string; title?: string | null } | null>(null)
  const [generated, setGenerated] = useState<{ subject?: string; body: string } | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const form = useForm<GenerateForm>({
    resolver: zodResolver(generateOutreachSchema) as unknown as Resolver<GenerateForm>,
    defaultValues: {
      channel: "EMAIL",
      tone: "professional",
      maxLength: 200,
    },
  })

  useEffect(() => {
    if (!contactId) return
    fetch(`/api/contacts/${contactId}`)
      .then((r) => r.json())
      .then((d) => setContact(d.data))
      .catch(() => {})
  }, [contactId])

  async function handleGenerate(values: GenerateForm) {
    if (!contactId) {
      toast.error("No contact selected")
      return
    }

    setIsGenerating(true)
    try {
      const res = await fetch(`/api/contacts/${contactId}/generate-outreach`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      if (!res.ok) throw new Error("Generation failed")
      const data = await res.json()
      setGenerated(data.data.generated)
      toast.success("Message drafted")
    } catch {
      toast.error("Failed to generate message")
    } finally {
      setIsGenerating(false)
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => toast.success("Copied to clipboard"))
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href={contactId ? `/contacts/${contactId}` : "/contacts"}>
              <ArrowLeft className="h-4 w-4" />
              {contactId ? "Back to contact" : "Contacts"}
            </Link>
          </Button>
          <span className="font-medium">Outreach Generator</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {contact && (
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{contact.fullName}</span>
                {contact.title && <Badge variant="outline">{contact.title}</Badge>}
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={form.handleSubmit(handleGenerate)} className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Message settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Channel</Label>
                  <Select
                    defaultValue="EMAIL"
                    onValueChange={(v) => form.setValue("channel", v as GenerateForm["channel"])}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EMAIL">Email</SelectItem>
                      <SelectItem value="LINKEDIN">LinkedIn message</SelectItem>
                      <SelectItem value="ALUMNI_NETWORK">Alumni network</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tone</Label>
                  <Select
                    defaultValue="professional"
                    onValueChange={(v) => form.setValue("tone", v as GenerateForm["tone"])}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="concise">Concise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal">Your goal <span className="text-destructive">*</span></Label>
                <Input id="goal" placeholder="e.g. Learn about open engineering roles" {...form.register("goal")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userBackground">Your background</Label>
                <Textarea id="userBackground" placeholder="Brief summary of your background" rows={2} {...form.register("userBackground")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="callToAction">Call to action</Label>
                <Input id="callToAction" placeholder="e.g. Would you have 15 minutes for a call?" {...form.register("callToAction")} />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" disabled={isGenerating}>
            {isGenerating ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Generating…</>
            ) : (
              <><MessageSquare className="h-4 w-4" />Generate message</>
            )}
          </Button>
        </form>

        {generated && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Generated draft</CardTitle>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(
                  (generated.subject ? `Subject: ${generated.subject}\n\n` : "") + generated.body
                )}>
                  <Copy className="h-4 w-4" />Copy
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {generated.subject && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">SUBJECT</p>
                  <p className="text-sm font-medium">{generated.subject}</p>
                </div>
              )}
              <div>
                {generated.subject && <p className="text-xs font-medium text-muted-foreground mb-1">BODY</p>}
                <Textarea value={generated.body} rows={10} onChange={(e) =>
                  setGenerated((prev) => prev ? { ...prev, body: e.target.value } : null)
                } className="font-mono text-sm" />
              </div>
              <p className="text-xs text-muted-foreground">
                Edit before sending. ReachScout does not send messages automatically.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
