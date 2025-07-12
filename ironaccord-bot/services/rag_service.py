import logging
import chromadb
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings

logger = logging.getLogger(__name__)

class RAGService:
    """Service to connect to a persistent ChromaDB vector store and perform queries."""

    def __init__(self, db_path="./chroma_db", collection_name="iron_accord_lore"):
        self.db_path = db_path
        self.collection_name = collection_name
        self.client = None
        self.vector_store = None
        self._initialize()

    def _initialize(self):
        """Connects to the local ChromaDB and initializes the vector store."""
        logger.info("Initializing RAG Service (Local Storage Mode)...")
        try:
            # 1. Connect to the same persistent local path
            self.client = chromadb.PersistentClient(path=self.db_path)
            logger.info(f"Successfully initialized local ChromaDB client from path: {self.db_path}")

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
            logger.critical(f"Failed to initialize RAG Service from path '{self.db_path}'.")
            logger.critical(f"Have you run 'python ingest.py' first to create the database? Error: {e}")
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

    def get_entity_by_name(self, name: str) -> dict:
        """Return YAML data for an entity by ``name`` if available."""
        import yaml  # Local import avoids dependency when unused
        from pathlib import Path

        key = name.lower()
        search_paths = [
            Path("ironaccord-bot/data/locations") / f"{key}.yaml",
            Path("ironaccord-bot/data/npcs") / f"{key}.yaml",
        ]
        for path in search_paths:
            try:
                if path.exists():
                    with path.open("r", encoding="utf-8") as f:
                        return yaml.safe_load(f) or {}
            except Exception as exc:  # pragma: no cover - unexpected file errors
                logger.error("Failed to read %s: %s", path, exc)
        return {}

    def get_character_section(self, character_name: str, section_name: str) -> str:
        """Retrieve a specific section of lore for a character."""
        if not self.vector_store:
            logger.error("Vector store not available. Cannot perform query.")
            return ""

        try:
            results = self.vector_store._collection.query(
                query_texts=[f"Retrieve the {section_name} for {character_name}"],
                where={"character_name": character_name, "section": section_name},
                n_results=1,
            )

            if results and results.get("documents") and results["documents"][0]:
                return results["documents"][0][0]

            return f"Section '{section_name}' not found for character '{character_name}'."
        except Exception as e:
            logger.error(
                f"Error retrieving section '{section_name}' for character '{character_name}': {e}"
            )
            return ""
