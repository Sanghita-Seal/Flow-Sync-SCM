import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are a supply chain analyst for a manufacturing company.
You analyze procurement risks, shipment delays, and S&OP planning data.
You provide clear, actionable insights in exactly 4 sections:
SITUATION, BUSINESS IMPACT, RECOMMENDED ACTIONS, PRIORITY.
Always use specific numbers from the provided data. Be concise and planner-friendly.`;

const PROMPTS = {
  risk_analysis: (data) => `
Analyze this procurement risk and provide a structured insight.

Risk Data:
${JSON.stringify(data, null, 2)}

Provide your response in exactly this format:

SITUATION:
[2-3 sentences describing what is happening, using specific numbers from the data]

BUSINESS IMPACT:
[2-3 sentences explaining production/supply impact, with specific quantities]

RECOMMENDED ACTIONS:
• [Action 1]
• [Action 2]
• [Action 3]

PRIORITY: [HIGH / MEDIUM / LOW]

Rules:
- Use ONLY the data provided. Do not invent numbers or facts.
- Be specific: mention SKUs, quantities, days, percentages.
- Keep total response under 200 words.
- Focus on actionable advice a planner can use.`,

  plan_analysis: (data) => `
Analyze this procurement plan and its linked shipments.

Plan Data:
${JSON.stringify(data, null, 2)}

Provide your response in exactly this format:

SITUATION:
[2-3 sentences about the procurement plan status and linked shipments]

BUSINESS IMPACT:
[2-3 sentences about production/supply impact with specific numbers]

RECOMMENDED ACTIONS:
• [Action 1]
• [Action 2]
• [Action 3]

PRIORITY: [HIGH / MEDIUM / LOW]

Rules:
- Use ONLY the data provided.
- Mention shipment references and their statuses.
- Keep total response under 200 words.`,

  cycle_summary: (data) => `
Summarize this S&OP cycle's planning health.

Cycle Data:
${JSON.stringify(data, null, 2)}

Provide your response in exactly this format:

SITUATION:
[2-3 sentences about the cycle's overall planning status]

BUSINESS IMPACT:
[2-3 sentences about what the shortage/excess/balanced split means]

RECOMMENDED ACTIONS:
• [Action 1]
• [Action 2]
• [Action 3]

PRIORITY: [HIGH / MEDIUM / LOW]

Rules:
- Use ONLY the data provided.
- Reference specific product counts and percentages.
- Keep total response under 200 words.`,
};

function extractSection(text, header) {
  const regex = new RegExp(`${header}:\\s*([\\s\\S]*?)(?=\\n(?:SITUATION|BUSINESS IMPACT|RECOMMENDED ACTIONS|PRIORITY):|$)`, "i");
  const match = text.match(regex);
  return match ? match[1].trim() : "";
}

function extractActions(text) {
  const lines = text.split("\n").filter((l) => l.trim().startsWith("•") || l.trim().startsWith("-"));
  return lines.map((l) => l.replace(/^[\s•\-]+/, "").trim());
}

function extractPriority(text) {
  const match = text.match(/PRIORITY:\s*(HIGH|MEDIUM|LOW)/i);
  return match ? match[1].toUpperCase() : "MEDIUM";
}

function parseInsightResponse(text) {
  const situation = extractSection(text, "SITUATION");
  const impact = extractSection(text, "BUSINESS IMPACT");
  const actionsText = extractSection(text, "RECOMMENDED ACTIONS");
  const priority = extractPriority(text);
  const actions = extractActions(actionsText);

  return { situation, impact, actions, priority };
}

export async function generateInsight(type, data) {
  const promptFn = PROMPTS[type];
  if (!promptFn) {
    throw new Error(`Unknown insight type: ${type}`);
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4.1-nano",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: promptFn(data) },
    ],
    max_tokens: 500,
    temperature: 0.3,
  });

  const raw = response.choices[0].message.content;
  return parseInsightResponse(raw);
}
