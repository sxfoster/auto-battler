import random
from .quiz_content_service import QuizContentService


class QuizService:
    """Manage the state of all active sorting quizzes."""

    def __init__(self, content_service: QuizContentService):
        self.content_service = content_service
        self.active_quizzes: dict[int, dict] = {}

    def start_quiz(self, user_id: int):
        all_backgrounds = list(
            self.content_service.structured_questions[0]["choices"].keys()
        )
        self.active_quizzes[user_id] = {
            "question_number": 1,
            "scores": {bg: 0 for bg in all_backgrounds},
        }
        print(f"Quiz started for user {user_id}")

    def get_next_question_for_user(self, user_id: int):
        if user_id not in self.active_quizzes:
            return None
        state = self.active_quizzes[user_id]
        question_data = self.content_service.get_question(state["question_number"])
        if not question_data:
            return None
        all_choices = question_data["choices"]
        random_backgrounds = random.sample(list(all_choices.keys()), 3)
        return {
            "text": question_data["text"],
            "choices": {bg: all_choices[bg] for bg in random_backgrounds},
        }

    def record_answer(self, user_id: int, chosen_background: str) -> bool:
        """Record a user's answer and advance the quiz.

        Returns ``True`` if the quiz has reached the end of the question list,
        otherwise ``False``. A missing ``user_id`` results in ``False`` as well.
        """
        if user_id not in self.active_quizzes:
            return False

        state = self.active_quizzes[user_id]
        if chosen_background in state["scores"]:
            state["scores"][chosen_background] += 1
            state["question_number"] += 1
            print(
                f"User {user_id} chose {chosen_background}. Scores: {state['scores']}"
            )

        # The quiz is over once question_number exceeds 5
        return state["question_number"] > 5

    def get_final_result(self, user_id: int):
        if user_id not in self.active_quizzes:
            return None
        state = self.active_quizzes[user_id]
        scores = state["scores"]
        max_score = max(scores.values())
        winners = [bg for bg, score in scores.items() if score == max_score]
        del self.active_quizzes[user_id]
        return random.choice(winners)
