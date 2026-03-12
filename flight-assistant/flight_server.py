import os
import json
from mcp.server.fastmcp import FastMCP
import chromadb
from amadeus import Client, ResponseError
from dotenv import load_dotenv

# 1. Load variables from a .env file if it exists locally
load_dotenv()

# 2. Initialize FastMCP
mcp = FastMCP("FlightAgent-Pro")

# 3. Setup RAG with a fallback path
# Use the new absolute path for the GitHub-organized folder
DEFAULT_PATH = "C:/dev/flight-agent/project-prana/flight-assistant/chroma_db"
DB_PATH = os.getenv("CHROMA_DB_PATH", DEFAULT_PATH)

db_client = chromadb.PersistentClient(path=DB_PATH)
collection = db_client.get_or_create_collection(name="travel_rules")

# 4. Initialize Amadeus Client
# Pulls keys from your OS Environment (Claude Desktop Config) or .env file
amadeus = Client(
    client_id=os.getenv("AMADEUS_ID"),
    client_secret=os.getenv("AMADEUS_SECRET")
)

@mcp.tool()
def get_user_preferences(context_query: str = "general travel rules") -> str:
    """
    CRITICAL: This tool MUST be called first. 
    It retrieves mandatory travel constraints from the RAG database.
    """
    results = collection.query(query_texts=[context_query], n_results=3)
    return "\n".join(results['documents'][0])

@mcp.tool()
def search_flights(origin: str, destination: str, departure_date: str):
    """
    Fetches live flight offers in USD. 
    Use IATA codes (e.g., SFO, LAX) and YYYY-MM-DD.
    """
    try:
        response = amadeus.shopping.flight_offers_search.get(
            originLocationCode=origin,
            destinationLocationCode=destination,
            departureDate=departure_date,
            adults=1,
            currencyCode='USD'
        )
        
        # We simplify the raw API data to help the LLM reason more effectively
        clean_results = []
        for flight in response.data[:5]:
            clean_results.append({
                "airline": flight['validatingAirlineCodes'][0],
                "departure": flight['itineraries'][0]['segments'][0]['departure']['at'],
                "price_usd": flight['price']['total'],
                "non_stop": not flight['itineraries'][0]['segments'][1:]
            })
            
        return json.dumps(clean_results)
    except ResponseError as error:
        return f"Live API Error: {error}"

if __name__ == "__main__":
    mcp.run()