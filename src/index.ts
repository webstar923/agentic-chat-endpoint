import express from "express";
import cors from "cors";
import chatRouter from "./routes/chat.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/chat", chatRouter);

app.get("/", (_req, res) => {
  res.json({ ok: true, message: "Agentic chat endpoint running" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
