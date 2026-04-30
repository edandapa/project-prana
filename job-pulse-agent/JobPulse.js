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
  if (!sheetId) throw new Error("SHEET_ID is missing from Script Properties.");

  const titles = ['"AI Solutions Manager"', '"AI Adoption Manager"', '"Customer Success Manager"', '"Strategic Success"'];
  
  // RESILIENT ARRAY: Looping through these prevents the "Zero Hits" bug
  const siteQueries = [
    'site:boards.greenhouse.io',
    'site:jobs.lever.co',
    'site:jobs.ashbyhq.com',
    'site:ycombinator.com/jobs',
    'site:myworkdayjobs.com'
  ];
  
  let rawResults = [];
  const memory = PropertiesService.getUserProperties();

  titles.forEach(title => {
    siteQueries.forEach(site => {
      const query = `${title} ${site}`; 
      const searchData = callSerper(query);
      
      if (searchData && searchData.organic) {
        Logger.log(`- Found ${searchData.organic.length} results for ${title} on ${site}`);
        // Memory Check: Only keep URLs we haven't processed in 30 days
        const freshOnly = searchData.organic.filter(job => !memory.getProperty(job.link));
        rawResults = rawResults.concat(freshOnly);
      }
    });
  });

  if (rawResults.length > 0) {
    const uniqueJobs = deduplicate(rawResults);
    const curatedJobs = filterWithGemini(uniqueJobs);
    
    if (curatedJobs && curatedJobs.length > 0) {
      updateSheet(sheetId, curatedJobs);
      sendEmail(curatedJobs);
      // Save URLs to memory
      curatedJobs.forEach(job => memory.setProperty(job.url, Date.now().toString()));
    }
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
  
  const prompt = `Act as a career agent for a US Citizen with 6+ years of SaaS Customer Success experience.
  
  CRITICAL INSTRUCTION: LOCATION VALIDATION
  - The candidate is ONLY looking for roles in the USA (Remote, Los Angeles, or San Francisco).
  - EXCLUDE roles that are primarily located in Japan, India, EMEA, or Canada, even if the company is headquartered in SF.
  - If a description mentions "First Japan-based hire" or "Based in Tokyo," it is a 100% DISQUALIFIER.

  Candidate Background:
  - Metrics: Managed $3-6M in ARR; 95% GRR and 120%+ NRR.
  - Focus: Observability, Data Infra, and AI Agents.

  Review these jobs: ${JSON.stringify(jobs)}.
  Return ONLY a JSON array: [{"company": "", "title": "", "location": "", "url": "", "fit_reason": ""}]`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
  const response = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    muteHttpExceptions: true
  });

  const textBlob = JSON.parse(response.getContentText()).candidates[0].content.parts[0].text;
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