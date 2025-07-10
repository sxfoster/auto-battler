import os
import logging
import pytest

from services import rag_service


def dummy_build(self, embeddings):
    self.vector_store = True


def dummy_embeddings(*args, **kwargs):
    return None


class DummyFAISS:
    @staticmethod
    def load_local(*args, **kwargs):
        return True


@pytest.mark.asyncio
async def test_cache_dir_created_and_writable(tmp_path, monkeypatch, caplog):
    cache_dir = tmp_path / "cache"
    index_path = cache_dir / "faiss_index"
    monkeypatch.setattr(rag_service, "FAISS_INDEX_PATH", str(index_path))
    monkeypatch.setattr(rag_service, "CACHE_DIRECTORY", str(cache_dir))
    monkeypatch.setattr(rag_service.RAGService, "_build_and_cache_index", dummy_build)
    monkeypatch.setattr(rag_service, "OllamaEmbeddings", dummy_embeddings)
    monkeypatch.setattr(rag_service, "FAISS", DummyFAISS)

    caplog.set_level(logging.INFO)
    rag_service.RAGService()

    assert cache_dir.exists()
    assert any("Cache directory not found" in m for m in caplog.messages)
    assert any("is writable" in m for m in caplog.messages)


@pytest.mark.asyncio
async def test_cache_dir_not_writable(tmp_path, monkeypatch):
    cache_dir = tmp_path / "cache"
    index_path = cache_dir / "faiss_index"
    cache_dir.mkdir()
    monkeypatch.setattr(rag_service, "FAISS_INDEX_PATH", str(index_path))
    monkeypatch.setattr(rag_service, "CACHE_DIRECTORY", str(cache_dir))
    monkeypatch.setattr(rag_service.RAGService, "_build_and_cache_index", dummy_build)
    monkeypatch.setattr(rag_service, "OllamaEmbeddings", dummy_embeddings)
    monkeypatch.setattr(rag_service, "FAISS", DummyFAISS)

    def fake_access(path, mode):
        if path == str(cache_dir):
            return False
        return os.access(path, mode)

    monkeypatch.setattr(os, "access", fake_access)

    with pytest.raises(PermissionError):
        rag_service.RAGService()
