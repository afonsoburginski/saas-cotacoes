CREATE TABLE "analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"store_id" integer,
	"product_id" integer,
	"service_id" integer,
	"event_type" varchar(50) NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "comparisons" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"product_ids" jsonb NOT NULL,
	"categoria" varchar(100),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "cart_items" ADD COLUMN "tipo" varchar(20);--> statement-breakpoint
ALTER TABLE "cart_items" ADD COLUMN "product_nome" text;--> statement-breakpoint
ALTER TABLE "cart_items" ADD COLUMN "store_nome" text;--> statement-breakpoint
ALTER TABLE "cart_items" ADD COLUMN "preco_unit" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "cart_items" ADD COLUMN "imagem_url" text;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "user_name" text;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "descricao" text;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "logo" text;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "horario_funcionamento" text;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "features" jsonb;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "total_services" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "rating" numeric(3, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "total_reviews" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_hash" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "google_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "verification_token" text;--> statement-breakpoint
ALTER TABLE "analytics" ADD CONSTRAINT "analytics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics" ADD CONSTRAINT "analytics_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics" ADD CONSTRAINT "analytics_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics" ADD CONSTRAINT "analytics_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comparisons" ADD CONSTRAINT "comparisons_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_google_id_unique" UNIQUE("google_id");