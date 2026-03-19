from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

# 1. Initialize the same local embeddings and database
model_name = "sentence-transformers/all-MiniLM-L6-v2"
hf_embeddings = HuggingFaceEmbeddings(model_name=model_name)
vectorstore = Chroma(persist_directory="./chroma_db", embedding_function=hf_embeddings)

# 2. Ask a question about the DEAR framework
query = "AI-driven intervention"
docs = vectorstore.similarity_search(query, k=2)

print("\n--- Agent's Found Knowledge ---")
for i, doc in enumerate(docs):
    source = doc.metadata.get("source_type", "unknown")
    print(f"\n[Source: {source}]")
    print(doc.page_content)