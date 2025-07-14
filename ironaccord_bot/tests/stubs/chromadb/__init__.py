"""Minimal stand-in for the ``chromadb`` package used in tests.

Only the ``PersistentClient`` class is defined because the real library is
heavy and rarely needed during unit testing.  Services import this module so the
test suite can run without pulling in the actual dependency.
"""


class PersistentClient:
    def __init__(self, *a, **kw):
        pass
