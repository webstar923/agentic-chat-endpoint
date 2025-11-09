import { webSearch } from "../tools/webSearch.js";

export type AgentEvent =
  | { type: "reasoning"; content: string }
  | {
      type: "tool_call";
      tool: string;
      input: unknown;
      output?: unknown;
    }
  | { type: "response"; content: string }
  | { type: "error"; content: string }
  | { type: "done" };

type Streamer = (event: AgentEvent) => void;

/**
 * Very tiny heuristic: if the query has a year or words like "latest" we
 * pretend we need fresh info and call the web search tool.
 */
function needsWebSearch(query: string): boolean {
  const lower = query.toLowerCase();
  const hasYear = /\b20\d{2}\b/.test(lower); // e.g. 2025
  const temporalKeywords = ["latest", "current", "state of", "trends", "2025"];
  return hasYear || temporalKeywords.some((k) => lower.includes(k));
}

/**
 * Produce the final answer, using the tool output if we have it.
 */
function synthesizeAnswer(query: string, searchData?: any): string {
  if (!searchData) {
    return `You asked: "${query}". At a high level, AI in 2025 is defined by stronger multimodal models, agentic workflows, and tighter governance.`;
  }

  const bullets = (searchData.results ?? [])
    .map((r: any) => `- ${r.title}: ${r.snippet}`)
    .join("\n");

  return [
    `You asked: "${query}". Here's a 2025-oriented view based on the retrieved sources:`,
    "",
    "1. Frontier & multimodal models keep getting cheaper to run, so more products embed them.",
    "2. Agentic systems (LLM + tool calls + memory) become the default UX for research, support, and analytics.",
    "3. Enterprises care a lot about evaluation, monitoring, and policy compliance.",
    "",
    "Sources I looked at:",
    bullets || "- (mocked search, no extra sources)"
  ].join("\n");
}

/**
 * Main agent orchestration.
 */
export async function runAgent(query: string, send: Streamer) {
  try {
    send({
      type: "reasoning",
      content:
        "User is asking something that might require up-to-date context. Checking whether I need to call an external tool..."
    });

    if (needsWebSearch(query)) {
      send({
        type: "reasoning",
        content:
          "The query looks time-sensitive or trend-like, so I'll call the web_search tool."
      });

      const toolInput = { query, topK: 5 };

      // announce tool call (input only)
      send({
        type: "tool_call",
        tool: "web_search",
        input: toolInput
      });

      const toolOutput = await webSearch(query);

      // send tool call again, now including output (like in the screenshot)
      send({
        type: "tool_call",
        tool: "web_search",
        input: toolInput,
        output: toolOutput
      });

      const answer = synthesizeAnswer(query, toolOutput);

      send({
        type: "response",
        content: answer
      });
    } else {
      send({
        type: "reasoning",
        content:
          "This doesn’t look time-sensitive — I can answer directly without tools."
      });

      const answer = synthesizeAnswer(query);
      send({
        type: "response",
        content: answer
      });
    }

    send({ type: "done" });
  } catch (err: any) {
    send({
      type: "error",
      content: err?.message ?? "Unknown error"
    });
    send({ type: "done" });
  }
}
