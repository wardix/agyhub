import { describe, expect, it } from 'bun:test'
import type { TranscriptEntry } from '../types/index.js'
import { countMessages, parseJsonl, validateTranscript } from './transcript.js'

describe('transcript utils', () => {
  const validJsonl = `{"step_index": 0, "type": "USER_INPUT", "source": "USER_EXPLICIT", "status": "DONE", "created_at": "2023-01-01T00:00:00Z"}
{"step_index": 1, "type": "PLANNER_RESPONSE", "source": "MODEL", "status": "DONE", "created_at": "2023-01-01T00:00:01Z"}
{"step_index": 2, "type": "TOOL_CALL", "source": "SYSTEM", "status": "DONE", "created_at": "2023-01-01T00:00:02Z"}`

  describe('parseJsonl', () => {
    it('should parse valid JSONL string into array', () => {
      const entries = parseJsonl(validJsonl)
      expect(entries).toHaveLength(3)
      expect(entries[0].type).toBe('USER_INPUT')
    })

    it('should throw on invalid JSON line', () => {
      const invalidJsonl = `{"step_index": 0, "type": "USER_INPUT"}
invalid json here`
      expect(() => parseJsonl(invalidJsonl)).toThrow('Invalid JSON line found')
    })
  })

  describe('countMessages', () => {
    it('should count only USER_INPUT and PLANNER_RESPONSE', () => {
      const entries = parseJsonl(validJsonl)
      const count = countMessages(entries)
      expect(count).toBe(2)
    })
  })

  describe('validateTranscript', () => {
    it('should validate correct entries', () => {
      const entries = parseJsonl(validJsonl)
      const res = validateTranscript(entries)
      expect(res.valid).toBe(true)
    })

    it('should reject empty array', () => {
      const res = validateTranscript([])
      expect(res.valid).toBe(false)
      expect(res.error).toBe('Transcript is empty')
    })

    it('should reject invalid entries', () => {
      const entries = [{ type: 'USER_INPUT' } as TranscriptEntry] // missing step_index
      const res = validateTranscript(entries)
      expect(res.valid).toBe(false)
      expect(res.error).toBe('Missing or invalid step_index')
    })
  })
})
