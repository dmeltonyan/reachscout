import { NextRequest, NextResponse } from "next/server"
import { requireSession, getOrCreateDbUser } from "@/lib/auth/session"
import { prisma } from "@/lib/db/prisma"
import { checkVerificationRateLimit } from "@/lib/rate-limit"
import { MockEmailVerificationProvider } from "@/services/providers/verification/mock"

interface Params { params: Promise<{ id: string }> }

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const user = await requireSession()
    const dbUser = await getOrCreateDbUser(user)

    await checkVerificationRateLimit(dbUser.id)

    const contact = await prisma.contact.findFirst({ where: { id, userId: dbUser.id } })
    if (!contact) {
      return NextResponse.json({ error: { code: "NOT_FOUND", message: "Contact not found" } }, { status: 404 })
    }
    if (!contact.email) {
      return NextResponse.json({ error: { code: "NO_EMAIL", message: "No email to verify" } }, { status: 400 })
    }
    if (contact.emailType === "PATTERN_ESTIMATE") {
      return NextResponse.json({ error: { code: "ESTIMATE_ONLY", message: "Cannot auto-verify a pattern estimate" } }, { status: 400 })
    }

    const provider = new MockEmailVerificationProvider()
    const result = await provider.verify({ email: contact.email })

    const updated = await prisma.contact.update({
      where: { id },
      data: {
        verificationStatus: result.status as any,
        verificationProvider: result.provider,
        verifiedAt: new Date(result.verifiedAt),
      },
    })

    await prisma.auditEvent.create({
      data: {
        userId: dbUser.id,
        action: "verify_email",
        entityType: "contact",
        entityId: id,
        metadata: { provider: result.provider, status: result.status },
      },
    })

    return NextResponse.json({ data: { contact: updated, verification: result } })
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "UNAUTHORIZED") {
        return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Sign in required" } }, { status: 401 })
      }
      if (err.message.startsWith("RATE_LIMIT")) {
        return NextResponse.json({ error: { code: "RATE_LIMIT", message: err.message } }, { status: 429 })
      }
    }
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Verification failed" } }, { status: 500 })
  }
}
