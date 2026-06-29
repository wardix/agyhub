import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, api } from './client'

const originalFetch = global.fetch

describe('api client', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })

  afterEach(() => {
    global.fetch = originalFetch
    vi.restoreAllMocks()
  })

  it('should handle successful GET request', async () => {
    const mockData = { message: 'success' }
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockData,
    } as Response)

    const result = await api.get('/test')
    expect(result).toEqual(mockData)
    expect(global.fetch).toHaveBeenCalledWith('/api/test', expect.any(Object))
  })

  it('should handle API errors', async () => {
    const mockResponse = {
      ok: false,
      status: 400,
      json: async () => ({ error: 'Bad Request' }),
    } as Response
    vi.mocked(global.fetch).mockResolvedValue(mockResponse)

    await expect(api.get('/test')).rejects.toThrow(ApiError)
    await expect(api.get('/test')).rejects.toThrow('Bad Request')
  })

  it('should retry on 401 and succeed if refresh succeeds', async () => {
    const mockData = { message: 'success after refresh' }

    // First call: 401
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Unauthorized' }),
    } as Response)

    // Second call: refresh successful
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    } as Response)

    // Third call: retry original request successful
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockData,
    } as Response)

    const result = await api.get('/test')
    expect(result).toEqual(mockData)
    expect(global.fetch).toHaveBeenCalledTimes(3)
  })

  it('should throw if refresh fails on 401', async () => {
    // First call: 401
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Unauthorized' }),
    } as Response)

    // Second call: refresh fails
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Unauthorized' }),
    } as Response)

    await expect(api.get('/test')).rejects.toThrow(ApiError)
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })
})
