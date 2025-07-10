import logging
from langchain_community.document_loaders import DirectoryLoader
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import OllamaEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

# --- Constants ---
LORE_DIRECTORY = 'docs'
EMBEDDING_MODEL = 'nomic-embed-text'

class RAGService:
    """Service for Retrieval-Augmented Generation (RAG)."""

    def __init__(self) -> None:
        """Load documents and build the vector store."""
        self.vector_store = None
        try:
            logging.info("Initializing RAG Service...")
            loader = DirectoryLoader(LORE_DIRECTORY, glob="**/*.md", show_progress=True)
            docs = loader.load()

            if not docs:
                logging.warning(
                    "No documents found in '%s'. RAG service will be inactive.",
                    LORE_DIRECTORY,
                )
                return

            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000, chunk_overlap=200
            )
            splits = text_splitter.split_documents(docs)

            embeddings = OllamaEmbeddings(model=EMBEDDING_MODEL)
            self.vector_store = FAISS.from_documents(splits, embeddings)
            logging.info(
                "RAG Service initialized successfully. Indexed %s document chunks.",
                len(splits),
            )
        except Exception as e:  # pragma: no cover - initialization safety net
            logging.error("Failed to initialize RAG Service: %s", e, exc_info=True)

    def query_lore(self, question: str) -> str:
        """Retrieve relevant lore text for the given question."""
        if not self.vector_store:
            return "The Codex is currently offline or has no knowledge loaded."

        logging.info("Performing similarity search for query: '%s'", question)
        results = self.vector_store.similarity_search(question, k=3)

        if not results:
            return ""

        context = "\n\n---\n\n".join(doc.page_content for doc in results)
        return context
