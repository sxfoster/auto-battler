import logging
import traceback
import chromadb
from langchain_community.embeddings import OllamaEmbeddings, HuggingFaceEmbeddings
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
        # Load the vector store immediately so tests have access without
        # calling ``load`` explicitly.
        self.load()

    def load(self):
        """
        Loads the Chroma vector store from disk. This is where the import error occurs.
        """
        if self._is_loaded:
            return

        logging.info(f"Attempting to load vector store from: {self.persist_directory}")
        try:
            embeddings = OllamaEmbeddings(model=EMBEDDING_MODEL_NAME)
            self.client = chromadb.PersistentClient(path=self.persist_directory)
            self.vector_store = Chroma(
                client=self.client,
                collection_name=DEFAULT_COLLECTION,
                embedding_function=embeddings,
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
        """Perform a similarity search on the vector store."""
        if not self.vector_store:
            logging.error("Vector store not available. Cannot perform query.")
            return []

        try:
            return self.vector_store.similarity_search(query_text, k=k)
        except Exception:
            logging.error("An error occurred during the RAG query.")
            return []

    def get_entity_by_name(self, name: str, entity_type: str) -> dict | None:
        """Retrieve an entity's metadata by its name and type."""

        if not self.vector_store:
            logging.error("Vector store not available. Cannot perform query.")
            return None

        where_filter = {
            "$and": [
                {"name": {"$eq": name}},
                {"type": {"$eq": entity_type}},
            ]
        }

        try:
            results = self.vector_store._collection.get(
                where=where_filter,
                limit=1,
                include=["metadatas"],
            )

            if results and results.get("metadatas"):
                return results["metadatas"][0]
            return None
        except Exception:
            logging.error(
                "Error retrieving entity '%s' of type '%s'", name, entity_type
            )
            return None
