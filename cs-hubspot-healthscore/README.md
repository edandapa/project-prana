🚀 Project Prana: AI-Driven HubSpot Health Score Agent
Project Prana is an intelligent agent loop designed to bridge the gap between static CRM data and proactive Customer Success strategy. By combining the Gainsight DEAR framework with a local RAG (Retrieval-Augmented Generation) knowledge base, this agent automates health score monitoring and intervention logic based on custom CS philosophies.

🧠 The Philosophy
This agent is built on the principle that Customer Success should not just survive, but thrive in the age of AI. It moves away from reactive "firefighting" and toward Proactive Intervention.

The reasoning engine is grounded in:

The Gainsight DEAR Framework: Deployment, Engagement, Adoption, and ROI.

Proactive CS Logic: Derived from "How Customer Success Can Not Only Survive But Thrive in the Age of AI" (Oct 2025).

🛠️ Core Capabilities (MCP Tools)
This agent operates as a Model Context Protocol (MCP) server, providing Claude (or any MCP-compatible LLM) with three primary "skills":

get_company_details (The Eyes): Real-time retrieval of HubSpot company properties, including current health scores and account status.

query_knowledge_base (The Brain): A semantic search tool that queries a local ChromaDB vector store containing CS playbooks, framework documentation, and strategic articles.

update_company_health (The Hands): The ability to close the loop by writing updated health scores and strategic notes directly back to the HubSpot CRM.

🏗️ Tech Stack
Language: Python 3.13+

Framework: FastMCP (Model Context Protocol)

Database: ChromaDB (Local Vector Store)

Embeddings: HuggingFace all-MiniLM-L6-v2

CRM Integration: HubSpot API (Private App)

Environment: Standardized .venv architecture

🚀 Quick Start
1. Environment Setup
Clone the repository and set up the virtual environment:

PowerShell
git clone https://github.com/edandapa/project-prana.git
cd project-prana/cs-hubspot-healthscore
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
2. Configuration
Create a .env file with your credentials:

Plaintext
HUBSPOT_ACCESS_TOKEN=your_pat_here
3. Usage with Claude Desktop
Add the server to your claude_desktop_config.json:

JSON
"cs-hubspot-healthscore": {
  "command": "C:/dev/project-prana/cs-hubspot-healthscore/.venv/Scripts/python.exe",
  "args": ["C:/dev/project-prana/cs-hubspot-healthscore/mcp_server.py"],
  "env": { "HUBSPOT_ACCESS_TOKEN": "..." }
}
Developer Note: This project is part of a broader initiative to build autonomous AI agents for high-growth SaaS environments. For more information on the strategic vision behind these tools, visit eshwardandapani.com.
