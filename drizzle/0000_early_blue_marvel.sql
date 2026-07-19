CREATE TABLE "sourcing_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"location" text NOT NULL,
	"contact_preference" text NOT NULL,
	"category" text NOT NULL,
	"request" text NOT NULL,
	"reference" text,
	"details" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
