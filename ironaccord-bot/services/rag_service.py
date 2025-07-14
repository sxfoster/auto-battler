import logging
import traceback

try:
    import chromadb
except Exception:  # pragma: no cover - optional dependency
    import types

    chromadb = types.SimpleNamespace(PersistentClient=None)
from langchain_community.embeddings import (
    OllamaEmbeddings,
    HuggingFaceEmbeddings,
)
from langchain_community.vectorstores import Chroma

# --- CONSTANTS ---
CHROMA_PATH = "./db"
EMBEDDING_MODEL_NAME = "nomic-embed-text"
DEFAULT_COLLECTION = "ironaccord"

class RAGService:
    def __init__(self, persist_directory: str = CHROMA_PATH):
        """
        Initializes the RAGService. Does NOT load the vector store.
        """
        self.persist_directory = persist_directory
        self.vector_store = None
        self._is_loaded = False
        logging.info("RAGService initialized but not yet loaded.")
        # Automatically attempt to load the vector store so the service is
        # ready for immediate use in most scenarios.
        self.load()

    def load(self):
        """
        Loads the Chroma vector store from disk. This is where the import error occurs.
        """
        if self._is_loaded:
            return

        logging.info(f"Attempting to load vector store from: {self.persist_directory}")
        try:
            # Instantiate a persistent Chroma client and load the vector store.
            client = chromadb.PersistentClient(path=self.persist_directory)
            embeddings = OllamaEmbeddings(model=EMBEDDING_MODEL_NAME)
            self.vector_store = Chroma(
                client=client,
                persist_directory=self.persist_directory,
                embedding_function=embeddings,
                collection_name=DEFAULT_COLLECTION,
            )
            self._is_loaded = True
            logging.info("RAG Service loaded successfully.")
        except Exception:
            logging.error("CRITICAL: Failed to load Chroma vector store.")
            traceback.print_exc()
            self.vector_store = None
            self._is_loaded = False

    def get_retriever(self):
        """
        Gets the retriever if the store is loaded.
        """
        if not self._is_loaded:
            self.load()  # Attempt to load on-demand

        if self.vector_store:
            return self.vector_store.as_retriever()
        else:
            logging.error("Cannot get retriever, RAG store is not available.")
            return None

    def query(self, query_text: str, k: int = 5):
        """Return documents similar to ``query_text`` using the vector store."""
        if not self.vector_store:
            self.load()

        if not self.vector_store:
            return []

        try:
            return self.vector_store.similarity_search(query_text, k=k)
        except Exception:
            logging.error("RAG similarity search failed.", exc_info=True)
            return []

    def get_entity_by_name(self, name: str, entity_type: str):
        """Return the first metadata entry matching ``name`` and ``entity_type``."""
        if not self.vector_store:
            self.load()

        if not self.vector_store or not hasattr(self.vector_store, "_collection"):
            return None

        where = {
            "$and": [
                {"name": {"$eq": name}},
                {"type": {"$eq": entity_type}},
            ]
        }

        try:
            result = self.vector_store._collection.get(
                where=where, include=["metadatas"], limit=1
            )
            metadatas = result.get("metadatas", [])
            return metadatas[0] if metadatas else None
        except Exception:
            logging.error("Failed to fetch entity metadata from vector store.", exc_info=True)
            return None
