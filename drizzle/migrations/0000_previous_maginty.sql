CREATE TABLE "cart_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"product_id" integer,
	"service_id" integer,
	"qty" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" varchar(100) NOT NULL,
	"preco" numeric(10, 2) NOT NULL,
	"periodicidade" varchar(20) NOT NULL,
	"recursos" jsonb,
	"ativo" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"store_id" integer NOT NULL,
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
);
--> statement-breakpoint
CREATE TABLE "purchase_lists" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"nome" text NOT NULL,
	"items" jsonb,
	"observacoes" text,
	"total_estimado" numeric(10, 2),
	"shipping_costs" jsonb,
	"total_com_frete" numeric(10, 2),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"store_id" integer,
	"product_id" integer,
	"service_id" integer,
	"rating" integer NOT NULL,
	"comentario" text,
	"status" varchar(20) DEFAULT 'pendente',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" serial PRIMARY KEY NOT NULL,
	"store_id" integer NOT NULL,
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
);
--> statement-breakpoint
CREATE TABLE "stores" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"nome" text NOT NULL,
	"cnpj" varchar(18),
	"status" varchar(20) DEFAULT 'ativo',
	"plano" varchar(20) DEFAULT 'Basic',
	"priority_score" integer DEFAULT 0,
	"shipping_policy" jsonb,
	"address" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" text,
	"phone" varchar(256),
	"email" varchar(256),
	"role" varchar(50) DEFAULT 'usuario',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_lists" ADD CONSTRAINT "purchase_lists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stores" ADD CONSTRAINT "stores_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;