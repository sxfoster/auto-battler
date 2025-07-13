import os
import yaml
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import OllamaEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import DirectoryLoader, UnstructuredMarkdownLoader

DATA_PATH = "data"
DB_PATH = "db"


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
                    doc = {"page_content": data["description"], "metadata": data}
                    all_documents.append(doc)
                    print(f"  - Loaded entity: {data['name']}")
                else:
                    print(f"  - WARNING: Skipping {filename}, missing required fields.")

    print("Checking for unstructured markdown data...")
    docs_path = "docs"
    if os.path.exists(docs_path) and os.path.isdir(docs_path):
        print("Processing unstructured markdown data...")
        markdown_loader = DirectoryLoader(
            docs_path, glob="**/*.md", loader_cls=UnstructuredMarkdownLoader, show_progress=True
        )
        markdown_docs = markdown_loader.load()
        all_documents.extend(markdown_docs)
    else:
        print("  - 'docs' directory not found, skipping markdown ingestion.")

    print("Splitting documents and creating vector store...")
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=750, chunk_overlap=50)
    splits = text_splitter.split_documents(all_documents)

    vector_store = Chroma.from_documents(
        documents=splits,
        embedding=OllamaEmbeddings(model="nomic-embed-text", show_progress=True),
        collection_name="ironaccord-lore",
        persist_directory=DB_PATH,
    )

    vector_store.persist()
    print("Ingestion complete. Database persisted.")


if __name__ == "__main__":
    ingest_data()
