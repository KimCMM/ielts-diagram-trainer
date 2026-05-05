import https from "node:https";
import net from "node:net";
import tls from "node:tls";

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
  let response;
  const requestBody = JSON.stringify({
    model,
    instructions: buildSystemInstruction(),
    input: buildUserPrompt({
      writing,
      processKey,
      level,
      instruction: body.instruction,
    }),
    max_output_tokens: 900,
  });

  try {
    response = await requestOpenAI({
      apiKey,
      body: requestBody,
      proxyUrl: process.env.OPENAI_PROXY_URL,
    });
  } catch (error) {
    throw new ApiError(
      "ChatGPT connection failed. Please check the network connection, VPN/proxy settings, or OpenAI API access, then try again.",
      503,
    );
  }

  const data = await parseOpenAIResponseJson(response);

  if (response.status < 200 || response.status >= 300) {
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

async function requestOpenAI({ apiKey, body, proxyUrl }) {
  const url = new URL(OPENAI_RESPONSES_URL);
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(body),
  };

  if (proxyUrl) {
    return requestViaProxy({ url, headers, body, proxyUrl });
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body,
  });

  return {
    status: response.status,
    body: await response.text(),
  };
}

function requestViaProxy({ url, headers, body, proxyUrl }) {
  const agent = new HttpsProxyAgent(proxyUrl);

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        method: "POST",
        hostname: url.hostname,
        port: 443,
        path: `${url.pathname}${url.search}`,
        headers,
        agent,
        timeout: 30000,
      },
      (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () =>
          resolve({
            status: res.statusCode || 500,
            body: Buffer.concat(chunks).toString("utf8"),
          }),
        );
      },
    );

    req.on("error", reject);
    req.on("timeout", () => req.destroy(new Error("OpenAI request timed out.")));
    req.end(body);
  });
}

async function parseOpenAIResponseJson(response) {
  try {
    return JSON.parse(response.body);
  } catch (error) {
    return null;
  }
}

class HttpsProxyAgent extends https.Agent {
  constructor(proxyUrl) {
    super();
    this.proxy = new URL(proxyUrl);
  }

  createConnection(options, callback) {
    const proxySocket = net.connect(
      Number(this.proxy.port || 80),
      this.proxy.hostname,
    );

    proxySocket.once("connect", () => {
      proxySocket.write(
        [
          `CONNECT ${options.host}:${options.port || 443} HTTP/1.1`,
          `Host: ${options.host}:${options.port || 443}`,
          "Connection: close",
          "",
          "",
        ].join("\r\n"),
      );
    });

    let response = "";

    proxySocket.on("data", (chunk) => {
      response += chunk.toString("utf8");

      if (!response.includes("\r\n\r\n")) return;

      if (!/^HTTP\/1\.[01] 2\d\d/i.test(response)) {
        callback(new Error("Proxy CONNECT failed."));
        proxySocket.destroy();
        return;
      }

      proxySocket.removeAllListeners("data");

      const secureSocket = tls.connect({
        socket: proxySocket,
        servername: options.host,
      });

      secureSocket.once("secureConnect", () => callback(null, secureSocket));
      secureSocket.once("error", callback);
    });

    proxySocket.once("error", callback);
  }
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
