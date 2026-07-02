import { afterAll, beforeAll, describe, expect, it } from 'bun:test'
import { Hono } from 'hono'
import { sql } from '../db/connection.js'
import { signAccessToken } from '../utils/jwt.js'
import { conversations } from './conversations.js'

const app = new Hono()
app.route('/api/conversations', conversations)

describe('conversations routes', () => {
  let testUserId = ''
  let authToken = ''
  let otherAuthToken = ''

  beforeAll(async () => {
    try {
      await sql`TRUNCATE TABLE users CASCADE`
      const [user] = await sql`
        INSERT INTO users (email, username) VALUES ('testconv@example.com', 'testconv') RETURNING id
      `
      testUserId = user.id
      authToken = await signAccessToken(testUserId)

      const [otherUser] = await sql`
        INSERT INTO users (email, username) VALUES ('other@example.com', 'other') RETURNING id
      `
      otherAuthToken = await signAccessToken(otherUser.id)
    } catch (_e) {
      console.warn('Could not setup db')
    }
  })

  afterAll(async () => {
    try {
      await sql`TRUNCATE TABLE users CASCADE`
    } catch (_e) {}
  })

  let conversationId = ''

  it('should create conversation via POST /api/conversations', async () => {
    if (!testUserId) return // skip if db not setup

    const formData = new FormData()
    const fileContent = `{"step_index":0,"type":"USER_INPUT","source":"USER_EXPLICIT","status":"DONE","created_at":"2023-01-01"}\n{"step_index":1,"type":"PLANNER_RESPONSE","source":"MODEL","status":"DONE","created_at":"2023-01-01"}`

    formData.append('title', 'Test Conversation')
    formData.append('description', 'Test Description')
    const tagsArr = Array.from({ length: 15 }, (_, i) => `tag${i}`)
    formData.append('tags', tagsArr.join(', '))
    formData.append(
      'file',
      new File([fileContent], 'transcript.jsonl', { type: 'application/json' }),
    )

    const res = await app.request('/api/conversations', {
      method: 'POST',
      headers: {
        Cookie: `access_token=${authToken}`,
      },
      body: formData,
    })

    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.conversation.title).toBe('Test Conversation')
    expect(data.conversation.message_count).toBe(2)

    conversationId = data.conversation.id
  })

  it('should reject title exceeding 200 chars', async () => {
    const formData = new FormData()
    formData.append('title', 'a'.repeat(201))
    formData.append(
      'file',
      new Blob(['{"type": "USER_INPUT", "content": "Hello"}']),
    )

    const res = await app.request('/api/conversations', {
      method: 'POST',
      headers: { Cookie: `access_token=${authToken}` },
      body: formData,
    })
    expect(res.status).toBe(400)
  })

  it('should reject description exceeding 1000 chars', async () => {
    const formData = new FormData()
    formData.append('title', 'Test Title')
    formData.append('description', 'a'.repeat(1001))
    formData.append(
      'file',
      new Blob(['{"type": "USER_INPUT", "content": "Hello"}']),
    )

    const res = await app.request('/api/conversations', {
      method: 'POST',
      headers: { Cookie: `access_token=${authToken}` },
      body: formData,
    })
    expect(res.status).toBe(400)
  })

  it('should list conversations via GET /api/conversations', async () => {
    if (!testUserId) return

    const res = await app.request('/api/conversations')
    expect(res.status).toBe(200)
    const data = await res.json()

    expect(data.data.length).toBeGreaterThan(0)
    expect(data.pagination.total).toBeGreaterThan(0)
    expect(data.data[0].transcript).toBeUndefined() // Should not include full transcript
  })

  it('should search conversations', async () => {
    if (!testUserId) return

    const res = await app.request('/api/conversations?q=Test')
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.data.length).toBeGreaterThan(0)
  })

  it('should get trending conversations', async () => {
    if (!testUserId) return

    const res = await app.request('/api/conversations/trending')
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(Array.isArray(data.data)).toBe(true)
  })

  it('should get a single conversation by ID', async () => {
    if (!testUserId || !conversationId) return

    const res = await app.request(`/api/conversations/${conversationId}`)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.conversation.id).toBe(conversationId)
    expect(data.conversation.transcript).toBeDefined() // Should include full transcript
    expect(data.conversation.has_liked).toBe(false)
  })

  it('should increment view count for a different IP', async () => {
    if (!testUserId || !conversationId) return

    const res1 = await app.request(`/api/conversations/${conversationId}`, {
      headers: { 'x-forwarded-for': '10.0.0.1' },
    })
    const data1 = await res1.json()
    const initialViews = data1.conversation.view_count

    const res2 = await app.request(`/api/conversations/${conversationId}`, {
      headers: { 'x-forwarded-for': '10.0.0.2' },
    })
    const data2 = await res2.json()
    expect(data2.conversation.view_count).toBe(initialViews + 1)
  })

  it('should not increment view count twice for the same IP within window', async () => {
    if (!testUserId || !conversationId) return

    const res1 = await app.request(`/api/conversations/${conversationId}`, {
      headers: { 'x-forwarded-for': '10.0.0.3' },
    })
    const data1 = await res1.json()
    const initialViews = data1.conversation.view_count

    const res2 = await app.request(`/api/conversations/${conversationId}`, {
      headers: { 'x-forwarded-for': '10.0.0.3' },
    })
    const data2 = await res2.json()
    expect(data2.conversation.view_count).toBe(initialViews)
  })

  it('should not increment view count for the author', async () => {
    if (!testUserId || !conversationId) return

    const res1 = await app.request(`/api/conversations/${conversationId}`, {
      headers: { 'x-forwarded-for': '10.0.0.4' },
    })
    const data1 = await res1.json()
    const initialViews = data1.conversation.view_count

    const res2 = await app.request(`/api/conversations/${conversationId}`, {
      headers: {
        'x-forwarded-for': '10.0.0.5',
        Cookie: `access_token=${authToken}`,
      },
    })
    const data2 = await res2.json()
    expect(data2.conversation.view_count).toBe(initialViews)
  })

  it('should get a single conversation by ID with has_liked true when liked', async () => {
    if (!testUserId || !conversationId) return

    await sql`
      INSERT INTO likes (user_id, conversation_id) VALUES (${testUserId}, ${conversationId})
    `

    const res = await app.request(`/api/conversations/${conversationId}`, {
      headers: {
        Cookie: `access_token=${authToken}`,
      },
    })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.conversation.id).toBe(conversationId)
    expect(data.conversation.has_liked).toBe(true)
  })

  it("should prevent deleting someone else's conversation", async () => {
    if (!testUserId || !conversationId) return

    const res = await app.request(`/api/conversations/${conversationId}`, {
      method: 'DELETE',
      headers: {
        Cookie: `access_token=${otherAuthToken}`,
      },
    })
    expect(res.status).toBe(403)
  })

  it("should prevent editing someone else's conversation", async () => {
    if (!testUserId || !conversationId) return

    const res = await app.request(`/api/conversations/${conversationId}`, {
      method: 'PUT',
      headers: {
        Cookie: `access_token=${otherAuthToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: 'New Title' }),
    })
    expect(res.status).toBe(403)
  })

  it('should update conversation if author', async () => {
    if (!testUserId || !conversationId) return

    const res = await app.request(`/api/conversations/${conversationId}`, {
      method: 'PUT',
      headers: {
        Cookie: `access_token=${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Updated Title',
        description: 'Updated Description',
        tags: 'newtag, test',
      }),
    })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.conversation.title).toBe('Updated Title')
    expect(data.conversation.description).toBe('Updated Description')

    // Check if tags are updated
    const res2 = await app.request(`/api/conversations/${conversationId}`)
    const data2 = await res2.json()
    expect(data2.conversation.tags.length).toBe(2)
  })

  it('should reject title exceeding 200 chars on edit', async () => {
    if (!testUserId || !conversationId) return

    const res = await app.request(`/api/conversations/${conversationId}`, {
      method: 'PUT',
      headers: {
        Cookie: `access_token=${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: 'a'.repeat(201) }),
    })
    expect(res.status).toBe(400)
  })

  it('should delete conversation if author', async () => {
    if (!testUserId || !conversationId) return

    const res = await app.request(`/api/conversations/${conversationId}`, {
      method: 'DELETE',
      headers: {
        Cookie: `access_token=${authToken}`,
      },
    })
    expect(res.status).toBe(204)
  })

  describe('visibility controls', () => {
    let publicId = ''
    let unlistedId = ''
    let privateId = ''

    it('should upload conversations with different visibilities', async () => {
      const upload = async (visibility: string) => {
        const formData = new FormData()
        formData.append('title', `Test ${visibility}`)
        formData.append('visibility', visibility)
        formData.append(
          'file',
          new File(
            [
              '{"step_index":0,"type":"USER_INPUT","source":"USER_EXPLICIT","status":"DONE","created_at":"2023-01-01"}',
            ],
            'transcript.jsonl',
            { type: 'application/json' },
          ),
        )
        const res = await app.request('/api/conversations', {
          method: 'POST',
          headers: { Cookie: `access_token=${authToken}` },
          body: formData,
        })
        const data = await res.json()
        return data.conversation.id
      }

      publicId = await upload('public')
      unlistedId = await upload('unlisted')
      privateId = await upload('private')

      expect(publicId).toBeDefined()
      expect(unlistedId).toBeDefined()
      expect(privateId).toBeDefined()
    })

    it('should filter out unlisted and private from lists for visitors', async () => {
      const res = await app.request('/api/conversations')
      const data = await res.json()
      const ids = data.data.map((c: any) => c.id)

      expect(ids).toContain(publicId)
      expect(ids).not.toContain(unlistedId)
      expect(ids).not.toContain(privateId)
    })

    it('should show all to author', async () => {
      // For lists where currentUserId is not authorId, but we are querying generally
      const res = await app.request('/api/conversations', {
        headers: { Cookie: `access_token=${authToken}` },
      })
      const data = await res.json()
      const ids = data.data.map((c: any) => c.id)

      expect(ids).toContain(publicId)
      expect(ids).toContain(unlistedId)
      expect(ids).toContain(privateId)
    })

    it('should allow visitor direct access to unlisted but not private', async () => {
      const resUnlisted = await app.request(
        `/api/conversations/${unlistedId}`,
        {
          headers: { Cookie: `access_token=${otherAuthToken}` },
        },
      )
      expect(resUnlisted.status).toBe(200)

      const resPrivate = await app.request(`/api/conversations/${privateId}`, {
        headers: { Cookie: `access_token=${otherAuthToken}` },
      })
      expect(resPrivate.status).toBe(404)
    })

    it('should allow author direct access to private', async () => {
      const res = await app.request(`/api/conversations/${privateId}`, {
        headers: { Cookie: `access_token=${authToken}` },
      })
      expect(res.status).toBe(200)
    })

    it('should allow changing visibility', async () => {
      const res = await app.request(`/api/conversations/${publicId}`, {
        method: 'PUT',
        headers: {
          Cookie: `access_token=${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ visibility: 'private' }),
      })
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.conversation.visibility).toBe('private')
    })
  })
})
