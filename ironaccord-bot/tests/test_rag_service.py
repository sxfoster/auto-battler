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
    def __init__(self, document):
        self.document = document
        self.last_where = None
        self.last_include = None
        self.last_limit = None

    def get(self, *, where=None, include=None, limit=None):
        self.last_where = where
        self.last_include = include
        self.last_limit = limit
        return {"documents": [self.document]}


def _init_service(monkeypatch):
    monkeypatch.setattr(rag_service.chromadb, "PersistentClient", lambda *a, **kw: DummyClient())
    monkeypatch.setattr(rag_service, "HuggingFaceEmbeddings", lambda *a, **kw: DummyEmbeddings())
    monkeypatch.setattr(rag_service, "Chroma", lambda *a, **kw: DummyChroma(*a, **kw))
    return rag_service.RAGService()


def test_get_entity_by_name_parses_yaml(monkeypatch):
    service = _init_service(monkeypatch)
    coll = DummyCollection("foo: bar")
    service.vector_store._collection = coll

    parsed = {"foo": "bar"}

    import types

    fake_yaml = types.SimpleNamespace(safe_load=lambda x: parsed)
    monkeypatch.setitem(sys.modules, "yaml", fake_yaml)

    result = service.get_entity_by_name("foo", "npc")

    assert coll.last_where == {"name": "foo", "type": "npc"}
    assert result == parsed


def test_get_entity_by_name_without_yaml(monkeypatch):
    service = _init_service(monkeypatch)
    coll = DummyCollection("foo: bar")
    service.vector_store._collection = coll

    import builtins
    orig_import = builtins.__import__

    def fake_import(name, globals=None, locals=None, fromlist=(), level=0):
        if name == "yaml":
            raise ModuleNotFoundError
        return orig_import(name, globals, locals, fromlist, level)

    monkeypatch.setattr(builtins, "__import__", fake_import)

    result = service.get_entity_by_name("foo", "npc")

    assert result == "foo: bar"
