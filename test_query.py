import sys
import asyncio

# This tells Python to look for code inside the 'ironaccord-bot' directory
sys.path.append('ironaccord-bot')

from services.rag_service import RAGService

async def main():
    """
    Initializes the RAGService and performs a test query.
    """
    print("Initializing RAG service...")
    rag_service = RAGService()

    # It might take a moment for the model to load
    await asyncio.sleep(1)

    query = "Who is Edraz?"
    print(f"\nPerforming query: '{query}'")

    result = await rag_service.query(query)

    print("\n--- Query Result ---")
    if result and result.get("answer"):
        print(f"Answer: {result['answer']}")
        print("\n--- Source Documents ---")
        for doc in result.get("source_documents", []):
            print(f"- {doc.page_content}")
    else:
        print("No answer found or RAG service not fully loaded.")
        print("Ensure the chromadb/ directory exists and is not empty.")


if __name__ == "__main__":
    # On Windows, you might need this policy to run asyncio scripts
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
