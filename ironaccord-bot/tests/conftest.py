import sys
import importlib

# Alias the hyphenated package name so `import ironaccord_bot` works
try:
    pkg = importlib.import_module('ironaccord-bot')
    sys.modules['ironaccord_bot'] = pkg
except Exception:
    pass
