import { normalize } from '../utils.ts'

export function matchesSearch(query: string, ...fields: string[]): boolean {
  return normalize(query)
    .split(/\s+/)
    .every(word => normalize(fields.join(' ')).includes(word))
}
