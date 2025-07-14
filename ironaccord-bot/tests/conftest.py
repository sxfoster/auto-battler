import os
import sys
import importlib
from pathlib import Path

# Ensure the project root is on the Python path and advertise it via the
# PYTHONPATH environment variable so that ``ironaccord_bot`` can be imported
# when tests run from any directory.
project_root = Path(__file__).resolve().parents[2]
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))
os.environ.setdefault("PYTHONPATH", str(project_root))

# Alias the hyphenated package name so `import ironaccord_bot` works
try:
    pkg = importlib.import_module("ironaccord-bot")
except ModuleNotFoundError:
    pkg_path = project_root / "ironaccord-bot"
    spec = importlib.util.spec_from_file_location(
        "ironaccord-bot",
        pkg_path / "__init__.py",
        submodule_search_locations=[str(pkg_path)],
    )
    pkg = importlib.util.module_from_spec(spec)
    sys.modules["ironaccord-bot"] = pkg
    spec.loader.exec_module(pkg)
except Exception:
    pkg = None

if pkg:
    sys.modules["ironaccord_bot"] = pkg


# Expose subpackages like ``services`` and ``models`` at the top level so
# tests can simply ``import services`` without the dashed package name.
# Import ``models`` first so that ``services`` modules depending on it load
# correctly during this setup.
for name in ("models", "services", "ai", "views", "utils", "data"):
    try:
        sys.modules.setdefault(name, importlib.import_module(f"ironaccord-bot.{name}"))
    except Exception:
        pass

# Ensure ``services`` and other subpackages can be imported by adding the
# package path directly to ``sys.path``.
pkg_path = project_root / "ironaccord-bot"
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
    types.SimpleNamespace(
        HuggingFaceEmbeddings=None,
        OllamaEmbeddings=None,
    ),
)
