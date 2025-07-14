import importlib, importlib.util, sys, pathlib
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
