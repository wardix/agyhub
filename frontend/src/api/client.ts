export class ApiError extends Error {
  status: number
  data: unknown

  constructor(status: number, message: string, data?: unknown) {
    super(message)
    this.status = status
    this.data = data
    this.name = 'ApiError'
  }
}

async function apiFetch(
  endpoint: string,
  options: RequestInit = {},
): Promise<unknown> {
  const url = endpoint.startsWith('http') ? endpoint : `/api${endpoint}`
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include' as RequestCredentials,
  }

  try {
    let response = await fetch(url, config)

    // Handle 401 Unauthorized (attempt token refresh)
    if (response.status === 401) {
      const refreshResponse = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })

      if (refreshResponse.ok) {
        // Retry original request
        response = await fetch(url, config)
      } else {
        // Refresh failed, user is logged out
        throw new ApiError(401, 'Unauthorized')
      }
    }

    if (response.status === 204) {
      return null
    }

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new ApiError(response.status, data.error || 'API Error', data)
    }

    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(
      500,
      error instanceof Error ? error.message : 'Unknown error',
    )
  }
}

export const api = {
  get: (endpoint: string, options?: RequestInit) =>
    apiFetch(endpoint, { ...options, method: 'GET' }),
  post: (endpoint: string, body?: unknown, options?: RequestInit) =>
    apiFetch(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    }),
  put: (endpoint: string, body?: unknown, options?: RequestInit) =>
    apiFetch(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  delete: (endpoint: string, options?: RequestInit) =>
    apiFetch(endpoint, { ...options, method: 'DELETE' }),
}
