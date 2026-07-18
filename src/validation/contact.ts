import { z } from "zod"

export const contactStatusEnum = z.enum([
  "NOT_CONTACTED",
  "DRAFTED",
  "CONTACTED",
  "REPLIED",
  "FOLLOW_UP_NEEDED",
  "CLOSED",
  "DO_NOT_CONTACT",
])

export const outreachChannelEnum = z.enum(["EMAIL", "LINKEDIN", "ALUMNI_NETWORK", "OTHER"])

export const updateContactSchema = z.object({
  status: contactStatusEnum.optional(),
  notes: z.string().max(5000).optional(),
  followUpDate: z.string().datetime().optional().nullable(),
  dateContacted: z.string().datetime().optional().nullable(),
})

export const suppressContactSchema = z.object({
  reason: z.string().min(1).max(500),
})

export const generateOutreachSchema = z.object({
  channel: outreachChannelEnum,
  goal: z.string().min(1).max(500),
  userBackground: z.string().max(1000).optional(),
  targetOpportunity: z.string().max(500).optional(),
  callToAction: z.string().max(300).optional(),
  tone: z.enum(["professional", "friendly", "concise"]).default("professional"),
  maxLength: z.number().int().min(50).max(500).default(200),
})

export const contactFiltersSchema = z.object({
  status: z.array(contactStatusEnum).optional(),
  hasEmail: z.coerce.boolean().optional(),
  organization: z.string().optional(),
  confidenceMin: z.coerce.number().min(0).max(100).optional(),
  search: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z
    .enum(["relevanceScore", "confidenceScore", "createdAt", "fullName"])
    .default("createdAt"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
})
