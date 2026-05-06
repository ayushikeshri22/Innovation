import dotenv from "dotenv";
import { scrapeSitemap } from "./helper/scrapeSitemap.js";
import { analyzeUrl } from "./helper/runPerformance.js";
import saveResults from "./helper/saveFile.js";
import { analyzeReport } from "./llm/analyzeReport.js";
import { createJiraPayload } from "./jira/createJiraPayload.js";
import { createJiraTicket } from "./jira/createJiraTicket.js";
import llmData from "./data/llmSeoAnalysis.json" with { type: "json" };
import cleanReportData from "./helper/cleanReportData.js";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
dotenv.config();

async function prepareFinalUrlList() {
  // /*
  const allSitemapUrls = await scrapeSitemap(
    "https://www.victoriassecret.com/sitemaps/en/us/product-1.xml",
  );

  console.log("Fetching sitemap...");

  console.log("Total URLs:", allSitemapUrls.length);

  // Pick random 100
  const sample = allSitemapUrls.sort(() => Math.random() - 0.5).slice(0, 1);

  console.log("Selected URLs:", sample.length);

  const results = [];

  for (const url of sample) {
    try {
      const data = await analyzeUrl(url);
      results.push(data);
    } catch (err) {
      console.log("Failed:", url, err.message);
    }
  }

  console.log("Analysis complete!");
  console.log("Total successful:", results.length);

  // get LLM analysis
  let llmSeoAnalysis = {};
  const sanitizedResult = cleanReportData(...results);

  try {
    console.log("Analyzing with LLM...");
    llmSeoAnalysis = await analyzeReport(sanitizedResult);
    console.log("LLM Analysis complete!");

    saveResults(llmSeoAnalysis, 'llmSeoAnalysis.json');
  } catch (error) {
    console.error("Error during LLM analysis:", error);
    console.log("Shutting down process!!");
    return;
  }

  llmSeoAnalysis.tickets.forEach((issue) => {
    console.log("Issue:", issue.title);
    console.log("Description:", issue.description);
    console.log("Priority:", issue.priority);
    console.log("Suggested Fix:", issue.fix);
    console.log("Impact:", issue.impact);
    console.log("-----------------------------");
    const payload = createJiraPayload(issue, sample[0]);
    createJiraTicket(payload)
      .then((response) => {
        console.log("Jira ticket created:", response.key);
        console.log("Jira ticket created:", response);
      })
      .catch((error) => {
        console.error("Error creating Jira ticket:", error);
        console.error("Error creating Jira ticket:", error.response.data.errors);
      });
  });

  saveResults(results, 'results.json');

  console.log("Saved results.json");
}

prepareFinalUrlList().then(console.log);
