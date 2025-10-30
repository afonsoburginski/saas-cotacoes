import postgres from 'postgres'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set')
}

const client = postgres(process.env.DATABASE_URL, { prepare: false })

async function applySchema() {
  console.log('🚀 Applying schema...')
  
  try {
    // Better Auth tables
    await client`
      CREATE TABLE IF NOT EXISTS "user" (
        "id" text PRIMARY KEY NOT NULL,
        "name" text NOT NULL,
        "email" text NOT NULL UNIQUE,
        "emailVerified" boolean DEFAULT false NOT NULL,
        "image" text,
        "createdAt" timestamp DEFAULT now() NOT NULL,
        "updatedAt" timestamp DEFAULT now() NOT NULL,
        "phone" varchar(256),
        "role" varchar(50) DEFAULT 'usuario',
        "status" varchar(20) DEFAULT 'active',
        "business_name" text,
        "business_type" varchar(20),
        "plan" varchar(20),
        "address" text,
        "total_orders" integer DEFAULT 0,
        "total_spent" numeric(10, 2) DEFAULT '0'
      )
    `
    
    await client`
      CREATE TABLE IF NOT EXISTS "session" (
        "id" text PRIMARY KEY NOT NULL,
        "expiresAt" timestamp NOT NULL,
        "ipAddress" text,
        "userAgent" text,
        "userId" text NOT NULL REFERENCES "user"("id"),
        "createdAt" timestamp DEFAULT now() NOT NULL,
        "updatedAt" timestamp DEFAULT now() NOT NULL
      )
    `
    
    await client`
      CREATE TABLE IF NOT EXISTS "account" (
        "id" text PRIMARY KEY NOT NULL,
        "accountId" text NOT NULL,
        "providerId" text NOT NULL,
        "userId" text NOT NULL REFERENCES "user"("id"),
        "accessToken" text,
        "refreshToken" text,
        "idToken" text,
        "expiresAt" timestamp,
        "password" text,
        "createdAt" timestamp DEFAULT now() NOT NULL,
        "updatedAt" timestamp DEFAULT now() NOT NULL
      )
    `
    
    await client`
      CREATE TABLE IF NOT EXISTS "verification" (
        "id" text PRIMARY KEY NOT NULL,
        "identifier" text NOT NULL,
        "value" text NOT NULL,
        "expiresAt" timestamp NOT NULL,
        "createdAt" timestamp DEFAULT now() NOT NULL,
        "updatedAt" timestamp DEFAULT now() NOT NULL
      )
    `
    
    // Stores
    await client`
      CREATE TABLE IF NOT EXISTS "stores" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" text REFERENCES "user"("id"),
        "nome" text NOT NULL,
        "email" varchar(256),
        "telefone" varchar(20),
        "cnpj" varchar(18),
        "endereco" text,
        "descricao" text,
        "logo" text,
        "horario_funcionamento" text,
        "status" varchar(20) DEFAULT 'pending',
        "plano" varchar(20) DEFAULT 'Basic',
        "priority_score" integer DEFAULT 0,
        "shipping_policy" jsonb,
        "address" jsonb,
        "features" jsonb,
        "total_products" integer DEFAULT 0,
        "total_services" integer DEFAULT 0,
        "total_sales" numeric(12, 2) DEFAULT '0',
        "rating" numeric(3, 2) DEFAULT '0',
        "total_reviews" integer DEFAULT 0,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      )
    `
    
    // Products
    await client`
      CREATE TABLE IF NOT EXISTS "products" (
        "id" serial PRIMARY KEY NOT NULL,
        "store_id" integer NOT NULL REFERENCES "stores"("id"),
        "nome" text NOT NULL,
        "categoria" varchar(100) NOT NULL,
        "preco" numeric(10, 2) NOT NULL,
        "preco_promocional" numeric(10, 2),
        "estoque" integer DEFAULT 0,
        "unidade_medida" varchar(50),
        "rating" numeric(3, 2) DEFAULT '0',
        "imagem_url" text,
        "imagens" jsonb,
        "ativo" boolean DEFAULT true,
        "destacado" boolean DEFAULT false,
        "sku" varchar(100),
        "descricao" text,
        "tem_variacao_preco" boolean DEFAULT false,
        "peso" numeric(10, 3),
        "dimensoes" jsonb,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      )
    `
    
    // Services
    await client`
      CREATE TABLE IF NOT EXISTS "services" (
        "id" serial PRIMARY KEY NOT NULL,
        "store_id" integer NOT NULL REFERENCES "stores"("id"),
        "nome" text NOT NULL,
        "categoria" varchar(100) NOT NULL,
        "preco" numeric(10, 2) NOT NULL,
        "preco_minimo" numeric(10, 2),
        "preco_maximo" numeric(10, 2),
        "tipo_precificacao" varchar(20) NOT NULL,
        "rating" numeric(3, 2) DEFAULT '0',
        "imagem_url" text,
        "imagens" jsonb,
        "ativo" boolean DEFAULT true,
        "destacado" boolean DEFAULT false,
        "descricao" text,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      )
    `
    
    // Outras tabelas...
    await client`
      CREATE TABLE IF NOT EXISTS "reviews" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" text REFERENCES "user"("id"),
        "user_name" text,
        "store_id" integer REFERENCES "stores"("id"),
        "product_id" integer REFERENCES "products"("id"),
        "service_id" integer REFERENCES "services"("id"),
        "rating" integer NOT NULL,
        "comentario" text,
        "status" varchar(20) DEFAULT 'pendente',
        "verified" boolean DEFAULT false,
        "created_at" timestamp DEFAULT now()
      )
    `
    
    await client`
      CREATE TABLE IF NOT EXISTS "cart_items" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" text NOT NULL REFERENCES "user"("id"),
        "product_id" integer REFERENCES "products"("id"),
        "service_id" integer REFERENCES "services"("id"),
        "qty" integer DEFAULT 1 NOT NULL,
        "tipo" varchar(20),
        "product_nome" text,
        "store_nome" text,
        "preco_unit" numeric(10, 2),
        "imagem_url" text,
        "created_at" timestamp DEFAULT now()
      )
    `
    
    await client`
      CREATE TABLE IF NOT EXISTS "purchase_lists" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" text NOT NULL REFERENCES "user"("id"),
        "nome" text NOT NULL,
        "items" jsonb,
        "observacoes" text,
        "total_estimado" numeric(10, 2),
        "shipping_costs" jsonb,
        "total_com_frete" numeric(10, 2),
        "created_at" timestamp DEFAULT now()
      )
    `
    
    await client`
      CREATE TABLE IF NOT EXISTS "plans" (
        "id" serial PRIMARY KEY NOT NULL,
        "nome" varchar(100) NOT NULL,
        "preco" numeric(10, 2) NOT NULL,
        "periodicidade" varchar(20) NOT NULL,
        "recursos" jsonb,
        "ativo" boolean DEFAULT true,
        "created_at" timestamp DEFAULT now()
      )
    `
    
    await client`
      CREATE TABLE IF NOT EXISTS "orders" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" text NOT NULL REFERENCES "user"("id"),
        "store_id" integer REFERENCES "stores"("id"),
        "tipo" varchar(20) NOT NULL,
        "status" varchar(30) DEFAULT 'pendente',
        "total" numeric(12, 2),
        "observacoes" text,
        "endereco_entrega" text,
        "data_entrega" timestamp,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      )
    `
    
    await client`
      CREATE TABLE IF NOT EXISTS "order_items" (
        "id" serial PRIMARY KEY NOT NULL,
        "order_id" integer NOT NULL REFERENCES "orders"("id"),
        "product_id" integer REFERENCES "products"("id"),
        "service_id" integer REFERENCES "services"("id"),
        "qty" integer DEFAULT 1 NOT NULL,
        "preco_unit" numeric(10, 2) NOT NULL,
        "preco_total" numeric(10, 2),
        "observacoes" text,
        "created_at" timestamp DEFAULT now()
      )
    `
    
    await client`
      CREATE TABLE IF NOT EXISTS "notifications" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" text NOT NULL REFERENCES "user"("id"),
        "tipo" varchar(50) NOT NULL,
        "titulo" text NOT NULL,
        "mensagem" text,
        "link" text,
        "is_read" boolean DEFAULT false,
        "created_at" timestamp DEFAULT now()
      )
    `
    
    await client`
      CREATE TABLE IF NOT EXISTS "categories" (
        "id" serial PRIMARY KEY NOT NULL,
        "nome" varchar(100) NOT NULL UNIQUE,
        "tipo" varchar(20) NOT NULL,
        "descricao" text,
        "icone" text,
        "ativo" boolean DEFAULT true,
        "ordem" integer DEFAULT 0,
        "created_at" timestamp DEFAULT now()
      )
    `
    
    // Measurement Units
    await client`
      CREATE TABLE IF NOT EXISTS "measurement_units" (
        "id" serial PRIMARY KEY NOT NULL,
        "nome" varchar(100) NOT NULL UNIQUE,
        "abreviacao" varchar(20) NOT NULL,
        "tipo" varchar(20) NOT NULL,
        "ativo" boolean DEFAULT true,
        "ordem" integer DEFAULT 0,
        "created_at" timestamp DEFAULT now()
      )
    `

    await client`
      CREATE TABLE IF NOT EXISTS "subscriptions" (
        "id" serial PRIMARY KEY NOT NULL,
        "store_id" integer NOT NULL REFERENCES "stores"("id"),
        "plan_id" integer NOT NULL REFERENCES "plans"("id"),
        "status" varchar(20) DEFAULT 'active',
        "start_date" timestamp DEFAULT now(),
        "end_date" timestamp,
        "auto_renew" boolean DEFAULT true,
        "created_at" timestamp DEFAULT now()
      )
    `
    
    await client`
      CREATE TABLE IF NOT EXISTS "favorites" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" text NOT NULL REFERENCES "user"("id"),
        "product_id" integer REFERENCES "products"("id"),
        "service_id" integer REFERENCES "services"("id"),
        "store_id" integer REFERENCES "stores"("id"),
        "created_at" timestamp DEFAULT now()
      )
    `
    
    await client`
      CREATE TABLE IF NOT EXISTS "analytics" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" text REFERENCES "user"("id"),
        "store_id" integer REFERENCES "stores"("id"),
        "product_id" integer REFERENCES "products"("id"),
        "service_id" integer REFERENCES "services"("id"),
        "event_type" varchar(50) NOT NULL,
        "metadata" jsonb,
        "created_at" timestamp DEFAULT now()
      )
    `
    
    await client`
      CREATE TABLE IF NOT EXISTS "comparisons" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" text NOT NULL REFERENCES "user"("id"),
        "product_ids" jsonb NOT NULL,
        "categoria" varchar(100),
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      )
    `
    
    console.log('✅ All tables created successfully!')
  } catch (error) {
    console.error('❌ Error applying schema:', error)
  } finally {
    await client.end()
  }
}

applySchema()

