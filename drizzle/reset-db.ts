import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set')
}

const connectionString = process.env.DATABASE_URL
const client = postgres(connectionString, { prepare: false })
const db = drizzle(client)

async function resetDatabase() {
  console.log('🗑️  Dropping all tables...')
  
  try {
    await client`DROP TABLE IF EXISTS comparisons CASCADE`
    await client`DROP TABLE IF EXISTS analytics CASCADE`
    await client`DROP TABLE IF EXISTS favorites CASCADE`
    await client`DROP TABLE IF EXISTS subscriptions CASCADE`
    await client`DROP TABLE IF EXISTS categories CASCADE`
    await client`DROP TABLE IF EXISTS notifications CASCADE`
    await client`DROP TABLE IF EXISTS order_items CASCADE`
    await client`DROP TABLE IF EXISTS orders CASCADE`
    await client`DROP TABLE IF EXISTS cart_items CASCADE`
    await client`DROP TABLE IF EXISTS purchase_lists CASCADE`
    await client`DROP TABLE IF EXISTS reviews CASCADE`
    await client`DROP TABLE IF EXISTS services CASCADE`
    await client`DROP TABLE IF EXISTS products CASCADE`
    await client`DROP TABLE IF EXISTS stores CASCADE`
    await client`DROP TABLE IF EXISTS plans CASCADE`
    await client`DROP TABLE IF EXISTS verification CASCADE`
    await client`DROP TABLE IF EXISTS account CASCADE`
    await client`DROP TABLE IF EXISTS session CASCADE`
    await client`DROP TABLE IF EXISTS "user" CASCADE`
    
    console.log('✅ All tables dropped!')
    console.log('✅ Database reset complete! Now run: bun run db:push')
  } catch (error) {
    console.error('❌ Error resetting database:', error)
  } finally {
    await client.end()
  }
}

resetDatabase()

