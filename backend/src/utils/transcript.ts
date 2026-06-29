import type { TranscriptEntry } from '../types/index.js'

export function parseJsonl(content: string): TranscriptEntry[] {
  if (!content || typeof content !== 'string') return []

  const lines = content.split('\n').filter((line) => line.trim() !== '')
  const entries: TranscriptEntry[] = []

  for (const line of lines) {
    try {
      entries.push(JSON.parse(line))
    } catch {
      throw new Error('Invalid JSON line found')
    }
  }

  return entries
}

export function countMessages(entries: TranscriptEntry[]): number {
  return entries.filter(
    (e) => e.type === 'USER_INPUT' || e.type === 'PLANNER_RESPONSE',
  ).length
}

export function validateTranscript(entries: TranscriptEntry[]): {
  valid: boolean
  error?: string
} {
  if (!Array.isArray(entries)) {
    return { valid: false, error: 'Transcript is not an array' }
  }

  if (entries.length === 0) {
    return { valid: false, error: 'Transcript is empty' }
  }

  for (const entry of entries) {
    if (typeof entry !== 'object' || entry === null) {
      return { valid: false, error: 'Invalid entry format' }
    }
    // Basic checks
    if (!('step_index' in entry) || typeof entry.step_index !== 'number') {
      return { valid: false, error: 'Missing or invalid step_index' }
    }
    if (!('type' in entry) || typeof entry.type !== 'string') {
      return { valid: false, error: 'Missing or invalid type' }
    }
  }

  return { valid: true }
}
