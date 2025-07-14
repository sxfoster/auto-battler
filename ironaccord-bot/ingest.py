import os
import yaml
from langchain.schema import Document
from langchain_community.vectorstores import Chroma
from services.rag_service import DEFAULT_COLLECTION
try:  # OllamaEmbeddings may not be available during testing
    from langchain_community.embeddings import OllamaEmbeddings
except Exception:  # pragma: no cover - provide lightweight fallback
    class OllamaEmbeddings:  # type: ignore
        def __init__(self, *a, **kw):
            pass
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import DirectoryLoader, UnstructuredMarkdownLoader

DATA_PATH = "data"
DB_PATH = "db"


def sanitize_metadata(metadata: dict) -> dict:
    """Ensure metadata only contains simple types supported by ChromaDB."""
    sanitized = {}
    for key, value in metadata.items():
        if isinstance(value, list):
            sanitized[key] = "\n".join(map(str, value))
        elif isinstance(value, dict):
            # Convert nested dictionaries to a string representation
            sanitized[key] = str(value)
        elif isinstance(value, (str, int, float, bool)) or value is None:
            sanitized[key] = value
        else:
            sanitized[key] = str(value)
    return sanitized


def ingest_data():
    """Ingest structured YAML and unstructured Markdown data into the vector store."""

    all_documents = []

    print("Processing structured YAML data...")
    for root, _, files in os.walk(DATA_PATH):
        for filename in files:
            if filename.endswith(".yaml"):
                file_path = os.path.join(root, filename)
                with open(file_path, "r") as f:
                    data = yaml.safe_load(f)

                if (
                    isinstance(data, dict)
                    and "name" in data
                    and "type" in data
                    and "description" in data
                ):
                    doc = Document(
                        page_content=data.get("description", ""),
                        metadata=sanitize_metadata(data),
                    )
                    all_documents.append(doc)
                    print(f"  - Loaded entity: {data['name']}")
                else:
                    print(f"  - WARNING: Skipping {filename}, missing required fields.")

    print("Checking for unstructured markdown data...")
    md_paths = ["docs", DATA_PATH]
    found_any = False
    for md_path in md_paths:
        if os.path.exists(md_path) and os.path.isdir(md_path):
            print(f"Processing markdown data in '{md_path}'...")
            markdown_loader = DirectoryLoader(
                md_path, glob="**/*.md", loader_cls=UnstructuredMarkdownLoader, show_progress=True
            )
            markdown_docs = markdown_loader.load()
            all_documents.extend(markdown_docs)
            found_any = True
    if not found_any:
        print("  - No markdown directories found, skipping markdown ingestion.")

    print("Splitting documents and creating vector store...")
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=750, chunk_overlap=50)
    splits = text_splitter.split_documents(all_documents)

    vector_store = Chroma.from_documents(
        documents=splits,
        embedding=OllamaEmbeddings(model="nomic-embed-text", show_progress=True),
        collection_name=DEFAULT_COLLECTION,
        persist_directory=DB_PATH,
    )

    vector_store.persist()
    print("Ingestion complete. Database persisted.")


if __name__ == "__main__":
    ingest_data()
