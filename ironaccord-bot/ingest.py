import os
import sys
import yaml
import shutil # Import the shutil library for directory operations
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import SentenceTransformerEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.docstore.document import Document

# --- Configuration ---
ABS_PATH = os.path.dirname(os.path.abspath(__file__)) 
PROJECT_ROOT = os.path.abspath(os.path.join(ABS_PATH, "..")) 

DB_DIR = os.path.join(PROJECT_ROOT, "chromadb")
DATA_DIR = os.path.join(PROJECT_ROOT, "data")
NPC_DATA_DIR = os.path.join(DATA_DIR, "npcs")
LOCATION_DATA_DIR = os.path.join(DATA_DIR, "locations")

# --- Main Ingestion Logic ---
def main():
    """
    Main function to process all data and ingest it into the vector store.
    """
    # --- NEW: Automated Cleanup Step ---
    print("--- Preparing for Ingestion ---")
    if os.path.exists(DB_DIR):
        print(f"  - Found existing database at {DB_DIR}. Deleting it for a clean rebuild.")
        try:
            shutil.rmtree(DB_DIR)
            print("  - Old database successfully deleted.")
        except Exception as e:
            print(f"  - ERROR: Could not delete old database. Reason: {e}")
            print("  - Please close any programs that might be using the ChromaDB directory and try again.")
            return # Exit if we can't delete the old DB
    else:
        print("  - No existing database found. Proceeding with new creation.")

    documents = []
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)

    # 1. Process structured YAML data
    print("\n--- Processing structured YAML data ---")
    # ... (rest of the script remains the same) ...
    for entity_type, path in [("NPC", NPC_DATA_DIR), ("Location", LOCATION_DATA_DIR)]:
        if os.path.exists(path):
            for filename in os.listdir(path):
                if filename.endswith(".yaml"):
                    try:
                        with open(os.path.join(path, filename), 'r', encoding='utf-8') as f:
                            data = yaml.safe_load(f)
                            content = f"Entity Type: {entity_type}\n"
                            for key, value in data.items():
                                content += f"{key}: {value}\n"
                            
                            doc = Document(page_content=content, metadata={"source": filename})
                            documents.append(doc)
                            print(f"  - Loaded {entity_type}: {data.get('name', filename)}")
                    except Exception as e:
                        print(f"  - ERROR: Failed to process YAML file {filename}. Reason: {e}")
        else:
             print(f"  - Directory not found for {entity_type}: {path}")


    # 2. Process unstructured markdown data
    print("\n--- Processing unstructured markdown data ---")
    if os.path.exists(DATA_DIR):
        for filename in os.listdir(DATA_DIR):
            if filename.endswith(".md"):
                file_path = os.path.join(DATA_DIR, filename)
                print(f"  - Loading markdown file: {filename}")
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        text = f.read()
                    
                    metadata = {"source": filename}
                    doc = Document(page_content=text, metadata=metadata)
                    
                    split_docs = text_splitter.split_documents([doc])
                    documents.extend(split_docs)
                    print(f"    - Success! Split into {len(split_docs)} chunks.")
                except Exception as e:
                    print(f"    - ERROR: Failed to load or split {filename}. Reason: {e}")
                    continue
    else:
        print(f"  - Data directory not found: {DATA_DIR}")


    # 3. Create vector store from all processed documents
    if not documents:
        print("\nNo documents found to ingest. Exiting.")
        return

    print(f"\n--- Ingesting {len(documents)} document chunks into ChromaDB ---")
    embedding_function = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")

    print("  - Calculating embeddings and building the vector store... (This may take a moment)")
    
    try:
        Chroma.from_documents(
            documents=documents,
            embedding=embedding_function,
            persist_directory=DB_DIR
        )
    except Exception as e:
        print(f"  - FATAL ERROR: Failed during ChromaDB creation. Reason: {e}")
        return

    print("\n--- Ingestion Complete! ---")
    print(f"Vector store created/updated at: {DB_DIR}")


if __name__ == "__main__":
    main()
