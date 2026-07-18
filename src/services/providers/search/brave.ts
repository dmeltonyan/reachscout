import type { SearchProvider, SearchProviderInput, SearchProviderResult } from "@/types/provider"

interface BraveWebResult {
  url: string
  title: string
  description: string
  profile?: { url: string }
  meta_url?: { hostname: string }
}

interface BraveSearchResponse {
  web?: { results: BraveWebResult[] }
}

export class BraveSearchProvider implements SearchProvider {
  name = "brave"
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  isAvailable(): boolean {
    return Boolean(this.apiKey)
  }

  async search(input: SearchProviderInput): Promise<SearchProviderResult[]> {
    const allResults: SearchProviderResult[] = []

    for (const query of input.queries.slice(0, 3)) {
      try {
        const url = new URL("https://api.search.brave.com/res/v1/web/search")
        url.searchParams.set("q", query)
        url.searchParams.set("count", "5")
        url.searchParams.set("safesearch", "moderate")

        const response = await fetch(url.toString(), {
          headers: {
            Accept: "application/json",
            "Accept-Encoding": "gzip",
            "X-Subscription-Token": this.apiKey,
          },
          signal: AbortSignal.timeout(10_000),
        })

        if (!response.ok) {
          console.error(`[brave] HTTP ${response.status} for query: ${query}`)
          continue
        }

        const data: BraveSearchResponse = await response.json()
        const results = data.web?.results ?? []

        for (const r of results) {
          const hostname =
            r.meta_url?.hostname ?? new URL(r.url).hostname
          allResults.push({
            url: r.url,
            title: r.title,
            snippet: r.description ?? "",
            domain: hostname,
          })
        }

        // Polite delay between queries
        await new Promise((res) => setTimeout(res, 250))
      } catch (err) {
        console.error(`[brave] Error searching: ${err}`)
      }
    }

    // Deduplicate by URL
    const seen = new Set<string>()
    return allResults.filter((r) => {
      if (seen.has(r.url)) return false
      seen.add(r.url)
      return true
    })
  }
}
