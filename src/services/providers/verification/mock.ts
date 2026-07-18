import type {
  EmailVerificationProvider,
  EmailVerificationInput,
  EmailVerificationResult,
} from "@/types/provider"

export class MockEmailVerificationProvider implements EmailVerificationProvider {
  name = "mock"

  isAvailable(): boolean {
    return true
  }

  async verify(input: EmailVerificationInput): Promise<EmailVerificationResult> {
    await new Promise((res) => setTimeout(res, 400))

    const email = input.email.toLowerCase()
    const isExampleDomain = email.endsWith("@example.com") || email.includes(".example.")

    return {
      email: input.email,
      status: isExampleDomain ? "VERIFIED_DELIVERABLE" : "UNVERIFIED",
      provider: "mock",
      verifiedAt: new Date().toISOString(),
      isDisposable: false,
      isCatchAll: false,
      riskLevel: "low",
      message: "Mock verification — connect a real provider in production",
    }
  }
}
