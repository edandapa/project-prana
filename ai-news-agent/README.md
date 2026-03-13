🤖 AI News Summary Agent
Part of the Project-Prana ecosystem, this agent serves as a high-signal "Knowledge Triage" tool. It automates the ingestion of global AI news and uses Gemini 2.0 Flash to synthesize raw headlines into actionable business and technical intelligence.

🌟 The "So What?"
In an industry where the SOTA (State of the Art) changes weekly, staying informed is a full-time job. This agent solves the "noise" problem by:

Filtering for Impact: Distinguishing between temporary hype and long-term structural shifts in AI regulation, investment, and architecture.

Executive Summarization: Transforming dense articles into 1-2 sentence "Strategic Overviews" and technical bullets.

Visual Intelligence: Automatically identifying relevant imagery to provide context at a glance.

🛠️ Tech Stack
Language: Python 3.13

LLM: Google Gemini 2.0 Flash (via Google AI Studio)

Data Source: NewsAPI (Global AI & Tech indices)

Architecture: Modular Python script designed for local execution or cloud-native deployment.

🚀 Getting Started
1. Prerequisites
Ensure you have Python 3.13+ installed and the necessary libraries:

Bash
pip install requests python-dotenv
2. Environment Setup
Create a .env file in this directory with the following keys:

Plaintext
GEMINI_API_KEY=your_gemini_key
NEWS_API_KEY=your_news_api_key
RECIPIENT_EMAIL=your_email@example.com
3. Execution
Run the orchestrator to generate your weekly digest:

Bash
python news_summarizer.py
📊 Sample Output Structure
The agent returns a structured JSON digest (and emails the formatted HTML version):

Title: Professional, punchy headline.

Overview: High-level business impact (The "Customer Success" lens).

Bullets: 3-5 deep-dive technical or strategic takeaways.

Source Tracking: Direct links to the original reporting for verification.