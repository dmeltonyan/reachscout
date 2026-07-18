import { NextRequest, NextResponse } from "next/server"
import { requireSession, getOrCreateDbUser } from "@/lib/auth/session"
import { prisma } from "@/lib/db/prisma"
import { generateOutreachSchema } from "@/validation/contact"
import { generateOutreachMessage } from "@/services/outreach/generator"

interface Params { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const user = await requireSession()
    const dbUser = await getOrCreateDbUser(user)

    const contact = await prisma.contact.findFirst({
      where: { id, userId: dbUser.id },
      include: { sources: true },
    })

    if (!contact) {
      return NextResponse.json({ error: { code: "NOT_FOUND", message: "Contact not found" } }, { status: 404 })
    }

    const body = await req.json()
    const parsed = generateOutreachSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input" } }, { status: 400 })
    }

    const result = await generateOutreachMessage({
      contact: contact as any,
      channel: parsed.data.channel,
      goal: parsed.data.goal,
      userBackground: parsed.data.userBackground,
      targetOpportunity: parsed.data.targetOpportunity,
      callToAction: parsed.data.callToAction,
      tone: parsed.data.tone,
      maxLength: parsed.data.maxLength,
    })

    // Persist draft
    const draft = await prisma.outreachDraft.create({
      data: {
        userId: dbUser.id,
        contactId: id,
        channel: parsed.data.channel as any,
        goal: parsed.data.goal,
        subject: result.subject ?? null,
        body: result.body,
        tone: parsed.data.tone,
      },
    })

    return NextResponse.json({ data: { draft, generated: result } })
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Sign in required" } }, { status: 401 })
    }
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Outreach generation failed" } }, { status: 500 })
  }
}
