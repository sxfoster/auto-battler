import logging
import traceback
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

    def load(self):
        """
        Loads the Chroma vector store from disk. This is where the import error occurs.
        """
        if self._is_loaded:
            return

        logging.info(f"Attempting to load vector store from: {self.persist_directory}")
        try:
            # This is the line that has been causing all the problems.
            # We isolate it here.
            embeddings = OllamaEmbeddings(model=EMBEDDING_MODEL_NAME)
            self.vector_store = Chroma(
                persist_directory=self.persist_directory,
                embedding_function=embeddings,
                collection_name=DEFAULT_COLLECTION
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
