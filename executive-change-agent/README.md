🚀 The Workflow
When triggered for a specific contact, the agent performs the following:

Identify: Fetches the contact from HubSpot to retrieve the stored title and LinkedIn URL.

Verify: Scrapes LinkedIn (via Apify) to find the current live headline.

Audit: Compares the live headline against the CRM data.

Act: If a discrepancy is found (indicating a move):

Updates HubSpot properties: Executive Status set to Left Company.

Queries the Local RAG Server to retrieve the specific "Phase 1: Immediate Triage" steps and email templates from the internal Playbook.

Report: Generates a summary and drafts a personalized outreach email for the CSM.

🛠️ Technical Stack
Orchestration: Model Context Protocol (MCP)

CRM: HubSpot (via Private App & MCP Server)

Scraping: Apify (LinkedIn Profile Scrapers)

RAG Engine: Local Vector Store (LanceDB) with all-MiniLM-L6-v2 embeddings.

Environment: Windows-based local execution via cmd.exe wrappers.

📂 Project Structure
Plaintext
executive-change-agent/
├── config/             # MCP server configuration templates
├── data/               # Source PDFs (Executive Churn Playbook)
├── lancedb/            # Local Vector Database (Indexed files)
├── models/             # Local Embedding models
├── prompts/            # System prompt architecture
└── .gitignore          # Prevents leaking tokens and local DBs
🔒 Security
Sensitive data such as HubSpot Private App Tokens and Apify API keys are stored in a local claude_desktop_config.json and are not committed to this repository.

# Project Prana: Executive Change Agent 🧘‍♂️

Project Prana is a centralized initiative focused on developing **Agentic AI** solutions to automate Customer Success workflows and proactive account management. 

The **Executive Change Agent** is a specialized tool designed to monitor leadership departures via automated web scraping and synchronize that data directly into HubSpot.

## 🏗️ Architecture
This agent uses the **Model Context Protocol (MCP)** to orchestrate a hybrid cloud/local environment. It functions as a multi-step autonomous loop:

```mermaid
graph TD
    subgraph User_Interface
        A[Claude Desktop / LLM]
    end

    subgraph MCP_Orchestration_Layer
        B{Model Context Protocol}
    end

    subgraph Tools
        C[Apify: LinkedIn Scraper]
        D[HubSpot: CRM Read/Write]
        E[Local RAG: LanceDB + MiniLM]
    end

    subgraph Knowledge_Base
        F[Executive_Churn_Playbook.pdf]
    end

    A <--> B
    B <--> C
    B <--> D
    B <--> E
    E --- F
