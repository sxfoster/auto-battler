import os
from pathlib import Path
from langchain.schema import Document
from ironaccord_bot import ingest

class DummySplitter:
    def __init__(self, *a, **kw):
        pass
    def split_documents(self, docs):
        DummySplitter.docs = docs
        return docs

class DummyChroma:
    def __init__(self, *a, **kw):
        pass
    @classmethod
    def from_documents(cls, documents, embedding, persist_directory):
        DummyChroma.docs = documents
        DummyChroma.persist_dir = persist_directory
        return cls()
    def persist(self):
        DummyChroma.persisted = True

class DummyEmb:
    pass


def test_ingest_recursively_loads_markdown(tmp_path, monkeypatch):
    data_dir = tmp_path / "data"
    nested = data_dir / "a" / "b"
    nested.mkdir(parents=True)
    (nested / "lore.md").write_text("hello")
    (nested / "README.md").write_text("skip")

    monkeypatch.setattr(ingest, "DATA_DIR", data_dir)
    monkeypatch.setattr(ingest, "DB_DIR", tmp_path / "db")
    monkeypatch.setattr(ingest, "RecursiveCharacterTextSplitter", DummySplitter)
    monkeypatch.setattr(ingest, "Chroma", DummyChroma)
    monkeypatch.setattr(ingest, "SentenceTransformerEmbeddings", lambda *a, **kw: DummyEmb())

    ingest.main()

    assert DummyChroma.persist_dir == str(tmp_path / "db")
    assert all(isinstance(d, Document) for d in DummySplitter.docs)
    assert len(DummyChroma.docs) == len(DummySplitter.docs) == 1


