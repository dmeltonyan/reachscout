import type { SearchProvider, SearchProviderInput, SearchProviderResult } from "@/types/provider"

const DEMO_RESULTS: SearchProviderResult[] = [
  {
    url: "https://www.acmerobotics.example.com/team/sarah-chen",
    title: "Sarah Chen - Engineering Recruiter | Acme Robotics",
    snippet:
      "Sarah Chen is the lead engineering recruiter at Acme Robotics, focused on robotics software and firmware roles. Reach her at recruiting@acmerobotics.example.com",
    domain: "acmerobotics.example.com",
  },
  {
    url: "https://www.acmerobotics.example.com/team/marcus-okonkwo",
    title: "Marcus Okonkwo - Head of Talent Acquisition | Acme Robotics",
    snippet:
      "Marcus Okonkwo leads talent acquisition at Acme Robotics. Previously at SpaceX and Boeing. Specializes in technical recruiting for robotics and autonomy teams.",
    domain: "acmerobotics.example.com",
  },
  {
    url: "https://cs.exampleuniversity.edu/faculty/dr-priya-singh",
    title: "Dr. Priya Singh - Associate Professor, Machine Learning | Example University",
    snippet:
      "Dr. Priya Singh researches machine learning and natural language processing. Lab contact: p.singh@cs.exampleuniversity.edu. Office hours posted on faculty page.",
    domain: "cs.exampleuniversity.edu",
  },
  {
    url: "https://www.acmerobotics.example.com/about/leadership",
    title: "Leadership Team | Acme Robotics",
    snippet:
      "Meet the leadership team at Acme Robotics. Jordan Lee (CEO), Alex Rivera (CTO), Sam Park (VP Engineering). Contact: info@acmerobotics.example.com",
    domain: "acmerobotics.example.com",
  },
  {
    url: "https://www.acmerobotics.example.com/careers",
    title: "Careers at Acme Robotics",
    snippet:
      "Join us! Open roles in software engineering, robotics, and AI. University recruiting: campus@acmerobotics.example.com",
    domain: "acmerobotics.example.com",
  },
  {
    url: "https://github.com/jlee-acme",
    title: "Jordan Lee (jlee-acme) - GitHub",
    snippet:
      "Jordan Lee · CTO at Acme Robotics · Robotics software engineer with 12 years of experience. Working on autonomous systems.",
    domain: "github.com",
  },
  {
    url: "https://sacramentostartups.example.com/founders/kai-nakamura",
    title: "Kai Nakamura - Founder & CEO, NovaMind AI | Sacramento Startups",
    snippet:
      "Kai Nakamura founded NovaMind AI in Sacramento in 2022. The company builds AI-powered process automation for SMBs. Contact via the company website.",
    domain: "sacramentostartups.example.com",
  },
  {
    url: "https://www.novamindai.example.com/about",
    title: "About NovaMind AI - Sacramento AI Startup",
    snippet:
      "NovaMind AI is a Sacramento-based startup building intelligent automation. Founded by Kai Nakamura. General inquiries: hello@novamindai.example.com",
    domain: "novamindai.example.com",
  },
]

export class MockSearchProvider implements SearchProvider {
  name = "mock"

  isAvailable(): boolean {
    return true
  }

  async search(input: SearchProviderInput): Promise<SearchProviderResult[]> {
    // Simulate network latency in development
    await new Promise((res) => setTimeout(res, 600))

    const orgLower = input.organization.toLowerCase()
    const roleLower = (input.targetRole ?? "").toLowerCase()

    // Filter mock results loosely by org/role keywords
    const relevant = DEMO_RESULTS.filter((r) => {
      const haystack = (r.title + " " + r.snippet + " " + r.url).toLowerCase()
      const orgMatch =
        orgLower.length > 2 ? haystack.includes(orgLower.split(" ")[0]) : true
      const roleMatch = roleLower.length > 2 ? haystack.includes(roleLower.split(" ")[0]) : true
      return orgMatch || roleMatch
    })

    // Always return at least some results in demo mode
    const results = relevant.length >= 2 ? relevant : DEMO_RESULTS.slice(0, 5)
    return results.slice(0, input.maxResults)
  }
}
