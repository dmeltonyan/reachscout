import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/search"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = next
      redirectUrl.searchParams.delete("code")
      redirectUrl.searchParams.delete("next")
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Auth error — redirect to login with error flag
  const loginUrl = request.nextUrl.clone()
  loginUrl.pathname = "/auth/login"
  loginUrl.searchParams.set("error", "auth_callback_failed")
  return NextResponse.redirect(loginUrl)
}
