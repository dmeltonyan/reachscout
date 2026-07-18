import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001"
const DEMO_SEARCH_ID = "00000000-0000-0000-0000-000000000002"

async function main() {
  // Demo user (fictional)
  await prisma.user.upsert({
    where: { id: DEMO_USER_ID },
    update: {},
    create: {
      id: DEMO_USER_ID,
      email: "demo@example.com",
      name: "Demo User",
    },
  })

  // Demo search
  await prisma.search.upsert({
    where: { id: DEMO_SEARCH_ID },
    update: {},
    create: {
      id: DEMO_SEARCH_ID,
      userId: DEMO_USER_ID,
      organization: "Acme Robotics",
      domain: "acmerobotics.example.com",
      targetRole: "software engineering",
      contactType: "RECRUITER",
      provider: "mock",
      status: "COMPLETED",
      resultCount: 3,
      completedAt: new Date(),
    },
  })

  // Demo contacts (fictional people on reserved domains)
  const contacts = [
    {
      fullName: "Sarah Chen",
      normalizedName: "sarah chen",
      title: "Engineering Recruiter",
      organization: "Acme Robotics",
      department: "Talent Acquisition",
      summary:
        "Sarah Chen is the lead engineering recruiter at Acme Robotics, focused on robotics software and firmware roles.",
      profileUrl: "https://www.acmerobotics.example.com/team/sarah-chen",
      email: "s.chen@acmerobotics.example.com",
      emailType: "PUBLICLY_LISTED" as const,
      relevanceScore: 85,
      confidenceScore: 82,
      confidenceExplanation:
        "High confidence because this contact is listed on an official team page, source domain matches the organization, and their title closely matches the target role.",
      sourceUrl: "https://www.acmerobotics.example.com/team/sarah-chen",
      sourceDomain: "acmerobotics.example.com",
      sourceTitle: "Sarah Chen - Engineering Recruiter | Acme Robotics",
      sourceType: "COMPANY_TEAM_PAGE" as const,
    },
    {
      fullName: "Marcus Okonkwo",
      normalizedName: "marcus okonkwo",
      title: "Head of Talent Acquisition",
      organization: "Acme Robotics",
      department: "Talent Acquisition",
      summary:
        "Marcus Okonkwo leads talent acquisition at Acme Robotics. Previously at SpaceX and Boeing.",
      profileUrl: "https://www.acmerobotics.example.com/team/marcus-okonkwo",
      email: "recruiting@acmerobotics.example.com",
      emailType: "GENERAL_CONTACT" as const,
      relevanceScore: 78,
      confidenceScore: 75,
      confidenceExplanation:
        "High confidence because this contact is listed on an official team page and the source domain matches the organization.",
      sourceUrl: "https://www.acmerobotics.example.com/team/marcus-okonkwo",
      sourceDomain: "acmerobotics.example.com",
      sourceTitle: "Marcus Okonkwo - Head of Talent | Acme Robotics",
      sourceType: "COMPANY_TEAM_PAGE" as const,
    },
    {
      fullName: "Dr. Priya Singh",
      normalizedName: "dr priya singh",
      title: "Associate Professor, Machine Learning",
      organization: "Example University",
      department: "Computer Science",
      summary:
        "Dr. Priya Singh researches machine learning and natural language processing at Example University.",
      profileUrl: "https://cs.exampleuniversity.edu/faculty/dr-priya-singh",
      email: "p.singh@cs.exampleuniversity.edu",
      emailType: "PUBLICLY_LISTED" as const,
      relevanceScore: 90,
      confidenceScore: 88,
      confidenceExplanation:
        "High confidence because this contact is listed on an official university faculty page and their public email is listed on the page.",
      sourceUrl: "https://cs.exampleuniversity.edu/faculty/dr-priya-singh",
      sourceDomain: "cs.exampleuniversity.edu",
      sourceTitle: "Dr. Priya Singh - Associate Professor | Example University CS",
      sourceType: "UNIVERSITY_FACULTY" as const,
    },
  ]

  for (const c of contacts) {
    const { sourceUrl, sourceDomain, sourceTitle, sourceType, ...contactData } = c
    await prisma.contact.upsert({
      where: {
        unique_contact_per_user: {
          userId: DEMO_USER_ID,
          normalizedName: contactData.normalizedName,
          organization: contactData.organization,
        },
      },
      update: {},
      create: {
        userId: DEMO_USER_ID,
        searchId: DEMO_SEARCH_ID,
        ...contactData,
        companyDomain: sourceDomain,
        verificationStatus: "UNVERIFIED",
        status: "NOT_CONTACTED",
        sources: {
          create: {
            url: sourceUrl,
            domain: sourceDomain,
            title: sourceTitle,
            sourceType,
            supportsName: true,
            supportsTitle: true,
            supportsOrganization: true,
            supportsEmail: true,
          },
        },
      },
    })
  }

  console.log("✅ Seed complete — 1 demo user, 1 search, 3 fictional contacts")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
