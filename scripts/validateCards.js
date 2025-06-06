import { sampleCards as cards } from '../shared/models/cards.js';
import { classes } from '../shared/models/classes.js';

let hasError = false;

for (const cls of classes) {
  const cardIds = new Set(
    cards
      .filter(card => {
        const belongs =
          card.classRestriction === cls.id ||
          (Array.isArray(card.classes) && card.classes.includes(cls.id));
        const level = card.level ?? 1;
        return belongs && level === 1;
      })
      .map(card => card.id)
  );

  if (cardIds.size !== 4) {
    console.error(
      `Class ${cls.id} has ${cardIds.size} level-1 cards: ${[...cardIds].join(', ')}`
    );
    hasError = true;
  }
}

if (hasError) {
  process.exit(1);
} else {
  console.log('All classes have exactly four distinct level-1 cards.');
}
