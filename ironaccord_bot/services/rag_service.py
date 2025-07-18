import os
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import SentenceTransformerEmbeddings
from langchain_community.llms import Ollama
from langchain.prompts import PromptTemplate
from langchain.chains import RetrievalQA
from chromadb.config import Settings

# Define paths and constants
ABS_PATH = os.path.dirname(os.path.abspath(__file__))
DB_DIR = os.path.join(ABS_PATH, "../../", "chromadb")
DEFAULT_COLLECTION = "lore"


class RAGService:
    """Simple Retrieval-Augmented Generation wrapper around LangChain.

    Documents are embedded and stored in a local Chroma database. Queries are
    answered by retrieving the most relevant chunks and feeding them to a local
    LLM hosted by Ollama.
    """

    def __init__(self):
        """Set up the vector store and LLM used for answering questions."""

        self.embedding_function = SentenceTransformerEmbeddings(
            model_name="all-MiniLM-L6-v2"
        )
        self.vector_store = Chroma(
            persist_directory=DB_DIR,
            embedding_function=self.embedding_function,
            client_settings=Settings(anonymized_telemetry=False),
        )

        self.llm = Ollama(model="mixtral")

        # Define the prompt template
        prompt_template = """
        Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.
        {context}
        Question: {question}
        Helpful Answer:"""
        qa_prompt = PromptTemplate(
            template=prompt_template, input_variables=["context", "question"]
        )

        # Create the QA Chain
        self.qa_chain = RetrievalQA.from_chain_type(
            llm=self.llm,
            chain_type="stuff",
            retriever=self.vector_store.as_retriever(),
            return_source_documents=True,
            chain_type_kwargs={"prompt": qa_prompt},
        )
        print("RAGService initialized with local Ollama model.")

    def query(self, query_text: str) -> dict:
        """Query the knowledge base and return the answer.

        Args:
            query_text: Natural language question posed by the user.

        Returns:
            Dictionary containing ``answer`` and ``source_documents`` entries.
        """
        raw_result = self.qa_chain({"query": query_text})
        answer = raw_result.get("result", "No answer could be generated.")
        source_docs = raw_result.get("source_documents", [])

        return {"answer": answer, "source_documents": source_docs}
