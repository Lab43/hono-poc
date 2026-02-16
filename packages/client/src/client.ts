import { hc } from 'hono/client'
import type { AppType } from '../../api/src/index'

// Create RPC client with type safety
export const client = hc<AppType>('http://localhost:3000')
