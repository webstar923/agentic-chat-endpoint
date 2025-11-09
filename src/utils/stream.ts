import { Response } from "express";

/**
 * Initialize SSE headers on the response.
 */
export function initSSE(res: Response) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  // allow CORS preflight to keep stream
  res.flushHeaders?.();
}

/**
 * Send a JSON event down the stream.
 */
export function sendSSE(res: Response, payload: unknown) {
  const data = JSON.stringify(payload);
  res.write(`data: ${data}\n\n`);
}

/**
 * Close the stream.
 */
export function endSSE(res: Response) {
  res.write("event: end\ndata: {}\n\n");
  res.end();
}
