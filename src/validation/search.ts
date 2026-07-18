import { z } from "zod"

export const contactTypeEnum = z.enum([
  "RECRUITER",
  "HIRING_MANAGER",
  "ENGINEERING_MANAGER",
  "FOUNDER",
  "EXECUTIVE",
  "PROFESSOR",
  "RESEARCHER",
  "ALUMNI",
  "GENERAL_RECRUITING",
  "OTHER",
])

export const searchFormSchema = z.object({
  organization: z
    .string()
    .min(1, "Organization is required")
    .max(200, "Organization name is too long"),
  domain: z
    .string()
    .max(200)
    .optional()
    .transform((v) => v || undefined),
  targetRole: z
    .string()
    .max(200)
    .optional()
    .transform((v) => v || undefined),
  contactType: contactTypeEnum.optional(),
  department: z
    .string()
    .max(200)
    .optional()
    .transform((v) => v || undefined),
  location: z
    .string()
    .max(200)
    .optional()
    .transform((v) => v || undefined),
  keywords: z
    .string()
    .max(500)
    .optional()
    .transform((v) => v || undefined),
  maxResults: z.number().int().min(1).max(50).default(10),
  onlyPublicEmails: z.boolean().default(false),
  includeGeneralContacts: z.boolean().default(true),
})

export type SearchFormSchema = z.infer<typeof searchFormSchema>

export const searchQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
})
