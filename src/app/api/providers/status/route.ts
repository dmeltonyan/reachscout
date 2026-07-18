import { NextResponse } from "next/server"

export async function GET() {
  const searchProvider = process.env.SEARCH_PROVIDER ?? "mock"
  const verificationProvider = process.env.EMAIL_VERIFICATION_PROVIDER ?? "mock"

  return NextResponse.json({
    data: {
      search: {
        provider: searchProvider,
        available: searchProvider === "mock" || Boolean(process.env.BRAVE_SEARCH_API_KEY),
        mode: searchProvider === "mock" ? "demo" : "live",
      },
      verification: {
        provider: verificationProvider,
        available: verificationProvider === "mock" || Boolean(process.env.HUNTER_API_KEY),
        mode: verificationProvider === "mock" ? "demo" : "live",
      },
      outreach: {
        provider: "anthropic",
        available: Boolean(process.env.ANTHROPIC_API_KEY),
        mode: process.env.ANTHROPIC_API_KEY ? "live" : "template",
      },
    },
  })
}
