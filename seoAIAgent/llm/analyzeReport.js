import { GoogleGenerativeAI } from "@google/generative-ai";

const ANALYSIS_PROMPT = `You are an SEO and web performance expert.

Your job:
1. Analyze the given JSON report
2. Identify issues
3. Prioritize them (Highest, High, Medium, Low, Lowest)
4. Suggest fixes
5. Output in STRICT JSON format

Return ONLY valid JSON:
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

Report:
`;

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
