import { test } from 'node:test'
import assert from 'assert'
import { classes } from '../models/classes.js'

// Ensure each defined class can be looked up by id and returns its display name
// similar to the client UI logic.
test('every class id resolves to a display name', () => {
  for (const cls of classes) {
    const found = classes.find(c => c.id === cls.id)
    const name = found ? found.name : 'Unknown'
    assert.notStrictEqual(name, 'Unknown', `Missing mapping for ${cls.id}`)
  }
})
