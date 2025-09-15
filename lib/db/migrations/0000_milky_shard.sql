-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."creator_status" AS ENUM('not-applied', 'pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('customer', 'creator', 'admin', 'editor', 'moderator');--> statement-breakpoint
CREATE TABLE "job_positions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"title" varchar(255) NOT NULL,
	"department" varchar(255) NOT NULL,
	"type" varchar(100) NOT NULL,
	"location" varchar(255) NOT NULL,
	"experience" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"responsibilities" jsonb,
	"requirements" jsonb,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "shipping_options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"is_active" boolean DEFAULT true,
	"duration" varchar(100)
);
--> statement-breakpoint
CREATE TABLE "cart_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"user_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"variant_id" uuid,
	"quantity" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"role" "user_role" DEFAULT 'customer' NOT NULL,
	"creator_status" "creator_status" DEFAULT 'not-applied',
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"image" text,
	"bio" text,
	"location" varchar(255),
	"website" text,
	"social_links" jsonb,
	"email_verified" boolean DEFAULT false NOT NULL,
	"password" varchar(255),
	"preferences" jsonb DEFAULT '{"darkMode":false,"newsletter":false,"notifications":false}'::jsonb,
	"phone" varchar(20),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "product_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"name" varchar(255) NOT NULL,
	"image" text,
	"icon" text,
	"description" text,
	"product_count" integer DEFAULT 0,
	"featured" boolean DEFAULT false,
	"slug" varchar(255) NOT NULL,
	CONSTRAINT "product_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "product_variants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"stock" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verificationTokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" uuid NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false,
	"related_id" uuid,
	"related_type" varchar(50)
);
--> statement-breakpoint
CREATE TABLE "creators" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"user_id" uuid NOT NULL,
	"followers" integer DEFAULT 0,
	"following" integer DEFAULT 0,
	"image" text,
	"story" text,
	"description" text,
	"location" varchar(255),
	"category" varchar(255),
	"rating" numeric(3, 2) DEFAULT '0.00',
	"sales" integer DEFAULT 0,
	"is_verified" boolean DEFAULT false,
	"is_featured" boolean DEFAULT false,
	"joined" timestamp DEFAULT now(),
	"categories" jsonb,
	"social_links" jsonb,
	"total_revenue" numeric(12, 2) DEFAULT '0.00',
	"monthly_revenue" numeric(12, 2) DEFAULT '0.00',
	"engagement_score" numeric(5, 2) DEFAULT '0.00',
	"response_time" integer DEFAULT 0,
	"completion_rate" numeric(5, 2) DEFAULT '100.00',
	"top_score" numeric(8, 2) DEFAULT '0.00',
	"last_active_at" timestamp DEFAULT now(),
	"cover_image" text
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"order_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"variant_id" uuid,
	"quantity" integer NOT NULL,
	"price" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"creator_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"order_id" uuid,
	"rating" integer NOT NULL,
	"comment" text,
	"review_type" varchar(50) DEFAULT 'general',
	"is_verified" boolean DEFAULT false,
	"helpful_votes" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "creator_stats" (
	"creator_id" uuid PRIMARY KEY NOT NULL,
	"avg_rating" numeric(3, 2) DEFAULT '0.00',
	"total_reviews" integer DEFAULT 0,
	"total_orders" integer DEFAULT 0,
	"completed_orders" integer DEFAULT 0,
	"avg_response_time" integer DEFAULT 0,
	"last_updated" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false,
	"attachments" jsonb
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"name" varchar(255) NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"creator_id" uuid NOT NULL,
	"image" text NOT NULL,
	"category_id" uuid NOT NULL,
	"description" text,
	"materials" jsonb,
	"rating" numeric(3, 2) DEFAULT '0.00',
	"attributes" jsonb,
	"other_images" jsonb,
	"highlights" jsonb,
	"care" text,
	"shipping" text,
	"returns" text,
	"stock" integer DEFAULT 0,
	"related_product" jsonb,
	"is_featured" boolean DEFAULT false,
	"slug" varchar(255) NOT NULL,
	"is_approved" boolean DEFAULT false,
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"creator_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"last_message_at" timestamp DEFAULT now(),
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "saved_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"variant_id" uuid
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"user_id" uuid NOT NULL,
	"creator_id" uuid NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"shipping_address" jsonb,
	"tracking_number" varchar(255),
	"completed_at" timestamp,
	"payment_method" varchar(50),
	"payment_status" varchar(50) DEFAULT 'pending',
	"subtotal" numeric(10, 2),
	"shipping" numeric(10, 2),
	"tax" numeric(10, 2),
	"discount" numeric(10, 2) DEFAULT '0',
	"coupon_code" varchar(100)
);
--> statement-breakpoint
CREATE TABLE "addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"user_id" uuid NOT NULL,
	"label" varchar(100),
	"name" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"street" varchar(255) NOT NULL,
	"apartment" varchar(100),
	"city" varchar(100) NOT NULL,
	"state" varchar(100) NOT NULL,
	"zip_code" varchar(20) NOT NULL,
	"country" varchar(100) NOT NULL,
	"is_default" boolean DEFAULT false,
	"type" varchar(50) DEFAULT 'shipping'
);
--> statement-breakpoint
CREATE TABLE "creator_followers" (
	"creator_id" uuid NOT NULL,
	"follower_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_followers_creator_id_follower_id_pk" PRIMARY KEY("creator_id","follower_id")
);
--> statement-breakpoint
CREATE TABLE "user_favorites" (
	"user_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_favorites_user_id_product_id_pk" PRIMARY KEY("user_id","product_id")
);
--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creators" ADD CONSTRAINT "creators_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_reviews" ADD CONSTRAINT "creator_reviews_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_reviews" ADD CONSTRAINT "creator_reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_stats" ADD CONSTRAINT "creator_stats_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_product_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."product_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_items" ADD CONSTRAINT "saved_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_items" ADD CONSTRAINT "saved_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_items" ADD CONSTRAINT "saved_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_followers" ADD CONSTRAINT "creator_followers_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_followers" ADD CONSTRAINT "creator_followers_follower_id_users_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_favorites" ADD CONSTRAINT "user_favorites_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_favorites" ADD CONSTRAINT "user_favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "jobs_active_idx" ON "job_positions" USING btree ("is_active" bool_ops);--> statement-breakpoint
CREATE INDEX "jobs_department_idx" ON "job_positions" USING btree ("department" text_ops);--> statement-breakpoint
CREATE INDEX "jobs_location_idx" ON "job_positions" USING btree ("location" text_ops);--> statement-breakpoint
CREATE INDEX "jobs_title_idx" ON "job_positions" USING btree ("title" text_ops);--> statement-breakpoint
CREATE INDEX "jobs_type_idx" ON "job_positions" USING btree ("type" text_ops);--> statement-breakpoint
CREATE INDEX "shipping_active_idx" ON "shipping_options" USING btree ("is_active" bool_ops);--> statement-breakpoint
CREATE INDEX "cart_product_idx" ON "cart_items" USING btree ("product_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "cart_user_idx" ON "cart_items" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "users_creator_status_idx" ON "users" USING btree ("creator_status" enum_ops);--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email" text_ops);--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role" enum_ops);--> statement-breakpoint
CREATE INDEX "categories_featured_idx" ON "product_categories" USING btree ("featured" bool_ops);--> statement-breakpoint
CREATE INDEX "categories_name_idx" ON "product_categories" USING btree ("name" text_ops);--> statement-breakpoint
CREATE INDEX "variants_product_idx" ON "product_variants" USING btree ("product_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verificationTokens" USING btree ("identifier" text_ops);--> statement-breakpoint
CREATE INDEX "accounts_userId_idx" ON "accounts" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "reviews_product_idx" ON "reviews" USING btree ("product_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "reviews_rating_idx" ON "reviews" USING btree ("rating" int4_ops);--> statement-breakpoint
CREATE INDEX "reviews_user_idx" ON "reviews" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "notifications_read_idx" ON "notifications" USING btree ("is_read" bool_ops);--> statement-breakpoint
CREATE INDEX "notifications_type_idx" ON "notifications" USING btree ("type" text_ops);--> statement-breakpoint
CREATE INDEX "notifications_user_idx" ON "notifications" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "creators_featured_idx" ON "creators" USING btree ("is_featured" bool_ops);--> statement-breakpoint
CREATE INDEX "creators_location_category_idx" ON "creators" USING btree ("location" text_ops,"category" text_ops);--> statement-breakpoint
CREATE INDEX "creators_rating_idx" ON "creators" USING btree ("rating" numeric_ops);--> statement-breakpoint
CREATE INDEX "creators_sales_idx" ON "creators" USING btree ("sales" int4_ops);--> statement-breakpoint
CREATE INDEX "creators_top_score_idx" ON "creators" USING btree ("top_score" numeric_ops);--> statement-breakpoint
CREATE INDEX "creators_total_revenue_idx" ON "creators" USING btree ("total_revenue" numeric_ops);--> statement-breakpoint
CREATE INDEX "creators_user_id_idx" ON "creators" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "creators_verified_featured_idx" ON "creators" USING btree ("is_verified" bool_ops,"is_featured" bool_ops);--> statement-breakpoint
CREATE INDEX "creators_verified_idx" ON "creators" USING btree ("is_verified" bool_ops);--> statement-breakpoint
CREATE INDEX "order_items_order_idx" ON "order_items" USING btree ("order_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "order_items_product_idx" ON "order_items" USING btree ("product_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "creator_reviews_creator_idx" ON "creator_reviews" USING btree ("creator_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "creator_reviews_rating_idx" ON "creator_reviews" USING btree ("rating" int4_ops);--> statement-breakpoint
CREATE INDEX "creator_reviews_user_idx" ON "creator_reviews" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "creator_reviews_verified_idx" ON "creator_reviews" USING btree ("is_verified" bool_ops);--> statement-breakpoint
CREATE INDEX "unique_creator_user_review" ON "creator_reviews" USING btree ("creator_id" uuid_ops,"user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "creator_stats_rating_idx" ON "creator_stats" USING btree ("avg_rating" numeric_ops);--> statement-breakpoint
CREATE INDEX "creator_stats_reviews_idx" ON "creator_stats" USING btree ("total_reviews" int4_ops);--> statement-breakpoint
CREATE INDEX "messages_conversation_idx" ON "messages" USING btree ("conversation_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "messages_read_idx" ON "messages" USING btree ("is_read" bool_ops);--> statement-breakpoint
CREATE INDEX "messages_sender_idx" ON "messages" USING btree ("sender_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "products_category_idx" ON "products" USING btree ("category_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "products_category_price_idx" ON "products" USING btree ("category_id" numeric_ops,"price" uuid_ops);--> statement-breakpoint
CREATE INDEX "products_creator_idx" ON "products" USING btree ("creator_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "products_creator_rating_idx" ON "products" USING btree ("creator_id" uuid_ops,"rating" uuid_ops);--> statement-breakpoint
CREATE INDEX "products_name_search_idx" ON "products" USING btree ("name" text_ops);--> statement-breakpoint
CREATE INDEX "products_price_idx" ON "products" USING btree ("price" numeric_ops);--> statement-breakpoint
CREATE INDEX "products_rating_idx" ON "products" USING btree ("rating" numeric_ops);--> statement-breakpoint
CREATE INDEX "products_slug_idx" ON "products" USING btree ("slug" text_ops);--> statement-breakpoint
CREATE INDEX "products_stock_idx" ON "products" USING btree ("stock" int4_ops);--> statement-breakpoint
CREATE INDEX "conversations_creator_idx" ON "conversations" USING btree ("creator_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "conversations_customer_idx" ON "conversations" USING btree ("customer_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "unique_conversation" ON "conversations" USING btree ("creator_id" uuid_ops,"customer_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "saved_items_product_idx" ON "saved_items" USING btree ("product_id" uuid_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "saved_items_unique" ON "saved_items" USING btree ("user_id" uuid_ops,"product_id" uuid_ops,"variant_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "saved_items_user_idx" ON "saved_items" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "orders_creator_idx" ON "orders" USING btree ("creator_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "orders_user_idx" ON "orders" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "addresses_city_idx" ON "addresses" USING btree ("city" text_ops);--> statement-breakpoint
CREATE INDEX "addresses_default_idx" ON "addresses" USING btree ("user_id" bool_ops,"is_default" uuid_ops);--> statement-breakpoint
CREATE INDEX "addresses_user_idx" ON "addresses" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "addresses_zipcode_idx" ON "addresses" USING btree ("zip_code" text_ops);
*/