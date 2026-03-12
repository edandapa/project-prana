import chromadb

# Initialize local database
client = chromadb.PersistentClient(path="./chroma_db")
collection = client.get_or_create_collection(name="travel_rules")

# Add your personal travel "constraints"
rules = [
    "I prefer flights departing after 10:00 AM to avoid the morning rush.",
    "Always flag if a flight has a layover longer than 3 hours.",
    "I prefer United or Delta for the miles.",
    "For short domestic flights, basic economy is fine if it saves >$50."
]

collection.add(
    documents=rules,
    ids=[f"rule_{i}" for i in range(len(rules))]
)
print("✅ RAG database created and rules indexed!")