import pytest

from services import rag_service


class DummyClient:
    pass


class DummyChroma:
    def __init__(self, *args, **kwargs):
        self.args = args
        self.kwargs = kwargs

    def similarity_search(self, query_text, k=5):
        return [f"result-{i}" for i in range(k)]


class DummyEmbeddings:
    pass


def test_initialize_and_query(monkeypatch):
    created = {}

    def dummy_http_client(*args, **kwargs):
        created["client"] = True
        return DummyClient()

    monkeypatch.setattr(rag_service.chromadb, "HttpClient", dummy_http_client)
    monkeypatch.setattr(rag_service, "HuggingFaceEmbeddings", lambda *a, **kw: DummyEmbeddings())
    monkeypatch.setattr(rag_service, "Chroma", lambda *a, **kw: DummyChroma(*a, **kw))

    service = rag_service.RAGService()

    assert isinstance(service.vector_store, DummyChroma)
    assert created.get("client")

    results = service.query("test", k=2)
    assert results == ["result-0", "result-1"]


def test_query_without_vector_store(monkeypatch):
    def fail_client(*args, **kwargs):
        raise RuntimeError("no connection")

    monkeypatch.setattr(rag_service.chromadb, "HttpClient", fail_client)

    service = rag_service.RAGService()
    assert service.vector_store is None
    assert service.query("anything") == []
