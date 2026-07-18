import { NextRequest, NextResponse } from "next/server"
import { requireSession, getOrCreateDbUser } from "@/lib/auth/session"
import { prisma } from "@/lib/db/prisma"
import { suppressContactSchema } from "@/validation/contact"

interface Params { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const user = await requireSession()
    const dbUser = await getOrCreateDbUser(user)

    const contact = await prisma.contact.findFirst({ where: { id, userId: dbUser.id } })
    if (!contact) {
      return NextResponse.json({ error: { code: "NOT_FOUND", message: "Contact not found" } }, { status: 404 })
    }

    const body = await req.json()
    const parsed = suppressContactSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Reason is required" } }, { status: 400 })
    }

    const updated = await prisma.contact.update({
      where: { id },
      data: { status: "DO_NOT_CONTACT", suppressionReason: parsed.data.reason },
    })

    await prisma.auditEvent.create({
      data: {
        userId: dbUser.id,
        action: "suppress_contact",
        entityType: "contact",
        entityId: id,
        metadata: { reason: parsed.data.reason },
      },
    })

    return NextResponse.json({ data: updated })
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Sign in required" } }, { status: 401 })
    }
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Failed to suppress contact" } }, { status: 500 })
  }
}
