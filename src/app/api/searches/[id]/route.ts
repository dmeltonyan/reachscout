import { NextRequest, NextResponse } from "next/server"
import { requireSession, getOrCreateDbUser } from "@/lib/auth/session"
import { prisma } from "@/lib/db/prisma"

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const user = await requireSession()
    const dbUser = await getOrCreateDbUser(user)

    const search = await prisma.search.findFirst({
      where: { id, userId: dbUser.id },
      include: {
        contacts: {
          include: { sources: true },
          orderBy: { confidenceScore: "desc" },
        },
      },
    })

    if (!search) {
      return NextResponse.json({ error: { code: "NOT_FOUND", message: "Search not found" } }, { status: 404 })
    }

    return NextResponse.json({ data: search })
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Sign in required" } }, { status: 401 })
    }
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Failed to fetch search" } }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const user = await requireSession()
    const dbUser = await getOrCreateDbUser(user)

    const search = await prisma.search.findFirst({ where: { id, userId: dbUser.id } })
    if (!search) {
      return NextResponse.json({ error: { code: "NOT_FOUND", message: "Search not found" } }, { status: 404 })
    }

    await prisma.search.delete({ where: { id } })
    return NextResponse.json({ data: { deleted: true } })
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Sign in required" } }, { status: 401 })
    }
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Failed to delete search" } }, { status: 500 })
  }
}
