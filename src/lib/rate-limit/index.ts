import { prisma } from "@/lib/db/prisma"

const SEARCHES_PER_HOUR = parseInt(process.env.SEARCHES_PER_HOUR ?? "10", 10)
const PROFILES_PER_DAY = parseInt(process.env.PROFILES_PER_DAY ?? "100", 10)
const VERIFICATIONS_PER_DAY = parseInt(process.env.VERIFICATIONS_PER_DAY ?? "25", 10)
const EXPORTS_PER_DAY = parseInt(process.env.EXPORTS_PER_DAY ?? "5", 10)

function startOfHour() {
  const d = new Date()
  d.setMinutes(0, 0, 0)
  return d
}

function startOfDay() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export async function checkSearchRateLimit(userId: string): Promise<void> {
  const count = await prisma.search.count({
    where: {
      userId,
      createdAt: { gte: startOfHour() },
    },
  })

  if (count >= SEARCHES_PER_HOUR) {
    throw new Error(`RATE_LIMIT: searches — ${SEARCHES_PER_HOUR} per hour`)
  }
}

export async function checkProfilesRateLimit(userId: string, newProfiles: number): Promise<void> {
  const today = startOfDay()
  const searches = await prisma.search.findMany({
    where: { userId, createdAt: { gte: today } },
    select: { resultCount: true },
  })
  const total = searches.reduce((sum, s) => sum + s.resultCount, 0)

  if (total + newProfiles > PROFILES_PER_DAY) {
    throw new Error(`RATE_LIMIT: profiles — ${PROFILES_PER_DAY} per day`)
  }
}

export async function checkVerificationRateLimit(userId: string): Promise<void> {
  const events = await prisma.auditEvent.count({
    where: {
      userId,
      action: "verify_email",
      createdAt: { gte: startOfDay() },
    },
  })

  if (events >= VERIFICATIONS_PER_DAY) {
    throw new Error(`RATE_LIMIT: verifications — ${VERIFICATIONS_PER_DAY} per day`)
  }
}

export async function checkExportRateLimit(userId: string): Promise<void> {
  const events = await prisma.auditEvent.count({
    where: {
      userId,
      action: "export_contacts",
      createdAt: { gte: startOfDay() },
    },
  })

  if (events >= EXPORTS_PER_DAY) {
    throw new Error(`RATE_LIMIT: exports — ${EXPORTS_PER_DAY} per day`)
  }
}

export { SEARCHES_PER_HOUR, PROFILES_PER_DAY, VERIFICATIONS_PER_DAY, EXPORTS_PER_DAY }
