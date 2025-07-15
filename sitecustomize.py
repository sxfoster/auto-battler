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
    "langchain.prompts": types.ModuleType("langchain.prompts"),
    "langchain.chains": types.ModuleType("langchain.chains"),
    "langchain.text_splitter": types.ModuleType("langchain.text_splitter"),
    "langchain.docstore.document": types.ModuleType("langchain.docstore.document"),
    "langchain.docstore": types.ModuleType("langchain.docstore"),
    "chromadb.config": types.ModuleType("chromadb.config"),
}

# Mark stub modules as packages to avoid AttributeError when using ``find_spec``.
for _mod in optional_modules.values():
    _mod.__path__ = []  # type: ignore[attr-defined]

# Populate minimal attributes expected by the codebase
class _Dummy:
    def __init__(self, *a, **kw):
        pass

class _DummyRetriever:
    def __init__(self, *a, **kw):
        pass
    def as_retriever(self):
        return None

optional_modules["langchain_community.vectorstores"].Chroma = _DummyRetriever
embeds = optional_modules["langchain_community.embeddings"]
embeds.SentenceTransformerEmbeddings = _Dummy
embeds.OllamaEmbeddings = _Dummy
optional_modules["langchain_community.llms"].Ollama = _Dummy
optional_modules["langchain.schema"].Document = object
optional_modules["dotenv"].load_dotenv = lambda *a, **kw: None
optional_modules["sentence_transformers"].SentenceTransformer = lambda *a, **k: object()
class _DummyRetrievalQA:
    @classmethod
    def from_chain_type(cls, *a, **kw):
        return object()

optional_modules["langchain.chains"].RetrievalQA = _DummyRetrievalQA
class _DummyTextSplitter:
    def __init__(self, *a, **kw):
        pass
    def split_documents(self, docs):
        return docs

optional_modules["langchain.text_splitter"].RecursiveCharacterTextSplitter = _DummyTextSplitter

class _DummyDocument:
    def __init__(self, page_content="", metadata=None):
        self.page_content = page_content
        self.metadata = metadata or {}

optional_modules["langchain.docstore.document"].Document = _DummyDocument
optional_modules["langchain.docstore"].document = optional_modules["langchain.docstore.document"]
class _DummySettings:
    def __init__(self, *a, **kw):
        pass

class _DummyPromptTemplate:
    def __init__(self, *a, **kw):
        pass

optional_modules["chromadb.config"].Settings = _DummySettings
optional_modules["langchain.prompts"].PromptTemplate = _DummyPromptTemplate

for name, module in optional_modules.items():
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
