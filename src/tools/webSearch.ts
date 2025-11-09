export interface WebSearchResult {
    source: string;
    query: string;
    results: Array<{
      title: string;
      url: string;
      snippet: string;
    }>;
  }
  
  /**
   * Mock web search.
   * Replace with real API call if the company wants to see it.
   */
  export async function webSearch(query: string): Promise<WebSearchResult> {
    // simulate network latency
    await new Promise((r) => setTimeout(r, 400));
  
    return {
      source: "mock-web-search",
      query,
      results: [
        {
          title: "AI Trends 2025: Foundation Models, Agents, and Regulation",
          url: "https://example.com/ai-trends-2025",
          snippet:
            "Discussion of frontier models, smaller task-specific models, and agentic workflows becoming mainstream in 2025."
        },
        {
          title: "Enterprise AI Adoption in 2025",
          url: "https://example.com/enterprise-ai-2025",
          snippet:
            "Companies consolidate AI stacks, add observability, and tighten data governance."
        }
      ]
    };
  }
  