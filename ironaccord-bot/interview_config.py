EDRAZ_GREETING = (
    "Signal acquired. I am Edraz, the Chronicler. I read the static between the worlds, and today it led me to you."
    " Your story is unwritten, a blank slate in the great archive. Before we begin, I need to tune into your signal."
)

EDRAZ_IMAGE_URL = "https://example.com/edraz-sanctum.png"

QUESTIONS = [
    {
        "text": "When you look upon the ruins, what stirs within you?",
        "options": [
            ("A sense of loss", "you mourn what was lost"),
            ("A chance for rebirth", "you see opportunity among the wreckage"),
            ("Only hardened resolve", "you feel nothing but determination"),
            ("Curiosity", "you thirst to uncover forgotten secrets"),
        ],
        "transition": "Hm. {choice}... The static sharpens. Now, tell me this",
    },
    {
        "text": "A starving family pleads for your last rations. How do you respond?",
        "options": [
            ("Share freely", "you share without hesitation"),
            ("Offer aid for a price", "you demand a trade"),
            ("Turn them away", "you ignore their plight"),
            ("Take what little they have", "you seize what is theirs"),
        ],
        "transition": "Your signal grows clearer. {choice} It reveals much. Another question",
    },
    {
        "text": "Rumors whisper that the Accord is built on lies. What do you do with such talk?",
        "options": [
            ("Seek the truth", "you dig deeper"),
            ("Silence the rumor", "you destroy evidence"),
            ("Use it for leverage", "you keep the secret close"),
            ("Ignore it", "you dismiss such chatter"),
        ],
        "transition": "Interesting. {choice} The pattern emerges. Finally",
    },
    {
        "text": "What quality do you prize most in those who walk beside you?",
        "options": [
            ("Loyalty", "you value steadfast allies"),
            ("Honesty", "you demand the truth"),
            ("Ingenuity", "you admire clever minds"),
            ("Survival skill", "you rely on the capable"),
        ],
        "transition": "Noted. {choice} The signal resolves at last.",
    },
]
