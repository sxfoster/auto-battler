import pathlib, sys
sys.path.append(str(pathlib.Path(__file__).resolve().parent / "ironaccord-bot"))
import ironaccord_bot
import asyncio
from ironaccord_bot.services.rag_service import RAGService

async def main():
    """Initializes the RAGService and performs a test query."""
    print("Initializing RAG service...")
    rag_service = RAGService()
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
        print("No answer found.")

if __name__ == "__main__":
    asyncio.run(main())
