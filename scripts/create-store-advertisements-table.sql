-- Script para criar a tabela store_advertisements
CREATE TABLE IF NOT EXISTS "store_advertisements" (
  "id" serial PRIMARY KEY NOT NULL,
  "store_id" integer NOT NULL REFERENCES "stores"("id"),
  "images" jsonb NOT NULL DEFAULT '[]',
  "start_date" timestamp,
  "end_date" timestamp,
  "active" boolean DEFAULT true,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

