MISSION = {
    "id": 1,
    "name": "test",
    "intro": "Test mission start",
    "rounds": [
        {
            "text": "Round 1",
            "options": [
                {
                    "text": "A",
                    "durability": -1,
                    "combat": True,
                    "dc": 12,
                    "outcomes": {
                        "Operational Success": {"loot": {"gold": 1}},
                        "System Degraded": {
                            "penalty": {"durability_loss": 5, "add_flag": "Injured"}
                        },
                    },
                },
                {
                    "text": "B",
                    "durability": -2,
                    "combat": True,
                    "dc": 12,
                    "outcomes": {
                        "Operational Success": {"loot": {"gold": 2}},
                        "System Degraded": {
                            "penalty": {"durability_loss": 5, "add_flag": "Injured"}
                        },
                    },
                },
            ],
        },
        {
            "text": "Round 2",
            "options": [
                {
                    "text": "A",
                    "durability": -1,
                    "combat": True,
                    "dc": 10,
                    "outcomes": {
                        "Operational Success": {"loot": {"gold": 1}},
                        "System Degraded": {
                            "penalty": {"durability_loss": 5, "add_flag": "Injured"}
                        },
                    },
                },
                {
                    "text": "B",
                    "durability": 0,
                    "combat": True,
                    "dc": 10,
                    "outcomes": {
                        "Operational Success": {"loot": {"gold": 1}},
                        "System Degraded": {
                            "penalty": {"durability_loss": 5, "add_flag": "Injured"}
                        },
                    },
                },
            ],
        },
        {
            "text": "Round 3",
            "options": [
                {
                    "text": "A",
                    "durability": 0,
                    "combat": True,
                    "dc": 8,
                    "outcomes": {
                        "Operational Success": {"loot": {"gold": 2}},
                        "System Degraded": {
                            "penalty": {"durability_loss": 5, "add_flag": "Injured"}
                        },
                    },
                },
                {
                    "text": "B",
                    "durability": 0,
                    "combat": True,
                    "dc": 8,
                    "outcomes": {
                        "Operational Success": {"loot": {"gold": 3}},
                        "System Degraded": {
                            "penalty": {"durability_loss": 5, "add_flag": "Injured"}
                        },
                    },
                },
            ],
        },
    ],
    "rewards": {"gold": 5},
    "codexFragment": "test_fragment",
}
