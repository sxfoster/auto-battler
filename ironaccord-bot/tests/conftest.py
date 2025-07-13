import os
import sys
import importlib
from pathlib import Path

# Ensure the project root is on the Python path and advertise it via the
# PYTHONPATH environment variable so that ``ironaccord_bot`` can be imported
# when tests run from any directory.
project_root = Path(__file__).resolve().parents[1]
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))
os.environ.setdefault("PYTHONPATH", str(project_root))

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
    sys.modules.setdefault(
        "chromadb",
        types.SimpleNamespace(
            PersistentClient=None,
            config=types.SimpleNamespace(Settings=None),
        ),
    )
    sys.modules.setdefault(
        "langchain_community.vectorstores",
        types.SimpleNamespace(Chroma=None),
    )
    sys.modules.setdefault(
        "langchain_community.embeddings",
        types.SimpleNamespace(
            HuggingFaceEmbeddings=None,
            OllamaEmbeddings=None,
        ),
    )
    sys.modules.setdefault(
        "langchain_chroma",
        types.SimpleNamespace(Chroma=None),
    )
    sys.modules.setdefault(
        "langchain_ollama",
        types.SimpleNamespace(OllamaEmbeddings=None),
    )
    sys.modules.setdefault(
        "langchain_huggingface",
        types.SimpleNamespace(HuggingFaceEmbeddings=None),
    )
    sys.modules.setdefault("aiomysql", types.ModuleType("aiomysql"))
    dummy_discord = types.ModuleType("discord")
    dummy_commands = types.ModuleType("discord.ext.commands")
    dummy_intents = types.SimpleNamespace(none=lambda: None)
    dummy_discord.ext = types.SimpleNamespace(commands=dummy_commands)
    dummy_discord.Intents = dummy_intents
    sys.modules.setdefault("discord", dummy_discord)
    sys.modules.setdefault("discord.ext", types.SimpleNamespace(commands=dummy_commands))
    sys.modules.setdefault("discord.ext.commands", dummy_commands)
    dummy_langchain_schema = types.ModuleType("langchain.schema")
    dummy_langchain_schema.Document = type("Document", (), {})
    sys.modules.setdefault("langchain.schema", dummy_langchain_schema)
    sys.modules.setdefault("langchain", types.SimpleNamespace(schema=dummy_langchain_schema))
except Exception:
    pass
