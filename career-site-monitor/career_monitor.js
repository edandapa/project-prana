/**
 * Script 3: The Autonomous Agent (Full Managed Service Version)
 * Includes: Precision Scraping, Batch AI, Multi-layer Observability, and Weekly Dashboards.
 */

const API_KEY_AG = "YOUR_GEMINI_API_KEY";
const EMAIL_AG = "YOUR_EMAIL_ADDRESS";
const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID";
const MODEL_AG = "AVAILABLE GEMINI MODEL"; 

const SITES = [
  { name: "Cribl", url: "https://boards-api.greenhouse.io/v1/boards/cribl/jobs" },
  { name: "Honeycomb", url: "https://api.lever.co/v0/postings/honeycomb" },
  { name: "Dagster", url: "https://jobs.ashbyhq.com/dagster/api/postings" },
  { name: "Qualytics", url: "https://qualytics.ai/careers/" } 
];

/**
 * 📊 NEW: Weekly Dashboard Report
 * Purpose: Summarizes the last 7 days of agent performance from the Logs tab.
 */
function sendWeeklyDashboard() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const logSheet = ss.getSheetByName("Logs");
  if (!logSheet) return;

  const data = logSheet.getDataRange().getValues();
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
  
  let totalRuns = 0;
  let successfulRuns = 0;
  let totalMatchesFound = 0;
  let avgLatency = 0;

  // Skip header row
  for (let i = 1; i < data.length; i++) {
    const runDate = new Date(data[i][0]);
    if (runDate >= sevenDaysAgo) {
      totalRuns++;
      if (data[i][1].toString().includes("SUCCESS")) successfulRuns++;
      
      // Extract number from "X new matches" string
      const matchCount = parseInt(data[i][3]) || 0;
      totalMatchesFound += matchCount;
      
      // Extract number from "Xs" latency string
      const latency = parseFloat(data[i][4]) || 0;
      avgLatency += latency;
    }
  }

  const successRate = totalRuns > 0 ? ((successfulRuns / totalRuns) * 100).toFixed(1) : 0;
  const finalAvgLatency = totalRuns > 0 ? (avgLatency / totalRuns).toFixed(2) : 0;

  const report = `
  📊 Agentic Weekly Performance Report
  --------------------------------------
  Period: ${sevenDaysAgo.toLocaleDateString()} - ${now.toLocaleDateString()}
  
  ✅ System Health: ${successRate}% Success Rate
  🎯 Total New Roles Found: ${totalMatchesFound}
  ⏱️ Average Latency: ${finalAvgLatency}s
  🔄 Total System Cycles: ${totalRuns}
  
  Status: ${successRate > 90 ? "OPTIMAL" : "ATTENTION REQUIRED"}
  `;

  MailApp.sendEmail(EMAIL_AG, "📊 Weekly Agent Dashboard", report);
  console.log("Weekly Dashboard Sent.");
}

/**
 * 🕵️ Main Agent Loop: Scans sites and logs telemetry.
 */
function checkCareersAgentic() {
  const startTime = new Date();
  let matches = [];
  let errorCount = 0;
  let sitesScanned = 0;
  
  let props = PropertiesService.getScriptProperties();
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const mainSheet = ss.getSheetByName("Sheet1") || ss.getSheets()[0];
  const logSheet = ss.getSheetByName("Logs");

  const excludeRegex = /london|uk|emea|europe|india|germany|canada|australia|united kingdom/i;

  SITES.forEach(site => {
    console.log(`🔎 Scanning: ${site.name}...`);
    try {
      const resp = UrlFetchApp.fetch(site.url, { muteHttpExceptions: true });
      let content = resp.getContentText();
      let candidates = [];
      sitesScanned++;

      try {
        let json = JSON.parse(content);
        let jobs = Array.isArray(json) ? json : (json.jobs || json.postings || json.results || []);
        
        candidates = jobs
          .map(j => {
            const title = j.text || j.title || "Unknown Title";
            const loc = j.location ? (j.location.name || j.location.text || (typeof j.location === 'string' ? j.location : "Remote")) : "Remote";
            return `${title} | LOC: ${loc}`;
          })
          .filter(text => /success/i.test(text) && !excludeRegex.test(text));
      } catch (e) {
        const cleanText = content.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, ' ');
        candidates = (cleanText.match(/[^\.!\?]*success[^\.!\?]*/gi) || [])
          .filter(text => !excludeRegex.test(text));
      }

      if (candidates.length > 0) {
        const prompt = `Identify "Customer Success" roles strictly in the USA/Remote. EXCLUDE International. DATA: \n${candidates.join("\n")}`;
        const verifiedJobs = callGeminiStructured(prompt);
        
        verifiedJobs.forEach(job => {
          const key = `v3_${site.name}_${job.title}_${job.location}`.replace(/\s+/g, '_').substring(0, 240);
          if (!props.getProperty(key)) {
            mainSheet.appendRow([new Date(), site.name, job.title, job.location, "Agent Verified"]);
            matches.push(`🎯 ${site.name}: ${job.title} (${job.location})`);
            props.setProperty(key, new Date().toISOString());
          }
        });
      }
      if ((new Date() - startTime) > 330000) return; 
    } catch(e) { 
      console.log(`❌ Error at ${site.name}: ${e.message}`);
      errorCount++;
    }
  });

  const endTime = new Date();
  const duration = (endTime - startTime) / 1000;
  const status = errorCount === 0 ? "SUCCESS" : `ERRORS: ${errorCount}`;
  
  if (logSheet) {
    logSheet.appendRow([startTime, status, `${sitesScanned}/${SITES.length} sites`, `${matches.length} matches`, `${duration.toFixed(2)}s`, MODEL_AG]);
  }

  if (matches.length > 0) {
    MailApp.sendEmail(EMAIL_AG, "🚀 Agentic Update: New Roles Found", matches.join("\n"));
  }
}

// --- RETAINED CORE FUNCTIONS ---

function callGeminiStructured(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/${MODEL_AG}:generateContent?key=${API_KEY_AG}`;
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      response_mime_type: "application/json",
      response_schema: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: { title: { type: "STRING" }, location: { type: "STRING" } },
          required: ["title", "location"]
        }
      }
    }
  };
  const options = { method: "POST", contentType: "application/json", payload: JSON.stringify(payload), muteHttpExceptions: true };
  const resp = UrlFetchApp.fetch(url, options);
  try {
    return JSON.parse(JSON.parse(resp.getContentText()).candidates[0].content.parts[0].text);
  } catch(e) { return []; }
}

function WeeklyHealthCheck() {
  const logSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("Logs");
  let status = "HEALTHY";
  SITES.forEach(site => {
    try {
      if (UrlFetchApp.fetch(site.url, {muteHttpExceptions: true}).getResponseCode() !== 200) status = "DEGRADED";
    } catch(e) { status = "ERROR"; }
  });
  if (logSheet) logSheet.appendRow([new Date(), "HEALTH_CHECK", status, "-", "N/A", "N/A"]);
}

function cleanupOldKeys() {
  const props = PropertiesService.getScriptProperties();
  const data = props.getProperties();
  const now = new Date();
  for (let key in data) {
    if (key.startsWith('v3_') && (now - new Date(data[key]) > (60 * 24 * 60 * 60 * 1000))) props.deleteProperty(key);
  }
}

function clearMemory() {
  PropertiesService.getScriptProperties().deleteAllProperties();
  console.log("Memory Reset.");
}