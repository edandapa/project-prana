import time
import asyncio
from notifypy import Notify
from mcp_server import get_company_details, update_company_health
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from rich.console import Console
from rich.table import Table
from rich.live import Live

console = Console()

def generate_dashboard(company_name, score, status, last_update):
    table = Table(title="🚀 Project Prana: Live CS Command Center")
    table.add_column("Company", style="cyan")
    table.add_column("Health Score", style="bold")
    table.add_column("Status", style="bold")
    table.add_column("Last Sync", style="dim")

    # Color coding based on your thresholds
    color = "green" if status == "Green" else "yellow" if status == "Yellow" else "red"
    
    table.add_row(company_name, f"{score}%", f"[{color}]{status}[/{color}]", last_update)
    return table


# Initialize RAG for recommendations
hf_embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
vectorstore = Chroma(persist_directory="./chroma_db", embedding_function=hf_embeddings)

def get_status(score):
    if score > 75: return "Green"
    if 50 <= score <= 75: return "Yellow"
    return "Red"

async def get_philosophy_advice(new_status, company_name):
    # Query your specific article philosophy indexed in RAG
    query = f"What is Eshwar's proactive strategy for a customer in {new_status} status?"
    docs = vectorstore.similarity_search(query, k=1)
    return docs[0].page_content if docs else "Maintain proactive alignment."

async def run_agent_loop(company_id):
    last_status = None
    print(f"🚀 Project Prana Agent Loop started for Company: {company_id}")

    while True:
        # 1. Fetch current data from HubSpot
        company_data = await get_company_details(company_id)
        current_score = int(company_data['properties'].get('project_prana_health_score', 0))
        current_status = get_status(current_score)

        # 2. Check for status change
        if current_status != last_status and last_status is not None:
            # 3. Get recommendation from your RAG philosophy
            advice = await get_philosophy_advice(current_status, company_data['properties']['name'])
            
            # 4. Trigger Desktop Notification
            notification = Notify()
            notification.title = f"Health Alert: {company_data['properties']['name']}"
            notification.message = f"Status changed from {last_status} to {current_status}. \nAdvice: {advice[:100]}..."
            notification.send()

            # 5. Log the shift back to HubSpot
            note = f"Status shift detected: {last_status} -> {current_status}. Strategic advice: {advice}"
            await update_company_health(company_id, current_score, note)
            dashboard = generate_dashboard(company_data['properties']['name'], current_score, current_status, time.strftime("%H:%M:%S"))
            console.clear()
            console.print(dashboard)
        last_status = current_status
        time.sleep(60) # Scan every 60 seconds

if __name__ == "__main__":
    # Use your Acme Corp ID from the previous test
    TEST_ID = "313986682611" 
    asyncio.run(run_agent_loop(TEST_ID))