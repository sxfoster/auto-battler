import importlib
import importlib.util
import sys
import types
import pathlib

# Provide lightweight stand-ins for optional heavy dependencies so that the test
# suite can run without installing them. Only minimal attributes used in the
# codebase are included.
optional_modules = {
    "langchain": types.ModuleType("langchain"),
    "langchain.schema": types.ModuleType("langchain.schema"),
    "langchain_core": types.ModuleType("langchain_core"),
    "langchain_community": types.ModuleType("langchain_community"),
    "langchain_community.vectorstores": types.ModuleType(
        "langchain_community.vectorstores"
    ),
    "langchain_community.embeddings": types.ModuleType(
        "langchain_community.embeddings"
    ),
    "langchain_community.llms": types.ModuleType(
        "langchain_community.llms"
    ),
    "langchain_openai": types.ModuleType("langchain_openai"),
    "chromadb": types.ModuleType("chromadb"),
    "dotenv": types.ModuleType("dotenv"),
    "sentence_transformers": types.ModuleType("sentence_transformers"),
}

# Populate minimal attributes expected by the codebase
optional_modules["langchain_community.vectorstores"].Chroma = object
embeds = optional_modules["langchain_community.embeddings"]
embeds.SentenceTransformerEmbeddings = object
embeds.OllamaEmbeddings = object
optional_modules["langchain_community.llms"].Ollama = object
optional_modules["langchain.schema"].Document = object
optional_modules["dotenv"].load_dotenv = lambda *a, **kw: None
optional_modules["sentence_transformers"].SentenceTransformer = lambda *a, **k: object()

for name, module in optional_modules.items():
    if importlib.util.find_spec(name) is None:
        sys.modules.setdefault(name, module)
pkg_path = pathlib.Path(__file__).resolve().parent / 'ironaccord_bot'
if pkg_path.exists():
    spec = importlib.util.spec_from_file_location(
        'ironaccord_bot', pkg_path / '__init__.py', submodule_search_locations=[str(pkg_path)]
    )
    pkg = importlib.util.module_from_spec(spec)
    sys.modules['ironaccord_bot'] = pkg
    spec.loader.exec_module(pkg)
    sys.modules.setdefault('ironaccord_bot', pkg)
    # expose subpackages like ai, services, models, views, utils
    for name in ("models", "services", "ai", "views", "utils", "data"):
        try:
            sys.modules.setdefault(name, importlib.import_module(f"ironaccord_bot.{name}"))
        except Exception:
            pass
