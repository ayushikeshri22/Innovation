import { GoogleGenAI } from "@google/genai";

const ANALYSIS_PROMPT = `You are an SEO and web performance expert.

Your job:
1. Analyze the given Lighthouse JSON report in full depth
2. Identify ALL possible issues across ALL audits (do NOT limit the number of issues)
3. Do NOT summarize or group multiple issues into one — create a separate ticket for each distinct issue
4. Treat each failing, warning, suboptimal metric, or improvement opportunity as an issue
5. Include issues even if they seem minor
6. If an audit contains multiple actionable problems, break them into multiple tickets
7. Do not stop early — ensure the entire report is fully traversed before producing output

Prioritization rules:
- Highest: Critical performance/SEO/accessibility failures (very low scores, blocking rendering, major UX impact)
- High: Significant issues affecting performance, SEO, or accessibility
- Medium: Noticeable but not critical issues
- Low: Minor improvements
- Lowest: Nice-to-have optimizations

Output rules:
- Return ONLY valid JSON
- Do NOT include explanations outside JSON
- Do NOT skip any issues
- Ensure the number of tickets reflects ALL detected issues in the report

Return format:
{
  "tickets": [
    {
      "title": "",
      "description": "",
      "priority": "",
      "impact": "",
      "fix": ""
    }
  ]
}

FIX GENERATION REQUIREMENTS:
The "fix" field MUST:
- contain detailed sequential implementation steps
- explain HOW to fix the issue
- explain WHY the issue happens
- include frontend/backend/build-pipeline recommendations where relevant
- include optimization techniques
- include framework-specific suggestions if inferable
- include code-level recommendations where possible
- include caching/CDN/compression/loading recommendations where relevant
- include image/font/script optimization recommendations where relevant
- include SEO metadata/content recommendations where relevant
- include accessibility remediation guidance where relevant
- contain enough detail that a developer can directly implement the fix

Report: `;

async function analyzeReport(report) {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  const prompt = `${ANALYSIS_PROMPT}${JSON.stringify(report)}`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  const output = JSON.parse(response.text);

  // Parse and return the JSON response
  return output;
}

export { analyzeReport };
