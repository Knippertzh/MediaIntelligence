import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email"),
  role: text("role").default("user"),
  profileImageUrl: text("profile_image_url"),
});

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  companyId: integer("company_id"),
  position: text("position"),
  source: text("source"),
  status: text("status").default("new"),
  aiScore: integer("ai_score").default(0),
  notes: text("notes"),
  assignedTo: integer("assigned_to"),
  market: text("market"),
  createdAt: timestamp("created_at").defaultNow(),
  lastContactedAt: timestamp("last_contacted_at"),
});

export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  industry: text("industry"),
  size: text("size"),
  website: text("website"),
  address: text("address"),
  city: text("city"),
  country: text("country"),
  market: text("market"),
  engagementScore: integer("engagement_score").default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  logoUrl: text("logo_url"),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").default("pending"),
  dueDate: timestamp("due_date"),
  assignedTo: integer("assigned_to"),
  leadId: integer("lead_id"),
  companyId: integer("company_id"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const aiInsights = pgTable("ai_insights", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  actionText: text("action_text"),
  actionUrl: text("action_url"),
  leadId: integer("lead_id"),
  companyId: integer("company_id"),
  isRead: boolean("is_read").default(false),
  isDismissed: boolean("is_dismissed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
  profileImageUrl: true,
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertAiInsightSchema = createInsertSchema(aiInsights).omit({
  id: true,
  createdAt: true,
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;

export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companies.$inferSelect;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export type InsertAiInsight = z.infer<typeof insertAiInsightSchema>;
export type AiInsight = typeof aiInsights.$inferSelect;

// Extended types for the frontend
export type LeadWithCompany = Lead & {
  company?: Company;
};

export type CompanyWithLeads = Company & {
  leads?: Lead[];
};
