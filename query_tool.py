import sys
import asyncio
sys.path.append('ironaccord_bot')
from services.rag_service import RAGService

async def main():
    """ Initializes the RAGService and performs a test query to verify the system. """
    print("--- Initializing RAG Service ---")
    try:
        rag_service = RAGService(persist_directory="ironaccord_bot/db")
        await asyncio.sleep(1)
        print("Service initialized successfully.")
    except Exception as e:
        print(f"FATAL: Could not initialize RAGService. Error: {e}")
        print("Please ensure you have run 'pip install -r requirements.txt' and that 'ingest.py' has been run successfully.")
        return

    query = "Who is Edraz?"
    print(f"\n--- Performing Query ---")
    print(f"Asking: '{query}'")

    try:
        if asyncio.iscoroutinefunction(rag_service.query):
            result = await rag_service.query(query)
        else:
            result = rag_service.query(query)
    except Exception as e:
        print(f"FATAL: An error occurred during the query. Error: {e}")
        return

    print("\n--- Query Result ---")
    if isinstance(result, dict) and result.get("answer"):
        print(f"Answer: {result['answer']}")
        print("\n--- Source Documents ---")
        for doc in result.get("source_documents", []):
            print(f"Source Text: {doc.page_content}")
    elif isinstance(result, list) and result:
        print(f"Answer: {result[0].page_content}")
    else:
        print("No answer was found. The database might be empty or the service failed.")

if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
