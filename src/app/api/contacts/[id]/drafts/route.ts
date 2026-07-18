import { NextRequest, NextResponse } from "next/server"
import { requireSession, getOrCreateDbUser } from "@/lib/auth/session"
import { prisma } from "@/lib/db/prisma"

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const user = await requireSession()
    const dbUser = await getOrCreateDbUser(user)

    const drafts = await prisma.outreachDraft.findMany({
      where: { userId: dbUser.id, contactId: id },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ data: drafts })
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Sign in required" } },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch drafts" } },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id: draftId } = await params
    const user = await requireSession()
    const dbUser = await getOrCreateDbUser(user)

    const draft = await prisma.outreachDraft.findFirst({
      where: { id: draftId, userId: dbUser.id },
    })

    if (!draft) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Draft not found" } },
        { status: 404 }
      )
    }

    await prisma.outreachDraft.delete({ where: { id: draftId } })
    return NextResponse.json({ data: { deleted: true } })
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Sign in required" } },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to delete draft" } },
      { status: 500 }
    )
  }
}
