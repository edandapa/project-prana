/**
 * PROJECT PRANA: Job Pulse Agent (v3.6 - Final Resilient Build)
 * Targets: AI Solutions/Adoption & Broad Customer Success
 * Features: Diagnostic Logs, Simplified Queries, & State Persistence
 */

const SETTINGS = {
  EMAIL: 'eshwar.d10@gmail.com',
  EXPIRATION_DAYS: 30 
};

function runDailyJobSearch() {
  const props = PropertiesService.getScriptProperties();
  const sheetId = props.getProperty('SHEET_ID');
  if (!sheetId) throw new Error("SHEET_ID is missing from Script Properties. Please add it to Project Settings.");

  const titles = ['"AI Solutions Manager"', '"AI Adoption Manager"', '"Customer Success Manager"', '"Strategic Success"'];
  
  // Simplified site list to avoid query complexity errors
  const siteQueries = [
    'site:greenhouse.io',
    'site:lever.co',
    'site:ashbyhq.com',
    'site:ycombinator.com/jobs',
    'site:myworkdayjobs.com'
  ];
  
  let rawResults = [];
  const memory = PropertiesService.getUserProperties();

  // HELLO WORLD CHECK: Verify API is returning data
  const testSearch = callSerper("Customer Success");
  if (!testSearch || !testSearch.organic || testSearch.organic.length === 0) {
    Logger.log("CRITICAL: Serper API returned zero results for a broad search. Check API Key or Credits.");
    return;
  }

  titles.forEach(title => {
    siteQueries.forEach(site => {
      const query = `${title} ${site}`; 
      const searchData = callSerper(query);
      
      if (searchData && searchData.organic) {
        Logger.log(`- Found ${searchData.organic.length} results for ${title} on ${site}`);
        const freshOnly = searchData.organic.filter(job => !memory.getProperty(job.link));
        rawResults = rawResults.concat(freshOnly);
      }
    });
  });

  if (rawResults.length > 0) {
    const uniqueJobs = deduplicate(rawResults);
    Logger.log(`Total fresh roles to filter: ${uniqueJobs.length}`);
    
    const curatedJobs = filterWithGemini(uniqueJobs);
    
    if (curatedJobs && curatedJobs.length > 0) {
      updateSheet(sheetId, curatedJobs);
      sendEmail(curatedJobs);
      curatedJobs.forEach(job => memory.setProperty(job.url, Date.now().toString()));
      Logger.log(`Successfully surfaced ${curatedJobs.length} roles.`);
    } else {
      Logger.log("Gemini filtered out all results based on location/experience criteria.");
    }
  } else {
    Logger.log("Zero new URLs found by Serper after memory check.");
  }
  cleanupOldKeys();
}

/**
 * Searches Serper with the 'qdr:w' (past week) filter for better initial volume.
 */
function callSerper(query) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('SERPER_API_KEY');
  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: { 'X-API-KEY': apiKey },
    payload: JSON.stringify({ "q": query, "tbs": "qdr:d2" }), // 'qdr:w' looks back 1 week
    muteHttpExceptions: true
  };
  const response = UrlFetchApp.fetch('https://google.serper.dev/search', options);
  return JSON.parse(response.getContentText());
}

/**
 * Filters results focusing on 6+ years SaaS and $3-6M ARR metrics.
 */
function filterWithGemini(jobs) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  const prompt = `Act as a career agent for a US Citizen with 6+ years of experience in high-growth SaaS Customer Success.
  
  Candidate Background:
  - Metrics: Managed $3-6M in ARR; achieved 95% GRR and 120%+ NRR[cite: 6, 8, 25].
  - Companies: Grafana Labs, Delphix, and Qubole[cite: 7].
  - Skills: Data infrastructure, observability, Agentic AI, and RAG[cite: 9, 23, 62].

  Filter Requirements:
  1. LOCATION: Remote (US-Based), Los Angeles, or San Francisco/Bay Area.
  2. ROLE: AI Solutions/Adoption Manager or CSM (Mid to Senior).
  3. EXCLUDE: Strictly exclude roles requiring residency outside the US (e.g., India).

  Review these jobs: ${JSON.stringify(jobs)}.
  Return ONLY a JSON array: [{"company": "", "title": "", "location": "", "url": "", "fit_reason": ""}]`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
  const response = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    muteHttpExceptions: true
  });

  const responseText = response.getContentText();
  const textBlob = JSON.parse(responseText).candidates[0].content.parts[0].text;
  const cleanJson = textBlob.replace(/```json|```/g, '').trim();
  return JSON.parse(cleanJson);
}
/**
 * Appends matches to the tracking sheet with a "New" status.
 */
function updateSheet(sheetId, jobs) {
  const sheet = SpreadsheetApp.openById(sheetId).getSheets()[0];
  jobs.forEach(job => {
    sheet.appendRow([new Date(), job.company, job.title, job.location, job.url, job.fit_reason, "New"]);
  });
}

/**
 * Initialization: Setup headers and Status dropdowns.
 */
function setupSheet() {
  const sheetId = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  const sheet = SpreadsheetApp.openById(sheetId).getSheets()[0];
  const headers = ["Date Found", "Company", "Job Title", "Location", "Application Link", "Fit Summary", "Status"];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight("bold");
  
  const statusRange = sheet.getRange("G2:G1000");
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["New", "Applied", "Interviewing", "Offer", "Pass", "Stale"], true)
    .build();
  statusRange.setDataValidation(rule);
  Logger.log("Sheet initialized.");
}

/**
 * Sends the daily digest to your Gmail.
 */
function sendEmail(jobs) {
  let htmlBody = `<div style="font-family: sans-serif;"><h3>Project Prana: Daily Job Pulse</h3><ul>`;
  jobs.forEach(job => {
    htmlBody += `<li style="margin-bottom: 12px;">
      <strong>${job.company}: ${job.title}</strong> (${job.location})<br>
      <a href="${job.url}">View Role</a><br>
      <em style="color: #444;">${job.fit_reason}</em>
    </li>`;
  });
  htmlBody += `</ul></div>`;
  
  MailApp.sendEmail({
    to: SETTINGS.EMAIL,
    subject: `Job Pulse: ${jobs.length} Fresh Openings`,
    htmlBody: htmlBody
  });
}

function cleanupOldKeys() {
  const memory = PropertiesService.getUserProperties();
  const allProps = memory.getProperties();
  const now = Date.now();
  const limit = SETTINGS.EXPIRATION_DAYS * 24 * 60 * 60 * 1000;
  for (const key in allProps) {
    if (now - parseInt(allProps[key]) > limit) memory.deleteProperty(key);
  }
}

function clearMemory() {
  PropertiesService.getUserProperties().deleteAllProperties();
  Logger.log("Job memory cleared.");
}

function deduplicate(results) {
  return Array.from(new Map(results.map(item => [item.link, item])).values());
}