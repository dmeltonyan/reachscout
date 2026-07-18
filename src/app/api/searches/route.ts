import { NextRequest, NextResponse } from "next/server"
import { requireSession, getOrCreateDbUser } from "@/lib/auth/session"
import { prisma } from "@/lib/db/prisma"

export async function GET(req: NextRequest) {
  try {
    const user = await requireSession()
    const dbUser = await getOrCreateDbUser(user)

    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))
    const pageSize = Math.min(50, parseInt(searchParams.get("pageSize") ?? "20", 10))

    const [searches, total] = await Promise.all([
      prisma.search.findMany({
        where: { userId: dbUser.id },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.search.count({ where: { userId: dbUser.id } }),
    ])

    return NextResponse.json({
      data: searches,
      total,
      page,
      pageSize,
      hasMore: page * pageSize < total,
    })
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Sign in required" } }, { status: 401 })
    }
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Failed to fetch searches" } }, { status: 500 })
  }
}
