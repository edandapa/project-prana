import httpx
from mcp.server.fastmcp import FastMCP

# Initialize the assistant server
mcp = FastMCP("NQ-Trading-Assistant")

# Use the working URL you just validated
GAS_URL = "https://script.google.com/macros/s/AKfycbziDoA85JOmkSz4t_-y_NdQlA8zl2DL-6Rvd7KEpvcBzz83OKGMs1krVsLP-vjEluXY/exec"

@mcp.tool()
async def get_latest_market_signal() -> str:
    """Fetches the most recent NQ trading signal from the Google Sheets Signal Hub."""
    async with httpx.AsyncClient(follow_redirects=True) as client:
        try:
            response = await client.get(GAS_URL)
            if response.status_code == 200:
                data = response.json()
                
                # Handle the "empty" state you just verified in the browser
                if data.get("status") == "empty":
                    return "The Signal Hub is active, but no alerts have been logged from TradingView yet."
                
                return (f"LATEST SIGNAL FOUND:\n"
                        f"- Signal Phase: {data.get('signal')}\n"
                        f"- Technical Type: {data.get('type')}\n"
                        f"- Price Level: {data.get('price')}\n"
                        f"- Status: {data.get('status')}")
            return f"Error: Could not reach Signal Hub (Status {response.status_code})"
        except Exception as e:
            return f"Connection Error: {str(e)}"

if __name__ == "__main__":
    mcp.run()