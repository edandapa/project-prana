import os
import requests
import asyncio
from dotenv import load_dotenv
from mcp.server.fastmcp import FastMCP

# 1. Initialize and load environment variables
load_dotenv() 
mcp = FastMCP("ProjectPranaHub")

HUBSPOT_ACCESS_TOKEN = os.getenv("HUBSPOT_ACCESS_TOKEN")
HEADERS = {
    "Authorization": f"Bearer {HUBSPOT_ACCESS_TOKEN}",
    "Content-Type": "application/json"
}

# 2. Define the tool with the decorator immediately above the function
@mcp.tool()
async def update_company_health(company_id: str, new_score: int, note: str):
    """
    Updates the health score in HubSpot.
    'new_score' should be 0-100.
    'note' should explain the reasoning based on the DEAR framework.
    """
    url = f"https://api.hubapi.com/crm/v3/objects/companies/{company_id}"
    
    payload = {
        "properties": {
            "project_prana_health_score": str(new_score),
            "health_score_notes": note 
        }
    }
    
    # Using requests to send the update
    response = requests.patch(url, headers=HEADERS, json=payload)
    
    if response.status_code == 200:
        return f"Successfully updated health score to {new_score}%."
    return f"Failed to update: {response.text}"

@mcp.tool()
async def get_company_details(company_id: str):
    """
    Retrieves current properties of a company from HubSpot.
    Used to check current health score and status.
    """
    # We explicitly ask for your custom properties
    properties = "name,project_prana_health_score,health_score_notes"
    url = f"https://api.hubapi.com/crm/v3/objects/companies/{company_id}?properties={properties}"
    
    response = requests.get(url, headers=HEADERS)
    if response.status_code == 200:
        return response.json()
    return None

@mcp.tool()
async def query_knowledge_base(question: str):
    """
    Searches the local RAG (Gainsight DEAR & CS Philosophy) for answers.
    Use this to get strategic advice before updating a health score.
    """
    from langchain_chroma import Chroma
    from langchain_huggingface import HuggingFaceEmbeddings
    
    # Initialize the same local DB we used in rag_engine.py
    hf_embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    vectorstore = Chroma(persist_directory="./chroma_db", embedding_function=hf_embeddings)
    
    docs = vectorstore.similarity_search(question, k=3)
    return "\n---\n".join([d.page_content for d in docs])

if __name__ == "__main__":
    # This tells the script to run as a server when called by Claude
    mcp.run()