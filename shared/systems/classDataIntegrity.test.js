import { test } from 'node:test'
import assert from 'assert'
import { classes } from '../models/classes.js'
import { sampleCards as cards } from '../models/cards.js'
import { canUseCard } from './classRole.js'

// Verify class IDs are unique and have display names
const ids = new Set()
for (const cls of classes) {
  test(`class ${cls.id} has valid id and name`, () => {
    assert.ok(cls.id && cls.name, 'id and name required')
    assert.ok(!ids.has(cls.id), `duplicate id ${cls.id}`)
    ids.add(cls.id)
  })
}

// Ensure each class has at least two usable cards
classes.forEach(cls => {
  test(`class ${cls.id} has at least two usable cards`, () => {
    const dummy = { id: 'x', name: 'dummy', class: cls.id, stats: {}, deck: [], survival: {} }
    const usable = cards.filter(c => canUseCard(dummy, c))
    assert.ok(usable.length >= 2, `only ${usable.length} usable cards`)
  })
})
