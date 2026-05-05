import { ApiError, handleAiFeedbackRequest } from "../src/server/aiFeedback.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  try {
    const result = await handleAiFeedbackRequest(req.body || {});
    res.status(200).json(result);
  } catch (error) {
    res.status(error instanceof ApiError ? error.statusCode : 500).json({
      error: error?.message || "AI feedback failed.",
    });
  }
}
