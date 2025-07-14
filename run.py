import sys
import os
import asyncio


def main():
    """
    Sets up the system path and directly imports and runs the bot's main function.
    This is a more forceful approach to bypass environment-specific module resolution issues.
    """
    # Get the absolute path of the directory where this script is located (the project root).
    project_root = os.path.dirname(os.path.abspath(__file__))

    # Add the project root to the system path to allow for package imports.
    if project_root not in sys.path:
        sys.path.insert(0, project_root)
        print(f"[Launcher] Added project root to path: {project_root}")

    print("[Launcher] Attempting to start the bot directly...")

    try:
        # Directly import the function we need from the bot module.
        # This is a more explicit way of loading the code than runpy.
        from ironaccord_bot.bot import start_bot

        # Run the bot's main async function.
        asyncio.run(start_bot())

    except KeyboardInterrupt:
        print("\n[Launcher] Bot shutdown gracefully.")
    except ModuleNotFoundError as e:
        print(f"\n[Launcher] FATAL: A module could not be found: {e}")
        print("[Launcher] This indicates a persistent pathing problem.")
        print("[Launcher] Please ensure all dependencies from requirements.txt are installed.")
        print(f"[Launcher] Current sys.path: {sys.path}")
    except Exception as e:
        print(f"\n[Launcher] An unexpected error occurred: {e}")


if __name__ == "__main__":
    main()
