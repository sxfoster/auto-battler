import sys
from pathlib import Path
import importlib
import types

# Add repository root and package directory to sys.path
ROOT = Path(__file__).resolve().parents[2]
PKG_PATH = ROOT / 'ironaccord-bot'
for p in (str(PKG_PATH), str(ROOT)):
    if p not in sys.path:
        sys.path.insert(0, p)

# Provide dummy modules for optional heavy dependencies
sys.modules.setdefault('chromadb', types.SimpleNamespace(PersistentClient=object))

# Alias hyphenated package name
try:
    pkg = importlib.import_module('ironaccord-bot')
    sys.modules.setdefault('ironaccord_bot', pkg)
except Exception:
    pass
