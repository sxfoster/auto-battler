import os
import glob
import logging
import chromadb
import yaml
from types import SimpleNamespace
from langchain.text_splitter import MarkdownHeaderTextSplitter

# --- Configuration ---
# NEW: Define a path for the persistent database directory
CHROMA_DB_PATH = "./chroma_db"
COLLECTION_NAME = "iron_accord_lore"
# Path to your lore documents
DOCS_PATH = "../docs"
# NEW: Paths to YAML data
DATA_LOCATIONS_PATH = "../data/locations"
DATA_NPCS_PATH = "../data/npcs"
# Model used to create embeddings. "all-MiniLM-L6-v2" is a great starting point.
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

# --- Logging Setup ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# NEW: Helper function to clean up metadata for ChromaDB
def sanitize_metadata(metadata: dict) -> dict:
    """Sanitize metadata values to ensure compatibility with ChromaDB."""
    sanitized = {}
    for key, value in metadata.items():
        if isinstance(value, list):
            sanitized[key] = ", ".join(map(str, value))
        elif isinstance(value, (str, int, float, bool)) or value is None:
            sanitized[key] = value
        else:
            sanitized[key] = str(value)
    return sanitized

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

    # --- 2. Reset the Collection ---
    logging.info(f"Resetting collection: '{COLLECTION_NAME}'")
    try:
        client.delete_collection(name=COLLECTION_NAME)
        logging.info("Existing collection deleted.")
    except Exception:
        logging.info("No existing collection to delete or deletion failed; continuing with fresh collection.")

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

    all_chunks = []
    splitter = MarkdownHeaderTextSplitter(headers_to_split_on=[("#", "character_name"), ("##", "section")])

    for i, doc_path in enumerate(md_files):
        logging.info(f"Processing document [{i+1}/{total_files}]: {os.path.basename(doc_path)}")
        try:
            with open(doc_path, "r", encoding="utf-8") as f:
                text = f.read()
            docs = splitter.split_text(text)
            for doc in docs:
                doc.metadata["source"] = os.path.basename(doc_path)
            all_chunks.extend(docs)
        except Exception as e:
            logging.error(f"Failed to process document {doc_path}: {e}")
            continue

    # --- NEW: Load YAML files from data directories ---
    yaml_files = []
    for path in (DATA_LOCATIONS_PATH, DATA_NPCS_PATH):
        logging.info(f"Scanning for YAML files in: {path}")
        if os.path.isdir(path):
            yaml_files.extend(glob.glob(os.path.join(path, "**/*.yml"), recursive=True))
            yaml_files.extend(glob.glob(os.path.join(path, "**/*.yaml"), recursive=True))
        else:
            logging.warning(f"Directory not found: {path}")

    logging.info(f"Found {len(yaml_files)} YAML files to process.")

    TEXT_FIELDS = {"description", "atmosphere"}
    for yaml_path in yaml_files:
        logging.info(f"Processing YAML file: {os.path.basename(yaml_path)}")
        try:
            with open(yaml_path, "r", encoding="utf-8") as f:
                data = yaml.safe_load(f) or {}
            if not isinstance(data, dict):
                logging.warning(f"Skipping {yaml_path}: root element is not a mapping")
                continue
            text_parts = [v for k, v in data.items() if k.lower() in TEXT_FIELDS and isinstance(v, str)]
            content = "\n\n".join(text_parts) if text_parts else ""
            meta = data.copy()
            meta["source"] = os.path.basename(yaml_path)
            doc = SimpleNamespace(page_content=content, metadata=meta)
            all_chunks.append(doc)
        except Exception as e:
            logging.error(f"Failed to process YAML file {yaml_path}: {e}")
            continue

    if not all_chunks:
        logging.error("No document sections were successfully parsed. Aborting ingestion.")
        return

    chunks = all_chunks
    logging.info(f"Split documents into {len(chunks)} chunks based on headings.")

    # --- 5. Add Chunks to ChromaDB ---
    logging.info("Starting ingestion of chunks into ChromaDB. This may take a while...")

    chunk_texts = [chunk.page_content for chunk in chunks]
    # NEW: Apply the sanitization function to each chunk's metadata
    chunk_metadatas = [sanitize_metadata(chunk.metadata) for chunk in chunks]
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
