import logging
import chromadb
from langchain.vectorstores import Chroma
from langchain.embeddings import HuggingFaceEmbeddings

logger = logging.getLogger(__name__)

class RAGService:
    """Service to connect to a persistent ChromaDB vector store and perform queries."""

    def __init__(self, host="localhost", port="8000", collection_name="iron_accord_lore"):
        self.host = host
        self.port = port
        self.collection_name = collection_name
        self.client = None
        self.vector_store = None
        self._initialize()

    def _initialize(self):
        """Connects to the ChromaDB server and initializes the vector store."""
        logger.info("Initializing RAG Service...")
        try:
            # 1. Connect to the running ChromaDB instance
            self.client = chromadb.HttpClient(host=self.host, port=self.port)
            logger.info(f"Successfully connected to ChromaDB at {self.host}:{self.port}")

            # 2. Initialize the LangChain vector store object
            embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
            self.vector_store = Chroma(
                client=self.client,
                collection_name=self.collection_name,
                embedding_function=embeddings,
            )
            logger.info(
                f"RAG Service connected to collection '{self.collection_name}'. Ready for queries."
            )

        except Exception as e:
            logger.critical("Failed to initialize RAG Service. Is ChromaDB running and populated?")
            logger.critical(f"Run 'python ingest.py' to populate the database. Error: {e}")
            self.vector_store = None

    def query(self, query_text: str, k: int = 5):
        """Performs a similarity search on the vector store."""
        if not self.vector_store:
            logger.error("Vector store not available. Cannot perform query.")
            return []

        logger.info(f"Performing RAG query for: '{query_text}'")
        try:
            results = self.vector_store.similarity_search(query_text, k=k)
            return results
        except Exception as e:
            logger.error(f"An error occurred during the RAG query: {e}")
            return []
