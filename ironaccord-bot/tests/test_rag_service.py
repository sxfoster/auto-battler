import pytest
import sys

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

    monkeypatch.setattr(rag_service.chromadb, "PersistentClient", dummy_http_client)
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

    monkeypatch.setattr(rag_service.chromadb, "PersistentClient", fail_client)

    service = rag_service.RAGService()
    assert service.vector_store is None
    assert service.query("anything") == []


class DummyCollection:
    def __init__(self, metadata):
        self.metadata = metadata
        self.last_where = None
        self.last_include = None
        self.last_limit = None

    def get(self, *, where=None, include=None, limit=None):
        self.last_where = where
        self.last_include = include
        self.last_limit = limit
        if self.metadata is None:
            return {"metadatas": []}
        return {"metadatas": [self.metadata]}


def _init_service(monkeypatch):
    monkeypatch.setattr(rag_service.chromadb, "PersistentClient", lambda *a, **kw: DummyClient())
    monkeypatch.setattr(rag_service, "HuggingFaceEmbeddings", lambda *a, **kw: DummyEmbeddings())
    monkeypatch.setattr(rag_service, "Chroma", lambda *a, **kw: DummyChroma(*a, **kw))
    return rag_service.RAGService()


def test_get_entity_by_name_returns_metadata(monkeypatch):
    service = _init_service(monkeypatch)
    coll = DummyCollection({"foo": "bar"})
    service.vector_store._collection = coll

    result = service.get_entity_by_name("foo", "npc")

    assert coll.last_where == {
        "$and": [
            {"name": {"$eq": "foo"}},
            {"type": {"$eq": "npc"}},
        ]
    }
    assert coll.last_include == ["metadatas"]
    assert coll.last_limit == 1
    assert result == {"foo": "bar"}


def test_get_entity_by_name_missing(monkeypatch):
    service = _init_service(monkeypatch)
    coll = DummyCollection(None)
    service.vector_store._collection = coll

    result = service.get_entity_by_name("foo", "npc")

    assert result is None
