MNQ Day Trading Assistant
This AI-powered "Second Opinion" tool is specifically designed for trading Micro E-mini Nasdaq-100 (MNQ) futures. It acts as a specialized Risk Manager to help traders navigate LUCID $25K PRO/FLEX evaluations by validating setups against institutional market structure logic.

🚀 Key Features

ICC Strategy Implementation: Automatically identifies and tracks the three core phases of price action: Indication (MSS/CHoCH), Correction (FVG Retracement), and Continuation (BOS).


Real-Time Signal Hub: A Google Apps Script-based backend that receives instant TradingView webhooks and logs them to a centralized Google Sheet.


Claude MCP Integration: Utilizes a custom Model Context Protocol (MCP) server to feed live market data directly into Claude for high-context decision support.


LUCID Guardrails: Monitors the 40% Consistency Rule ($1,000 maximum single-day profit for a $25K account) and identifies potential "micro-scalping" violations.

📊 Strategy Overview: ICC Framework
The assistant validates every trade according to the Indication, Correction, Continuation strategy:


Indication: Detects a Bullish Change of Character (CHoCH), signaling a break in downward momentum and a potential trend shift.


Correction: Monitors for price retracement into a Fair Value Gap (FVG) or Order Block to identify high-probability entry zones.


Continuation: Confirms the trade with a Bullish Break of Structure (BOS), validating that the 1-minute trend aligns with higher timeframe flows.

📂 Architecture

src-gas/: Receiver endpoint for TradingView webhooks (managed via Clasp).


src-mcp/: Python-based FastMCP server that connects the Signal Hub to the AI Assistant.

⚖️ Risk Management & Compliance
The assistant is strictly a Decision Support System to ensure compliance with prop firm rules requiring manual execution. It monitors:


Consistency: Alerts the trader when reaching 40% of the profit target to protect the evaluation.


Volatility: Provides timing-based warnings during the high-volatility 6:30 AM – 6:45 AM PDT market open.