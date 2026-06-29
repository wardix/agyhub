import { Hono } from 'hono'
import { sql } from '../db/connection.js'
import { authRequired } from '../middleware/auth.js'
import { buildConversationQuery } from '../utils/queryBuilder.js'

const feed = new Hono()

feed.get('/', authRequired, async (c) => {
  try {
    const userId = c.get('userId')
    const sort = c.req.query('sort') || 'recent'
    const pageRaw = Number.parseInt(c.req.query('page') || '1', 10)
    const page = Number.isNaN(pageRaw) || pageRaw < 1 ? 1 : pageRaw
    const limitRaw = Number.parseInt(c.req.query('limit') || '10', 10)
    const limit =
      Number.isNaN(limitRaw) || limitRaw < 1 ? 10 : Math.min(limitRaw, 100)
    const offset = (page - 1) * limit

    const { query, countQuery, args } = buildConversationQuery({
      currentUserId: userId,
      followedByUserId: userId,
      sort,
      limit,
      offset,
    })

    const countRes = await sql.unsafe(countQuery, args)
    const total = Number.parseInt(countRes[0].count, 10)

    const rows = await sql.unsafe(query, args)

    return c.json(
      {
        data: rows,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
      200,
    )
  } catch (err) {
    console.error('Error fetching feed:', err)
    return c.json({ error: 'Internal server error', status: 500 }, 500)
  }
})

export { feed }
