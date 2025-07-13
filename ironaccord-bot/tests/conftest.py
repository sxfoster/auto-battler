import sys
import importlib
from pathlib import Path

# Alias the hyphenated package name so `import ironaccord_bot` works
try:
    pkg = importlib.import_module("ironaccord-bot")
    sys.modules["ironaccord_bot"] = pkg

    # Expose subpackages like ``services`` and ``models`` at the top level so
    # tests can simply ``import services`` without the dashed package name.
    # Import ``models`` first so that ``services`` modules depending on it load
    # correctly during this setup.
    for name in ("models", "services"):
        try:
            sys.modules.setdefault(name, importlib.import_module(f"ironaccord-bot.{name}"))
        except Exception:
            pass

    # Ensure ``services`` and other subpackages can be imported by adding the
    # package path directly to ``sys.path``.
    pkg_path = Path(__file__).resolve().parent.parent / "ironaccord-bot"
    sys.path.insert(0, str(pkg_path))

    # Provide lightweight stand-ins for optional heavy dependencies used by the
    # RAG service so the module can be imported during testing.
    import types
    sys.modules.setdefault("chromadb", types.SimpleNamespace(PersistentClient=None))
    sys.modules.setdefault(
        "langchain_community.vectorstores",
        types.SimpleNamespace(Chroma=None),
    )
    sys.modules.setdefault(
        "langchain_community.embeddings",
        types.SimpleNamespace(HuggingFaceEmbeddings=None),
    )
except Exception:
    pass
