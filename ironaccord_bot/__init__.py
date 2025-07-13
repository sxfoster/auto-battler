import importlib.util, sys, pathlib
pkg_path = pathlib.Path(__file__).resolve().parent.parent / 'ironaccord-bot'
spec = importlib.util.spec_from_file_location('ironaccord-bot', pkg_path / '__init__.py')
pkg = importlib.util.module_from_spec(spec)
sys.modules['ironaccord-bot'] = pkg
spec.loader.exec_module(pkg)
for k, v in pkg.__dict__.items():
    globals()[k] = v
sys.modules.setdefault('ironaccord_bot', pkg)
