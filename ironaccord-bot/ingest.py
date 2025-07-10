import os
import glob
import logging
import chromadb
from langchain.document_loaders import UnstructuredMarkdownLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import HuggingFaceEmbeddings

# --- Configuration ---
# NEW: Define a path for the persistent database directory
CHROMA_DB_PATH = "./chroma_db"
COLLECTION_NAME = "iron_accord_lore"
# Path to your lore documents
DOCS_PATH = "../docs"
# Model used to create embeddings. "all-MiniLM-L6-v2" is a great starting point.
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

# --- Logging Setup ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def ingest_data():
    """
    Connects to a local, persistent ChromaDB; processes and ingests markdown files.
    """
    logging.info("--- Starting Data Ingestion Process (Local Storage Mode) ---")

    # --- 1. Connect to ChromaDB using a persistent local path ---
    try:
        logging.info(f"Initializing local ChromaDB at path: {CHROMA_DB_PATH}")
        client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
        logging.info("Successfully initialized local ChromaDB client.")
    except Exception as e:
        logging.critical(f"Failed to initialize ChromaDB. Check permissions for the path. Error: {e}")
        return

    # --- 2. Get or Create the Collection ---
    logging.info(f"Accessing collection: '{COLLECTION_NAME}'")
    collection = client.get_or_create_collection(name=COLLECTION_NAME)
    logging.info("Collection is ready.")

    # --- 3. Load and Process Documents ---
    logging.info(f"Scanning for documents in: {DOCS_PATH}")
    try:
        md_files = glob.glob(os.path.join(DOCS_PATH, "**/*.md"), recursive=True)
        total_files = len(md_files)
        if total_files == 0:
            logging.error("No markdown documents found. Aborting.")
            return
        logging.info(f"Found {total_files} documents to process.")
    except Exception as e:
        logging.critical(f"Failed to scan for documents. Error: {e}")
        return

    all_docs = []
    for i, doc_path in enumerate(md_files):
        logging.info(f"Loading document [{i+1}/{total_files}]: {os.path.basename(doc_path)}")
        try:
            loader = UnstructuredMarkdownLoader(doc_path, mode="elements")
            docs = loader.load()
            all_docs.extend(docs)
        except Exception as e:
            logging.error(f"Failed to load or process document {doc_path}: {e}")
            continue

    if not all_docs:
        logging.error("No documents were successfully loaded. Aborting ingestion.")
        return

    # --- 4. Split Documents into Chunks ---
    logging.info("Splitting documents into manageable chunks...")
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1024, chunk_overlap=128)
    chunks = text_splitter.split_documents(all_docs)
    logging.info(f"Split documents into {len(chunks)} chunks.")

    # --- 5. Add Chunks to ChromaDB ---
    logging.info("Starting ingestion of chunks into ChromaDB. This may take a while...")

    chunk_texts = [chunk.page_content for chunk in chunks]
    chunk_metadatas = [chunk.metadata for chunk in chunks]
    chunk_ids = [f"chunk_{i}" for i in range(len(chunks))]

    try:
        collection.add(
            documents=chunk_texts,
            metadatas=chunk_metadatas,
            ids=chunk_ids
        )
        logging.info(f"--- Successfully ingested {len(chunks)} chunks into ChromaDB! ---")
    except Exception as e:
        logging.critical(f"Failed during batch ingestion. Error: {e}")

if __name__ == "__main__":
    ingest_data()
