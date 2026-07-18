import { NextRequest, NextResponse } from "next/server"
import { requireSession, getOrCreateDbUser } from "@/lib/auth/session"
import { checkSearchRateLimit } from "@/lib/rate-limit"
import { searchFormSchema } from "@/validation/search"
import { runSearchOrchestrator } from "@/services/search/orchestrator"

export async function POST(req: NextRequest) {
  try {
    const user = await requireSession()
    const dbUser = await getOrCreateDbUser(user)

    await checkSearchRateLimit(dbUser.id)

    const body = await req.json()
    const parsed = searchFormSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error.flatten() } },
        { status: 400 }
      )
    }

    const result = await runSearchOrchestrator({ ...parsed.data, userId: dbUser.id })

    return NextResponse.json({ data: result })
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "UNAUTHORIZED") {
        return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Sign in required" } }, { status: 401 })
      }
      if (err.message.startsWith("RATE_LIMIT")) {
        return NextResponse.json({ error: { code: "RATE_LIMIT", message: err.message } }, { status: 429 })
      }
    }
    console.error("[POST /api/search]", err)
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Search failed" } }, { status: 500 })
  }
}
