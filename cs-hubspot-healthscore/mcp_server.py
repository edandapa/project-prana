import os
import httpx
import asyncio
from dotenv import load_dotenv
from fastmcp import FastMCP 

# 1. Initialize and load environment variables
load_dotenv() 
mcp = FastMCP("Project Prana")

HUBSPOT_ACCESS_TOKEN = os.getenv("HUBSPOT_ACCESS_TOKEN")
# We'll define the HEADERS here so all tools can see them
HEADERS = {
    "Authorization": f"Bearer {HUBSPOT_ACCESS_TOKEN}",
    "Content-Type": "application/json"
}

# 2. Define the tools
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
    
    # Use httpx.AsyncClient for modern, non-blocking code
    async with httpx.AsyncClient() as client:
        response = await client.patch(url, headers=HEADERS, json=payload)
    
    if response.status_code == 200:
        return f"Successfully updated health score to {new_score}%."
    return f"Failed to update: {response.text}"

@mcp.tool()
async def get_company_details(company_id: str):
    """
    Retrieves current properties of a company from HubSpot.
    Used to check current health score and status.
    """
    properties = "name,project_prana_health_score,health_score_notes"
    url = f"https://api.hubapi.com/crm/v3/objects/companies/{company_id}?properties={properties}"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=HEADERS)
        
    if response.status_code == 200:
        return response.json()
    return f"Error: Company {company_id} not found or API error: {response.status_code}"

@mcp.tool()
async def query_knowledge_base(question: str):
    """
    Searches the local RAG (Gainsight DEAR & CS Philosophy) for answers.
    """
    from langchain_chroma import Chroma
    from langchain_huggingface import HuggingFaceEmbeddings
    
    # 💡 FIX: Resolve the absolute path to the chroma_db folder
    current_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(current_dir, "chroma_db")
    
    hf_embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    
    # Use the absolute db_path here
    vectorstore = Chroma(persist_directory=db_path, embedding_function=hf_embeddings)
    
    docs = vectorstore.similarity_search(question, k=3)
    return "\n---\n".join([d.page_content for d in docs])

if __name__ == "__main__":
    mcp.run()