import random
import yaml


class QuizContentService:
    """Load quiz questions from YAML and provide randomized choices."""

    def __init__(self, file_path: str = "docs/yaml/mission_background_sorter.yaml"):
        # Load the YAML once at startup
        with open(file_path, "r", encoding="utf-8") as f:
            self.quiz_data = yaml.safe_load(f)["questions"]
        print("Quiz content loaded.")

    def get_question_and_choices(self, question_number: int):
        """Return the question text and three random choices for the given number."""
        question_data = self.quiz_data[question_number - 1]
        random_choices = random.sample(question_data["choices"], 3)
        return {"text": question_data["text"], "choices": random_choices}
