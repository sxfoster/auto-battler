import { classes } from '../../../shared/models/classes.js'

export function getClassById(id: string) {
  const cls = classes.find(c => c.id === id)
  if (!cls) {
    console.error(`Unknown class id '${id}'`)
  }
  return cls
}
