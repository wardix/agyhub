import { describe, expect, it } from 'bun:test'

describe('Health Check Endpoint', () => {
  it('GET /api/health should return ok', async () => {
    // Import the app object to test it. Wait, index.ts exports { port, fetch } as default.
    // Let's import fetch from index.ts.
    const app = (await import('./index.ts')).default
    const req = new Request('http://localhost/api/health')
    const res = await app.fetch(req)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ status: 'ok' })
  })
})

describe('Global Middleware', () => {
  it('should reject payloads larger than 1MB', async () => {
    const app = (await import('./index.ts')).default
    // Generate a payload slightly larger than 1MB
    const largePayload = 'a'.repeat(1024 * 1024 + 10)
    const req = new Request('http://localhost/api/health', {
      method: 'POST',
      body: largePayload,
    })
    const res = await app.fetch(req)

    expect(res.status).toBe(413)
    const data = await res.json()
    expect(data.error).toBe('Payload Too Large')
  })
})
