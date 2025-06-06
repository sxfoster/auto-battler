import { sampleCards } from '../shared/models/cards.js';
import { classes } from '../shared/models/classes.js';

let errors = [];

for (const cls of classes) {
  const allowed = cls.allowedCards;
  if (!Array.isArray(allowed)) {
    errors.push(`Class ${cls.id} missing allowedCards array`);
    continue;
  }
  if (allowed.length !== 4) {
    errors.push(`Class ${cls.id} must have exactly four allowedCards but has ${allowed.length}`);
  }
  const unique = new Set(allowed);
  if (unique.size !== allowed.length) {
    errors.push(`Class ${cls.id} has duplicate cards: ${allowed}`);
  }
  for (const cardId of allowed) {
    const card = sampleCards.find(c => c.id === cardId);
    if (!card) {
      errors.push(`Class ${cls.id} references unknown card ${cardId}`);
      continue;
    }
    const level = card.level ?? 1;
    if (level !== 1) {
      errors.push(`Card ${cardId} for class ${cls.id} is level ${level}, not level 1`);
    }
    const allowedClasses = card.classRestriction
      ? [card.classRestriction]
      : Array.isArray(card.classes)
        ? card.classes
        : [];
    if (allowedClasses.length && !allowedClasses.includes(cls.id)) {
      errors.push(`Card ${cardId} not allowed for class ${cls.id} by restriction`);
    }
  }
}

if (errors.length) {
  console.error('Card validation failed:');
  for (const err of errors) {
    console.error(' - ' + err);
  }
  process.exit(1);
} else {
  console.log('All classes have valid level-1 cards.');
}
