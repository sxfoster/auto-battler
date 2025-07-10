import logging
import os
from langchain_community.document_loaders import DirectoryLoader
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import OllamaEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

# --- Constants ---
# Correctly navigate up two directories to the project root, then into 'docs'
SERVICE_DIR = os.path.dirname(os.path.abspath(__file__))
LORE_DIRECTORY = os.path.abspath(os.path.join(SERVICE_DIR, '..', '..', 'docs'))
# --- NEW: Define a path for the cached vector store ---
FAISS_INDEX_PATH = os.path.abspath(os.path.join(SERVICE_DIR, '..', 'cache', 'faiss_index'))
CACHE_DIRECTORY = os.path.dirname(FAISS_INDEX_PATH)

EMBEDDING_MODEL = 'nomic-embed-text'

class RAGService:
    """Handle the Retrieval-Augmented Generation (RAG) pipeline with caching."""

    def __init__(self):
        """Load a cached FAISS index or build a new one if needed."""
        self.vector_store = None
        logging.info("Initializing RAG Service...")

        # --- Verify cache directory exists and is writable ---
        if not os.path.isdir(CACHE_DIRECTORY):
            try:
                os.makedirs(CACHE_DIRECTORY, exist_ok=True)
                logging.info(
                    f"Cache directory not found. Creating directory at {CACHE_DIRECTORY}."
                )
            except Exception as e:
                logging.critical(
                    f"Failed to create cache directory {CACHE_DIRECTORY}. Error: {e}. Halting startup."
                )
                raise

        if os.access(CACHE_DIRECTORY, os.W_OK):
            logging.info(f"Cache directory {CACHE_DIRECTORY} is writable.")
        else:
            logging.critical(
                f"Insufficient permissions to write to cache directory {CACHE_DIRECTORY}. Please check folder permissions. Halting startup."
            )
            raise PermissionError(
                f"Cache directory {CACHE_DIRECTORY} is not writable"
            )

        embeddings = OllamaEmbeddings(model=EMBEDDING_MODEL)

        if os.path.exists(FAISS_INDEX_PATH):
            logging.info(f"Loading cached FAISS index from: {FAISS_INDEX_PATH}")
            try:
                self.vector_store = FAISS.load_local(
                    FAISS_INDEX_PATH,
                    embeddings,
                    allow_dangerous_deserialization=True,
                )
                logging.info("Successfully loaded RAG index from cache.")
            except Exception as e:
                logging.error(
                    f"Failed to load cached index. Rebuilding... Error: {e}"
                )
                self._build_and_cache_index(embeddings)
        else:
            self._build_and_cache_index(embeddings)

    def _build_and_cache_index(self, embeddings: OllamaEmbeddings) -> None:
        """Build the FAISS index from lore documents and cache it."""
        try:
            logging.warning(
                "No cached index found. Building new RAG index from scratch."
            )
            logging.warning(
                "This is a one-time process and may take several minutes..."
            )

            logging.info(f"Loading documents from: {LORE_DIRECTORY}")
            loader = DirectoryLoader(LORE_DIRECTORY, glob="**/*.md", show_progress=True)
            docs = loader.load()

            if not docs:
                logging.warning(
                    f"No documents found in '{LORE_DIRECTORY}'. RAG service will be inactive."
                )
                return

            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000, chunk_overlap=200
            )
            splits = text_splitter.split_documents(docs)

            logging.info(
                f"Creating embeddings for {len(splits)} document chunks. This is the slow part..."
            )
            self.vector_store = FAISS.from_documents(splits, embeddings)
            logging.info("Vector store created successfully.")

            os.makedirs(os.path.dirname(FAISS_INDEX_PATH), exist_ok=True)
            self.vector_store.save_local(FAISS_INDEX_PATH)
            logging.info(f"RAG index has been cached to: {FAISS_INDEX_PATH}")

        except Exception as e:  # pragma: no cover - safety net
            logging.error(
                f"Failed to build and cache RAG index: {e}", exc_info=True
            )
            self.vector_store = None

    def query_lore(self, question: str) -> str:
        """
        Queries the vector store to find lore relevant to the user's question.

        Args:
            question: The user's query about the game world.

        Returns:
            A string containing the concatenated content of the most relevant
            document chunks, or an empty string if no context is found.
        """
        if not self.vector_store:
            return "The Codex is currently offline or has no knowledge loaded."

        logging.info(f"Performing similarity search for query: '{question}'")
        # Find the top 3 most relevant document chunks.
        results = self.vector_store.similarity_search(question, k=3)

        if not results:
            return ""  # Return empty string if no relevant documents are found

        # Combine the content of the found documents into a single context string.
        context = "\n\n---\n\n".join([doc.page_content for doc in results])
        return context
