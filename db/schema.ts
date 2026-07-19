import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const sourcingRequests = pgTable("sourcing_requests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  location: text("location").notNull(),
  contactPreference: text("contact_preference").notNull(),
  category: text("category").notNull(),
  request: text("request").notNull(),
  reference: text("reference"),
  details: text("details"),
  status: text("status").default("pending").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
