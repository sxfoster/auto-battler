import { test } from 'node:test'
import assert from 'assert'
import { classes } from './classes.js'
import { sampleCards as cards } from './cards.js'

// Ensure every class has a unique id and name
test('every class has a unique id and name', () => {
  const ids = new Set()
  classes.forEach(cls => {
    assert.ok(cls.id, `Class missing id: ${cls.name}`)
    assert.ok(cls.name, `Class missing name for id: ${cls.id}`)
    assert.ok(!ids.has(cls.id), `Duplicate class id: ${cls.id}`)
    ids.add(cls.id)
  })
})

// Verify card restrictions reference real class ids
test('every card with a classRestriction references an existing class id', () => {
  cards.forEach(card => {
    if (card.classRestriction) {
      assert.ok(
        classes.some(c => c.id === card.classRestriction),
        `Unknown classRestriction ${card.classRestriction} on card ${card.id}`
      )
    }
  })
})
