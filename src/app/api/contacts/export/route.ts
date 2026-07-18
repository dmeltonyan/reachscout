import { NextRequest, NextResponse } from "next/server"
import { requireSession, getOrCreateDbUser } from "@/lib/auth/session"
import { prisma } from "@/lib/db/prisma"
import { checkExportRateLimit } from "@/lib/rate-limit"
import { exportContactsToCsv } from "@/services/export/csv-exporter"

export async function GET(req: NextRequest) {
  try {
    const user = await requireSession()
    const dbUser = await getOrCreateDbUser(user)

    await checkExportRateLimit(dbUser.id)

    const { searchParams } = new URL(req.url)
    const statusFilter = searchParams.get("status")

    const contacts = await prisma.contact.findMany({
      where: {
        userId: dbUser.id,
        status: { not: "DO_NOT_CONTACT" },
        emailType: { not: "PATTERN_ESTIMATE" },
        ...(statusFilter ? { status: statusFilter as any } : {}),
      },
      include: {
        sources: { take: 1 },
        tags: { include: { tag: true } },
      },
      orderBy: { confidenceScore: "desc" },
      take: 1000,
    })

    await prisma.auditEvent.create({
      data: {
        userId: dbUser.id,
        action: "export_contacts",
        metadata: { count: contacts.length },
      },
    })

    const csv = exportContactsToCsv(contacts as any)
    const filename = `reachscout-export-${new Date().toISOString().slice(0, 10)}.csv`

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "UNAUTHORIZED") {
        return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Sign in required" } }, { status: 401 })
      }
      if (err.message.startsWith("RATE_LIMIT")) {
        return NextResponse.json({ error: { code: "RATE_LIMIT", message: err.message } }, { status: 429 })
      }
    }
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Export failed" } }, { status: 500 })
  }
}
