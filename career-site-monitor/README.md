Career Site Monitor (Gemini-Powered)
This module is an automated intelligence agent built with Google Apps Script. It proactively monitors the career pages of top-tier tech companies, using recent Gemini model to verify if new openings align with specific role criteria (Customer Success) and geographical constraints (US/Remote only).

🚀 Key Features
Automated Scanning: Periodically fetches job data from high-growth companies like Cribl, Honeycomb, Dagster and Qualytics.

AI-Powered Verification: Instead of basic keyword searches, it uses Gemini to analyze job titles and descriptions to filter out non-US roles (e.g., London/UK) and irrelevant positions.

Email Alerts: Automatically compiles verified matches and emails a structured summary to the user.

Flexible Parsing: Handles both JSON-based API career pages and standard HTML fallbacks.

🛠️ Technical Stack
Language: JavaScript (Google Apps Script)

LLM: gemini-3-flash-preview (via Google AI Studio API)

Infrastructure: Google Apps Script Triggers (Cron-style scheduling)

Services: URLFetchApp (Web Scraping), MailApp (Notifications)

🛡️ Security & Setup
1. Security Best Practices
API Key Protection: The script is designed to pull your Gemini API key from the script's Project Settings. Never hardcode your API key directly in the .js file before pushing to GitHub.

Environment Variables: In Google Apps Script, navigate to Project Settings > Script Properties and add a property named GEMINI_API_KEY to store your secret safely.

2. Manual Installation
Go to script.google.com and create a New Project.

Copy the contents of career_monitor.js from this repo into the Google Apps Script editor.

Add your GEMINI_API_KEY to the Script Properties (as mentioned above).

Update the USER_EMAIL variable in the script to your preferred notification address.

3. Scheduling
To make the agent truly autonomous:

Click the Triggers (clock icon) in the GAS sidebar.

Add a new trigger for the main function.

Set it to run on a Time-driven basis (e.g., "Weekly" or "Daily").

🧠 Agent Logic: The Verification Pipeline
The script doesn't just look for the word "Success"; it reasons through the data:

Fetch: Scrapes the career API or HTML of a target company (e.g., Honeycomb, Dagster).

Filter: Uses a regex to find broad matches for "Customer Success" or "Solution".

Validate (LLM): Sends potential leads to Gemini with a prompt like: "Is this a Customer Success role based in the USA or Remote? Exclude any international locations like London."

Notify: Only roles that receive a "YES" from Gemini are included in the final email report.
