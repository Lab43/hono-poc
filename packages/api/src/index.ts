import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

const app = new Hono()

// Enable CORS for the client
app.use('/*', cors({
  origin: 'http://localhost:5173',
  credentials: true,
}))

// Zod schemas
const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
})

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
})

// In-memory data store
type User = {
  id: number
  name: string
  email: string
}

let users: User[] = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' },
]

let nextId = 3

// API routes
const routes = app
  .get('/users', (c) => {
    return c.json(users)
  })
  .get('/users/:id', (c) => {
    const id = parseInt(c.req.param('id'))
    const user = users.find((u) => u.id === id)

    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }

    return c.json(user)
  })
  .post('/users', zValidator('json', createUserSchema), (c) => {
    const data = c.req.valid('json')
    const newUser: User = {
      id: nextId++,
      ...data,
    }
    users.push(newUser)
    return c.json(newUser, 201)
  })
  .put('/users/:id', zValidator('json', updateUserSchema), (c) => {
    const id = parseInt(c.req.param('id'))
    const data = c.req.valid('json')
    const userIndex = users.findIndex((u) => u.id === id)

    if (userIndex === -1) {
      return c.json({ error: 'User not found' }, 404)
    }

    users[userIndex] = { ...users[userIndex], ...data }
    return c.json(users[userIndex])
  })
  .delete('/users/:id', (c) => {
    const id = parseInt(c.req.param('id'))
    const userIndex = users.findIndex((u) => u.id === id)

    if (userIndex === -1) {
      return c.json({ error: 'User not found' }, 404)
    }

    users.splice(userIndex, 1)
    return c.json({ success: true })
  })

// Export the type for RPC
export type AppType = typeof routes

const port = 3000
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
})
