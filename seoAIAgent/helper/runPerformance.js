// runner.js
import puppeteer from "puppeteer";
import lighthouse from "lighthouse";
import { launch } from "chrome-launcher";

export async function analyzeUrl(url) {
  console.log("Analyzing:", url);

  // launch Chrome
   const chrome = await launch({
    chromeFlags: ["--headless"]
  });
  const resp = await fetch(`http://localhost:${chrome.port}/json/version`);
  const data = await resp.json();
  const { webSocketDebuggerUrl } = data;

  // Puppeteer connect
  const browser = await puppeteer.connect({
    browserWSEndpoint: webSocketDebuggerUrl,
    defaultViewport: null
  });

  const page = await browser.newPage();
  let jsErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") jsErrors.push(msg.text());
  });
  await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

  // Screenshot for AI use
  const screenshot = await page.screenshot({ encoding: "base64", fullPage: true });

  //Html data
  const htmlData = await page.evaluate(() => {
    return {
      h1_count: document.querySelectorAll("h1").length,
      schema_count: [...document.querySelectorAll("script[type='application/ld+json']")].length,
      missing_alts: [...document.querySelectorAll("img")]
        .filter(img => !img.alt).length,
      title_length: document.title.length,
      meta_description_length:
        document.querySelector("meta[name='description']")?.content.length || 0,
      jsonld_present: !!document.querySelector("script[type='application/ld+json']")
    };
  });

  // Lighthouse run
  const { lhr } = await lighthouse(url, {
    port: chrome.port,
    output: "json",
    onlyCategories: ["performance", "seo", "accessibility"]
  });

  const audits = lhr.audits;

  await browser.close();
  await chrome.kill();

  return {
    url,
    technical_seo: {
      status: audits["http-status-code"]?.numericValue,
      has_title: audits["document-title"]?.score === 1,
      has_meta_description: audits["meta-description"]?.score === 1,
      has_canonical: audits["canonical"]?.score === 1,
      is_crawlable: audits["is-crawlable"]?.score === 1
    },
    performance_issues: {
      blocking_time: audits["total-blocking-time"]?.numericValue,
      unused_js_kb: audits["unused-javascript"]?.details?.overallSavingsBytes / 1024,
      unused_css_kb: audits["unused-css-rules"]?.details?.overallSavingsBytes / 1024,
      large_images: audits["uses-optimized-images"]?.details?.items?.map(i => i.url)
    },
    html_semantics: htmlData,
    js_errors: jsErrors,
    accessibility: {
      contrast_issues: audits["color-contrast"]?.details?.items?.length || 0,
      aria_errors: audits["aria-valid-attr"]?.details?.items?.length || 0
    },
    coreWebVitals: {
      lcp: audits["largest-contentful-paint"]?.numericValue,
      cls: audits["cumulative-layout-shift"]?.numericValue,
      inp: audits["interaction-to-next-paint"]?.numericValue,
      fcp: audits["first-contentful-paint"]?.numericValue,
      ttfb: audits["server-response-time"]?.numericValue,
      speedIndex: audits["speed-index"]?.numericValue,
      tti: audits["interactive"]?.numericValue,
    },
    mainThread: {
      totalBlockingTime: audits["total-blocking-time"]?.numericValue,
      scriptEvaluation: audits["script-evaluation"]?.numericValue,
      scriptParse: audits["script-parse-time"]?.numericValue,
      longTasks: audits["long-tasks"]?.details?.items || [],
      mainThreadWorkBreakdown: audits["mainthread-work-breakdown"]?.details?.items || [],
      bootupTime: audits["bootup-time"]?.numericValue,
      javascriptExecutionTime: audits["javascript-execution-time"]?.numericValue,
      tasks: audits["tasks"]?.details?.items || [],
    },
    renderBlocking: {
      renderBlockingResources: audits["render-blocking-resources"]?.details?.items || [],
      preloads: audits["uses-rel-preload"]?.details?.items || [],
      preconnects: audits["uses-rel-preconnect"]?.details?.items || [],
      criticalRequests: audits["critical-request-chains"]?.details?.chains || {},
    },
    codeEfficiency: {
      unusedJS: audits["unused-javascript"]?.details?.items || [],
      unusedCSS: audits["unused-css-rules"]?.details?.items || [],
      jsLibraries: audits["large-javascript-libraries"]?.details?.items || [],
      noDocumentWrite: audits["no-document-write"]?.score,
    },
    images: {
      unoptimizedImages: audits["uses-optimized-images"]?.details?.items || [],
      responsiveImages: audits["uses-responsive-images"]?.details?.items || [],
      webpCandidates: audits["uses-webp-images"]?.details?.items || [],
      offscreenImages: audits["offscreen-images"]?.details?.items || [],
      oversizedImages: audits["image-size-responsive"]?.details?.items || [],
      animatedContent: audits["efficient-animated-content"]?.details?.items || [],
    },
    network: {
      serverResponseTime: audits["server-response-time"]?.numericValue,
      networkRequests: audits["network-requests"]?.details?.items || [],
      networkRTT: audits["network-rtt"]?.numericValue,
      redirects: audits["redirects"]?.details?.items || [],
    },
    diagnostics: {
      lcpElement: audits["largest-contentful-paint-element"]?.details?.items || [],
      clsElements: audits["layout-shift-elements"]?.details?.items || [],
      diagnostics: audits["diagnostics"]?.details?.items || [],
    },
    thirdParties: {
      thirdPartySummary: audits["third-party-summary"]?.details?.items || [],
      thirdPartyFacades: audits["third-party-facades"]?.details?.items || [],
      thirdPartyMediations: audits["third-party-mediations"]?.details?.items || [],
    },
  };
}
