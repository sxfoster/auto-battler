import { test } from 'node:test'
import assert from 'assert'
import { classes } from '../models/classes.js'
import { sampleCards as cards } from '../models/cards.js'

classes.forEach(cls => {
  test(`Class "${cls.name}" has at least 2 usable cards`, () => {
    const usable = cards.filter(c => c.classRestriction === cls.id || c.roleTag === cls.role)
    assert.ok(usable.length >= 2)
  })
})
