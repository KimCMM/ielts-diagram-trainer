import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import {
  ApiError,
  handleAiFeedbackRequest,
  readJsonFromNodeRequest,
} from "./src/server/aiFeedback.js";

const aiFeedbackApiPlugin = () => ({
  name: "ai-feedback-api",
  configureServer(server) {
    server.middlewares.use("/api/ai-feedback", async (req, res) => {
      if (req.method !== "POST") {
        res.statusCode = 405;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Method not allowed." }));
        return;
      }

      try {
        const body = await readJsonFromNodeRequest(req);
        const result = await handleAiFeedbackRequest(body);
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(result));
      } catch (error) {
        res.statusCode = error instanceof ApiError ? error.statusCode : 500;
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            error: error?.message || "AI feedback failed.",
          }),
        );
      }
    });
  },
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  process.env.OPENAI_API_KEY ||= env.OPENAI_API_KEY;
  process.env.OPENAI_MODEL ||= env.OPENAI_MODEL;
  process.env.OPENAI_PROXY_URL ||= env.OPENAI_PROXY_URL;

  return {
    plugins: [react(), aiFeedbackApiPlugin()],
  };
});
