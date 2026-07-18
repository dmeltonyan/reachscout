import { NextRequest, NextResponse } from "next/server"
import { requireSession, getOrCreateDbUser } from "@/lib/auth/session"
import { prisma } from "@/lib/db/prisma"
import { updateContactSchema } from "@/validation/contact"

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const user = await requireSession()
    const dbUser = await getOrCreateDbUser(user)

    const contact = await prisma.contact.findFirst({
      where: { id, userId: dbUser.id },
      include: {
        sources: true,
        tags: { include: { tag: true } },
        outreachDrafts: { orderBy: { createdAt: "desc" } },
      },
    })

    if (!contact) {
      return NextResponse.json({ error: { code: "NOT_FOUND", message: "Contact not found" } }, { status: 404 })
    }

    return NextResponse.json({ data: contact })
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Sign in required" } }, { status: 401 })
    }
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Failed to fetch contact" } }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const user = await requireSession()
    const dbUser = await getOrCreateDbUser(user)

    const contact = await prisma.contact.findFirst({ where: { id, userId: dbUser.id } })
    if (!contact) {
      return NextResponse.json({ error: { code: "NOT_FOUND", message: "Contact not found" } }, { status: 404 })
    }

    const body = await req.json()
    const parsed = updateContactSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid input" } }, { status: 400 })
    }

    const updated = await prisma.contact.update({
      where: { id },
      data: parsed.data,
    })

    return NextResponse.json({ data: updated })
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Sign in required" } }, { status: 401 })
    }
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Failed to update contact" } }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const user = await requireSession()
    const dbUser = await getOrCreateDbUser(user)

    const contact = await prisma.contact.findFirst({ where: { id, userId: dbUser.id } })
    if (!contact) {
      return NextResponse.json({ error: { code: "NOT_FOUND", message: "Contact not found" } }, { status: 404 })
    }

    await prisma.contact.delete({ where: { id } })
    return NextResponse.json({ data: { deleted: true } })
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Sign in required" } }, { status: 401 })
    }
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Failed to delete contact" } }, { status: 500 })
  }
}
