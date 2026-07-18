import { prisma } from "@/lib/db/prisma"
import { normalizeOrg } from "./domain-normalizer"
import { generateSearchQueries } from "./query-generator"
import { extractContactsFromResults } from "./profile-extractor"
import { deduplicateContacts } from "./deduplicator"
import { rankContacts } from "./ranker"
import { MockSearchProvider } from "@/services/providers/search/mock"
import { BraveSearchProvider } from "@/services/providers/search/brave"
import type { SearchProvider } from "@/types/provider"
import type { SearchFormValues } from "@/types/search"

function getSearchProvider(): SearchProvider {
  const name = process.env.SEARCH_PROVIDER ?? "mock"
  if (name === "brave" && process.env.BRAVE_SEARCH_API_KEY) {
    return new BraveSearchProvider(process.env.BRAVE_SEARCH_API_KEY)
  }
  return new MockSearchProvider()
}

export interface OrchestratorInput extends SearchFormValues {
  userId: string
}

export async function runSearchOrchestrator(input: OrchestratorInput) {
  const searchRecord = await prisma.search.create({
    data: {
      userId: input.userId,
      organization: input.organization,
      domain: input.domain ?? null,
      targetRole: input.targetRole ?? null,
      contactType: (input.contactType as any) ?? null,
      department: input.department ?? null,
      location: input.location ?? null,
      keywords: input.keywords ?? null,
      provider: process.env.SEARCH_PROVIDER ?? "mock",
      status: "RUNNING",
    },
  })

  const start = Date.now()

  try {
    // Stage A: Normalize org
    const org = normalizeOrg(input.organization, input.domain)

    // Stage B: Generate queries
    const queries = generateSearchQueries(org, {
      targetRole: input.targetRole,
      contactType: input.contactType,
      department: input.department,
      location: input.location,
      keywords: input.keywords,
    })

    // Stage C: Retrieve results
    const provider = getSearchProvider()
    const rawResults = await provider.search({
      queries,
      maxResults: input.maxResults ?? 10,
      organization: org.displayName,
      domain: org.domain ?? undefined,
      targetRole: input.targetRole,
      contactType: input.contactType,
    })

    // Stage D: Extract profiles
    const extracted = extractContactsFromResults(rawResults, org)

    // Stage E: Deduplicate + rank
    const deduplicated = deduplicateContacts(extracted)
    const ranked = rankContacts(deduplicated, {
      organization: org.displayName,
      domain: org.domain,
      targetRole: input.targetRole,
      contactType: input.contactType,
      location: input.location,
    })

    // Persist contacts
    const saved = await Promise.all(
      ranked.map(async ({ contact, relevanceScore, confidenceScore, confidenceExplanation }) => {
        const normalizedName = contact.fullName.toLowerCase().replace(/[^a-z\s]/g, "").trim()

        try {
          return await prisma.contact.upsert({
            where: {
              unique_contact_per_user: {
                userId: input.userId,
                normalizedName,
                organization: contact.organization ?? input.organization,
              },
            },
            update: {
              searchId: searchRecord.id,
              title: contact.title ?? undefined,
              summary: contact.summary ?? undefined,
              profileUrl: contact.profileUrl ?? undefined,
              email: contact.email ?? undefined,
              emailType: (contact.emailType as any) ?? undefined,
              relevanceScore,
              confidenceScore,
              confidenceExplanation,
              updatedAt: new Date(),
            },
            create: {
              userId: input.userId,
              searchId: searchRecord.id,
              fullName: contact.fullName,
              normalizedName,
              title: contact.title ?? null,
              organization: contact.organization ?? input.organization,
              department: contact.department ?? null,
              location: contact.location ?? null,
              summary: contact.summary ?? null,
              profileUrl: contact.profileUrl ?? null,
              contactPageUrl: contact.contactPageUrl ?? null,
              companyDomain: org.domain ?? null,
              email: contact.email ?? null,
              emailType: (contact.emailType as any) ?? null,
              relevanceScore,
              confidenceScore,
              confidenceExplanation,
              sources: {
                create: {
                  url: contact.sourceUrl,
                  domain: contact.sourceDomain,
                  title: contact.sourceTitle,
                  sourceType: contact.sourceType as any,
                  supportsName: true,
                  supportsTitle: Boolean(contact.title),
                  supportsOrganization: true,
                  supportsEmail: Boolean(contact.email),
                },
              },
            },
            include: { sources: true },
          })
        } catch {
          return null
        }
      })
    )

    const validContacts = saved.filter(Boolean)

    await prisma.search.update({
      where: { id: searchRecord.id },
      data: {
        status: "COMPLETED",
        resultCount: validContacts.length,
        completedAt: new Date(),
        durationMs: Date.now() - start,
      },
    })

    return { searchId: searchRecord.id, contacts: validContacts, count: validContacts.length }
  } catch (err) {
    await prisma.search.update({
      where: { id: searchRecord.id },
      data: {
        status: "FAILED",
        errorMessage: err instanceof Error ? err.message : "Unknown error",
        completedAt: new Date(),
        durationMs: Date.now() - start,
      },
    })
    throw err
  }
}
