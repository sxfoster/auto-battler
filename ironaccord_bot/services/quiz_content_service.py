import yaml


class QuizContentService:
    """Load and provide static quiz content from YAML."""

    def __init__(self, file_path: str = "docs/yaml/mission_background_sorter.yaml"):
        with open(file_path, "r", encoding="utf-8") as f:
            self.quiz_data = yaml.safe_load(f)
        self.structured_questions = self._structure_questions()
        print("Quiz content loaded and structured.")

    def _structure_questions(self):
        structured = []
        for q_data in self.quiz_data.get("questions", []):
            question_obj = {
                "id": q_data.get("id"),
                "text": q_data.get("text"),
                "choices": {c["background"]: c["text"] for c in q_data.get("choices", [])},
            }
            structured.append(question_obj)
        return structured

    def get_question(self, question_number: int):
        if 0 <= question_number - 1 < len(self.structured_questions):
            return self.structured_questions[question_number - 1]
        return None
