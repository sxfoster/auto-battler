import logging
import os
from langchain_community.document_loaders import DirectoryLoader
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import OllamaEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

# --- CORRECTED PATH LOGIC ---
# This gets the directory where rag_service.py is located (e.g., .../ironaccord-bot/services)
SERVICE_DIR = os.path.dirname(os.path.abspath(__file__))
# This constructs a path from there up two levels to the project root, then into 'docs'
LORE_DIRECTORY = os.path.abspath(os.path.join(SERVICE_DIR, '..', '..', 'docs'))

EMBEDDING_MODEL = 'nomic-embed-text'

class RAGService:
    """
    A service to handle the Retrieval-Augmented Generation (RAG) pipeline.
    This includes loading lore documents, creating vector embeddings, and
    retrieving relevant context based on a user's query.
    """

    def __init__(self):
        """
        Initializes the RAG service by loading and processing the lore documents.
        This is a one-time setup process that builds the in-memory vector store.
        """
        self.vector_store = None
        try:
            logging.info("Initializing RAG Service...")

            # This now uses the correct absolute path.
            logging.info(f"Loading documents from: {LORE_DIRECTORY}")
            loader = DirectoryLoader(LORE_DIRECTORY, glob="**/*.md", show_progress=True)
            docs = loader.load()

            if not docs:
                logging.warning(f"No documents found in '{LORE_DIRECTORY}'. RAG service will be inactive.")
                return

            # 2. Split the documents into smaller chunks for better retrieval.
            text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
            splits = text_splitter.split_documents(docs)

            # 3. Create vector embeddings for each chunk using the local Ollama model.
            embeddings = OllamaEmbeddings(model=EMBEDDING_MODEL)

            # 4. Build an in-memory FAISS vector store from the document chunks.
            # This is the "long-term memory" of the bot.
            self.vector_store = FAISS.from_documents(splits, embeddings)
            logging.info(f"RAG Service initialized successfully. Indexed {len(splits)} document chunks.")

        except Exception as e:
            logging.error(f"Failed to initialize RAG Service: {e}", exc_info=True)
            # self.vector_store remains None, so the service will be disabled.

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
