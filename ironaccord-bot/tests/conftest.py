import sys
import importlib
from pathlib import Path

# Ensure project root is on sys.path
ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))
PKG_DIR = ROOT / "ironaccord-bot"
if str(PKG_DIR) not in sys.path:
    sys.path.insert(0, str(PKG_DIR))

# Alias the hyphenated package name so `import ironaccord_bot` works
try:
    pkg = importlib.import_module('ironaccord-bot')
    sys.modules['ironaccord_bot'] = pkg
except Exception:
    pass
