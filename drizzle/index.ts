import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set')
}

const connectionString = process.env.DATABASE_URL

// Singleton: garantir que apenas uma instância do cliente existe
// Configurar pool com limites para evitar "Max client connections reached"
const globalForPostgres = globalThis as unknown as {
  postgres: ReturnType<typeof postgres> | undefined
}

const client = globalForPostgres.postgres ?? postgres(connectionString, { 
  prepare: false,
  max: 10, // Máximo de 10 conexões simultâneas
  idle_timeout: 20, // Fechar conexões idle após 20s
  connect_timeout: 5, // Timeout de conexão de 5s
  max_lifetime: 60 * 30, // Reciclar conexões após 30 minutos
})

if (process.env.NODE_ENV !== 'production') {
  globalForPostgres.postgres = client
}

export const db = drizzle(client, { schema })

