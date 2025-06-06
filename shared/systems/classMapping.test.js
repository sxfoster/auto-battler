import { test } from 'node:test'
import assert from 'assert'
import { classes } from '../models/classes.js'
import { sampleCharacters } from '../models/characters.js'

test('each party member classId maps to a valid class', () => {
  sampleCharacters.forEach(ch => {
    const cls = classes.find(c => c.id === ch.class)
    assert.ok(cls, `Missing class definition for ${ch.class}`)
  })
})
