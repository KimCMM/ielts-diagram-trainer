const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = "gpt-4.1-mini";

const processNames = {
  bamboo: "bamboo fabric manufacturing",
  sugar: "sugar production",
  noodles: "instant noodle manufacturing",
  recycling: "plastic bottle recycling",
};

const levelNames = {
  band55: "Band 5.5",
  band6: "Band 6",
  band65: "Band 6.5",
};

export class ApiError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
  }
}

export async function readJsonFromNodeRequest(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(Buffer.from(chunk));
  }

  const rawBody = Buffer.concat(chunks).toString("utf8");
  if (!rawBody.trim()) return {};

  try {
    return JSON.parse(rawBody);
  } catch (error) {
    throw new ApiError("Request body must be valid JSON.", 400);
  }
}

export async function handleAiFeedbackRequest(body = {}) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new ApiError("OPENAI_API_KEY is not configured.", 503);
  }

  const writing = typeof body.writing === "string" ? body.writing.trim() : "";
  const processKey = typeof body.processKey === "string" ? body.processKey : "";
  const level = typeof body.level === "string" ? body.level : "";

  if (!writing) {
    throw new ApiError("Writing text is required.", 400);
  }

  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;
  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      instructions: buildSystemInstruction(),
      input: buildUserPrompt({
        writing,
        processKey,
        level,
        instruction: body.instruction,
      }),
      max_output_tokens: 900,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data?.error?.message || data?.message || "OpenAI language check failed.";
    throw new ApiError(message, response.status);
  }

  const text = extractResponseText(data);
  const parsed = parseJsonObject(text);
  const errors = normalizeErrors(parsed.errors);

  return {
    errors,
    source: "chatgpt",
    model,
  };
}

function buildSystemInstruction() {
  return [
    "You are a careful IELTS Academic Writing Task 1 process-diagram language checker.",
    "Check only the student's submitted body paragraph.",
    "Identify likely grammar, vocabulary, spelling, word form, preposition, passive voice, cohesion, reference, and process-description errors.",
    "Do not rewrite the paragraph.",
    "Do not provide corrected full sentences.",
    "Return only valid JSON. The JSON shape must be: {\"errors\":[{\"id\":\"short-id\",\"type\":\"grammar|vocabulary|cohesion|task|spelling|reference|word-form|punctuation\",\"message\":\"brief issue label without correction\",\"examples\":[\"short copied phrase if useful\"]}]}",
    "If no likely issues are found, return {\"errors\":[]}.",
  ].join(" ");
}

function buildUserPrompt({ writing, processKey, level, instruction }) {
  const processName = processNames[processKey] || processKey || "unknown process";
  const levelName = levelNames[level] || level || "unknown level";

  return [
    `Process diagram: ${processName}`,
    `Target level: ${levelName}`,
    instruction ? `Teacher instruction: ${instruction}` : "",
    "Student body paragraph:",
    writing,
    "",
    "Return JSON only. Keep each message short and diagnostic. Do not provide corrections or improved sentences.",
  ]
    .filter(Boolean)
    .join("\n");
}

function extractResponseText(data) {
  if (typeof data?.output_text === "string") {
    return data.output_text.trim();
  }

  if (!Array.isArray(data?.output)) return "";

  return data.output
    .flatMap((item) => item.content || [])
    .map((part) => part.text || part.output_text || "")
    .join("\n")
    .trim();
}

function parseJsonObject(text) {
  const cleaned = text
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    throw new ApiError("OpenAI returned an invalid feedback format.", 502);
  }
}

function normalizeErrors(errors) {
  if (!Array.isArray(errors)) return [];

  return errors.slice(0, 12).map((error, index) => ({
    id:
      typeof error?.id === "string" && error.id.trim()
        ? error.id.trim()
        : `chatgpt-issue-${index + 1}`,
    type:
      typeof error?.type === "string" && error.type.trim()
        ? error.type.trim()
        : "language",
    message:
      typeof error?.message === "string" && error.message.trim()
        ? error.message.trim()
        : "Possible language issue.",
    examples: Array.isArray(error?.examples)
      ? error.examples.filter((item) => typeof item === "string").slice(0, 3)
      : [],
  }));
}
