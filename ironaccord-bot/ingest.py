import os
import yaml
from tqdm import tqdm
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import SentenceTransformerEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import DirectoryLoader, UnstructuredMarkdownLoader
from langchain.docstore.document import Document

# --- Configuration ---
ABS_PATH = os.path.dirname(os.path.abspath(__file__))
DB_DIR = os.path.join(ABS_PATH, "../../", "chromadb")
DATA_DIR = os.path.join(ABS_PATH, "../../", "data")
NPC_DATA_DIR = os.path.join(DATA_DIR, "npcs")
LOCATION_DATA_DIR = os.path.join(DATA_DIR, "locations")

# --- Main Ingestion Logic ---
def main():
    """
    Main function to process all data and ingest it into the vector store.
    """
    documents = []
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)

    # 1. Process structured YAML data
    print("--- Processing structured YAML data ---")
    for entity_type, path in [("NPC", NPC_DATA_DIR), ("Location", LOCATION_DATA_DIR)]:
        if os.path.exists(path):
            for filename in os.listdir(path):
                if filename.endswith(".yaml"):
                    with open(os.path.join(path, filename), 'r') as f:
                        data = yaml.safe_load(f)
                        # Create a Document object from the YAML content
                        content = f"Entity Type: {entity_type}\n"
                        for key, value in data.items():
                            content += f"{key}: {value}\n"
                        
                        doc = Document(page_content=content, metadata={"source": filename})
                        documents.append(doc)
                        print(f"  - Loaded {entity_type}: {data.get('name', filename)}")

    # 2. Process unstructured markdown data
    print("\n--- Processing unstructured markdown data ---")
    if os.path.exists(DATA_DIR):
        loader = DirectoryLoader(DATA_DIR, glob="**/*.md", loader_cls=UnstructuredMarkdownLoader, show_progress=True)
        markdown_docs = loader.load()
        if markdown_docs:
            split_docs = text_splitter.split_documents(markdown_docs)
            documents.extend(split_docs)
            print(f"  - Loaded and split {len(markdown_docs)} markdown file(s) into {len(split_docs)} chunks.")
        else:
            print("  - No markdown files found to process.")
    else:
        print(f"  - Directory not found: {DATA_DIR}")


    # 3. Create vector store from all processed documents
    if not documents:
        print("\nNo documents found to ingest. Exiting.")
        return

    print(f"\n--- Ingesting {len(documents)} document chunks into ChromaDB ---")
    embedding_function = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")

    # This is a blocking call, so we let the user know what's happening.
    print("  - Calculating embeddings and building the vector store... (This may take a moment)")
    
    # We will still use from_documents for efficiency, but now the user knows why it's \"hanging\".
    Chroma.from_documents(
        documents=documents,
        embedding=embedding_function,
        persist_directory=DB_DIR
    )

    print("\n--- Ingestion Complete! ---")
    print(f"Vector store created/updated at: {DB_DIR}")


if __name__ == "__main__":
    main()
