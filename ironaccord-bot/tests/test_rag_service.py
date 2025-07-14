import types
from services import rag_service

class DummyQA:
    def __init__(self):
        self.last_query = None
    def __call__(self, inp):
        self.last_query = inp
        return {"result": "answer", "source_documents": ["doc"]}

def _init_service(monkeypatch):
    monkeypatch.setattr(rag_service, "SentenceTransformerEmbeddings", lambda *a, **kw: object())
    class DummyChroma:
        def __init__(self, *a, **kw):
            pass
        def as_retriever(self):
            return None
    monkeypatch.setattr(rag_service, "Chroma", DummyChroma)
    monkeypatch.setattr(rag_service, "Ollama", lambda *a, **kw: object())
    dummy = DummyQA()
    monkeypatch.setattr(rag_service.RetrievalQA, "from_chain_type", classmethod(lambda cls, **kw: dummy))
    service = rag_service.RAGService()
    return service, dummy

def test_query_returns_dict(monkeypatch):
    service, dummy = _init_service(monkeypatch)
    result = service.query("hi")
    assert result == {"answer": "answer", "source_documents": ["doc"]}
    assert dummy.last_query == {"query": "hi"}
