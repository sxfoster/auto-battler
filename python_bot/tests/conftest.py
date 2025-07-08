import sys
from pathlib import Path

# Ensure the project root is on the path so `import python_bot` works
ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))
