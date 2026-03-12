Flight-Assistant: RAG-Enabled MCP Flight Agent
This module within Project-Prana is an autonomous travel assistant that bridges the gap between static user preferences and live travel data. It leverages the Model Context Protocol (MCP) to interface with Claude Desktop and uses Retrieval-Augmented Generation (RAG) to ensure all flight recommendations adhere to personal travel constraints.

🚀 Key Features
Intelligent Orchestration: Uses "Aggressive Metadata" in tool definitions to force the LLM to check personal preferences before searching live data.

RAG Integration: Utilizes ChromaDB as a vector store to retrieve user-specific travel rules (e.g., airline preferences, departure time restrictions).

Live Data Fetching: Connects to the Amadeus Flight Offers Search API to retrieve real-time pricing and schedule information in USD.

Secure Credential Management: Implements environment variable handling to keep API secrets out of the codebase.

🛠️ Technical Stack
Core Protocol: Model Context Protocol (MCP)

Language: Python 3.10+

AI Orchestration: FastMCP

Vector Database: ChromaDB

External API: Amadeus for Developers (Flight Offers Search)

📂 File Structure
flight_server.py: The main MCP server containing tool definitions for preference retrieval and flight searching.

setup_rag.py: A utility script to initialize the ChromaDB vector store and index travel preferences.

chroma_db/: Local directory housing the persistent vector database (excluded from Git).

⚙️ Setup & Installation
Environment Setup:

Initialize RAG:
Run the setup script to create your local knowledge base:

Claude Desktop Configuration:
Add the server to your claude_desktop_config.json:

🧠 Agent Logic: The RAG-to-MCP Pipeline
The agent is designed to follow a strict reasoning chain:

Step 1 (RAG): When asked about a flight, the agent first calls get_user_preferences().

Step 2 (Context): It retrieves constraints (e.g., "No flights before 10:00 AM").

Step 3 (API): It calls search_flights() to get live data.

Step 4 (Synthesis): It filters the live data against the retrieved rules to provide a compliant recommendation.

🛡️ Security Best Practices
This project uses Environment Variables for API authentication. Never commit your .env or claude_desktop_config.json files. Refer to .env.example for the required keys.# Flight Assistant
