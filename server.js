// ===================================================================
//  🖥️  BACKEND  (Part 2)
//
//  You don't need to edit this file! It does two jobs:
//    1. Shows your website at http://localhost:3000
//    2. Takes what visitors type, adds your instructions from
//       my-ai.js, sends it to the AI, and sends the answer back.
//
//  Run it from this folder with:   node server.js
//  Stop it with:                   Ctrl + C
//
//  Your API key goes in a file called api-key.txt (never commit it!).
// ===================================================================

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const KEY_FILE = path.join(ROOT, "api-key.txt");

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".gif": "image/gif", ".webp": "image/webp", ".svg": "image/svg+xml", ".ico": "image/x-icon",
};
// Files the browser is never allowed to see
const PRIVATE = new Set(["server.js", "my-ai.js", "api-key.txt"]);

const LENGTH = {
  short:  { tokens: 400,  hint: "Keep your whole answer short: about 50 to 120 words." },
  medium: { tokens: 900,  hint: "Keep your answer medium length: about 150 to 300 words." },
  long:   { tokens: 2000, hint: "You may give a longer answer, up to about 600 words." },
};
const CREATIVITY = { focused: 0.2, balanced: 0.7, wild: 1.0 };

// ---------- Settings and API key ----------

function loadAI() {
  // Re-read my-ai.js every time, so your edits work without restarting
  const file = require.resolve("./my-ai.js");
  delete require.cache[file];
  try {
    return require(file);
  } catch (err) {
    throw new UserError("There’s a typo in my-ai.js: " + err.message);
  }
}

function getKey() {
  if (process.env.AI_API_KEY) return process.env.AI_API_KEY.trim();
  try {
    const key = fs.readFileSync(KEY_FILE, "utf8").trim();
    return key && !/paste/i.test(key) ? key : "";
  } catch {
    return "";
  }
}

class UserError extends Error {
  constructor(message, status) { super(message); this.status = status || 400; }
}

function checkSettings(ai) {
  if (!ai || typeof ai !== "object") throw new UserError("my-ai.js didn’t load. Is the last line still module.exports = MY_AI; ?");
  if (!["openai", "anthropic"].includes(ai.provider)) throw new UserError('In my-ai.js, provider must be "openai" or "anthropic".');
  if (!ai.model) throw new UserError("In my-ai.js, fill in a model name.");
  if (!ai.instructions || !ai.instructions.trim()) throw new UserError("In my-ai.js, write some instructions for your AI.");
}

// ---------- Talking to the AI ----------

async function askAI(message) {
  const ai = loadAI();
  checkSettings(ai);
  const key = getKey();
  if (!key) throw new UserError("No API key yet. Put your key in a file called api-key.txt next to server.js.", 500);

  const length = LENGTH[ai.answerLength] || LENGTH.short;
  const temperature = CREATIVITY[ai.creativity] ?? CREATIVITY.balanced;
  const system = ai.instructions.trim() + "\n\n" + length.hint;

  return ai.provider === "anthropic"
    ? askAnthropic(key, ai.model, system, message, length.tokens, temperature)
    : askOpenAI(key, ai.model, system, message, length.tokens, temperature);
}

async function askAnthropic(key, model, system, message, maxTokens, temperature) {
  const base = process.env.ANTHROPIC_BASE_URL || "https://api.anthropic.com";
  const res = await fetch(base + "/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature,
      system,
      messages: [{ role: "user", content: message }],
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw apiError(res.status, data.error && data.error.message, "Anthropic");
  return (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
}

async function askOpenAI(key, model, system, message, maxTokens, temperature) {
  const base = process.env.OPENAI_BASE_URL || "https://api.openai.com";
  const send = (withTemperature) => {
    const body = {
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: message },
      ],
      // Newer "thinking" models use some tokens to think, so leave extra room
      max_completion_tokens: maxTokens + 2000,
    };
    if (withTemperature) body.temperature = temperature;
    return fetch(base + "/v1/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: "Bearer " + key },
      body: JSON.stringify(body),
    });
  };

  let res = await send(true);
  let data = await res.json().catch(() => ({}));
  // Some models only allow their default creativity: try again without it
  if (res.status === 400 && /temperature/i.test(JSON.stringify(data))) {
    res = await send(false);
    data = await res.json().catch(() => ({}));
  }
  if (!res.ok) throw apiError(res.status, data.error && data.error.message, "OpenAI");
  const choice = data.choices && data.choices[0];
  return ((choice && choice.message && choice.message.content) || "").trim();
}

function apiError(status, detail, company) {
  if (status === 401 || status === 403) return new UserError(`${company} didn’t accept your API key. Check api-key.txt (and that provider in my-ai.js matches your key).`, 502);
  if (status === 404) return new UserError(`${company} doesn’t know that model name. Check model in my-ai.js.`, 502);
  if (status === 429) return new UserError(`${company} says slow down, or the account is out of credits. Wait a moment and try again.`, 502);
  return new UserError(`${company} error: ${detail || "something went wrong (" + status + ")"}`, 502);
}

// ---------- The web server ----------

function sendJSON(res, status, obj) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(obj));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 20000) { reject(new UserError("That message is too long.", 413)); req.destroy(); }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function serveFile(req, res) {
  let urlPath = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  if (urlPath === "/") urlPath = "/index.html";
  const name = path.basename(urlPath);
  const file = path.join(ROOT, path.normalize(urlPath));
  const type = TYPES[path.extname(file).toLowerCase()];

  if (!file.startsWith(ROOT + path.sep) || PRIVATE.has(name) || name.startsWith(".") || !type) {
    res.writeHead(404); return res.end("Not found");
  }
  fs.readFile(file, (err, content) => {
    if (err) { res.writeHead(404); return res.end("Not found"); }
    res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-store" });
    res.end(content);
  });
}

const server = http.createServer(async (req, res) => {
  const pathname = new URL(req.url, "http://localhost").pathname;

  if (pathname === "/api/status" && req.method === "GET") {
    try {
      const ai = loadAI();
      checkSettings(ai);
      if (!getKey()) return sendJSON(res, 200, { ready: false, reason: "add your API key to api-key.txt" });
      return sendJSON(res, 200, { ready: true, provider: ai.provider, model: ai.model });
    } catch (err) {
      return sendJSON(res, 200, { ready: false, reason: err.message });
    }
  }

  if (pathname === "/api/ask") {
    if (req.method !== "POST") return sendJSON(res, 405, { error: "Use POST" });
    try {
      const body = JSON.parse((await readBody(req)) || "{}");
      const message = typeof body.message === "string" ? body.message.trim() : "";
      if (!message) throw new UserError("Type something first!");
      if (message.length > 2000) throw new UserError("That message is too long (2000 characters max).");
      const answer = await askAI(message);
      console.log("✅ Answered: " + message.slice(0, 60).replace(/\s+/g, " "));
      return sendJSON(res, 200, { answer });
    } catch (err) {
      const status = err instanceof UserError ? err.status : 500;
      const msg = err instanceof UserError ? err.message : "The backend hit a problem: " + err.message;
      console.log("⚠️  " + msg);
      return sendJSON(res, status, { error: msg });
    }
  }

  serveFile(req, res);
});

if (typeof fetch !== "function") {
  console.log("⚠️  Your Node.js is too old. Install the LTS version from nodejs.org (18 or newer).");
  process.exit(1);
}

server.listen(PORT, () => {
  console.log(`\n🌐 Your website is running at http://localhost:${PORT}`);
  console.log(getKey() ? "🔑 API key found. Your AI is connected!" : "🔑 No API key found yet. The site runs in demo mode (put your key in api-key.txt).");
  console.log("   Press Ctrl + C to stop.\n");
});
