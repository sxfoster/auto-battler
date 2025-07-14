import os
from pathlib import Path
from types import SimpleNamespace
from langchain.schema import Document
from importlib import import_module
ingest = import_module('ironaccord-bot.ingest')

class DummyLoader:
    def __init__(self, *a, **kw):
        self.docs = [Document(page_content="md", metadata={"src": "m"})]
    def load(self):
        return self.docs

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
    def from_documents(cls, documents, embedding, collection_name, persist_directory):
        DummyChroma.docs = documents
        DummyChroma.persist_dir = persist_directory
        return cls()
    def persist(self):
        DummyChroma.persisted = True

class DummyEmb:
    pass


def test_ingest_mixed_sources(tmp_path, monkeypatch):
    data_dir = tmp_path / "data"
    data_dir.mkdir()
    yaml_file = data_dir / "npc.yaml"
    yaml_file.write_text("""\nname: Test\ntype: npc\ndescription: hi\n""")
    docs_dir = tmp_path / "docs"
    docs_dir.mkdir()

    monkeypatch.setattr(ingest, "DATA_PATH", str(data_dir))
    monkeypatch.setattr(ingest, "DB_PATH", str(tmp_path / "db"))
    monkeypatch.setattr(ingest, "DirectoryLoader", DummyLoader)
    monkeypatch.setattr(ingest, "RecursiveCharacterTextSplitter", DummySplitter)
    monkeypatch.setattr(ingest, "Chroma", DummyChroma)
    monkeypatch.setattr(ingest, "OllamaEmbeddings", lambda *a, **kw: DummyEmb())

    ingest.ingest_data()

    assert all(isinstance(d, Document) for d in DummySplitter.docs)
    assert len(DummyChroma.docs) == len(DummySplitter.docs)
    assert DummyChroma.persisted


def test_sanitize_metadata_flattens_list():
    meta = {
        "name": "Brasshaven",
        "type": "location",
        "tags": ["steam", "gear"]
    }

    sanitized = ingest.sanitize_metadata(meta)

    assert sanitized["tags"] == "steam\ngear"
    assert sanitized["name"] == "Brasshaven"
