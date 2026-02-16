# Hono RPC Proof of Concept

A monorepo demonstrating Hono RPC with a Node.js API server and React client.

## Features

- **Monorepo**: pnpm workspaces
- **Server**: Hono with Zod validation
- **Client**: React + Vite with TypeScript
- **RPC**: Type-safe client-server communication using Hono RPC
- **Validation**: Zod schemas for request validation

## Structure

```
├── packages/
│   ├── api/          # Hono server
│   └── client/       # React + Vite app
```

## Getting Started

### Prerequisites

- Node.js 18 or higher
- pnpm (install with `npm install -g pnpm`)

### Installation

```bash
# Install dependencies for all packages
pnpm install
```

### Development

Run both API and client in development mode:

```bash
# Run both (in parallel)
pnpm dev

# Or run individually:
pnpm dev:api    # API on http://localhost:3000
pnpm dev:client # Client on http://localhost:5173
```

### Build

```bash
pnpm build
```

## How It Works

### Server (packages/api)

The API server uses:
- **Hono**: Fast web framework
- **Zod**: Schema validation with `@hono/zod-validator`
- Type exports for RPC client

Key endpoints:
- `GET /users` - List all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user (validated with Zod)
- `PUT /users/:id` - Update user (validated with Zod)
- `DELETE /users/:id` - Delete user

### Client (packages/client)

The React client uses:
- **Hono RPC Client**: Type-safe API calls via `hono/client`
- **TypeScript**: Full type inference from server
- **React**: UI components with hooks

The magic happens in `client/src/client.ts`:
```typescript
import { hc } from 'hono/client'
import type { AppType } from '../../api/src/index'

export const client = hc<AppType>('http://localhost:3000')
```

This gives you full type safety and autocomplete for all API endpoints!

### Zod Validation

The server validates requests using Zod schemas:

```typescript
const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
})
```

Invalid requests are automatically rejected with proper error messages.

## Example Usage

The client demonstrates all CRUD operations:
- List users
- Create new user
- Update existing user
- Delete user

All with full type safety and validation!
