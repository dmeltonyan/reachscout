import { NextRequest, NextResponse } from "next/server"
import { requireSession, getOrCreateDbUser } from "@/lib/auth/session"
import { prisma } from "@/lib/db/prisma"
import { contactFiltersSchema } from "@/validation/contact"

export async function GET(req: NextRequest) {
  try {
    const user = await requireSession()
    const dbUser = await getOrCreateDbUser(user)

    const { searchParams } = new URL(req.url)
    const parsed = contactFiltersSchema.safeParse(Object.fromEntries(searchParams))
    if (!parsed.success) {
      return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid filters" } }, { status: 400 })
    }

    const { page, pageSize, sortBy, sortDir, search, hasEmail, organization, confidenceMin, status } = parsed.data

    const where: Record<string, unknown> = {
      userId: dbUser.id,
      status: { not: "DO_NOT_CONTACT" },
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { organization: { contains: search, mode: "insensitive" } },
        { title: { contains: search, mode: "insensitive" } },
      ]
    }
    if (hasEmail === true) where.email = { not: null }
    if (hasEmail === false) where.email = null
    if (organization) where.organization = { contains: organization, mode: "insensitive" }
    if (confidenceMin !== undefined) where.confidenceScore = { gte: confidenceMin }
    if (status?.length) where.status = { in: status }

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        include: { sources: true, tags: { include: { tag: true } } },
        orderBy: { [sortBy]: sortDir },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.contact.count({ where }),
    ])

    return NextResponse.json({ data: contacts, total, page, pageSize, hasMore: page * pageSize < total })
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Sign in required" } }, { status: 401 })
    }
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Failed to fetch contacts" } }, { status: 500 })
  }
}
