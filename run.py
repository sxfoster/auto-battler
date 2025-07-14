import sys
import os
import asyncio
import runpy


def main():
    """Sets up the system path to include the project root and runs the bot module."""
    try:
        project_root = os.path.dirname(os.path.abspath(__file__))
        if project_root not in sys.path:
            sys.path.insert(0, project_root)
            print(f"[Launcher] Added project root to path: {project_root}")

        print("[Launcher] Starting the Iron Accord bot...")
        runpy.run_module("ironaccord_bot.bot", run_name="__main__")

    except KeyboardInterrupt:
        print("\n[Launcher] Bot shutdown gracefully.")
    except ModuleNotFoundError as e:
        print(f"\n[Launcher] A module could not be found: {e}")
        print("[Launcher] Please ensure all dependencies from requirements.txt are installed.")
    except Exception as e:
        print(f"\n[Launcher] An unexpected error occurred: {e}")


if __name__ == "__main__":
    main()
