import { afterAll, beforeAll, describe, expect, it } from 'bun:test'
import { sql } from '../db/connection.js'
import app from '../index.js'
import { signAccessToken } from '../utils/jwt.js'

describe('feed routes', () => {
  let user1Token: string
  let user1Id: string
  let user2Id: string
  let user3Id: string

  beforeAll(async () => {
    await sql`DELETE FROM users`
    await sql`DELETE FROM conversations`
    await sql`DELETE FROM follows`

    const [u1] = await sql`
      INSERT INTO users (email, username, password_hash) 
      VALUES ('u1@test.com', 'user1', 'hash') RETURNING id
    `
    user1Id = u1.id
    user1Token = await signAccessToken(user1Id)

    const [u2] = await sql`
      INSERT INTO users (email, username, password_hash) 
      VALUES ('u2@test.com', 'user2', 'hash') RETURNING id
    `
    user2Id = u2.id

    const [u3] = await sql`
      INSERT INTO users (email, username, password_hash) 
      VALUES ('u3@test.com', 'user3', 'hash') RETURNING id
    `
    user3Id = u3.id

    // user1 follows user2
    await sql`INSERT INTO follows (follower_id, following_id) VALUES (${user1Id}, ${user2Id})`

    // Create conversation for user2
    await sql`
      INSERT INTO conversations (user_id, title, description, transcript, message_count) 
      VALUES (${user2Id}, 'User 2 Title', 'Desc', '[]', 0)
    `

    // Create conversation for user3
    await sql`
      INSERT INTO conversations (user_id, title, description, transcript, message_count) 
      VALUES (${user3Id}, 'User 3 Title', 'Desc', '[]', 0)
    `
  })

  afterAll(async () => {
    await sql`DELETE FROM follows`
    await sql`DELETE FROM conversations`
    await sql`DELETE FROM users`
  })

  it('should return 401 without auth', async () => {
    const res = await app.fetch(
      new Request('http://localhost/api/feed', {
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    expect(res.status).toBe(401)
  })

  it('should return conversations only from followed users', async () => {
    const res = await app.fetch(
      new Request('http://localhost/api/feed', {
        headers: { Cookie: `access_token=${user1Token}` },
      }),
    )
    expect(res.status).toBe(200)
    const body = await res.json()

    expect(body.data).toBeDefined()
    expect(body.data).toHaveLength(1)
    expect(body.data[0].title).toBe('User 2 Title')
  })
})
