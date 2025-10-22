import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Durante o build, pode não ter DATABASE_URL
// A conexão só será criada em runtime quando necessário
const connectionString = process.env.DATABASE_URL || ''

let _db: ReturnType<typeof drizzle> | null = null

const getDbInstance = () => {
  if (!_db) {
    if (!connectionString) {
      throw new Error('DATABASE_URL is not set')
    }
    
    // Disable prefetch as it is not supported for "Transaction" pool mode
    const client = postgres(connectionString, { prepare: false })
    _db = drizzle(client, { schema })
  }
  
  return _db
}

// Proxy para tornar o acesso transparente
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get: (target, prop) => {
    const instance = getDbInstance()
    const value = instance[prop as keyof typeof instance]
    return typeof value === 'function' ? value.bind(instance) : value
  }
})

