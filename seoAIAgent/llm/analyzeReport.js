import { GoogleGenerativeAI } from "@google/generative-ai";

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

Report: `;
// `You are an SEO and web performance expert.

// Your job:
// 1. Analyze the given JSON report
// 2. Identify issues
// 3. Prioritize them (Highest, High, Medium, Low, Lowest)
// 4. Suggest fixes
// 5. Output in STRICT JSON format

// Return ONLY valid JSON:
// {
//   "tickets": [
//     {
//       "title": "",
//       "description": "",
//       "priority": "",
//       "impact": "",
//       "fix": ""
//     }
//   ]
// }

// Report:
// `;

async function analyzeReport(report) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-3-flash-preview",
  });

  const prompt = `${ANALYSIS_PROMPT}${JSON.stringify(report)}`;
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // Parse and return the JSON response
  return JSON.parse(text);
}

export { analyzeReport };
