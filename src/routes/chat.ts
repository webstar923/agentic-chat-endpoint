import { Router } from "express";
import { initSSE, sendSSE, endSSE } from "../utils/stream.js";
import { runAgent } from "../agent/agent.js";

const router = Router();

/**
 * POST /chat
 * body: { "query": "Explain the state of AI in 2025?" }
 */
router.post("/", async (req, res) => {
  const { query } = req.body as { query?: string };

  if (!query) {
    return res.status(400).json({ error: "query is required" });
  }

  // turn this response into a stream
  initSSE(res);

  // small greeting / handshake is optional
  sendSSE(res, {
    type: "reasoning",
    content: "Starting agentic processing..."
  });

  // run the agent, passing a function that pushes events to the stream
  await runAgent(query, (event) => {
    sendSSE(res, event);
  });

  endSSE(res);
});

export default router;
