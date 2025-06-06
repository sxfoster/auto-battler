import { test } from 'node:test'
import assert from 'assert'
import { classes } from '../models/classes.js'
import { sampleCards as cards } from '../models/cards.js'

classes.forEach((cls) => {
  test(`Class "${cls.name}" has exactly 4 level 1 cards`, () => {
    const usable = cards.filter(
      (c) =>
        (c.classRestriction === cls.id || c.classes?.includes(cls.id)) &&
        (!c.level || c.level === 1),
    )
    assert.strictEqual(usable.length, 4)
  })
})
