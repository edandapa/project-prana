import os
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

def ingest_all_knowledge():
    # 1. Initialize local embeddings (Zero-cost, runs locally)
    model_name = "sentence-transformers/all-MiniLM-L6-v2"
    hf_embeddings = HuggingFaceEmbeddings(model_name=model_name)
    
    all_documents = []
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)

    # 2. Load the "Primary Directive" (Gainsight Logic)
    if os.path.exists("data/dear_logic.md"):
        rule_loader = TextLoader("data/dear_logic.md")
        rules = rule_loader.load()
        for r in rules: 
            r.metadata["source_type"] = "primary_directive"
        all_documents.extend(text_splitter.split_documents(rules))

    # 3. Load the "Strategic Philosophy" (Your AI-driven CS approach)
    if os.path.exists("data/eshwar_philosophy.md"):
        philosophy_loader = TextLoader("data/eshwar_philosophy.md")
        philosophy = philosophy_loader.load()
        for p in philosophy: 
            p.metadata["source_type"] = "strategy_philosophy"
        all_documents.extend(text_splitter.split_documents(philosophy))

    # 4. Load the "Extended Library" (The Gainsight PDF)
    if os.path.exists("data/DEAR-Ebook-Gainsight.pdf"):
        pdf_loader = PyPDFLoader("data/DEAR-Ebook-Gainsight.pdf")
        library = pdf_loader.load()
        for l in library: 
            l.metadata["source_type"] = "extended_library"
        all_documents.extend(text_splitter.split_documents(library))

    # 5. Create and persist the vector store
    if all_documents:
        vectorstore = Chroma.from_documents(
            documents=all_documents, 
            embedding=hf_embeddings,
            persist_directory="./chroma_db"
        )
        print(f"Ingestion complete. {len(all_documents)} total chunks indexed across 3 sources.")
    else:
        print("No documents found in the 'data' folder to ingest.")

if __name__ == "__main__":
    ingest_all_knowledge()